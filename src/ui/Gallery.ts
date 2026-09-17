import "../styles/gallery.css";
import { CGS } from "../scene/cgs.ts";
import { galleryPick, sectionTitle, type GallerySection } from "../scene/gallery.ts";
import type { RasterCatalog } from "../scene/raster.ts";

/**
 * 事件图回廊（D-220，B43）。HUD「回廊」打开，全屏一张纸，和题画同一个体系：纸色底、没有卡片阴影、按钮是上下两条细线。
 *
 * - 按章一排一个小标题，格子手机竖屏一屏两列、宽屏按宽度多排几列；
 * - 解锁过的格子是图（按焦点裁成竖格），没解锁的是一块空纸，**不写名字**；
 * - 点一张图整张看（不裁），再点一下回到回廊；点「合上」或空白处收起回廊。
 * - 缩略图直接用原图，`loading="lazy"`：没解锁的一张都不取，解锁的滚到了才取。
 */
export interface GalleryDeps {
  sections: GallerySection[];
  seen: () => ReadonlySet<string>;
  raster: RasterCatalog;
}

export function openGallery(root: HTMLElement, deps: GalleryDeps): () => void {
  const seen = deps.seen();
  const has = (k: string) => deps.raster.hasCg(k);

  const box = document.createElement("div");
  box.className = "gallery";
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-label", "回廊");

  const head = document.createElement("div");
  head.className = "gallery__head";
  const title = document.createElement("div");
  title.className = "gallery__title";
  title.textContent = "回廊";
  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "gallery__close";
  closeBtn.textContent = "合上";
  head.append(title, closeBtn);
  box.appendChild(head);

  for (const sec of deps.sections) {
    const picks = sec.keys.map((k) => galleryPick(k, seen, has));
    const part = document.createElement("section");
    part.className = "gallery__sec";
    const h = document.createElement("h3");
    h.className = "gallery__sec-title";
    h.textContent = sectionTitle(sec);
    const count = document.createElement("span");
    count.className = "gallery__count";
    count.textContent = `${picks.filter(Boolean).length}／${picks.length}`;
    h.appendChild(count);
    const grid = document.createElement("div");
    grid.className = "gallery__grid";
    picks.forEach((pick) => {
      const cell = document.createElement(pick ? "button" : "div");
      cell.className = "gallery__cell";
      if (pick) {
        (cell as HTMLButtonElement).type = "button";
        const img = document.createElement("img");
        img.alt = "";
        img.loading = "lazy";
        img.decoding = "async";
        img.src = deps.raster.cgUrl(pick);
        const f = CGS[pick]?.focus;
        if (f) img.style.objectPosition = `${f.x}% ${f.y}%`;
        cell.appendChild(img);
        cell.addEventListener("click", (e) => { e.stopPropagation(); view(pick); });
      } else {
        cell.dataset.locked = "1";
        cell.setAttribute("aria-label", "未解锁");
      }
      grid.appendChild(cell);
    });
    part.append(h, grid);
    box.appendChild(part);
  }

  // 整张看：盖在回廊上面，点一下回去
  const view = (key: string): void => {
    const v = document.createElement("div");
    v.className = "gallery__view";
    const img = document.createElement("img");
    img.alt = "";
    img.src = deps.raster.cgUrl(key);
    v.appendChild(img);
    v.addEventListener("click", (e) => { e.stopPropagation(); v.remove(); });
    box.appendChild(v);
  };

  const close = (): void => { box.dataset.state = "out"; window.setTimeout(() => box.remove(), 240); };
  closeBtn.addEventListener("click", (e) => { e.stopPropagation(); close(); });
  box.addEventListener("click", (e) => { e.stopPropagation(); if (e.target === box) close(); });
  root.appendChild(box);
  return close;
}
