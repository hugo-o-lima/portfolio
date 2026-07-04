import { describe, it, expect } from 'vitest';
import { writeVarInt, readVarInt, stripColorCodes } from '../src/modules/status/status.service';

describe('VarInt encoding (Minecraft SLP protocol)', () => {
  it('round-trips representative values', () => {
    for (const n of [0, 1, 127, 128, 255, 300, 25565, 2097151, 2147483647]) {
      const buf = writeVarInt(n);
      const { value, bytesRead } = readVarInt(buf, 0);
      expect(value).toBe(n);
      expect(bytesRead).toBe(buf.length);
    }
  });

  it('uses a single byte for values < 128 and two bytes for 128', () => {
    expect(writeVarInt(0).length).toBe(1);
    expect(writeVarInt(127).length).toBe(1);
    expect(writeVarInt(128).length).toBe(2);
  });

  it('reads from a non-zero offset', () => {
    const buf = Buffer.concat([Buffer.from([0xff]), writeVarInt(300)]);
    const { value } = readVarInt(buf, 1);
    expect(value).toBe(300);
  });

  it('throws on an over-long VarInt', () => {
    const bad = Buffer.from([0x80, 0x80, 0x80, 0x80, 0x80, 0x80]);
    expect(() => readVarInt(bad, 0)).toThrow('VarInt too large');
  });

  it('throws on an incomplete buffer', () => {
    expect(() => readVarInt(Buffer.from([0x80]), 0)).toThrow('incomplete');
  });
});

describe('stripColorCodes', () => {
  it('removes Minecraft § color codes and trims', () => {
    expect(stripColorCodes('§aHello §lWorld§r')).toBe('Hello World');
    expect(stripColorCodes('  §cplain  ')).toBe('plain');
  });

  it('leaves text without codes unchanged', () => {
    expect(stripColorCodes('A normal MOTD')).toBe('A normal MOTD');
  });
});
