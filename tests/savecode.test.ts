import { test } from "node:test";
import assert from "node:assert/strict";
import { encodeSave, decodeSave } from "../src/engine/savecode.ts";
import type { SaveV1 } from "../src/engine/save.ts";

/**
 * 存档导出码（D-031）。
 * Node 24 有 CompressionStream 和 btoa/atob，所以这些用例走的是和浏览器同一条路。
 */

const sample = (): SaveV1 => ({
  version: 1,
  savedAt: 1789000000000,
  sceneId: "ch01_s09_shuge",
  lineIndex: 7,
  stats: { shi: 5, ming: 7, cai: 11, xin: 9 },
  affinity: { shenheng: 12, wenqiao: 4 },
  flags: { took_seal: true, trial_recopy: true },
  protagonistName: "吾则添",
  seenLineIds: Array.from({ length: 120 }, (_, i) => `ch01_s0${i % 9}_shuge.l${i}`),
  poemsCollected: ["liye_bazhi", "wangwei_shanjuqiuming"],
  endingsUnlocked: [],
  letters: [{ id: "lt_ch01_shenheng_01", state: "replied", dueAt: 1789000, repliedWith: "plain:a" }],
  lastSeenAt: 1789000000000,
  dataVersion: 1,
});

test("导出再导入，逐字节还原", async () => {
  const s = sample();
  const code = await encodeSave(s);
  const r = await decodeSave(code);
  assert.ok(r.ok, r.ok ? "" : r.reason);
  assert.equal(JSON.stringify(r.save), JSON.stringify(s));
});

test("码以 WZT1 开头，并且比原始 JSON 短", async () => {
  const s = sample();
  const code = await encodeSave(s);
  assert.match(code, /^WZT1\./);
  assert.ok(code.length < JSON.stringify(s).length,
    `压缩没生效：码 ${code.length} 字符，JSON ${JSON.stringify(s).length} 字符`);
});

test("换行与空格不影响导入：玩家从聊天软件里粘贴常带这些", async () => {
  const code = await encodeSave(sample());
  const messy = "  " + code.replace(/(.{20})/g, "$1\n") + "\n ";
  const r = await decodeSave(messy);
  assert.ok(r.ok, r.ok ? "" : r.reason);
  assert.equal(r.save.sceneId, "ch01_s09_shuge");
});

test("被截断的码当场报错，不读出半份存档", async () => {
  const code = await encodeSave(sample());
  const r = await decodeSave(code.slice(0, code.length - 10));
  assert.ok(!r.ok);
  assert.match(r.reason, /截断|不完整/);
});

test("改掉一个字符也报错", async () => {
  const code = await encodeSave(sample());
  const i = 25;
  const flipped = code.slice(0, i) + (code[i] === "A" ? "B" : "A") + code.slice(i + 1);
  const r = await decodeSave(flipped);
  assert.ok(!r.ok);
});

test("空、乱写、未来版本各有自己的说法", async () => {
  for (const [input, pattern] of [["", /没有内容/], ["hello", /不像一串存档码/], ["WZT9.abc.0000", /版本/]] as const) {
    const r = await decodeSave(input);
    assert.ok(!r.ok, `「${input}」不该被接受`);
    assert.match(r.reason, pattern);
  }
});

test("报错话是给玩家看的，不是给程序员看的", async () => {
  const r = await decodeSave("hello");
  assert.ok(!r.ok);
  assert.doesNotMatch(r.reason, /undefined|null|Error|exception|base64|checksum/i);
});
