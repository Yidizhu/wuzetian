/**
 * 把 vite build 的产物压成一份可以直接发 Artifact 的 HTML。
 *
 *   npm run build:artifact
 *
 * Artifact 会自己包一层 doctype/html/head/body，所以这里只输出正文：
 * 一个 <title>、一个 <style>、#app、一段内联的 module script。
 * 外链一律不行（CSP 只放行几个 CDN，且只放行 script），所以 CSS 和 JS 全部内联。
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "./load.ts";

/**
 * 默认从 dist 出 CSS 版；`--3d` 从 dist-3d 出把 three 内联进去的版本，
 * 文件名带 -3d。两份都发 Artifact，手机上各开一次就知道 3D 过不过 D-003 的闸门。
 */
const is3d = process.argv.includes("--3d");
const DIST = join(ROOT, is3d ? "dist-3d" : "dist");
const OUT_DIR = join(ROOT, "dist-artifact");
const OUT = join(OUT_DIR, is3d ? "wuzetian-3d.html" : "wuzetian.html");
const OUT_STANDALONE = join(OUT_DIR, is3d ? "wuzetian-3d-standalone.html" : "wuzetian-standalone.html");

const assets = readdirSync(join(DIST, "assets"));
const cssFile = assets.find((f) => f.endsWith(".css"));
const jsFile = assets.find((f) => f.endsWith(".js"));
if (!cssFile || !jsFile) throw new Error("dist/assets 里找不到 css 或 js，先跑 npm run build");

const css = readFileSync(join(DIST, "assets", cssFile), "utf8");
const js = readFileSync(join(DIST, "assets", jsFile), "utf8");

// </script> 出现在字符串里会提前闭合标签
const safeJs = js.replace(/<\/script>/gi, "<\/script>");

const html = `<title>吾则天</title>
<style>
/* Artifact 外层会给 body 一个 14px 系统字体和浅色底，这里全部覆盖掉 */
html, body { height: 100%; margin: 0; }
#app { height: 100dvh; }
${css}
</style>

<div id="app"></div>

<script type="module">
${safeJs}
</script>
`;

/**
 * 另出一份自带 doctype 与 charset 的完整页面。
 * Artifact 会自己补 charset，直接打开文件或发 itch.io 的时候没人补，
 * 少了它中文会按 Latin-1 解码，标题先乱。两份内容一样，只差外壳。
 */
const standalone = `<!doctype html>
<html lang="zh-Hans" data-palette="ink">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#EDE7DA">
${html.slice(0, html.indexOf("<div id=\"app\">"))}</head>
<body>
${html.slice(html.indexOf("<div id=\"app\">"))}</body>
</html>
`;

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT, html, "utf8");
writeFileSync(OUT_STANDALONE, standalone, "utf8");

const kb = (n: number) => `${(n / 1024).toFixed(1)} KB`;
console.log();
console.log("单文件已写入：");
console.log(`  ${OUT.slice(ROOT.length + 1)}            发 Artifact 用，外层会补 doctype 和 charset`);
console.log(`  ${OUT_STANDALONE.slice(ROOT.length + 1)} 直接打开或发 itch.io 用，自带完整头`);
console.log(`  CSS ${kb(css.length)} + JS ${kb(js.length)} = 共 ${kb(html.length)}`);
console.log(`  Artifact 上限 16 MB，余量充足\n`);
