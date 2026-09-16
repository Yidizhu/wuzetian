import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { NAMES } from "../src/ui/names.ts";

/** 不是「人」的 who：旁白、内心、事件图、空镜、题记。它们不显示名字 */
const NOT_PEOPLE = new Set(["narr", "self", "cg", "empty", "tiji"]);

function speakers(dir: string, out = new Map<string, string>()): Map<string, string> {
  if (!existsSync(dir)) return out;
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) speakers(p, out);
    else if (f.endsWith(".json") && f !== "manifest.json") {
      const j = JSON.parse(readFileSync(p, "utf8")) as { lines?: { who: string }[] };
      for (const l of j.lines ?? []) if (!NOT_PEOPLE.has(l.who) && !out.has(l.who)) out.set(l.who, p);
    }
  }
  return out;
}

test("B41 说话的人都在 NAMES 里：缺了对话框名字是空的（柳承欢漏过一次），构建拦", () => {
  const root = new URL("../src/data/", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
  for (const dir of ["chapters", "converted/chapters"]) {
    const who = speakers(decodeURIComponent(join(root, dir)));
    if (dir === "chapters") assert.ok(who.size >= 10, "正式数据里读到了说话的人");
    for (const [k, file] of who) assert.ok(k in NAMES && NAMES[k] !== undefined, `${k}（${file}）不在 src/ui/names.ts 的 NAMES 里`);
  }
});
