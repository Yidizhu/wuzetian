/**
 * 事件图（CG，D-142）表。**一张事件图一行**，名字就是 `public/cg/<key>.webp`。
 *
 * **默认是关的（D-097）**：`public/cg/` 现在是空的，剧本里也还没有一句「事件图」。
 * 谁来开：CC3 验收、`art:post` 出图到 `public/cg/`；ChatGPT 在剧本里写一行说话人「事件图」、文本写这里的 key。
 * 两样都到了那一格才会铺图；只有剧本没有图，那一格直接跳过，游戏照常走。
 *
 * 剧本写法和题记同一个办法，不加新字段：
 *   | 序 | 说话人 | 表情 | 类型 | 条件 | 文本 |
 *   | 12 | 事件图 |  |  |  | peizhaoye_xunma |
 * 转换器出 `who: "cg"`、`text: "peizhaoye_xunma"`。前一格写她看见了什么，后一格写她没说出口的那一句（D-144）。
 *
 * 表管的是「有哪些事件图、画的是谁、在恋爱线上是第几段」；有没有图看 `public/cg/` 里有没有文件（构建期扫出来）。
 * 校验器守两件：剧本里写的 key 这张表必须有；`public/cg/` 里的文件必须是表里的名字。
 */
export interface Cg {
  /** 画里的人（角色 key） */
  who: string[];
  /** D-143 三段式：本行 → 为你 → 亲密。非恋爱线的写「关系」 */
  beat: "本行" | "为你" | "亲密" | "关系";
  /** 给人看：画的是什么、打算放在哪一场 */
  where: string;
}

export const CGS: Record<string, Cg> = {
  // D-146：先试两张，一单人一双人
  peizhaoye_xunma: { who: ["peizhaoye"], beat: "本行", where: "裴照夜驯马（单人）。第一章苑野" },
  adi_buxiu:       { who: ["adi", "wuze"], beat: "关系", where: "阿荻替主角补袖（双人，有接触）。ch01-03 正文本来就有这个动作" },
};
