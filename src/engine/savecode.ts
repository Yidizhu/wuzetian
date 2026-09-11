import { SAVE_VERSION, type SaveV1 } from "./save.ts";

/**
 * 存档导出码（D-031）。把一份存档压成一串可复制的文字。
 *
 * 为什么要有：localStorage 只活在这一个浏览器里。清一次数据、换一台设备、
 * 从手机挪到电脑，进度就没了。一串能复制的码解决全部三件事，
 * 顺带让朋友之间可以互发「我走到这里了」。
 *
 * 码长这样：`WZT1.<base64url>`
 *   - 前缀带版本，将来格式变了能一眼认出旧码，而不是解出一堆乱码
 *   - 正文优先用 deflate-raw 压，中文 JSON 能压到三分之一左右；
 *     浏览器没有 CompressionStream 就退回不压，前缀改成 WZT1U 以示区别
 *   - 末尾四字符是校验和：粘贴时被聊天软件截断了要当场报错，
 *     而不是读出一份缺胳膊少腿的存档让玩家以为进度还在
 */

const MAGIC = "WZT1";
const MAGIC_RAW = "WZT1U";

// ---------------------------------------------------------------- base64url

function toB64Url(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64Url(text: string): Uint8Array {
  const s = atob(text.replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}

/** 四字符校验和。防的是粘贴被截断，不是防篡改——玩家改自己的存档随他去 */
function checksum(text: string): string {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36).padStart(4, "0").slice(-4);
}

// ---------------------------------------------------------------- 压缩

async function deflate(text: string): Promise<Uint8Array | null> {
  if (typeof CompressionStream === "undefined") return null;
  try {
    const cs = new CompressionStream("deflate-raw");
    const stream = new Blob([new TextEncoder().encode(text)]).stream().pipeThrough(cs);
    return new Uint8Array(await new Response(stream).arrayBuffer());
  } catch {
    return null;
  }
}

async function inflate(bytes: Uint8Array): Promise<string | null> {
  if (typeof DecompressionStream === "undefined") return null;
  try {
    const ds = new DecompressionStream("deflate-raw");
    const stream = new Blob([bytes as BlobPart]).stream().pipeThrough(ds);
    return new TextDecoder().decode(await new Response(stream).arrayBuffer());
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------- 对外

export async function encodeSave(save: SaveV1): Promise<string> {
  const json = JSON.stringify(save);
  const packed = await deflate(json);
  const body = packed ? toB64Url(packed) : toB64Url(new TextEncoder().encode(json));
  const magic = packed ? MAGIC : MAGIC_RAW;
  return `${magic}.${body}.${checksum(body)}`;
}

export type DecodeResult =
  | { ok: true; save: SaveV1 }
  | { ok: false; reason: string };

export async function decodeSave(code: string): Promise<DecodeResult> {
  const clean = code.trim().replace(/\s+/g, "");
  if (!clean) return { ok: false, reason: "没有内容。把整串码贴进来。" };

  const parts = clean.split(".");
  const known = (m?: string) => m === MAGIC || m === MAGIC_RAW;
  if (parts.length !== 3) {
    // 开头对但段数不对，多半是复制少了一截，而不是贴错了东西。
    // 这两种情况对玩家来说要做的事完全不同，所以话也要不一样。
    if (known(parts[0]) || /^WZT\d/.test(parts[0] ?? "")) {
      return { ok: false, reason: "这串码不完整，多半是复制时被截断了。重新全选复制一次。" };
    }
    return { ok: false, reason: "这不像一串存档码。整串应该是 WZT1 开头、中间两个点。" };
  }
  const [magic, body, sum] = parts as [string, string, string];
  if (!known(magic)) {
    return { ok: false, reason: `认不出的存档码版本「${magic}」。可能来自更新之后的版本。` };
  }
  if (checksum(body) !== sum) {
    return { ok: false, reason: "这串码不完整，多半是复制时被截断了。重新全选复制一次。" };
  }

  let json: string | null;
  try {
    const bytes = fromB64Url(body);
    json = magic === MAGIC ? await inflate(bytes) : new TextDecoder().decode(bytes);
  } catch {
    return { ok: false, reason: "解不开。这串码里有本不该有的字符。" };
  }
  if (json === null) {
    return { ok: false, reason: "这个浏览器解不开压缩过的存档码。换一个浏览器试试。" };
  }

  let save: SaveV1;
  try {
    save = JSON.parse(json) as SaveV1;
  } catch {
    return { ok: false, reason: "解开了，但里面不是一份存档。" };
  }
  if (typeof save?.sceneId !== "string") {
    return { ok: false, reason: "解开了，但缺少场景位置，这份存档用不了。" };
  }
  if (typeof save.version === "number" && save.version > SAVE_VERSION) {
    return { ok: false, reason: `这份存档来自更新的版本（v${save.version}），当前版本读不了。` };
  }
  return { ok: true, save };
}

/** 分组显示，方便玩家在手机上核对有没有复制全 */
export function prettyCode(code: string): string {
  return code.replace(/(.{48})/g, "$1\n");
}
