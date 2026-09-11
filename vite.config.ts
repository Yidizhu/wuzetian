import { defineConfig, type Plugin } from "vite";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

/**
 * STATIC_THREE=1：把 three 那个动态 chunk 内联进主包。
 * 只有出单文件 3D 试玩版时才开；日常构建保持拆分，默认的 CSS 版不背 120KB。
 */
const staticThree = !!process.env.STATIC_THREE;

/**
 * 18+ 数据包（D-029）。默认关。
 *
 * 用虚拟模块而不是 `if (import.meta.env.X)` 包一层 glob：后者仍然会把文件
 * 打进产物，只是运行时不读——那不叫「默认不打包」。这里关掉时返回的是
 * 一个空数组的模块，src/data/adult 下的内容一个字节都不会出现在 dist 里。
 */
const ADULT_ID = "virtual:adult-scenes";
function adultScenes(enabled: boolean): Plugin {
  const resolved = "\0" + ADULT_ID;
  return {
    name: "wuzetian-adult-scenes",
    resolveId: (id) => (id === ADULT_ID ? resolved : null),
    load(id) {
      if (id !== resolved) return null;
      if (!enabled) return "export default [];";
      const dir = join(import.meta.dirname, "src", "data", "adult", "chapters");
      if (!existsSync(dir)) return "export default [];";
      const files: string[] = [];
      const walk = (d: string) => {
        for (const name of readdirSync(d, { withFileTypes: true })) {
          const p = join(d, name.name);
          if (name.isDirectory()) walk(p);
          else if (name.name.endsWith(".json")) files.push(p);
        }
      };
      walk(dir);
      for (const f of files) this.addWatchFile(f);
      const json = files.map((f) => JSON.parse(readFileSync(f, "utf8")));
      return `export default ${JSON.stringify(json)};`;
    },
  };
}
const adult = !!process.env.ADULT;

/**
 * CC2 转出来的数据（src/data/converted/）。只在 dev 和 `PREVIEW_CONVERTED=1` 时打包。
 *
 * 它不是正式数据：转换还没跑通全章，validate 也还没过。用 `?data=converted`
 * 打开就能拿真剧本压引擎，同时正式产物里一个字节都没有。
 * CC2 转完、validate 零硬错误之后，把 converted/ 的内容搬进 data/，这个开关就可以删。
 */
const CONVERTED_ID = "virtual:converted-data";
function convertedData(enabled: boolean): Plugin {
  const resolved = "\0" + CONVERTED_ID;
  const root = join(import.meta.dirname, "src", "data", "converted");
  const readAll = (dir: string): unknown[] => {
    if (!existsSync(dir)) return [];
    const out: unknown[] = [];
    const walk = (d: string) => {
      for (const e of readdirSync(d, { withFileTypes: true })) {
        const p = join(d, e.name);
        if (e.isDirectory()) walk(p);
        else if (e.name.endsWith(".json")) out.push(JSON.parse(readFileSync(p, "utf8")));
      }
    };
    walk(dir);
    return out;
  };
  const readOne = (f: string): unknown[] => {
    const p = join(root, f);
    return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : [];
  };
  return {
    name: "wuzetian-converted-data",
    resolveId: (id) => (id === CONVERTED_ID ? resolved : null),
    load(id) {
      if (id !== resolved) return null;
      if (!enabled) return "export default { scenes: [], duels: [], letters: [], endings: [], poems: [] };";
      const data = {
        scenes: readAll(join(root, "chapters")),
        letters: readAll(join(root, "letters")),
        duels: readOne("duels.json"),
        endings: readOne("endings.json"),
        poems: readOne("poems.json"),
      };
      return `export default ${JSON.stringify(data)};`;
    },
  };
}
const previewConverted = !!process.env.PREVIEW_CONVERTED;

export default defineConfig({
  plugins: [adultScenes(adult), convertedData(previewConverted || process.env.NODE_ENV !== "production")],
  base: "./",
  server: { port: 5173, strictPort: true },
  build: {
    target: "es2020",
    assetsInlineLimit: 8192,
    outDir: staticThree ? "dist-3d" : adult ? "dist-adult" : "dist",
    rollupOptions: { output: { inlineDynamicImports: staticThree } },
  },
});
