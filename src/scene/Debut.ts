/**
 * 首次登场卡的皮肤（E5 第 2 条，D-048）。什么时候出、谁出过了、可关不可关，归 CC1；
 * 这里只管它长什么样、挂在哪儿。
 *
 * 挂在对话框里、名字的右边，不另起一张浮在画面上的卡——三条理由：
 * 一，「不盖立绘」。E4 刚把人的脚提到对话框顶边之上，框外任何一块东西都会落在她腿上；
 * 二，名字和职务本来是一句话（「裴照夜，左监门卫中郎将」），拆到两处读的人要来回找；
 * 三，它只在这个人第一句话时出现，下一句就没了——跟着台词走比跟着画面走对。
 *
 * D-094（CC1 改，待协调）：删掉了名字下面那一句话，只剩名字 + 职务一行。
 * 那句话是人物的信条，该由玩家看她做了什么自己得出，不该印在她脸下面。
 * 竖屏上为那一行扣回来的上内边距一并还原（debut.css），否则名字和台词之间会少一截、框变矮。
 */

export interface Debut {
  /** 职务，六字以内最好。只回答「她管什么」，不回答「她信什么」（D-094） */
  role: string;
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
  name.after(role);
  dlg.dataset.debut = "1";
}
