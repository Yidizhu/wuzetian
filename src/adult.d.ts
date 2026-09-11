declare module "virtual:adult-scenes" {
  import type { Scene } from "./engine/types.ts";
  /** 18+ 数据包（D-029）。默认构建里恒为空数组，文件不进产物 */
  const scenes: Scene[];
  export default scenes;
}
