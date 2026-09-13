/**
 * Tripo 这条链（D-074、D-080）。
 *
 *   npm run tripo -- check                       第 0 步，不花钱：鉴权、余额、上传拿 image_token、查一个不存在的任务看错误形状、把提交的请求体摆出来
 *   npm run tripo -- ref --v 3                   渲参考图第 N 版 → Claude outputs/tripo/peizhaoye-ref-vN.png（不覆盖旧版）
 *   npm run tripo -- balance                     查余额（不花钱）
 *   npm run tripo -- submit --image <png> --confirm    建 image_to_model 任务（约 25 credits）
 *   npm run tripo -- wait <task_id>              轮询到结束（不花钱），glb 下载到 Claude outputs/tripo/
 *   npm run tripo -- rigcheck <task_id>          能不能绑（不花钱）
 *   npm run tripo -- rig <task_id> --confirm     绑骨（约 25 credits）。**只在几何验收通过之后**
 *
 * **凭证**（D-075）：只从环境变量 TRIPO_API_KEY 读。代码、日志、报告里都不出现它的值，连前几位也不打。
 * 读不到就报「TRIPO_API_KEY 未设置」。
 *
 * **花钱纪律**（D-080，六条都落在代码里，不靠自觉）：
 * 1. 先跑不花钱的：`check` 把提交之前的每一步跑通，不通就不许 submit（submit 会检查 check 的结果）
 * 2. 一次一个：没有批量命令；上一个任务还没到终态，submit 拒绝
 * 3. 绑骨是第二步：`rig` 要求那个模型在账本里被标了「几何验收通过」
 * 4. 失败不自动重试：任何一步失败就停，打印原因，退出
 * 5. 记账 docs/tripo-ledger.md：花钱前先写一行「预计」，花完补「实际」和余额
 * 6. 每轮硬上限（--round 指定轮次，默认 E8）：这一轮账本里已花 + 这一次预计 > 上限，拒绝
 *
 * 接口照 Tripo 官方 Python SDK（VAST-AI-Research/tripo-python-sdk）的实现写。
 * 生成参数对着 art-cc3-p2-spec.md 的规格表：texture/pbr 关、face_limit 2600，其余走服务端默认。
 */
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createServer } from "vite";
import { launch, sleep } from "./cdp.ts";

const ROOT = join(import.meta.dirname, "..");
const OUT = join(ROOT, "Claude outputs", "tripo");
const STATE = join(OUT, "state.json");
const LEDGER = join(ROOT, "docs", "tripo-ledger.md");
const BASE = "https://api.tripo3d.ai/v2/openapi";

export const TASK_PARAMS = { texture: false, pbr: false, face_limit: 2600 } as const;
const COST = { image_to_model: 25, animate_rig: 25 } as const;
const CAP: Record<string, number> = { E8: 60 };

const [cmd, ...rest] = process.argv.slice(2);
const confirmed = rest.includes("--confirm");
const opt = (name: string): string | undefined => { const i = rest.indexOf(name); return i >= 0 ? rest[i + 1] : undefined; };
const arg = rest.find((a, i) => !a.startsWith("--") && !(i > 0 && rest[i - 1]!.startsWith("--") && rest[i - 1] !== "--confirm"));
const round = opt("--round") ?? "E8";

function key(): string {
  const k = process.env.TRIPO_API_KEY;
  if (!k) { console.error("TRIPO_API_KEY 未设置"); process.exit(3); }
  return k;
}

interface State {
  checkedAt?: string; checkedImage?: string;
  tasks: { id: string; type: string; at: string; note?: string; status?: string; credits?: number; geometryOk?: boolean }[];
}
const loadState = (): State => existsSync(STATE) ? JSON.parse(readFileSync(STATE, "utf8")) : { tasks: [] };
const saveState = (s: State) => { mkdirSync(OUT, { recursive: true }); writeFileSync(STATE, JSON.stringify(s, null, 2)); };

// ------------------------------------------------------------ 账本

