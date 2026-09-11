/**
 * 导出剧情分支图。
 *
 *   node --experimental-strip-types tools/story-graph.ts
 *
 * 输出 docs/story-graph.md，里面是一张 mermaid 图加一份摘要。
 * markdown 预览、GitHub、Artifact 都能直接渲染，不用装 graphviz。
 *
 * 人眼扫一遍分支图，比读一屏报错快得多——校验器管对错，这个管形状。
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { DATA, ROOT, loadDir } from "./load.ts";
import { Scene } from "../src/engine/schema.ts";
import type { SceneT } from "../src/engine/schema.ts";

const START = "ch01_s01_zhaoyang";
const OUT = join(ROOT, "docs", "story-graph.md");

const duels = new Map<string, { onWin?: { goto?: string }; onLose?: { goto?: string } }>();
try {
  for (const d of JSON.parse(readFileSync(join(DATA, "duels.json"), "utf8")) as { id: string; onWin?: { goto?: string }; onLose?: { goto?: string } }[]) duels.set(d.id, d);
} catch { /* 没有对局也能画图 */ }

const scenes = new Map<string, SceneT>();
for (const { file, raw } of loadDir(join(DATA, "chapters"))) {
  const r = Scene.safeParse(raw);
  if (!r.success) { console.error(`跳过 ${file}：不合 schema，先跑 npm run validate`); continue; }
  scenes.set(r.data.id, r.data);
}

const exits = (s: SceneT) => {
  const out = [
    ...(s.choices ?? []).map((c) => ({ to: c.goto, label: c.text, locked: !!c.require })),
    ...(s.goto ? [{ to: s.goto, label: "", locked: false }] : []),
  ];
  // 对诗出口：胜负两条边
  const d = s.duel ? duels.get(s.duel) : undefined;
  if (d?.onWin?.goto) out.push({ to: d.onWin.goto, label: `对诗·赢`, locked: false });
  if (d?.onLose?.goto) out.push({ to: d.onLose.goto, label: `对诗·输`, locked: false });
  return out;
};

// 可达性：和校验器同一套算法，这里用来给不可达节点标色
const reach = new Set<string>(scenes.has(START) ? [START] : []);
const q = [...reach];
while (q.length) {
  const cur = scenes.get(q.shift()!);
  if (!cur) continue;
  for (const e of exits(cur)) if (scenes.has(e.to) && !reach.has(e.to)) { reach.add(e.to); q.push(e.to); }
}

const esc = (s: string) => s.replace(/"/g, "'").replace(/[[\]{}()]/g, "");
const lines: string[] = ["flowchart TD"];

for (const s of scenes.values()) {
  const tag = [
    s.palette === "gold" ? "金" : "墨",
    s.weightless ? "无用" : "",
    s.leavesLetter.length ? `留信:${s.leavesLetter.join(",")}` : "",
  ].filter(Boolean).join(" ");
  lines.push(`  ${s.id}["${esc(s.id)}<br/>${esc(s.scene)} · ${tag}"]`);
}
for (const s of scenes.values()) {
  for (const e of exits(s)) {
    const label = e.label ? `|"${esc(e.label)}${e.locked ? " 🔒" : ""}"|` : "";
    lines.push(`  ${s.id} -->${label} ${e.to}`);
  }
}
// 结局与无出口的终点：结局是这个游戏的重点，图上要看得见
for (const s of scenes.values()) {
  if (s.ending) lines.push(`  ${s.id} ==> ENDING_${s.ending}{{"结局：${esc(s.ending)}"}}`);
  else if (!exits(s).length) lines.push(`  ${s.id} --> END_${s.id}(("终"))`);
}
lines.push("  classDef gold fill:#E6D9B9,stroke:#1A1815,color:#1A1815;");
lines.push("  classDef ink  fill:#EDE7DA,stroke:#1A1815,color:#33302B;");
lines.push("  classDef lost fill:#EDE7DA,stroke:#A8232A,stroke-width:2px,color:#A8232A;");
const gold = [...scenes.values()].filter((s) => s.palette === "gold").map((s) => s.id);
const ink = [...scenes.values()].filter((s) => s.palette === "ink").map((s) => s.id);
const lost = [...scenes.keys()].filter((id) => !reach.has(id));
if (gold.length) lines.push(`  class ${gold.join(",")} gold;`);
if (ink.length) lines.push(`  class ${ink.join(",")} ink;`);
if (lost.length) lines.push(`  class ${lost.join(",")} lost;`);

const acts = new Map<number, SceneT[]>();
for (const s of scenes.values()) {
  if (!acts.has(s.act)) acts.set(s.act, []);
  acts.get(s.act)!.push(s);
}

const md = `# 剧情分支图

> 由 \`tools/story-graph.ts\` 生成，不要手改。数据变了重新跑 \`npm run graph\`。
> 生成时间：${new Date().toISOString().slice(0, 16).replace("T", " ")}

绢色是金碧场景，纸色是水墨场景，**朱砂描边的是从开场走不到的孤儿场景**。
带锁的边表示这个选项有条件。

\`\`\`mermaid
${lines.join("\n")}
\`\`\`

## 摘要

| 项 | 数 |
|---|---|
| 场景 | ${scenes.size} |
| 其中金碧 | ${gold.length} |
| 其中无用场景 | ${[...scenes.values()].filter((s) => s.weightless).length} |
| 留信的场景 | ${[...scenes.values()].filter((s) => s.leavesLetter.length).length} |
| 走不到的孤儿 | ${lost.length}${lost.length ? `（${lost.join("、")}）` : ""} |
| 终点（无出口） | ${[...scenes.values()].filter((s) => !exits(s).length).length} |

## 按幕

${[...acts].sort((a, b) => a[0] - b[0]).map(([act, list]) =>
  `**第 ${act} 幕**（${list.length} 场，无用场景 ${list.filter((s) => s.weightless).length} 场）\n\n` +
  list.map((s) => `- \`${s.id}\` ${s.scene}／${s.palette === "gold" ? "金碧" : "水墨"}　${s.purpose}`).join("\n")
).join("\n\n")}
`;

writeFileSync(OUT, md, "utf8");
console.log(`\n分支图已写入 docs/story-graph.md`);
console.log(`  场景 ${scenes.size}，金碧 ${gold.length}，无用场景 ${[...scenes.values()].filter((s) => s.weightless).length}，孤儿 ${lost.length}\n`);
