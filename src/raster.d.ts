declare module "virtual:raster-assets" {
  import type { RasterList } from "./scene/raster.ts";
  /** public/char/full、public/char/knee、public/scene 里有哪些 webp（不带扩展名）。构建期扫出来，见 vite.config.ts */
  const list: RasterList;
  export default list;
}
