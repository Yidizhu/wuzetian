declare module "virtual:converted-data" {
  import type { Scene, Ending } from "./engine/types.ts";
  import type { PoemT, PoemDuelT, LetterT } from "./engine/schema.ts";
  /**
   * CC2 的转换产物。正式构建里全是空数组，那些文件不进产物。
   * 用 `?data=converted` 打开可以拿真剧本压引擎。
   */
  const data: {
    scenes: Scene[]; duels: PoemDuelT[]; letters: LetterT[];
    endings: Ending[]; poems: PoemT[];
  };
  export default data;
}
