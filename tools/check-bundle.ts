/**
 * 构建产物体检。跑在 vite build 之后：
 *
 *   node --experimental-strip-types tools/check-bundle.ts [dist 目录]
 *
 * 查的三件事都有过前科，而且都不会让构建报错——它们只会安静地让产物变坏：
 *
 * 1. **zod 混进玩家的包。** 它是构建期的校验器。engine 里任何一个文件从
 *    schema.ts 取一个运行时的值（比如一个整数常量），整个 zod 就跟着进包，
 *    实测 +62 KB。这件事发生过一次，靠的是有人盯着 vite 打印的数字才发现。
 * 2. **18+ 数据包混进默认产物（D-029）。** 默认构建里那些文字一个字节都不该出现。
 * 3. **CC2 的转换产物混进正式产物。** `src/data/converted/` 是预览用的，
 *    没过 validate；它进了包，玩家玩到的就可能是没审过的版本。
 *
 * 三条都只报第一条命中的证据，不打印命中的原文——18+ 那条尤其不该往日志里抄。
 */
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

const dir = process.argv[2] ?? join(import.meta.dirname, "..", "dist");
if (!existsSync(dir)) {
  console.error(`${dir} 不存在。先跑 vite build。`);
  process.exit(1);
}

function walk(d: string): string[] {
  const out: string[] = [];
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

const files = walk(dir).filter((f) => /\.(js|css|html)$/.test(f));
const text = new Map(files.map((f) => [f, readFileSync(f, "utf8")]));

interface Check { name: string; why: string; needles: string[] }

const CHECKS: Check[] = [
  {
    name: "zod 进了玩家的包",
    why: "zod 只该在构建期跑。engine 里有人从 schema.ts 取了运行时的值——把那个值挪到 types.ts。",
    needles: ["ZodError", "ZodIssueCode", "invalid_union_discriminator"],
  },
  {
    name: "18+ 数据包进了默认产物（D-029）",
    why: "默认构建不该带这些文字。检查 vite.config.ts 的 adultScenes 开关。",
    // 场景 id 的前缀，不是正文。这里不该出现任何需要打码的字符串。
    needles: ["adult_ch", "src/data/adult/chapters"],
  },
  {
    name: "CC2 的转换产物进了正式产物",
    why: "converted/ 没过 validate，只给 ?data=converted 预览用。检查 convertedData 开关。",
    needles: ["virtual:converted-data", "data/converted/manifest"],
  },
];

let bad = 0;
for (const c of CHECKS) {
  const hit = files.find((f) => c.needles.some((n) => text.get(f)!.includes(n)));
  if (hit) {
    bad += 1;
    console.error(`  ✗ ${c.name}`);
    console.error(`    在 ${hit.slice(dir.length + 1)}`);
    console.error(`    ${c.why}`);
  }
}

const total = files.reduce((n, f) => n + statSync(f).size, 0);
const main = files.filter((f) => f.endsWith(".js") && !/ThreeStage/.test(f))
  .reduce((n, f) => n + statSync(f).size, 0);

console.log(`\n产物体检：${dir}`);
console.log(`  ${files.length} 个文件，共 ${(total / 1024).toFixed(0)} KB；主包（不含按需加载的 3D）${(main / 1024).toFixed(0)} KB`);
if (bad) {
  console.error(`\n  ${bad} 项不合格。\n`);
  process.exit(1);
}
console.log(`  三项都干净：没有 zod、没有 18+ 数据、没有未审的转换产物。\n`);