function ledgerInit(): void {
  if (existsSync(LEDGER)) return;
  writeFileSync(LEDGER, `# Tripo 账本（D-080）

> 每次调用一行。**花钱前先写预计，花完补实际。** 由 \`tools/tripo.ts\` 自动写；人手补的在备注里说明。
> 不花钱的调用（查余额、查任务、上传、rig check）也记，预计与实际写 0。

| 时间 | 轮次 | 做了什么 | 预计 | 实际 | 余额（之后） | 拿到了什么 |
|---|---|---|---|---|---|---|
`);
}
/** 把提交时写下的那一行「待补」原地补上实际与余额。按任务 id 前缀找；找不到才另起一行 */
function ledgerSettle(id: string, actual: number, balance: number): boolean {
  if (!existsSync(LEDGER)) return false;
  const lines = readFileSync(LEDGER, "utf8").split("\n");
  const i = lines.findIndex((l) => l.includes(id.slice(0, 8)) && l.includes("| 待补 |"));
  if (i < 0) return false;
  lines[i] = lines[i]!.replace("| 待补 |", `| ${actual} |`).replace("| 待查 |", `| ${balance} |`);
  writeFileSync(LEDGER, lines.join("\n"));
  return true;
}
function ledger(row: { what: string; est: number; actual: number | "待补"; balance: number | "待查"; got: string }): void {
  ledgerInit();
  const t = new Date().toISOString().replace("T", " ").slice(0, 16);
  appendFileSync(LEDGER, `| ${t} | ${round} | ${row.what} | ${row.est} | ${row.actual} | ${row.balance} | ${row.got} |\n`);
}
/** 提交成功后，把最后一行「（提交中）」补上任务 id，之后结算按它找 */
function ledgerNameTask(id: string): void {
  const lines = readFileSync(LEDGER, "utf8").split("\n");
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i]!.includes("（提交中）")) {
      lines[i] = lines[i]!.replace(" | 25 | 待补 |", `，任务 ${id.slice(0, 8)}… | 25 | 待补 |`).replace("（提交中）", "见结算");
      break;
    }
  }
  writeFileSync(LEDGER, lines.join("\n"));
}
/** 这一轮账本里已经花掉（或预计要花、还没补实际）的 credits */
function spentThisRound(): number {
  if (!existsSync(LEDGER)) return 0;
  let sum = 0;
  for (const line of readFileSync(LEDGER, "utf8").split("\n")) {
    const c = line.split("|").map((x) => x.trim());
    if (c.length < 8 || c[2] !== round) continue;
    const actual = Number(c[5]);
    sum += Number.isFinite(actual) && c[5] !== "" ? actual : Number(c[4]) || 0;
  }
  return sum;
}
function guardCap(est: number): void {
  const cap = CAP[round];
  if (cap === undefined) { console.error(`轮次 ${round} 没有定上限，不花钱。改 tools/tripo.ts 的 CAP 之前先问 Cowork`); process.exit(4); }
  const spent = spentThisRound();
  if (spent + est > cap) { console.error(`这一轮已花（含预计）${spent}，再花 ${est} 超过上限 ${cap}。停，问 Cowork`); process.exit(4); }
}

// ------------------------------------------------------------ 接口

interface Resp<T> { code?: number; message?: string; data?: T; suggestion?: string }

