import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

export const ROOT = resolve(import.meta.dirname, "..");
export const DATA = join(ROOT, "src", "data");

export interface Loaded<T = unknown> {
  file: string;      // 相对仓库根的路径，报错时给人看
  raw: T;
}

/** 读一个目录下所有 .json，递归。读不出来就当场报错，不要静默跳过。 */
export function loadDir(dir: string): Loaded[] {
  const out: Loaded[] = [];
  const walk = (d: string) => {
    for (const name of readdirSync(d).sort()) {
      const p = join(d, name);
      if (statSync(p).isDirectory()) { walk(p); continue; }
      if (!name.endsWith(".json")) continue;
      out.push({ file: relative(ROOT, p).replace(/\\/g, "/"), raw: parse(p) });
    }
  };
  walk(dir);
  return out;
}

export function loadFile(path: string): Loaded {
  return { file: relative(ROOT, path).replace(/\\/g, "/"), raw: parse(path) };
}

function parse(p: string): unknown {
  const text = readFileSync(p, "utf8");
  try {
    return JSON.parse(text);
  } catch (e) {
    // JSON 语法错误要指到行，不然一份几百行的场景文件没法找
    const m = /position (\d+)/.exec(String(e));
    let where = "";
    if (m) {
      const pos = Number(m[1]);
      const line = text.slice(0, pos).split("\n").length;
      where = `，第 ${line} 行附近`;
    }
    throw new Error(`${relative(ROOT, p)} 不是合法 JSON${where}：${(e as Error).message}`);
  }
}
