export interface StatusData {
  system: {
    cpu: { usage: number; cores: number; model: string; speed: number };
    memory: { total: number; used: number; usagePercent: number };
    disk: { size: number; used: number; usagePercent: number };
    uptime: number;
  };
  minecraft: {
    processRunning: boolean;
    online: boolean;
  };
}

export interface MinecraftDetails {
  processRunning: boolean;
  online: boolean;
  uptimeSeconds: number | null;
  players: { online: number; max: number; names: string[] } | null;
  version: string | null;
  motd: string | null;
  latency: number | null;
}
