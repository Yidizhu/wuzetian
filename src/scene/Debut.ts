/**
 * 首次登场卡的皮肤（E5 第 2 条，D-048）。什么时候出、谁出过了、可关不可关，归 CC1；
 * 这里只管它长什么样、挂在哪儿。
 *
 * 挂在对话框里、名字的右边，不另起一张浮在画面上的卡——三条理由：
 * 一，「不盖立绘」。E4 刚把人的脚提到对话框顶边之上，框外任何一块东西都会落在她腿上；
 * 二，名字和职务本来是一句话（「裴照夜，左监门卫中郎将」），拆到两处读的人要来回找；
 * 三，它只在这个人第一句话时出现，下一句就没了——跟着台词走比跟着画面走对。
 *
 * 竖屏上一行放不下「名字 + 职务 + 一句话」，所以职务留在名字那一行，一句话落到下一行；
 * 同时收掉名字下面的空和框的上内边距，对话框总高只多出几个像素，人的脚不会被吃掉。
 */

export interface Debut {
  /** 职务，六字以内最好。「奉召入京的女将」这种长的也放得下，但会把一句话挤到下一行 */
  role: string;
  /** 一句话，≤ 20 字（D-048） */
  line: string;
}

/**
 * 给对话框挂上或摘掉登场卡。`dlg` 是 `.dlg` 那个元素，`debut` 给 null 就是摘掉。
 * 每句台词调用一次即可：同一个人第一句传卡，之后传 null。
 */
export function attachDebut(dlg: HTMLElement, debut: Debut | null): void {
  dlg.querySelectorAll(".dlg__role, .dlg__line").forEach((n) => n.remove());
  const name = dlg.querySelector<HTMLElement>(".dlg__name");
  if (!debut || !name || name.hidden) {
    delete dlg.dataset.debut;
    return;
  }
  const role = document.createElement("span");
  role.className = "dlg__role";
  role.textContent = debut.role;
  const line = document.createElement("span");
  line.className = "dlg__line";
  line.textContent = debut.line;
  name.after(role, line);
  dlg.dataset.debut = "1";
}
