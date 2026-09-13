/**
 * 自动渲染审查循环（D-060）。
 *
 *   npm run art:loop                 全部场景状态
 *   npm run art:loop -- --since E6   只跑某一批（shots.ts 里的 since）
 *   npm run art:loop -- --only yilu  只跑某个场景
 *   npm run art:loop -- --no-fix     只量不改
 *
 * 一条链：
 *   起一个 vite（5177）→ 起一个无头 Chrome，视口压成手机（390×844，像素比 2）
 *   → 每个场景状态开一次舞台抽查台，读它当场算出来的数（面数、每帧毫秒、留白、朱砂、紫、色板外）
 *   → 按 shots.ts 的 GATES 自动判
 *   → 不过就自己改，改完重跑，最多三轮 → 三轮还不过就停，说清卡在哪一条
 *   → 截图、报告写进 Claude outputs/art-loop/，取景的改动写回 src/scene/stage-tune.ts
 *
 * **只自动化能量的**（D-060 边界第 1 条）。能自己改的只有一个旋钮：取景倍数。
 * 留白不够就往后退一成，退到 1.3 倍还不够就停——再退人和景的尺度就变了，那是判断。
 * 面数、毫秒、朱砂、紫、色板外卡住，一律**不自动改**：减哪件东西、哪一点红该留，
 * 都是画面的意思，机器不许替人定。循环只把卡住的那一条和截图摆出来。
 *
 * 恐怖谷、是不是仙侠了、换成男主角会不会一样、剪影、姿态、节奏——这些报告里列成待人看的清单，
 * 旁边是截图的路径，机器一个字都不判。
 *
 * 零依赖：Chrome 走 DevTools 协议，用 Node 自带的 WebSocket；vite 就是项目里那个。
 */
import { spawn, type ChildProcess } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "vite";
import { GATES, SHOTS, type Shot, type ShotResult } from "../src/scene/shots.ts";
import { STAGE_TUNE, tuneKey, type Tune } from "../src/scene/stage-tune.ts";

const ROOT = join(import.meta.dirname, "..");
const OUT = join(ROOT, "Claude outputs", "art-loop");
const PORT = 5177;
const VIEW = { width: 390, height: 844, dpr: 2 };
const MAX_ROUNDS = 3;
const FIT_STEP = 1.1;
const FIT_MAX = 1.3;

const argv = process.argv.slice(2);
const flag = (name: string): string | undefined => {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : undefined;
};
const fix = !argv.includes("--no-fix");
/**
 * 自检用：把留白门槛临时抬高，逼出「不过 → 退镜头 → 重跑」那条路。
 * 这一轮加的东西第一轮就全过了，改的那条分支从没真跑过——没跑过的代码不算做好了。
 * 抬了门槛的那一次**不写回** stage-tune.ts，报告里会标出来
 */
const blankBump = Number(flag("--blank-bump") ?? 0);
const shots = SHOTS.filter((s) =>
  (!flag("--since") || s.since === flag("--since")) && (!flag("--only") || s.key === flag("--only")));

// ------------------------------------------------------------ Chrome

