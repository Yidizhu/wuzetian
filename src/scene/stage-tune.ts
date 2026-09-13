/**
 * 取景微调表。**这个文件由 tools/art-loop.ts 写**，手改也行，下次跑循环会照当时的结果覆盖。
 *
 * 键是「场景 | 色板 | 布置」，值里的 fit 是取景倍数：大于 1 往后退。
 * 自动审查循环只敢动这一个旋钮——留白不够就退半步，退到 1.3 还不够就停下交人。
 * 几何、光、用色一律不自动改：那些是判断，不是量（D-060 第 1 条）。
 */
export interface Tune { fit?: number }

export function tuneKey(key: string, palette: string, dressing: string): string {
  return `${key}|${palette}|${dressing}`;
}

export const STAGE_TUNE: Record<string, Tune> = {};