async function call<T>(method: string, path: string, body?: unknown): Promise<{ ok: boolean; status: number; json: Resp<T> }> {
  const res = await fetch(BASE + path, {
    method,
    headers: { Authorization: `Bearer ${key()}`, ...(body ? { "Content-Type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({})) as Resp<T>;
  return { ok: res.ok && (json.code === undefined || json.code === 0), status: res.status, json };
}
async function api<T>(method: string, path: string, body?: unknown): Promise<T> {
  const r = await call<T>(method, path, body);
  // 出错只打状态码和服务端的错误信息，不打请求头
  if (!r.ok) throw new Error(`Tripo ${method} ${path} → ${r.status} ${r.json.code ?? ""} ${r.json.message ?? ""} ${r.json.suggestion ?? ""}`.trim());
  return r.json.data as T;
}
const balanceNow = async () => (await api<{ balance: number; frozen: number }>("GET", "/user/balance"));

async function upload(image: string): Promise<string> {
  const form = new FormData();
  form.append("file", new Blob([readFileSync(image)], { type: "image/png" }), "ref.png");
  const up = await fetch(`${BASE}/upload`, { method: "POST", headers: { Authorization: `Bearer ${key()}` }, body: form });
  const j = await up.json().catch(() => ({})) as Resp<{ image_token: string }>;
  if (!up.ok || !j.data?.image_token) throw new Error(`上传失败：${up.status} ${j.code ?? ""} ${j.message ?? ""}`);
  return j.data.image_token;
}

// ------------------------------------------------------------ 命令

const imageArg = () => join(OUT, opt("--image") ?? "peizhaoye-ref.png");

async function check(): Promise<void> {
  const image = imageArg();
  const step = (ok: boolean, what: string) => console.log(`${ok ? "✓" : "✗"} ${what}`);
  if (!existsSync(image)) { step(false, `参考图不在：${image}`); process.exit(5); }
  const b0 = await balanceNow();
  step(true, `鉴权通过，余额 ${b0.balance}，冻结 ${b0.frozen}`);
  ledger({ what: "check：查余额", est: 0, actual: 0, balance: b0.balance, got: "鉴权通过" });
  const token = await upload(image);
  step(true, `上传拿到 image_token（${token.length} 字符，不打印）`);
  const b1 = await balanceNow();
  step(b1.balance === b0.balance, `上传不花钱：余额 ${b0.balance} → ${b1.balance}`);
  ledger({ what: "check：上传参考图", est: 0, actual: b0.balance - b1.balance, balance: b1.balance, got: "image_token" });
  const fake = await call("GET", "/task/00000000-0000-0000-0000-000000000000");
  step(!fake.ok && fake.status !== 401 && fake.status !== 403,
    `查一个不存在的任务：HTTP ${fake.status}，code ${fake.json.code ?? "—"}（不是 401/403，说明查询这条路有权限，错误能读出来）`);
  ledger({ what: "check：查不存在的任务", est: 0, actual: 0, balance: b1.balance, got: `HTTP ${fake.status} code ${fake.json.code ?? "—"}` });
  const body = { type: "image_to_model", file: { type: "png", file_token: "<上面拿到的 token>" }, ...TASK_PARAMS };
  step(true, `提交请求体：${JSON.stringify(body)}`);
  const s = loadState();
  s.checkedAt = new Date().toISOString();
  s.checkedImage = image;
  saveState(s);
  console.log("\n第 0 步全通。可以 submit。");
}

async function ref(): Promise<void> {
  const v = opt("--v");
  if (!v) throw new Error("要 --v <版本号>：参考图按版本存，不覆盖旧版（旧版可能已经被拿去生成过）");
  const file = join(OUT, `peizhaoye-ref-v${v}.png`);
  if (existsSync(file)) throw new Error(`${file} 已经存在。旧版不覆盖，换个版本号`);
  mkdirSync(OUT, { recursive: true });
  const port = 5180;
  const server = await createServer({ root: ROOT, logLevel: "error", server: { port, strictPort: true, host: "127.0.0.1" } });
  await server.listen();
  const b = await launch();
  try {
    await b.cdp.send("Page.enable");
    await b.cdp.send("Emulation.setDeviceMetricsOverride", { width: 1100, height: 1100, deviceScaleFactor: 1, mobile: false });
    await b.cdp.send("Page.navigate", { url: `http://localhost:${port}/src/scene/tripo-ref.html?v=${v}` });
    let data: string | null = null;
    for (let i = 0; i < 60 && !data; i++) { await sleep(250); data = await b.cdp.evaluate<string | null>("window.__ref ?? null").catch(() => null); }
    if (!data) throw new Error("参考图十五秒没渲出来");
    writeFileSync(file, Buffer.from(data.split(",")[1]!, "base64"));
    await b.cdp.send("Emulation.setDeviceMetricsOverride", { width: 1640, height: 760, deviceScaleFactor: 1, mobile: false });
    await b.cdp.send("Page.navigate", { url: `http://localhost:${port}/src/scene/tripo-ref.html?view=sheet&v=${v}` });
    await sleep(2500);
    const shot = await b.cdp.send<{ data: string }>("Page.captureScreenshot", { format: "png" });
    writeFileSync(join(OUT, `peizhaoye-ref-v${v}-sheet.png`), Buffer.from(shot.data, "base64"));
    console.log(`参考图：${file}\n审图页：${join(OUT, `peizhaoye-ref-v${v}-sheet.png`)}`);
  } finally {
    await b.dispose();
    await server.close();
  }
}

async function view(f: string): Promise<void> {
  const port = 5181;
  const server = await createServer({ root: ROOT, logLevel: "error", server: { port, strictPort: true, host: "127.0.0.1" } });
  await server.listen();
  const b = await launch();
  try {
    await b.cdp.send("Page.enable");
    await b.cdp.send("Emulation.setDeviceMetricsOverride", { width: 1900, height: 440, deviceScaleFactor: 1, mobile: false });
    await b.cdp.send("Page.navigate", { url: `http://localhost:${port}/src/scene/tripo-view.html?file=${encodeURIComponent(f)}` });
    let info: string | null = null;
    for (let i = 0; i < 120 && !info; i++) { await sleep(250); info = await b.cdp.evaluate<string | null>("window.__view ? JSON.stringify(window.__view) : null").catch(() => null); }
    if (!info) throw new Error("模型三十秒没渲出来");
    await sleep(500);
    const shot = await b.cdp.send<{ data: string }>("Page.captureScreenshot", { format: "png" });
    const out = join(OUT, f.replace(/\.glb$/, "") + "-views.png");
    writeFileSync(out, Buffer.from(shot.data, "base64"));
    console.log(`${info}
六视图：${out}`);
  } finally {
    await b.dispose();
    await server.close();
  }
}

async function balance(): Promise<void> {
  const d = await balanceNow();
  console.log(`余额 ${d.balance}，冻结 ${d.frozen}`);
}

async function submit(): Promise<void> {
  const image = imageArg();
  const s = loadState();
  if (!s.checkedAt || s.checkedImage !== image) { console.error("先跑 check（第 0 步），而且要用同一张图"); process.exit(5); }
  const open = s.tasks.find((t) => !t.status || ["queued", "running"].includes(t.status));
  if (open) { console.error(`上一个任务 ${open.id.slice(0, 8)}… 还没到终态。一次一个`); process.exit(5); }
  guardCap(COST.image_to_model);
  if (!confirmed) { console.log(`约 ${COST.image_to_model} credits。参数：${JSON.stringify(TASK_PARAMS)}。加 --confirm 才提交`); return; }
  const before = await balanceNow();
  // 先记预计，再花
  ledger({ what: `image_to_model 提交（${image.split(/[\\/]/).pop()}）`, est: COST.image_to_model, actual: "待补", balance: "待查", got: "（提交中）" });
  const token = await upload(image);
  const { task_id } = await api<{ task_id: string }>("POST", "/task", {
    type: "image_to_model", file: { type: "png", file_token: token }, ...TASK_PARAMS,
  });
  ledgerNameTask(task_id);
  s.tasks.push({ id: task_id, type: "image_to_model", at: new Date().toISOString(), note: image.split(/[\\/]/).pop() });
  saveState(s);
  console.log(`已提交 image_to_model：${task_id}（提交前余额 ${before.balance}）\n接着：npm run tripo -- wait ${task_id}`);
}

interface Task { task_id: string; type: string; status: string; progress?: number; consumed_credit?: number; error_msg?: string;
  output?: { model?: string; base_model?: string; pbr_model?: string; rendered_image?: string; riggable?: boolean } }

async function wait(id: string, quiet = false): Promise<Task> {
  for (;;) {
    const t = await api<Task>("GET", `/task/${id}`);
    if (!quiet) process.stdout.write(`\r${t.type} ${t.status} ${t.progress ?? 0}%   `);
    if (["queued", "running"].includes(t.status)) { await sleep(4000); continue; }
    if (!quiet) console.log("");
    const s = loadState();
    const row = s.tasks.find((x) => x.id === id);
    const bal = await balanceNow();
    if (row) { row.status = t.status; row.credits = t.consumed_credit; saveState(s); }
    const got: string[] = [];
    if (t.status === "success") {
      const url = t.output?.model ?? t.output?.base_model ?? t.output?.pbr_model;
      if (url) {
        const ext = (url.split("?")[0]!.match(/\.(glb|fbx|obj|zip)$/i)?.[1] ?? "glb").toLowerCase();
        const file = join(OUT, `peizhaoye-${t.type}-${id.slice(0, 8)}.${ext}`);
        try {
          writeFileSync(file, Buffer.from(await (await fetch(url)).arrayBuffer()));
          got.push(`${ext} ${(readFileSync(file).length / 1024).toFixed(0)} KB`);
          console.log(`下载：${file}`);
        } catch {
          // 已经下过一次就不算失败：下载地址是带时效的，重查任务时可能已经取不到
          got.push(existsSync(file) ? `${ext} 已在本地（重下失败）` : `${ext} 下载失败`);
        }
      }
      if (t.output?.rendered_image) {
        // 预览图是附带的，取不到不影响账本和模型（E8 第一次跑时这里 fetch failed，账本的实际消耗就没写上）
        try {
          writeFileSync(join(OUT, `peizhaoye-${id.slice(0, 8)}-preview.webp`), Buffer.from(await (await fetch(t.output.rendered_image)).arrayBuffer()));
          got.push("预览图");
        } catch { got.push("预览图没取到"); }
      }
      if (t.output?.riggable !== undefined) got.push(`riggable=${t.output.riggable}`);
    }
    if (row?.type && row.type in COST) {
      // 实际消耗补回提交那一行（原地改），结果另记一行、实际写 0，免得上限那道闸重复计
      const settled = t.consumed_credit !== undefined && ledgerSettle(id, t.consumed_credit, bal.balance);
      ledger({ what: `${t.type} 结果（${id.slice(0, 8)}…）：${t.status}${t.error_msg ? "，" + t.error_msg : ""}`, est: 0,
        actual: settled ? 0 : (t.consumed_credit ?? "待补"), balance: bal.balance, got: got.join("、") || "—" });
    }
    // 失败不自动重试（D-080 第 4 条）
    if (t.status !== "success") { console.error(`任务没成：${t.status}${t.error_msg ? "，" + t.error_msg : ""}。停，不重试`); process.exit(6); }
    return t;
  }
}

async function rigcheck(id: string): Promise<void> {
  const r = await api<{ task_id: string }>("POST", "/task", { type: "animate_prerigcheck", original_model_task_id: id });
  const t = await wait(r.task_id, true);
  ledger({ what: `rig check（${id.slice(0, 8)}…）`, est: 0, actual: t.consumed_credit ?? 0, balance: (await balanceNow()).balance, got: `riggable=${t.output?.riggable}` });
  console.log(`riggable = ${t.output?.riggable}`);
}

async function rig(id: string): Promise<void> {
  const s = loadState();
  const model = s.tasks.find((t) => t.id === id);
  if (!model?.geometryOk) { console.error("这个模型没有标「几何验收通过」。绑骨永远是第二步（D-080 第 3 条）"); process.exit(5); }
  guardCap(COST.animate_rig);
  if (!confirmed) { console.log(`约 ${COST.animate_rig} credits，加 --confirm`); return; }
  ledger({ what: `animate_rig 提交（${id.slice(0, 8)}…）`, est: COST.animate_rig, actual: "待补", balance: "待查", got: "（提交中）" });
  const r = await api<{ task_id: string }>("POST", "/task", { type: "animate_rig", original_model_task_id: id, out_format: "glb", rig_type: "biped", spec: "tripo" });
  ledgerNameTask(r.task_id);
  s.tasks.push({ id: r.task_id, type: "animate_rig", at: new Date().toISOString(), note: `绑 ${id.slice(0, 8)}` });
  saveState(s);
  await wait(r.task_id);
}

const run: Record<string, () => Promise<void>> = {
  check, ref, balance, submit,
  view: async () => { if (!arg) throw new Error("要 glb 文件名（Claude outputs/tripo/ 下）"); await view(arg); },
  wait: async () => { if (!arg) throw new Error("要 task_id"); await wait(arg); },
  rigcheck: async () => { if (!arg) throw new Error("要 task_id"); await rigcheck(arg); },
  rig: async () => { if (!arg) throw new Error("要 task_id"); await rig(arg); },
};
if (!cmd || !run[cmd]) {
  console.log("用法：npm run tripo -- check | ref --v N | balance | submit [--image f] [--confirm] | wait <id> | rigcheck <id> | rig <id> [--confirm]");
  process.exit(1);
}
run[cmd]!().catch((e) => { console.error(e instanceof Error ? e.message : e); process.exit(2); });
