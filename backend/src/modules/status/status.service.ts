import { exec, execFile, spawn, type ChildProcess } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as net from 'net';
import * as os from 'os';
import si from 'systeminformation';
import { pool } from '../../db/client';
import { env } from '../../config/env';
import type { StatusData, MinecraftDetails } from './status.types';

const execFileAsync = promisify(execFile);

// ─── Persisted settings (app_settings table) ──────────────────────────────────

const MC_NAME_SETTING = 'mc_server_name';
const DEFAULT_MC_NAME = 'Fabric Minecraft 1.21.x';

export async function getServerName(): Promise<string> {
  const { rows } = await pool.query<{ value: string }>(
    'SELECT value FROM app_settings WHERE key = $1',
    [MC_NAME_SETTING]
  );
  return rows[0]?.value ?? DEFAULT_MC_NAME;
}

export async function setServerName(name: string): Promise<string> {
  const trimmed = name.trim();
  await pool.query(
    `INSERT INTO app_settings (key, value) VALUES ($1, $2)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
    [MC_NAME_SETTING, trimmed]
  );
  return trimmed;
}

function readMemInfo(): { total: number; used: number; usagePercent: number } {
  const content = fs.readFileSync('/proc/meminfo', 'utf8');
  const get = (key: string) => {
    const m = content.match(new RegExp(`^${key}:\\s+(\\d+)`, 'm'));
    return m ? parseInt(m[1]) * 1024 : 0;
  };
  const total = get('MemTotal');
  const available = get('MemAvailable');
  const used = total - available;
  return { total, used, usagePercent: Math.round((used / total) * 100) };
}

const MC_HOST = '127.0.0.1';
const MC_PORT = 25565;

// ─── VarInt helpers ───────────────────────────────────────────────────────────

export function writeVarInt(val: number): Buffer {
  const bytes: number[] = [];
  let v = val >>> 0; // treat as unsigned
  do {
    let byte = v & 0x7f;
    v >>>= 7;
    if (v !== 0) byte |= 0x80;
    bytes.push(byte);
  } while (v !== 0);
  return Buffer.from(bytes);
}

export function readVarInt(buf: Buffer, offset: number): { value: number; bytesRead: number } {
  let value = 0;
  let bytesRead = 0;
  let byte: number;
  do {
    if (offset + bytesRead >= buf.length) throw new Error('incomplete');
    byte = buf[offset + bytesRead];
    value |= (byte & 0x7f) << (7 * bytesRead);
    bytesRead++;
    if (bytesRead > 5) throw new Error('VarInt too large');
  } while ((byte & 0x80) !== 0);
  return { value, bytesRead };
}

// ─── Minecraft process check (minecraftserver user only) ──────────────────────

function checkMinecraftProcess(): Promise<{ running: boolean; pid: number | null }> {
  return new Promise((resolve) => {
    // Only match java processes belonging to the minecraftserver system user
    exec('ps -u minecraftserver -o pid=,comm= 2>/dev/null', (_err, stdout) => {
      const javaLine = stdout.split('\n').find((l) => l.trim().includes('java'));
      if (!javaLine) return resolve({ running: false, pid: null });
      const pid = parseInt(javaLine.trim().split(/\s+/)[0]) || null;
      resolve({ running: true, pid });
    });
  });
}

function getProcessUptime(pid: number): Promise<number | null> {
  return new Promise((resolve) => {
    exec(`ps -o etimes= -p ${pid} 2>/dev/null`, (_err, stdout) => {
      const secs = parseInt(stdout.trim());
      resolve(isNaN(secs) ? null : secs);
    });
  });
}

// ─── Minecraft Server List Ping (SLP) ─────────────────────────────────────────

interface SLPResponse {
  version: { name: string; protocol: number };
  players: { max: number; online: number; sample?: { name: string; id: string }[] };
  description: { text?: string } | string;
}

export function stripColorCodes(text: string): string {
  return text.replace(/§[0-9a-fklmnorA-FKLMNOR]/g, '').trim();
}

function slpPing(host: string, port: number, timeoutMs = 3000): Promise<{ data: SLPResponse; latency: number }> {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ host, port });
    let buf = Buffer.alloc(0);
    let done = false;
    const pingStart = Date.now();

    const cleanup = (err?: Error) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      socket.destroy();
      if (err) reject(err);
    };

    const timer = setTimeout(() => cleanup(new Error('timeout')), timeoutMs);

    socket.on('error', cleanup);

    socket.on('connect', () => {
      const hostBuf = Buffer.from(host, 'utf8');
      const portBuf = Buffer.allocUnsafe(2);
      portBuf.writeUInt16BE(port);

      // Handshake payload
      const payload = Buffer.concat([
        writeVarInt(0x00),           // packet id
        writeVarInt(0),              // protocol version (0 = status probe)
        writeVarInt(hostBuf.length), // host string length
        hostBuf,
        portBuf,
        writeVarInt(1),              // next state: status
      ]);

      const handshake = Buffer.concat([writeVarInt(payload.length), payload]);
      const statusReq = Buffer.from([0x01, 0x00]);
      socket.write(Buffer.concat([handshake, statusReq]));
    });

    socket.on('data', (chunk) => {
      buf = Buffer.concat([buf, chunk]);
      try {
        let offset = 0;
        const pktLen = readVarInt(buf, offset);
        offset += pktLen.bytesRead;
        if (buf.length < pktLen.bytesRead + pktLen.value) return;

        const pktId = readVarInt(buf, offset);
        offset += pktId.bytesRead;
        if (pktId.value !== 0x00) return;

        const jsonLen = readVarInt(buf, offset);
        offset += jsonLen.bytesRead;
        if (buf.length < offset + jsonLen.value) return;

        const json = JSON.parse(buf.slice(offset, offset + jsonLen.value).toString('utf8')) as SLPResponse;
        const latency = Date.now() - pingStart;

        if (!done) {
          done = true;
          clearTimeout(timer);
          socket.destroy();
          resolve({ data: json, latency });
        }
      } catch {
        // Buffer incomplete, wait for more data
      }
    });
  });
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getStatus(): Promise<StatusData> {
  const [load, cpu, disks, mc] = await Promise.all([
    si.currentLoad(),
    si.cpu(),
    si.fsSize(),
    checkMinecraftProcess(),
  ]);
  const mem = readMemInfo();

  const online = mc.running
    ? await slpPing(MC_HOST, MC_PORT).then(() => true).catch(() => false)
    : false;

  const root = disks.find((d) => d.mount === '/') ?? disks[0];

  return {
    system: {
      cpu: {
        usage: Math.round(load.currentLoad),
        cores: cpu.cores,
        model: cpu.manufacturer ? `${cpu.manufacturer} ${cpu.brand}` : cpu.brand,
        speed: cpu.speed,
      },
      memory: mem,
      disk: root
        ? { size: root.size, used: root.used, usagePercent: Math.round((root.used / root.size) * 100) }
        : { size: 0, used: 0, usagePercent: 0 },
      uptime: os.uptime(),
    },
    minecraft: {
      processRunning: mc.running,
      online,
    },
  };
}

export async function getMinecraftDetails(): Promise<MinecraftDetails> {
  const mc = await checkMinecraftProcess();

  const uptimeSeconds = mc.pid ? await getProcessUptime(mc.pid) : null;

  if (!mc.running) {
    return { processRunning: false, online: false, uptimeSeconds: null, players: null, version: null, motd: null, latency: null };
  }

  try {
    const { data, latency } = await slpPing(MC_HOST, MC_PORT);

    const rawMotd = typeof data.description === 'string'
      ? data.description
      : (data.description?.text ?? '');

    return {
      processRunning: true,
      online: true,
      uptimeSeconds,
      players: {
        online: data.players.online,
        max: data.players.max,
        names: (data.players.sample ?? []).map((p) => p.name),
      },
      version: data.version?.name ?? null,
      motd: stripColorCodes(rawMotd),
      latency,
    };
  } catch {
    // Process running but port not yet open (server still starting)
    return { processRunning: true, online: false, uptimeSeconds, players: null, version: null, motd: null, latency: null };
  }
}

// ─── Server control (start / stop / live logs) ────────────────────────────────
//
// The Minecraft server runs as the `minecraftserver` system user inside a screen
// session, launched by start.sh which wraps java in a `while true` auto-restart
// loop. The backend runs as root, so it drives the session via `runuser`.
//
//   start → create a detached screen session running ./start.sh
//   stop  → send the "stop" console command (graceful world save), wait for java
//           to exit, then quit the screen session to break the restart loop.

const RUNUSER = '/usr/sbin/runuser';
const SCREEN = '/usr/bin/screen';
const TAIL = '/usr/bin/tail';
const MC_LOG = `${env.MC_SERVER_DIR}/logs/latest.log`;

export interface ControlResult {
  ok: boolean;
  message: string;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

// Run a command as the minecraftserver user (backend is root, so no password).
function runAsMcUser(cmd: string, args: string[]) {
  return execFileAsync(RUNUSER, ['-u', env.MC_USER, '--', cmd, ...args]);
}

export async function startMinecraft(): Promise<ControlResult> {
  const mc = await checkMinecraftProcess();
  if (mc.running) {
    return { ok: false, message: 'O servidor já está em execução.' };
  }
  // screen inherits the launching cwd, so cd into the server dir first.
  await runAsMcUser('bash', [
    '-lc',
    `cd ${env.MC_SERVER_DIR} && ${SCREEN} -dmS ${env.MC_SCREEN} ./start.sh`,
  ]);
  return { ok: true, message: 'Servidor iniciando…' };
}

export async function stopMinecraft(): Promise<ControlResult> {
  const mc = await checkMinecraftProcess();
  if (!mc.running) {
    return { ok: false, message: 'O servidor já está parado.' };
  }
  // Graceful shutdown: type "stop" into the console so the world is saved.
  // The trailing CR submits the command.
  await runAsMcUser(SCREEN, ['-S', env.MC_SCREEN, '-p', '0', '-X', 'stuff', 'stop\r']);
  // Break the start.sh auto-restart loop once java has exited, in the background.
  void quitScreenAfterExit(mc.pid);
  return { ok: true, message: 'Parando o servidor (salvando o mundo)…' };
}

// Waits for the running java PID to exit (graceful save), then quits the screen
// session so the `while true` loop in start.sh does not relaunch the server.
async function quitScreenAfterExit(pid: number | null): Promise<void> {
  const deadline = Date.now() + 120_000; // up to 2 min for a modded world to save
  while (Date.now() < deadline) {
    await delay(1500);
    if (pid == null || !isAlive(pid)) break;
  }
  try {
    await runAsMcUser(SCREEN, ['-S', env.MC_SCREEN, '-X', 'quit']);
  } catch {
    // Session may already be gone — nothing to do.
  }
}

// Streams the Minecraft log file. Emits the last `tailLines` lines, then follows
// new output (surviving log rotation via `tail -F`). Returns the child process so
// the caller can kill it when the client disconnects.
export function streamMinecraftLog(
  onLine: (line: string) => void,
  tailLines = 100
): ChildProcess {
  const child = spawn(TAIL, ['-n', String(tailLines), '-F', MC_LOG]);
  let buffer = '';
  child.stdout.on('data', (chunk: Buffer) => {
    buffer += chunk.toString('utf8');
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) onLine(line.replace(/\r$/, ''));
  });
  // Swallow errors (e.g. file not yet created); tail -F will retry on its own.
  child.stderr.on('data', () => {});
  child.on('error', () => {});
  return child;
}