function findChrome(): string {
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

interface Cdp {
  send<T = Record<string, unknown>>(method: string, params?: Record<string, unknown>): Promise<T>;
  close(): void;
}

async function launch(): Promise<{ proc: ChildProcess; cdp: Cdp; profile: string }> {
  const profile = mkdtempSync(join(tmpdir(), "art-loop-"));
  const proc = spawn(findChrome(), [
    "--headless=new", "--remote-debugging-port=0", `--user-data-dir=${profile}`,
    "--no-first-run", "--no-default-browser-check", "--hide-scrollbars",
    // 要真 GPU：软件渲染量出来的毫秒没有意义，报告里会标出来
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
  let session: string | undefined;
  const raw = <T>(method: string, params: Record<string, unknown> = {}, sid?: string): Promise<T> =>
    new Promise((resolve, reject) => {
      id += 1;
      pending.set(id, { resolve: resolve as (v: unknown) => void, reject });
      ws.send(JSON.stringify({ id, method, params, ...(sid ? { sessionId: sid } : {}) }));
    });
  const { targetId } = await raw<{ targetId: string }>("Target.createTarget", { url: "about:blank" });
  ({ sessionId: session } = await raw<{ sessionId: string }>("Target.attachToTarget", { targetId, flatten: true }));
  const cdp: Cdp = {
    send: (method, params) => raw(method, params, session),
    close: () => ws.close(),
  };
  return { proc, cdp, profile };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function evaluate<T>(cdp: Cdp, expression: string): Promise<T> {
  const r = await cdp.send<{ result: { value: T } }>("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  return r.result.value;
}

// ------------------------------------------------------------ 一次测量

async function measure(cdp: Cdp, s: Shot, fit: number, shotPath: string): Promise<ShotResult> {
  const q = new URLSearchParams({
    key: s.key, palette: s.palette, act: String(s.act), w: String(VIEW.width), h: String(VIEW.height), fit: String(fit),
  });
  if (s.dress) q.set("dress", s.dress);
  if (s.ink !== undefined) q.set("ink", String(s.ink));
  await cdp.send("Page.navigate", { url: `http://localhost:${PORT}/src/scene/stage-preview.html?${q}` });
  const t0 = Date.now();
  for (;;) {
    await sleep(250);
    const json = await evaluate<string | null>(cdp, "window.__result ? JSON.stringify(window.__result) : null").catch(() => null);
    if (json) {
      const [r] = JSON.parse(json) as ShotResult[];
      // 截图：只截舞台那一块（纸纹、墨层、雨都在），给人看剪影与构图
      const rect = await evaluate<{ x: number; y: number; w: number; h: number }>(cdp,
        "(() => { const r = document.querySelector('.stage').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; })()");
      const png = await cdp.send<{ data: string }>("Page.captureScreenshot", {
        format: "png", captureBeyondViewport: true,
        clip: { x: rect.x, y: rect.y, width: rect.w, height: rect.h, scale: 1 },
      });
      writeFileSync(shotPath, Buffer.from(png.data, "base64"));
      return r!;
    }
    if (Date.now() - t0 > 30000) throw new Error(`${s.label}：三十秒没出数`);
  }
}

interface Verdict { gate: string; ok: boolean; value: string; fixable: boolean }

function judge(r: ShotResult, softwareGl: boolean): Verdict[] {
  const minBlank = (r.palette === "gold" ? GATES.blankGold : GATES.blankInk) + blankBump;
  return [
    { gate: "面数", ok: r.tris <= GATES.tris, value: `${r.tris} / ${GATES.tris}`, fixable: false },
    // 软件渲染下毫秒只能当量级，不据此判不过
    { gate: "每帧", ok: softwareGl || r.ms <= GATES.ms, value: `${r.ms.toFixed(2)} ms${softwareGl ? "（软件渲染，不作数）" : ""}`, fixable: false },
    { gate: "留白", ok: r.blank >= minBlank, value: `${r.blank.toFixed(1)}% / ≥${minBlank}%`, fixable: true },
    // 金碧板没有红：朝廷画面里的每一点朱砂都得是一个事件，场景本身一点都不许有
    { gate: "朱砂", ok: r.palette === "gold" ? r.accent <= 0.05 : r.accent <= GATES.accent,
      value: `${r.accent.toFixed(2)}% / ${r.palette === "gold" ? "金碧 0" : `≤${GATES.accent}%`}`, fixable: false },
    { gate: "紫", ok: r.purple <= GATES.purple && (r.purple === 0 || r.purple < r.accent),
      value: `${r.purple.toFixed(2)}% / ≤${GATES.purple}% 且小于朱砂`, fixable: false },
    { gate: "色板外", ok: r.offPalette <= GATES.offPalette, value: `${r.offPalette.toFixed(2)}% / ≤${GATES.offPalette}%`, fixable: false },
  ];
}

// ------------------------------------------------------------ 主流程

interface Row { shot: Shot; rounds: { fit: number; r: ShotResult; v: Verdict[]; png: string }[]; tuneTo?: number }

async function main(): Promise<void> {
  if (!shots.length) throw new Error("没有要跑的场景（--since / --only 过滤完是空的）");
  mkdirSync(OUT, { recursive: true });
  const server = await createServer({ root: ROOT, logLevel: "error", server: { port: PORT, strictPort: true, host: "127.0.0.1" } });
  await server.listen();
  const { proc, cdp, profile } = await launch();
  const rows: Row[] = [];
  let glName = "?";
  try {
    await cdp.send("Page.enable");
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: VIEW.width + 40, height: VIEW.height + 140, deviceScaleFactor: VIEW.dpr, mobile: true,
    });
    await cdp.send("Page.navigate", { url: `http://localhost:${PORT}/src/scene/stage-preview.html?key=yeting&w=8&h=8` });
    await sleep(1500);
    glName = await evaluate<string>(cdp, `(() => { const gl = document.createElement('canvas').getContext('webgl');
      const e = gl && gl.getExtension('WEBGL_debug_renderer_info'); return e ? gl.getParameter(e.UNMASKED_RENDERER_WEBGL) : 'unknown'; })()`);
    const softwareGl = /swiftshader|llvmpipe|software/i.test(glName);
    console.log(`GPU：${glName}${softwareGl ? "（软件渲染：每帧毫秒不作数）" : ""}\n`);

    for (const s of shots) {
      const tk = tuneKey(s.key, s.palette, s.dress ?? "");
      let fit = STAGE_TUNE[tk]?.fit ?? 1;
      const row: Row = { shot: s, rounds: [] };
      for (let round = 1; round <= MAX_ROUNDS; round++) {
        const png = join(OUT, `${s.key}-${s.palette}-${s.act}${s.dress ? "-" + s.dress : ""}-r${round}.png`);
        const r = await measure(cdp, s, fit, png);
        const v = judge(r, softwareGl);
        row.rounds.push({ fit, r, v, png });
        const bad = v.filter((x) => !x.ok);
        const mark = bad.length ? `✗ ${bad.map((b) => b.gate).join("、")}` : "✓";
        console.log(`${s.label}  第${round}轮 fit ${fit.toFixed(2)}  ${r.tris} 面  ${r.ms.toFixed(2)} ms  留白 ${r.blank.toFixed(1)}%  朱砂 ${r.accent.toFixed(2)}%  色板外 ${r.offPalette.toFixed(2)}%  ${mark}`);
        if (!bad.length) {
          if (fit !== (STAGE_TUNE[tk]?.fit ?? 1)) row.tuneTo = fit;
          break;
        }
        // 只要有一条不是取景能改的，就不试了：退镜头救不了面数，也不该拿退镜头去稀释一点多出来的红
        if (!fix || bad.some((b) => !b.fixable) || fit * FIT_STEP > FIT_MAX + 1e-6) break;
        fit = Math.round(fit * FIT_STEP * 100) / 100;
      }
      rows.push(row);
    }
  } finally {
    cdp.close();
    proc.kill();
    await server.close();
    await sleep(300);
    try { rmSync(profile, { recursive: true, force: true }); } catch { /* Chrome 还攥着文件锁就留着，系统临时目录 */ }
  }

  // 取景改动写回
  const changed = rows.filter((r) => r.tuneTo !== undefined);
  if (changed.length && fix && !blankBump) {
    const next: Record<string, Tune> = { ...STAGE_TUNE };
    for (const r of changed) next[tuneKey(r.shot.key, r.shot.palette, r.shot.dress ?? "")] = { fit: r.tuneTo };
    const body = Object.keys(next).sort().map((k) => `  ${JSON.stringify(k)}: ${JSON.stringify(next[k])},`).join("\n");
    const path = join(ROOT, "src", "scene", "stage-tune.ts");
    const head = (await import("node:fs")).readFileSync(path, "utf8").split("export const STAGE_TUNE")[0];
    writeFileSync(path, `${head}export const STAGE_TUNE: Record<string, Tune> = {\n${body}\n};\n`);
  }

  const failed = rows.filter((r) => r.rounds.at(-1)!.v.some((x) => !x.ok));
  const md: string[] = [
    `# 自动审查循环报告`, ``,
    `${new Date().toISOString()} · 视口 ${VIEW.width}×${VIEW.height} @${VIEW.dpr}x · GPU：${glName}`,
    blankBump ? `**自检：留白门槛临时抬高 ${blankBump} 个点，取景不写回**` : "", ``,
    `| 场景状态 | 轮 | 取景 | 面 | ms | 留白 | 朱砂 | 紫 | 色板外 | 结论 |`,
    `|---|---|---|---|---|---|---|---|---|---|`,
  ];
  for (const row of rows) {
    const last = row.rounds.at(-1)!;
    const bad = last.v.filter((x) => !x.ok);
    const r = last.r;
    md.push(`| ${row.shot.label} | ${row.rounds.length} | ${last.fit.toFixed(2)}${row.tuneTo ? "（已写回）" : ""} | ${r.tris} | ${r.ms.toFixed(2)} | ${r.blank.toFixed(1)}% | ${r.accent.toFixed(2)}% | ${r.purple.toFixed(2)}% | ${r.offPalette.toFixed(2)}% | ${bad.length ? "卡在 " + bad.map((b) => `${b.gate}（${b.value}）`).join("、") : "六条过"} |`);
  }
  md.push(``, `## 机器不判的，交人看`, ``,
    `每张截图逐条过：**恐怖谷**、**是不是仙侠了**、**换成男主角会不会一样**（art-style 第 4–6 条），`,
    `以及 art-director 的**剪影、姿态、节奏**。还有一条清单里没有、但 E5 那匹马说明必须有的：**这里该不该有这个东西**。`, ``);
  for (const row of rows) md.push(`- ${row.shot.label}：\`${row.rounds.at(-1)!.png.replace(ROOT + "\\", "").replace(ROOT + "/", "")}\``);
  writeFileSync(join(OUT, "report.md"), md.join("\n") + "\n");
  console.log(`\n${rows.length - failed.length}/${rows.length} 过。报告：Claude outputs/art-loop/report.md`);
  if (changed.length) {
    const what = changed.map((r) => `${r.shot.label} → ${r.tuneTo}`).join("、");
    console.log(fix && !blankBump ? `取景写回 stage-tune.ts：${what}` : `取景试出来了但没写回（${blankBump ? "自检" : "--no-fix"}）：${what}`);
  }
  if (failed.length) process.exitCode = 1;
}

main().catch((e) => { console.error(e); process.exit(2); });
