/**
 * 玩家偏好。和存档分开放：这是「这台设备上的这个人喜欢怎么玩」，
 * 不是「这一局走到了哪儿」。导出存档码时不带它，换一局也不该重置它。
 *
 * 读写都包 try：存不住档的环境里偏好也存不住，那就按默认值来，不报错。
 */

const DEBUTS = "wuzetian.pref.debuts";
const SOUND = "wuzetian.pref.sound";

function get(key: string, fallback: boolean): boolean {
  try {
    const v = localStorage.getItem(key);
    return v === null ? fallback : v === "1";
  } catch {
    return fallback;
  }
}
function set(key: string, on: boolean): void {
  try { localStorage.setItem(key, on ? "1" : "0"); } catch { /* 记不住就算了 */ }
}

/** 登场卡（D-048）。默认开：第一次玩的人需要知道这是谁 */
export const debutsOn = (): boolean => get(DEBUTS, true);
export const setDebutsOn = (on: boolean): void => set(DEBUTS, on);

/** 环境声（D-053）。默认关：手机上没人愿意一打开网页就出声 */
export const soundOn = (): boolean => get(SOUND, false);
export const setSoundOn = (on: boolean): void => set(SOUND, on);
