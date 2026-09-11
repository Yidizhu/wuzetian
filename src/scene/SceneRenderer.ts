import type { Palette, SceneKey } from "../engine/types.ts";

/**
 * 背景层接口。CSS 视差版和 Three.js 舞台版实现同一个接口。
 *
 * 这是 D-003 那条退路的全部依据：M5 结束前如果手机上帧率或首屏不达标，
 * 换一行注册代码就退回 CSS 版，对话层一个字都不用改。
 * 所以这个接口只能有背景层自己的事，绝不能漏进任何对话、数值、UI 的概念。
 */
export interface SceneDescriptor {
  key: SceneKey;
  palette: Palette;
  act: number;
}

export interface SceneRenderer {
  /** renderer 自己决定往这个容器里塞什么，或者什么都不塞 */
  mount(root: HTMLElement): void;
  /** 预载资源，不显示 */
  load(d: SceneDescriptor): Promise<void>;
  /** 切场景，自带墨晕转场 */
  show(d: SceneDescriptor): Promise<void>;
  /** 关键 beat 的缓慢推拉。CSS 版做轻微缩放，3D 版动相机 */
  beat(name: string): void;
  resize(w: number, h: number): void;
  dispose(): void;
}
