import "../styles/gate.css";

/**
 * 开启页的门（D-219，B42）：标题屏之前输六位数字才进，本机记住，下次不问。
 *
 * **这不是安全措施**，是测试期不让路人随手点进来：密码就写在下面，谁看前端代码都看得见（YIDI 知道）。
 * 样式和 HUD 的「声」开关一个体系：一个淡墨细框的输入格，一个同样的按钮；输错整格抖一下、清空，不提示对错。
 *
 * **怎么拆**：发布前构建时带 `VITE_GATE=off`（`main.ts` 按这个开关决定要不要 import 这一块，关了整块不进包）；
 * 或者直接把 `main.ts` 里那三行和这个文件删掉。
 * `?notitle=1`（无头工具、抽查用）不过门——它本来就跳过标题屏。
 */
const CODE = "628811";
const KEY = "wuzetian.gate";

export function gatePassed(): boolean {
  try { return localStorage.getItem(KEY) === CODE; } catch { return false; }
}

/** 挂上门。输对了记住、收起、调 `onPass`。本机记过就直接 `onPass` */
export function mountGate(root: HTMLElement, onPass: () => void): void {
  if (gatePassed()) { onPass(); return; }

  const box = document.createElement("div");
  box.className = "gate";
  const form = document.createElement("form");
  form.className = "gate__form";
  const input = document.createElement("input");
  input.className = "gate__input";
  input.type = "password";
  input.inputMode = "numeric";
  input.pattern = "[0-9]*";
  input.maxLength = 6;
  input.autocomplete = "off";
  input.setAttribute("aria-label", "六位数字");
  const btn = document.createElement("button");
  btn.type = "submit";
  btn.className = "gate__btn";
  btn.textContent = "开";
  form.append(input, btn);
  box.append(form);
  root.appendChild(box);

  const check = (): void => {
    if (input.value === CODE) {
      try { localStorage.setItem(KEY, CODE); } catch { /* 记不住就下次再输 */ }
      box.dataset.state = "out";
      window.setTimeout(() => box.remove(), 320);
      onPass();
      return;
    }
    // 输错：抖一下、清空，不说对错
    box.classList.remove("gate--wrong");
    void box.offsetWidth;
    box.classList.add("gate--wrong");
    input.value = "";
    input.focus();
  };
  form.addEventListener("submit", (e) => { e.preventDefault(); check(); });
  input.addEventListener("input", () => {
    input.value = input.value.replace(/\D/g, "").slice(0, 6);
    if (input.value.length === 6) check();
  });
  // 点空白处不做事（不许点穿到后面去），点输入格外的纸面把键盘叫回来
  box.addEventListener("click", (e) => { e.stopPropagation(); if (e.target === box) input.focus(); });
  window.setTimeout(() => input.focus(), 50);
}
