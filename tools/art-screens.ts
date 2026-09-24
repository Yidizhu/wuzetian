/**
 * 整屏闭环（D-071）：玩家实际看到的那一屏——场景 + 立绘 + 对话框 + HUD，手机视口。
 * **这一张才是验收对象。** art-loop 量的场景那一层只是它的一部分。
 *
 *   npm run art:screens                        第一到三章每一场
 *   npm run art:screens -- ch01_s01_zhaoyang   只截某几场
 *   npm run art:screens -- --chapter 2         只截一章
 *
 * 每一场：写一份自动存档把人放到「第二个人第一次开口」那一句（台上有人站着、有人说话，最接近玩家看到的样子），
 * 默认 3D 渲染器，等推镜走完，截整屏，再从 DOM 和像素里量几样**能量的**：
 *
 * - **脚**：每个立绘最低一笔墨离对话框顶边多少像素。负数就是脚被框吃了
 * - **出屏**：立绘有多少露在视口外
 * - **透明**：立绘格子的不透明度（D-072 修过，防回退）
 * - **留白连不连成片**（R-017 第 6 条）：对话框以上的画面切成 10px 的格，纸色的格里最大一块连通区域占全部留白的几成。
 *   百分比够、却被横梁和柱子切成碎块的那一屏，这个比值会掉下来。**它只报数，不判过不过**——碎是不是坏，看画
 *
 * 机器不判的三件事（D-071）列在报告里，截图旁边留着给人填：
 * **立绘和场景是不是同一个空间**（比例、地平线、透视）、**有没有穿帮**（半透明、悬空、断开）、**对话框压住了什么**。
 *
 * 输出：Claude outputs/art-screens/（截图、report.md、sheet.html 一页看全部）。不进版本库。
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createServer } from "vite";
import { DATA_VERSION } from "../src/engine/types.ts";
import { decodePng, launch, sleep } from "./cdp.ts";

const ROOT = join(import.meta.dirname, "..");
const OUT_BASE = join(ROOT, "Claude outputs", "art-screens");

const PORT = 5179;
const VIEW = { width: 390, height: 844, dpr: 2 };

const argv = process.argv.slice(2);
const chIdx = argv.indexOf("--chapter");
const onlyChapter = chIdx >= 0 ? argv[chIdx + 1] : undefined;
const setIdx = argv.indexOf("--set");
/** 色板集（E9）：`--set tang` 在页面脚本跑之前给根元素加 data-palette-set，截图落到 art-screens-tang/ */
const paletteSet = setIdx >= 0 ? argv[setIdx + 1] : undefined;
const OUT = paletteSet ? `${OUT_BASE}-${paletteSet}` : OUT_BASE;
const picked = argv.filter((a, i) => !a.startsWith("--") && (chIdx < 0 || i !== chIdx + 1) && (setIdx < 0 || i !== setIdx + 1));

interface SceneFile { id: string; chapter: number; scene: string; palette: string; cast: string[]; dressing?: string;
  lines: { id: string; who: string; kind?: string }[] }

function loadScenes(): SceneFile[] {
  const dir = join(ROOT, "src", "data", "chapters");
  const out: SceneFile[] = [];
  for (const ch of readdirSync(dir).sort()) {
    for (const f of readdirSync(join(dir, ch)).filter((x) => x.endsWith(".json")).sort()) {
      out.push(JSON.parse(readFileSync(join(dir, ch, f), "utf8")));
    }
  }
  return out.filter((s) => (!onlyChapter || String(s.chapter) === onlyChapter) && (!picked.length || picked.includes(s.id)));
}

/** 截哪一句：第二个人第一次开口；没有就主角第一次开口；再没有就第一句 */
function pickLine(s: SceneFile): number {
  const other = s.lines.findIndex((l) => l.who !== "wuze" && s.cast.includes(l.who));
  if (other >= 0) return other;
  const self = s.lines.findIndex((l) => l.who === "wuze");
  return self >= 0 ? self : 0;
}

interface Measure {
  renderer: string; palette: string; floor: string; person: string;
  /** 「真人该多高 地线原本在哪」，渲染器写在根元素 data-stage-raw 上 */
  raw: string;
  dlgTop: number;
  slots: { who: string; active: string; opacity: number; feet: number | null; box: number[] }[];
  grounds: string[];
}

interface Row {
  s: SceneFile; line: number; png: string;
  m: Measure;
  blank: number; largest: number; frag: number;
  flags: string[];
}

