/**
 * 无头 Chrome 的最小驱动：DevTools 协议 + Node 自带的 WebSocket，零依赖。
 * art-loop（场景那一层）和 art-screens（整屏）共用。
 */
import { spawn, type ChildProcess } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { inflateSync } from "node:zlib";

export function findChrome(): string {
  const cands = [
    process.env.CHROME_PATH,
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ];
  const hit = cands.find((p) => p && existsSync(p));
  if (!hit) throw new Error("找不到 Chrome 或 Edge。装一个，或者设 CHROME_PATH");
  return hit;
}

export interface Cdp {
  send<T = Record<string, unknown>>(method: string, params?: Record<string, unknown>): Promise<T>;
  evaluate<T>(expression: string): Promise<T>;
  close(): void;
}

export interface Browser { cdp: Cdp; proc: ChildProcess; dispose(): Promise<void> }

export async function launch(): Promise<Browser> {
  const profile = mkdtempSync(join(tmpdir(), "art-cdp-"));
  const proc = spawn(findChrome(), [
    "--headless=new", "--remote-debugging-port=0", `--user-data-dir=${profile}`,
    "--no-first-run", "--no-default-browser-check", "--hide-scrollbars",
    // 要真 GPU：软件渲染量出来的毫秒没有意义
    "--enable-gpu", "--ignore-gpu-blocklist", "--use-angle=default",
    "about:blank",
  ], { stdio: ["ignore", "ignore", "pipe"] });
  const wsUrl = await new Promise<string>((resolve, reject) => {
    let buf = "";
    const t = setTimeout(() => reject(new Error("Chrome 十五秒没起来")), 15000);
    proc.stderr!.on("data", (d: Buffer) => {
      buf += d.toString();
      const m = buf.match(/DevTools listening on (ws:\/\/\S+)/);
      if (m) { clearTimeout(t); resolve(m[1]!); }
    });
    proc.on("exit", (c) => reject(new Error(`Chrome 退出了（${c}）`)));
  });
  const ws = new WebSocket(wsUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  let id = 0;
  const pending = new Map<number, { resolve: (v: unknown) => void; reject: (e: Error) => void }>();
  ws.onmessage = (ev) => {
    const msg = JSON.parse(String(ev.data));
    if (msg.id && pending.has(msg.id)) {
      const p = pending.get(msg.id)!;
      pending.delete(msg.id);
      if (msg.error) p.reject(new Error(`${msg.error.message}`)); else p.resolve(msg.result);
    }
  };
  const raw = <T>(method: string, params: Record<string, unknown> = {}, sid?: string): Promise<T> =>
    new Promise((resolve, reject) => {
      id += 1;
      pending.set(id, { resolve: resolve as (v: unknown) => void, reject });
      ws.send(JSON.stringify({ id, method, params, ...(sid ? { sessionId: sid } : {}) }));
    });
  const { targetId } = await raw<{ targetId: string }>("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await raw<{ sessionId: string }>("Target.attachToTarget", { targetId, flatten: true });
  const cdp: Cdp = {
    send: (method, params) => raw(method, params, sessionId),
    evaluate: async <T>(expression: string) => {
      const r = await raw<{ result: { value: T } }>("Runtime.evaluate",
        { expression, returnByValue: true, awaitPromise: true }, sessionId);
      return r.result.value;
    },
    close: () => ws.close(),
  };
  return {
    cdp, proc,
    async dispose() {
      ws.close();
      proc.kill();
      await sleep(300);
      try { rmSync(profile, { recursive: true, force: true }); } catch { /* Chrome 还攥着文件锁就留在系统临时目录 */ }
    },
  };
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** 读 GPU 名。软件渲染时每帧毫秒不作数 */
export async function gpuName(cdp: Cdp): Promise<string> {
  return cdp.evaluate<string>(`(() => { const gl = document.createElement('canvas').getContext('webgl');
    const e = gl && gl.getExtension('WEBGL_debug_renderer_info'); return e ? gl.getParameter(e.UNMASKED_RENDERER_WEBGL) : 'unknown'; })()`);
}

/**
 * 最小 PNG 解码：8 位、非隔行、RGB 或 RGBA。Chrome 截图就是这种。
 * 返回 RGBA。为整屏量「留白连不连成片」用，不求通用。
 */
export function decodePng(buf: Buffer): { width: number; height: number; data: Uint8Array } {
  let p = 8, width = 0, height = 0, bpp = 0;
  const idat: Buffer[] = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p);
    const type = buf.toString("ascii", p + 4, p + 8);
    const body = buf.subarray(p + 8, p + 8 + len);
    if (type === "IHDR") {
      width = body.readUInt32BE(0); height = body.readUInt32BE(4);
      const depth = body[8], color = body[9], interlace = body[12];
      if (depth !== 8 || interlace !== 0 || (color !== 2 && color !== 6)) throw new Error(`PNG 格式不支持：depth ${depth} color ${color}`);
      bpp = color === 6 ? 4 : 3;
    } else if (type === "IDAT") idat.push(body);
    else if (type === "IEND") break;
    p += 12 + len;
  }
  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * bpp;
  const cur = new Uint8Array(stride), prev = new Uint8Array(stride);
  const out = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++) {
    const f = raw[y * (stride + 1)]!;
    const row = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? cur[i - bpp]! : 0, b = prev[i]!, c = i >= bpp ? prev[i - bpp]! : 0;
      let v = row[i]!;
      if (f === 1) v += a;
      else if (f === 2) v += b;
      else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const pp = a + b - c, pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      cur[i] = v & 255;
    }
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * 4, s = x * bpp;
      out[o] = cur[s]!; out[o + 1] = cur[s + 1]!; out[o + 2] = cur[s + 2]!; out[o + 3] = bpp === 4 ? cur[s + 3]! : 255;
    }
    prev.set(cur);
  }
  return { width, height, data: out };
}
