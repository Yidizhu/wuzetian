import type { SceneDescriptor, SceneRenderer } from "./SceneRenderer.ts";

/**
 * 什么都不画的渲染器。M1 的验收工具，不是占位代码。
 *
 * 用 ?renderer=null 打开，游戏必须照常从头跑到尾：文本能推进、选项能选、
 * 数值会变、刷新能接着玩。跑得通就说明对话层没有偷偷依赖背景层，
 * D-003 那条「不达标就退回 CSS 版」的退路才是真的。
 *
 * 这件事只有在第一天验证才便宜。等到 M5 才发现两层耦合了就来不及了。
 */
export class NullRenderer implements SceneRenderer {
  readonly name = "null";
  mount(root: HTMLElement): void {
    root.classList.add("stage", "stage--null");
  }
  async load(_d: SceneDescriptor): Promise<void> {}
  async show(_d: SceneDescriptor): Promise<void> {}
  beat(_name: string): void {}
  resize(_w: number, _h: number): void {}
  dispose(): void {}
}