function hexRgb(h: string): [number, number, number] | null {
  const m = h.trim().match(/^#([0-9a-f]{6})$/i);
  if (!m) return null;
  const n = parseInt(m[1]!, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** 对话框以上的画面按 10px 切格，算纸色格占比和最大连通块 */
function blankness(png: Buffer, m: Measure): { blank: number; largest: number } {
  const img = decodePng(png);
  const cell = 10 * VIEW.dpr;
  const cols = Math.floor(img.width / cell), rows = Math.floor((m.dlgTop * VIEW.dpr) / cell);
  const grounds = m.grounds.map(hexRgb).filter((g): g is [number, number, number] => !!g);
  const blankCell = new Uint8Array(cols * rows);
  for (let cy = 0; cy < rows; cy++) {
    for (let cx = 0; cx < cols; cx++) {
      let hit = 0, n = 0;
      for (let y = cy * cell; y < (cy + 1) * cell; y += 2) {
        for (let x = cx * cell; x < (cx + 1) * cell; x += 2) {
          const o = (y * img.width + x) * 4;
          const r = img.data[o]!, g = img.data[o + 1]!, b = img.data[o + 2]!;
          n++;
          // 纸纹是 multiply 叠上去的，纸色会暗一点点，容差放宽到 16
          if (grounds.some((c) => Math.abs(r - c[0]) < 16 && Math.abs(g - c[1]) < 16 && Math.abs(b - c[2]) < 16)) hit++;
        }
      }
      blankCell[cy * cols + cx] = hit / n >= 0.85 ? 1 : 0;
    }
  }
  const total = blankCell.reduce((a, v) => a + v, 0);
  const seen = new Uint8Array(cols * rows);
  let largest = 0;
  for (let i = 0; i < blankCell.length; i++) {
    if (!blankCell[i] || seen[i]) continue;
    let size = 0;
    const stack = [i];
    seen[i] = 1;
    while (stack.length) {
      const k = stack.pop()!;
      size++;
      const x = k % cols, y = (k / cols) | 0;
      for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]] as const) {
        if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
        const j = ny * cols + nx;
        if (blankCell[j] && !seen[j]) { seen[j] = 1; stack.push(j); }
      }
    }
    largest = Math.max(largest, size);
  }
  return { blank: (total / (cols * rows)) * 100, largest: (largest / (cols * rows)) * 100 };
}

async function main(): Promise<void> {
  const scenes = loadScenes();
  if (!scenes.length) throw new Error("没有要截的场");
  mkdirSync(OUT, { recursive: true });
  const server = await createServer({ root: ROOT, logLevel: "error", server: { port: PORT, strictPort: true, host: "127.0.0.1" } });
  await server.listen();
  const browser = await launch();
  const { cdp } = browser;
  const rows: Row[] = [];
  try {
    await cdp.send("Page.enable");
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: VIEW.width, height: VIEW.height, deviceScaleFactor: VIEW.dpr, mobile: true });
    if (paletteSet) {
      await cdp.send("Page.addScriptToEvaluateOnNewDocument", {
        // 不能在这里直接写：注入的时候 <html> 还没被解析器建出来，写上去的属性会丢。
        // 解析完（interactive）到模块脚本开跑之前有一拍，在那一拍写
        source: `document.addEventListener("readystatechange", () => {
          if (document.readyState === "interactive") document.documentElement.dataset.paletteSet = ${JSON.stringify(paletteSet)};
        });`,
      });
    }
    for (const s of scenes) {
      const line = pickLine(s);
      const save = {
        version: 1, dataVersion: DATA_VERSION, savedAt: 0, sceneId: s.id, lineIndex: line,
        stats: { shi: 5, ming: 5, cai: 5, xin: 5 }, affinity: {}, flags: {}, protagonistName: "吾则添",
        seenLineIds: [], poemsCollected: [], endingsUnlocked: [], letters: [], lastSeenAt: 0,
        // 登场卡关着截：卡只挂第一句，截到的这一句多半不是第一句，开着反而不稳
        introsSeen: s.cast,
      };
      await cdp.send("Page.navigate", { url: `http://localhost:${PORT}/?notitle=1&renderer=three` });
      await sleep(500);
      await cdp.evaluate(`localStorage.clear(); localStorage.setItem("wuzetian.notice.storage","1");
        localStorage.setItem("wuzetian.save.0", ${JSON.stringify(JSON.stringify(save))}); true`);
      await cdp.send("Page.navigate", { url: `http://localhost:${PORT}/?notitle=1&renderer=three` });
      await sleep(4600);        // 推镜 2.6 秒 + 立绘挂上 + 打字机
      const m = await cdp.evaluate<Measure>(`(() => {
        const root = getComputedStyle(document.documentElement);
        const dlg = document.querySelector('.dlg');
        const dlgTop = dlg && !dlg.hidden ? dlg.getBoundingClientRect().top : innerHeight;
        return {
          renderer: document.querySelector('.stage')?.className ?? '',
          palette: document.documentElement.dataset.palette ?? '',
          floor: root.getPropertyValue('--stage-floor').trim(),
          person: root.getPropertyValue('--stage-person').trim() || '1',
          raw: document.documentElement.dataset.stageRaw ?? '',
          dlgTop,
          grounds: [root.getPropertyValue('--c-ground').trim(), root.getPropertyValue('--c-ground-night').trim()],
          slots: [...document.querySelectorAll('.cast__slot')].map((n) => {
            const r = n.getBoundingClientRect();
            let feet = null;
            n.querySelectorAll('path,ellipse,rect,circle,polygon').forEach((p) => {
              const b = p.getBoundingClientRect();
              if (b.height > 0 && b.width > 0) feet = Math.max(feet ?? -1e9, b.bottom);
            });
            return { who: n.dataset.char, active: n.dataset.active ?? '', opacity: Number(getComputedStyle(n).opacity),
              feet, box: [r.left, r.top, r.width, r.height].map((v) => Math.round(v)) };
          }),
        };
      })()`);
      const shot = await cdp.send<{ data: string }>("Page.captureScreenshot", { format: "png" });
      const buf = Buffer.from(shot.data, "base64");
      const png = join(OUT, `${s.id}.png`);
      writeFileSync(png, buf);
      const { blank, largest } = blankness(buf, m);
      const flags: string[] = [];
      if (!m.renderer.includes("three")) flags.push("不是 3D");
      {
        const [ph, fl] = m.raw.split(" ").map(Number);
        const slot = 0.72 * 0.86;
        if (ph !== undefined && ph / slot < 0.62) flags.push(`人按相机只该 ${(ph * 100).toFixed(0)}% 高，夹到 0.62`);
        if (fl !== undefined && fl > 0.42) flags.push(`地线原在 ${(fl * 100).toFixed(0)}%，夹到 42%`);
        if (fl !== undefined && fl < 0.21) flags.push(`地线原在 ${(fl * 100).toFixed(0)}%，抬到 21%`);
      }
      for (const sl of m.slots) {
        if (sl.opacity < 0.999) flags.push(`${sl.who} 透明 ${sl.opacity}`);
        if (sl.feet !== null && sl.feet > m.dlgTop - 2) flags.push(`${sl.who} 脚被框吃 ${Math.round(sl.feet - m.dlgTop)}px`);
        const [x, , w] = sl.box as [number, number, number, number];
        const inside = Math.max(0, Math.min(x + w, VIEW.width) - Math.max(x, 0)) / Math.max(1, w);
        if (inside < 0.55) flags.push(`${sl.who} 出屏 ${Math.round((1 - inside) * 100)}%`);
      }
      const frag = blank > 0 ? largest / blank : 1;
      rows.push({ s, line, png, m, blank, largest, frag, flags });
      console.log(`${s.id}  ${s.scene}/${s.palette}${s.dressing ? "/" + s.dressing : ""}  第${line + 1}句  人 ${m.person}  留白 ${blank.toFixed(0)}% 最大一块 ${largest.toFixed(0)}%（占留白 ${(frag * 100).toFixed(0)}%）  ${flags.join("；") || "—"}`);
    }
  } finally {
    await browser.dispose();
    await server.close();
  }

  const rel = (p: string) => p.slice(OUT.length + 1);
  const md = [
    `# 整屏闭环报告（D-071）`, ``,
    `${new Date().toISOString()} · ${VIEW.width}×${VIEW.height} @${VIEW.dpr}x · 3D · 每场截「第二个人第一次开口」那一句`, ``,
    `机器量的四样只报数。「留白成片」是对话框以上最大一块连通的纸占全部留白的比例，低于五成多半是被梁柱切碎了——但碎是不是坏，看画。`, ``,
    `| 场 | 地点 | 句 | 人 | 留白 | 成片 | 脚离框顶 | 机器标出的 | 同一个空间？ | 穿帮？ | 框压住了什么 |`,
    `|---|---|---|---|---|---|---|---|---|---|---|`,
  ];
  for (const r of rows) {
    const feet = r.m.slots.map((sl) => sl.feet === null ? `${sl.who} —` : `${sl.who} ${Math.round(r.m.dlgTop - sl.feet)}`).join(" / ");
    md.push(`| ${r.s.id} | ${r.s.scene}·${r.s.palette}${r.s.dressing ? "·" + r.s.dressing : ""} | ${r.line + 1} | ${r.m.person} | ${r.blank.toFixed(0)}% | ${(r.frag * 100).toFixed(0)}% | ${feet} | ${r.flags.join("；") || "—"} |  |  |  |`);
  }
  writeFileSync(join(OUT, "report.md"), md.join("\n") + "\n");
  const html = `<!doctype html><meta charset="utf-8"><title>整屏闭环</title>
<style>body{margin:0;background:#2a2a28;color:#ddd;font:12px system-ui}main{display:flex;flex-wrap:wrap;gap:10px;padding:10px}
figure{margin:0;width:195px}img{width:195px;display:block}figcaption{padding:3px 0;line-height:1.4}b{color:#fff}i{color:#e99;font-style:normal}</style>
<main>${rows.map((r) => `<figure><img src="${rel(r.png)}"><figcaption><b>${r.s.id}</b><br>留白 ${r.blank.toFixed(0)}% · 成片 ${(r.frag * 100).toFixed(0)}%${r.flags.length ? `<br><i>${r.flags.join("；")}</i>` : ""}</figcaption></figure>`).join("")}</main>`;
  writeFileSync(join(OUT, "sheet.html"), html);
  console.log(`\n${rows.length} 场。报告 Claude outputs/art-screens/report.md，一页看全部 sheet.html`);
}

main().catch((e) => { console.error(e); process.exit(2); });
