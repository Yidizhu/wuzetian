import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { CASES, sceneId, lineId, choiceId, parseCondition, parseEffects, convert, convertBatch, tableCells, writeOut, issueReport, classify, manualTail, MANUAL_MARK } from "../tools/convert-story.ts";
import { readFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * convert-story 的验收测试，覆盖 Prompt D 的逐字段转换及拒绝猜测边界。
 * 用例本身在 CASES 里，改用例等于改验收标准。
 */

describe("id 生成", () => {
  test("场景 id", () => {
    for (const c of CASES.sceneId) {
      assert.equal(sceneId(c.in[0] as string, c.in[1] as string), c.out);
    }
  });
  test("台词 id", () => {
    for (const c of CASES.lineId) {
      assert.equal(lineId(c.in[0] as string, c.in[1] as number), c.out);
    }
  });
  test("选项 id", () => {
    for (const c of CASES.choiceId) {
      assert.equal(choiceId(c.in[0] as string, c.in[1] as string), c.out);
    }
  });
  test("id 生成是纯函数：同样输入永远同样输出", () => {
    const a = sceneId("ch01-03 昭阳殿一角", "zhaoyang");
    const b = sceneId("ch01-03 昭阳殿一角", "zhaoyang");
    assert.equal(a, b, "带时间戳或自增计数器会把存档打乱");
  });
});

describe("条件与效果", () => {
  test("条件表达式", () => {
    for (const c of CASES.condition) {
      if ("issue" in c && c.issue) {
        assert.throws(() => parseCondition(c.in), `「${c.in}」应该进 issues，不要猜`);
      } else {
        assert.deepEqual(parseCondition(c.in), c.out);
      }
    }
  });
  test("效果表达式", () => {
    for (const c of CASES.effects) {
      assert.deepEqual(parseEffects(c.in), c.out);
    }
  });
});

const scene = (label = 'ch01-01', extra = '', exit = '| 结局 | done |') => `### 场景 ${label} 测试

| 字段 | 值 |
|---|---|
| 章 | 1 |
| 幕 | 1 |
| 地点 key | shuge |
| 色板 | ink |
| 在场 | wuze, shenheng |
| 无用场景 | 否 |
| 一句话目的 | 共读 |
${[extra, exit].filter(Boolean).join('\n')}

| # | 说话人 | 表情 | 类型 | 台词 |
|---|---|---|---|---|
| 1 | narr | | 旁白 | 灯亮着。 |
| 2 | self | | 内心 | {名},看\\|纸。 |
| 3 | wuze | open | 说 | 我来。 |
| 4 | shenheng | guarded | 诗 | 明月松间照。 |
`;

test('场景字段、四类台词、主角占位、逗号及转义竖线', () => {
  const r = convert(scene('ch01-01', '| 进入条件 | cai >= 6 且 非 flag.gone |'), 'scene.md');
  assert.deepEqual(r.issues, []);
  const s = r.scenes[0];
  assert.deepEqual(s.lines.map(l => l.kind), ['aside', 'inner', 'say', 'poem']);
  assert.equal(s.lines[1].text, '{名},看|纸。');
  assert.equal(s.lines[2].expr, 'open');
  assert.equal(s.weightless, false);
  assert.deepEqual(s.require, { cai: { gte: 6 }, 'flag.gone': false });
  assert.deepEqual(s.cast, ['wuze', 'shenheng']);
});

test('无用场景是/否/空及双色板', () => {
  for (const [text, expected] of [['是', true], ['否', false], ['', false]]) {
    const r = convert(scene().replace('无用场景 | 否', `无用场景 | ${text}`).replace('色板 | ink', '色板 | gold'), 's');
    assert.equal(r.scenes[0].weightless, expected);
    assert.equal(r.scenes[0].palette, 'gold');
  }
});

test('前向跨文件去向、选项条件效果及不可逆提示', () => {
  const first = scene('ch01-01', '', '') + `
| # | 选项文本 | 需要 | 效果 | 去向 | 备注 |
|---|---|---|---|---|---|
| A | 留下 | 好感.shenheng >= 5 | xin +1, flag.stay = 真 | ch01-02 | 不可逆；提示「交情未到」 |
`;
  const r = convertBatch([{ markdown: first, file: 'a' }, { markdown: scene('ch01-02'), file: 'b' }]);
  assert.deepEqual(r.issues, []);
  assert.deepEqual(r.scenes[0].choices[0], { id: 'ch01_s01_shuge.cA', text: '留下', require: { 'affinity.shenheng': { gte: 5 } }, effects: { xin: 1, 'flag.stay': true }, goto: 'ch01_s02_shuge', irreversible: true, lockHint: '交情未到' });
  const linear = convertBatch([{ markdown: scene('ch01-01', '', '| 去向 | ch01-02 |'), file: 'a' }, { markdown: scene('ch01-02'), file: 'b' }]);
  assert.equal(linear.scenes[0].goto, 'ch01_s02_shuge');
});

test('严格拒绝坏条件/效果/重复键/未知角色', () => {
  for (const value of ['shi = 真', 'flag.x >= 2', '好感.unknown >= 2', 'flag.x 且 非 flag.x', 'xin >= 1 且 xin >= 2']) assert.throws(() => parseCondition(value));
  for (const value of ['xin 真', 'flag.x +1', 'xin +1, xin -1', '好感.unknown +2', 'flag.x = true', 'xin +1,']) assert.throws(() => parseEffects(value));
  assert.deepEqual(parseCondition('xin >= 1 且 xin < 5'), { xin: { gte: 1, lt: 5 } });
  assert.deepEqual(parseEffects(''), {});
  assert.throws(() => sceneId('书阁', 'shuge'));
  assert.throws(() => sceneId('ch01-01', 'moon'));
  assert.throws(() => lineId('s', 0));
  assert.throws(() => choiceId('s', 'aa'));
});

test('错误有精确行号，不能丢坏行后输出残缺场景', () => {
  const md = scene().replace('| 3 | wuze', '| 3 | nobody');
  const r = convert(md, 'bad.md');
  assert.equal(r.scenes.length, 0);
  assert.ok(r.issues.some(i => i.line === md.split('\n').findIndex(l => l.includes('| 3 | nobody')) + 1));
  const broken = scene().replace('灯亮着。', '灯|亮');
  assert.equal(convert(broken, 'bad.md').scenes.length, 0);
  assert.ok(convert(broken, 'bad.md').issues.some(i => i.message.includes('实际 6 列')));
});

test('重复场景、重复台词及中文去向报错', () => {
  assert.ok(convert(scene() + '\n' + scene(), 'dup').issues.some(i => i.message.includes('两次')));
  assert.ok(convert(scene().replace('| 2 | self', '| 1 | self'), 'dup').issues.some(i => i.message.includes('重复')));
  assert.ok(convert(scene('ch01-01', '', '| 去向 | 夜间书阁 |'), 'bad').issues.length);
  assert.ok(convert(scene('ch01-01', '', '| 去向 | ch01-07 |'), 'bad').issues.some(i => i.message.includes('不能猜')));
});

test('Markdown 转义、Windows 换行与代码示例不误导转换', () => {
  assert.deepEqual(tableCells('| a\\|b | c\\\\ |'), ['a|b', 'c\\']);
  assert.deepEqual(convert(scene().replace(/\n/g, '\r\n'), 'f'), convert(scene(), 'f'));
  assert.equal(convert('```md\n' + scene() + '\n```', 'f').scenes.length, 0);
});

const ending = (cond: string, body = '| 正文 | 她走了。 |') => `### 结局
| 字段 | 值 |
|---|---|
| 结局 key | finish |
| 标题 | 留白 |
| 判定 | ${cond} |
| 色板 | ink |
| 主题 | 自由 |
${body}
`;
test('结局条件与三段变体、D-020', () => {
  assert.equal(convert(ending(''), 'e').endings[0].body, '她走了。');
  const body = '| 正文 · 天 | 天。 |\n| 正文 · 曌 | 曌。 |\n| 正文 · 不改 | 添。 |';
  assert.deepEqual(convert(ending('flag.enthroned', body), 'e').endings[0].body, { tian: '天。', zhao: '曌。', kept: '添。' });
  assert.ok(convert(ending('flag.name_tian'), 'e').issues.length);
});

const letter = `### 信 lt-ch01-shenheng-01
| 字段 | 值 |
|---|---|
| 发信人 | shenheng |
| 触发 | 场景 ch01-01 之后第 3 场 |
| 延迟分钟 | 18 |
| 笺 | 秘书省黄麻纸 |
| 明面 | 灯边还有位置。 |
| 引诗 | 薛涛《蝉》· 声声似相接，各在一枝栖。 |
| 引诗要说的 | 愿意相应 |
| 空白 | （她未写的话，我愿意坐下听她再讲一次。） |
| 她可能不回 | 好感.shenheng < 5 |
| 会被截 | 是 |
| 被截去向 | ch01-01 |

| 回信 | 内容 | 效果 | 去向 |
|---|---|---|---|
| 直言 A | 来。 | 好感.shenheng +2 | |
| 直言 B | 等。 | xin +1 | |
| 直言 C | 别。 | shi -1 | |
| 以诗代答 · 合意象 | 蝉, 叶 | cai +1 | |
| 以诗代答 · 不合 | | 好感.shenheng +1 | |
| 不回 | | flag.silent = 真 | |

| 回信 | 她的反应 |
|---|---|
| 直言 A | 她留灯。 |
| 直言 B | 她等。 |
| 直言 C | 她关门。 |
| 以诗代答 · 合意象 | 她点头。 |
| 以诗代答 · 不合 | 她摇头。 |
| 不回 | 她收纸。 |
`;

test('书信三层、三类回复、触发、截信、留信', () => {
  const md = scene('ch01-01', '| 留信 | shenheng |') + '\n' + letter;
  const r = convert(md, 'l');
  assert.deepEqual(r.issues, []);
  const l = r.letters[0];
  assert.equal(l.id, 'lt_ch01_shenheng_01');
  assert.deepEqual(l.trigger, { kind: 'scene', sceneId: 'ch01_s01_shuge', afterScenes: 3 });
  assert.equal(l.delayMinutes, 18);
  assert.equal(l.paper, 'huangma');
  assert.equal(l.body.poem.ref, 'xuetao_chan');
  assert.deepEqual(l.sheMayNotReply, { 'affinity.shenheng': { lt: 5 } });
  assert.deepEqual(l.replies.poem.resonantTags, ['蝉', '叶']);
  assert.equal(l.replies.plain.length, 3);
  assert.equal(l.replies.plain[0].id, 'lt_ch01_shenheng_01.rA');
  assert.equal(l.replies.silence.effects['flag.silent'], true);
  assert.equal(l.onIntercept.goto, 'ch01_s01_shuge');
  assert.deepEqual(r.scenes[0].leavesLetter, ['shenheng']);
});

test('四节气与五种笺、缺反应和缺留信必须报告', () => {
  for (const [cn, key] of [['上元', 'shangyuan'], ['寒食', 'hanshi'], ['七夕', 'qixi'], ['中秋', 'zhongqiu']]) {
    const md = letter.replace('| 触发 | 场景 ch01-01 之后第 3 场 |', `| 节气 | ${cn} |`).replace('| 会被截 | 是 |', '| 会被截 | 否 |').replace('| 被截去向 | ch01-01 |', '| 被截去向 | |');
    assert.deepEqual(convert(md, 'l').letters[0].trigger, { kind: 'solarTerm', term: key, minAffinity: 5 });
  }
  for (const [cn, key] of [['黄麻纸','huangma'], ['军中素笺','junzhong'], ['泥金笺','nijin'], ['自制花笺','huajian'], ['常笺','chang']]) {
    assert.equal(convert(scene() + letter.replace('秘书省黄麻纸', cn), 'l').letters[0].paper, key);
  }
  assert.ok(convert(scene() + letter.replace('| 直言 A | 她留灯。 |', ''), 'l').issues.some(i => i.message.includes('缺少她的反应')));
  assert.ok(convert(scene('ch01-01', '| 留信 | shenheng, wenqiao |'), 'l').issues.some(i => i.message.includes('wenqiao')));
});

/** 诗库会随剧本增补（D-033 就加过一首），所以数目从原文的表格行数来，不写死 */
const poemRows = (md: string) => md.split('\n').filter(l => /^\|\s*\d+\s*\|/.test(l)).length;

test('真实诗库逐首转出、四题、来源与逐字保真', () => {
  const md = readFileSync(new URL('../docs/C0-2-诗词库与对诗.md', import.meta.url), 'utf8');
  const r = convert(md, 'poems');
  assert.deepEqual(r.issues, []);
  assert.equal(r.poems.length, poemRows(md), '诗库表有几行就转出几首，一首都不能丢');
  assert.ok(r.poems.length >= 30);
  assert.equal(r.duels.length, 4);
  assert.equal(r.poems[0].title, '蝉（一作闻蝉）');
  assert.equal(r.poems[0].lines.join('／'), '露涤清音远，／风吹数叶齐。／声声似相接，／各在一枝栖。');
  assert.equal(r.poems[0].source, '全唐诗卷803');
  assert.ok(r.poems[0].sourceUrl.endsWith('卷803'));
  assert.deepEqual(r.duels.map(d => d.options.find(o => o.correct).key), ['B','D','A','C']);
  assert.ok(r.duels.every(d => !d.onWin && !d.onLose));
  assert.deepEqual(convert(md, 'poems'), r);
});

test('真实 C-2：04 场只有对诗出口，场景表「对诗」行与对局块指同一局', () => {
  const md = readFileSync(new URL('../docs/C-2-第一章前六场.md', import.meta.url), 'utf8');
  const r = convert(md, 'C2');
  const s04 = r.scenes.find(s => s.id === 'ch01_s04_shuge');
  assert.ok(s04, '04 场应当转出（duel 是出口，D-026）');
  assert.equal(s04.duel, 'pd_01');
  assert.equal(s04.choices, undefined);
  assert.equal(s04.goto, undefined);
  const d = r.duels.find(d => d.id === 'pd_01');
  assert.equal(d.sceneId, 'ch01_s04_shuge');
  assert.equal(d.opponent, 'shenheng');
  assert.equal(d.onWin.goto, 'ch01_s05_yuanye');
  assert.equal(d.onLose.goto, 'ch01_s05_yuanye');
  assert.equal(d.onWin.effects.cai, 2);
  assert.equal(d.onLose.effects.cai, 1);
});

test('输出字节稳定、保留其他数据、信件单文件对象、报告转义', () => {
  const dir = mkdtempSync(join(tmpdir(), 'wuzetian-convert-'));
  try {
    const r = convert(scene() + letter, 'l');
    writeOut(r, dir);
    const path = join(dir, 'letters', 'lt_ch01_shenheng_01.json');
    const bytes = readFileSync(path, 'utf8');
    writeOut(r, dir);
    assert.equal(readFileSync(path, 'utf8'), bytes);
    assert.equal(JSON.parse(bytes).id, r.letters[0].id);
    const report = issueReport({ ...r, issues: [{ file: 'f', line: 7, excerpt: 'a|b', message: 'bad' }] });
    assert.ok(report.includes('a\\|b'));
    assert.ok(report.includes('| 7 |'));
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('非登基变体、未知表头与新诗稳定 id 的边界', () => {
  const r = convert(scene().replace('### 场景 ch01-01 测试', '#### 条件正文 · 进入条件：flag.x'), 'condition');
  assert.ok(r.issues.some(i => i.message.includes('承接段写法已废')), '旧承接段要指回 D-026 的「条件」列写法');
  assert.ok(r.issues.some(i => i.message.includes('不在场景表之下')));
  const md = `## 诗库
| 序 | 题名 | 作者 | 完整原文（／换行） | 出处 | 意象标签 | 情绪 | 适合场合（设） | 难度 |
|---|---|---|---|---|---|---|---|---|
| 1 | 测试诗 | 测试作者 | 一句。／二句。 | 原创测试 | 纸 | 喜 | 读书 | 1 |
`;
  assert.equal(convert(md, 'p').poems[0].id, convert(md, 'p').poems[0].id);
});

test('重复反应、未知回复不能悄悄覆盖或丢弃', () => {
  assert.ok(convert(scene() + letter.replace('| 直言 A | 她留灯。 |', '| 直言 A | 她留灯。 |\n| 直言 A | 新反应。 |'), 'l').issues.some(i => i.message.includes('重复或未知反应')));
  assert.ok(convert(scene() + letter.replace('| 直言 A | 来。', '| 直言 D | 来。'), 'l').issues.some(i => i.message.includes('未知回信')));
});

test('真实结局八项依原顺序，登基三项均有名字变体', () => {
  const md = readFileSync(new URL('../docs/C-B-结局树.md', import.meta.url), 'utf8');
  const r = convert(md, 'endings');
  assert.deepEqual(r.issues, []);
  assert.deepEqual(r.endings.map(e => e.key), ['mandianwusheng','wuzibei','weijingzhizhao','liangxizhijian','kaimenshouzi','bushou','guanshanyouxin','zhishangyouming']);
  assert.deepEqual(Object.keys(r.endings[0].body), ['tian','zhao','kept']);
  assert.ok(r.endings.slice(0,3).every(e => typeof e.body === 'object'));
  assert.deepEqual(r.endings[7].require, {});
});

test('合并保留其他诗条目，结局重转按来源顺序替换', () => {
  const dir = mkdtempSync(join(tmpdir(), 'wuzetian-merge-'));
  try {
    const first = convert(ending(''), 'e');
    writeOut(first, dir);
    const next = convert(ending('flag.ready').replaceAll('finish', 'first') + '\n' + ending(''), 'e');
    writeOut(next, dir);
    assert.deepEqual(JSON.parse(readFileSync(join(dir, 'endings.json'), 'utf8')).map(e => e.key), ['first','finish']);
    const p = convert(readFileSync(new URL('../docs/C0-2-诗词库与对诗.md', import.meta.url), 'utf8'), 'p');
    writeOut({ ...p, poems: p.poems.slice(0,1), duels: [] }, dir);
    writeOut({ ...p, poems: p.poems.slice(1,2), duels: [] }, dir);
    assert.equal(JSON.parse(readFileSync(join(dir, 'poems.json'), 'utf8')).length, 2);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('终局判定与长台词校验不互相干扰', () => {
  const r = convert(scene('ch01-01', '', '| 终局判定 | 是 |'), 'judge');
  assert.deepEqual(r.issues, []);
  assert.equal(r.scenes[0].judgeEnding, true);
  assert.equal(r.scenes[0].ending, undefined);
  assert.equal(convert(scene().replace('灯亮着。', '灯'.repeat(41)), 'long').scenes.length, 0);
});

test('未支持的条件段仍报告明确的缺失去向', () => {
  const md = `#### 公共正文
| # | 选项文本 | 需要 | 效果 | 去向 | 备注 |
|---|---|---|---|---|---|
| A | 留下 | | | ch01-12 | |
`;
  assert.ok(convert(md, 'nested').issues.some(i => i.line === 4 && i.message.includes('ch01-12')));
});

// ------------------------------------------------------------ Prompt D2 · D-026

const sceneCond = (rows: string, header = '| # | 说话人 | 表情 | 类型 | 台词 | 条件 |\n|---|---|---|---|---|---|') => `### 场景 ch01-01 测试

| 字段 | 值 |
|---|---|
| 章 | 1 |
| 幕 | 1 |
| 地点 key | shuge |
| 色板 | ink |
| 在场 | wuze, shenheng |
| 无用场景 | 否 |
| 一句话目的 | 共读 |
| 结局 | done |

${header}
| 1 | narr | | 旁白 | 灯亮着。 | |
| 2 | wuze | open | 说 | 我抄过了。 | flag.trial_recopy |
| 3 | wuze | open | 说 | 我附改过了。 | 非 flag.trial_recopy 且 cai >= 3 |
| 4 | shenheng | guarded | 说 | 坐。 | |
${rows}`;

test('D-026 台词表「条件」列 -> Line.when；空列不生成；写进 JSON', () => {
  const r = convert(sceneCond(''), 'w');
  assert.deepEqual(r.issues, []);
  const s = r.scenes[0];
  assert.equal(s.lines[0].when, undefined);
  assert.deepEqual(s.lines[1].when, { 'flag.trial_recopy': true });
  assert.deepEqual(s.lines[2].when, { 'flag.trial_recopy': false, cai: { gte: 3 } });
  assert.equal(s.lines[3].when, undefined);
  assert.equal(s.lines.length, 4, '条件行与无条件行混排，序号连续，不拆场');
  const dir = mkdtempSync(join(tmpdir(), 'wuzetian-when-'));
  try {
    writeOut(r, dir);
    const json = JSON.parse(readFileSync(join(dir, 'chapters', 'ch01', 'ch01_s01_shuge.json'), 'utf8'));
    assert.deepEqual(json.lines[1].when, { 'flag.trial_recopy': true }, 'when 必须落到磁盘上的 JSON');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('D-026 条件列写坏了：报到那一行，整场不输出；列序不对也报', () => {
  const md = sceneCond('| 5 | wuze | | 说 | 嗯。 | 如果她够坚定 |');
  const r = convert(md, 'w');
  assert.equal(r.scenes.length, 0);
  const line = md.split('\n').findIndex(l => l.includes('如果她够坚定')) + 1;
  assert.ok(r.issues.some(i => i.line === line && i.message.includes('不能解析条件')));
  const wrong = convert(sceneCond('', '| # | 说话人 | 条件 | 表情 | 类型 | 台词 |\n|---|---|---|---|---|---|'), 'w');
  assert.ok(wrong.issues.some(i => i.message.includes('列不合规范')));
  assert.equal(wrong.scenes.length, 0);
});

const duelBlock = (heading = '### 对诗 · 场景 ch01-01 · 对手 shenheng', results = '| 赢 | cai +2 | ch01-02 |\n| 输 | cai +1 | ch01-02 |', header = '| 结果 | 效果 | 去向 |\n|---|---|---|') => `${heading}

| 字段 | 值 |
|---|---|
| 出句 | 明月松间照 |
| 出处 | 王维《山居秋暝》 |
| 难度 | 1 |
| 题面 | 接五字句，末字平声。 |
| 判题重点 | 句脚 |

| 选项 | 对句 | 对错 | 为什么 |
|---|---|---|---|
| A | 清泉穿石冷 | 错 | 末字「冷」为上声，未满足题面要求的平声句脚 |
| B | 清泉石上流 | 对 | 三层相应且末字平声，正是原诗对句 |
| C | 昨夜有归舟 | 错 | 没有按题面把自然物、处所、动作逐层对应 |
| D | 清泉石上长流 | 错 | 六个字，不满足本局五字句的字数限制 |

${header}
${results}
`;
const duelScene = (extra = '| 对诗 | pd-01 |') => scene('ch01-01', extra, '');
const target = () => ({ markdown: scene('ch01-02'), file: 'b' });

test('D-026 场景表「对诗」行 -> Scene.duel；对局块不写 id 时沿用它', () => {
  const r = convertBatch([{ markdown: duelScene() + '\n' + duelBlock(), file: 'a' }, target()]);
  assert.deepEqual(r.issues, []);
  assert.equal(r.scenes[0].duel, 'pd_01', 'pd-01 短横改下划线');
  assert.equal(r.scenes[0].goto, undefined);
  const d = r.duels.find(d => d.id === 'pd_01');
  assert.equal(d.sceneId, 'ch01_s01_shuge');
  assert.equal(d.opponent, 'shenheng');
  assert.equal(d.onWin.goto, 'ch01_s02_shuge');
  const explicit = convertBatch([{ markdown: duelScene() + '\n' + duelBlock('### 对诗 pd-01 · 场景 ch01-01 · 对手 shenheng'), file: 'a' }, target()]);
  assert.deepEqual(explicit.issues, []);
  assert.equal(explicit.duels.find(d => d.id === 'pd_01').sceneId, 'ch01_s01_shuge');
});

test('D-026 对诗出口的三种拒绝：id 不一致、对局不存在、只有对诗出口却缺去向', () => {
  const conflict = convertBatch([{ markdown: duelScene() + '\n' + duelBlock('### 对诗 pd-02 · 场景 ch01-01 · 对手 shenheng'), file: 'a' }, target()]);
  assert.ok(conflict.issues.some(i => i.message.includes('不一致')));
  assert.equal(conflict.scenes.filter(s => s.id === 'ch01_s01_shuge').length, 0);
  const missing = convertBatch([{ markdown: duelScene('| 对诗 | pd-09 |'), file: 'a' }, target()]);
  assert.ok(missing.issues.some(i => i.message.includes('不在本批对局') && i.excerpt.includes('pd-09')));
  assert.equal(missing.scenes.filter(s => s.id === 'ch01_s01_shuge').length, 0);
  const noLose = convertBatch([{ markdown: duelScene() + '\n' + duelBlock(undefined, '| 赢 | cai +2 | ch01-02 |\n| 输 | cai +1 | |'), file: 'a' }, target()]);
  assert.ok(noLose.issues.some(i => i.message.includes('赢、输两行都必须写去向')));
  assert.equal(noLose.scenes.filter(s => s.id === 'ch01_s01_shuge').length, 0);
  const choiceTable = '\n| # | 选项文本 | 需要 | 效果 | 去向 | 备注 |\n|---|---|---|---|---|---|\n| A | 走 | | | ch01-02 | |\n\n';
  const withChoice = convertBatch([{ markdown: duelScene() + choiceTable + duelBlock(undefined, '| 赢 | cai +2 | |\n| 输 | cai +1 | |'), file: 'a' }, target()]);
  assert.deepEqual(withChoice.issues, [], '有选项出口时，对诗胜负不写去向也行：打完回到选项');
  assert.equal(withChoice.scenes[0].duel, 'pd_01');
});

test('D-026 结果表第四列「台词」-> onWin/onLose.line，说话人是表头对手', () => {
  const header = '| 结果 | 效果 | 去向 | 台词 |\n|---|---|---|---|';
  const md = duelScene() + '\n' + duelBlock(undefined, '| 赢 | cai +2 | ch01-02 | 接得好。方才那句话，我仍不同意。 |\n| 输 | cai +1 | ch01-02 | |', header);
  const r = convertBatch([{ markdown: md, file: 'a' }, target()]);
  assert.deepEqual(r.issues, []);
  const d = r.duels.find(d => d.id === 'pd_01');
  assert.deepEqual(d.onWin.line, { id: 'pd_01.win', who: 'shenheng', kind: 'say', text: '接得好。方才那句话，我仍不同意。' });
  assert.equal(d.onLose.line, undefined, '空格子不生成台词');
  const noOpp = convertBatch([{ markdown: md.replace(' · 对手 shenheng', ''), file: 'a' }, target()]);
  assert.ok(noOpp.issues.some(i => i.message.includes('对手')));
  const tooLong = convertBatch([{ markdown: md.replace('接得好。方才那句话，我仍不同意。', '好'.repeat(41)), file: 'a' }, target()]);
  assert.ok(tooLong.issues.some(i => i.message.includes('40')));
});

test('胜负反馈写成散文：要求改成「台词」列；改了就不再报', () => {
  const prose = '\n胜负反馈文案：赢——沈衡：“接得好。”输——沈衡：“不合题。”\n';
  const r = convertBatch([{ markdown: duelScene() + '\n' + duelBlock() + prose, file: 'a' }, target()]);
  assert.ok(r.issues.some(i => i.message.includes('「台词」') && i.excerpt.startsWith('胜负反馈文案')));
  const fixedRows = '| 赢 | cai +2 | ch01-02 | 接得好。 |\n| 输 | cai +1 | ch01-02 | 不合题。 |';
  const fixed = convertBatch([{ markdown: duelScene() + '\n' + duelBlock(undefined, fixedRows, '| 结果 | 效果 | 去向 | 台词 |\n|---|---|---|---|') + prose, file: 'a' }, target()]);
  assert.deepEqual(fixed.issues, []);
});

test('信件：延迟与场数越界报到那一行，并译成中文；留信指向转换失败的信要说明', () => {
  // R-006 之后下限是 5 分钟、隔 1 场；这里用真正越界的值
  const md = scene('ch01-01', '| 留信 | shenheng |') + '\n' + letter.replace('| 延迟分钟 | 18 |', '| 延迟分钟 | 4 |').replace('之后第 3 场', '之后第 5 场');
  const r = convert(md, 'l');
  assert.equal(r.letters.length, 0);
  const at = (needle: string) => md.split('\n').findIndex(l => l.includes(needle)) + 1;
  assert.ok(r.issues.some(i => i.line === at('| 延迟分钟 | 4 |') && i.message.includes('须 ≥ 5')));
  assert.ok(r.issues.some(i => i.line === at('之后第 5 场') && i.message.includes('须 ≤ 4')));
  assert.ok(r.issues.some(i => i.line === at('| 留信 | shenheng |') && i.message.includes('未通过转换')));
  assert.ok(!r.issues.some(i => i.message.includes('一同转换 C-4')), '信交了，就不要再说没交');
});

test('R-006 放宽之后：军中素笺 8 分钟、隔 1 场的信照常转出', () => {
  const md = scene('ch01-01', '| 留信 | shenheng |') + '\n' + letter.replace('| 延迟分钟 | 18 |', '| 延迟分钟 | 8 |').replace('之后第 3 场', '之后第 1 场');
  const r = convert(md, 'l');
  assert.deepEqual(r.issues, []);
  assert.equal(r.letters[0].delayMinutes, 8);
  assert.equal(r.letters[0].trigger.afterScenes, 1);
});

const readDoc = (f: string) => ({ file: f, markdown: readFileSync(new URL(`../docs/${f}`, import.meta.url), 'utf8') });

test('真实 C-4：四封信一封不少，要么转出要么有问题；不静默丢信', () => {
  const inputs = ['C-2-第一章前六场.md', 'C-3-第一章后十二场.md', 'C-4-第一章书信.md'].map(readDoc);
  const r = convertBatch(inputs);
  const headings = [...inputs[2].markdown.matchAll(/^### 信 (lt-[a-z0-9-]+)/gm)].map(m => m[1].replace(/-/g, '_'));
  assert.equal(headings.length, 4);
  for (const id of headings) {
    const ok = r.letters.some(l => l.id === id) || r.issues.some(i => i.file === 'C-4-第一章书信.md');
    assert.ok(ok, `${id} 既没转出也没有问题记录`);
  }
  for (const l of r.letters) {
    assert.equal(l.trigger.kind, 'scene');
    const from = r.scenes.find(s => s.id === l.trigger.sceneId);
    assert.ok(from, '触发场景必须是本批转出的场');
    assert.ok(from.leavesLetter.includes(l.from), '触发场景要留了这个人的信');
  }
  assert.deepEqual(convertBatch(inputs), r, '同一批输入转两次结果相同');
});

test('去向「第二章（待交）」：只报一条待交问题，不再叠报没有出口', () => {
  const r = convert(scene('ch01-01', '', '| 去向 | 第二章（待交） |'), 'c');
  assert.equal(r.scenes.length, 0);
  assert.equal(r.issues.length, 1);
  assert.ok(r.issues[0].message.includes('待交'));
  assert.ok(!r.issues[0].message.includes('没有出口'));
});

test('问题单按三类分拣：ChatGPT 格式 / CC1 接口 / 待交付', () => {
  assert.equal(classify('台词表列不合规范'), 'ChatGPT 格式');
  assert.equal(classify('章末如何收束由 CC1 定，转换器不补'), 'CC1 接口');
  assert.equal(classify('去向 ch02-01 没有场景全文／地点 key，不能猜 id 或补空场景'), '待交付');
  assert.equal(classify('留了 x 的信，但本批输入没有对应完整信件；请交付并一同转换 C-4'), '待交付');
  const report = issueReport({ scenes: [], poems: [], duels: [], letters: [], endings: [], issues: [
    { file: 'f', line: 1, excerpt: 'a', message: '台词表列不合规范' },
    { file: 'f', line: 2, excerpt: 'b', message: 'schema 尚未收录' },
  ] });
  assert.ok(report.includes('## ChatGPT 格式（1）'));
  assert.ok(report.includes('## CC1 接口（1）'));
  assert.ok(!report.includes('## 待交付'));
});

test('D-034 去向「章末」-> chapterEnd，不当成缺去向，也不去解析成场次', () => {
  const r = convert(scene('ch01-01', '', '| 去向 | 章末 |'), 'end');
  assert.deepEqual(r.issues, []);
  assert.equal(r.scenes[0].chapterEnd, true);
  assert.equal(r.scenes[0].goto, undefined);
  const waiting = convert(scene('ch01-01', '', '| 去向 | 第二章（待交） |'), 'end');
  assert.equal(waiting.scenes.length, 0);
  assert.ok(waiting.issues[0].message.includes('章末'), '待交的提示要指向现在的解法');
});

test('D-026 结果表第四列叫「她说」也认；写「角色key：台词」时说话人以它为准', () => {
  const rows = '| 赢 | cai +2 | ch01-02 | shenheng：接得好。 |\n| 输 | cai +1 | ch01-02 | wenqiao：这句不合题。 |';
  const r = convertBatch([{ markdown: duelScene() + '\n' + duelBlock(undefined, rows, '| 结果 | 效果 | 去向 | 她说 |\n|---|---|---|---|'), file: 'a' }, target()]);
  assert.deepEqual(r.issues, []);
  const d = r.duels.find(d => d.id === 'pd_01');
  assert.deepEqual(d.onWin.line, { id: 'pd_01.win', who: 'shenheng', kind: 'say', text: '接得好。' });
  assert.equal(d.onLose.line.who, 'wenqiao', '写明了角色就用它，不用表头的对手');
  const bad = convertBatch([{ markdown: duelScene() + '\n' + duelBlock(undefined, '| 赢 | cai +2 | ch01-02 | nobody：接得好。 |\n| 输 | cai +1 | ch01-02 | |', '| 结果 | 效果 | 去向 | 她说 |\n|---|---|---|---|'), file: 'a' }, target()]);
  assert.ok(bad.issues.some(i => i.message.includes('角色 key')), '不在冻结十人里的 key 要拦下');
});

test('陈旧 id：合并模式留着，重写模式清掉（对局改过 id 之后不留没人引用的旧局）', () => {
  const dir = mkdtempSync(join(tmpdir(), 'wuzetian-stale-'));
  try {
    const r = convert(readFileSync(new URL('../docs/C0-2-诗词库与对诗.md', import.meta.url), 'utf8'), 'p');
    writeOut({ ...r, scenes: [], letters: [], endings: [] }, dir);
    const ids = () => JSON.parse(readFileSync(join(dir, 'duels.json'), 'utf8')).map((d: any) => d.id);
    const stale = ids()[0];
    const without = { ...r, scenes: [], letters: [], endings: [], duels: r.duels.filter(d => d.id !== stale) };
    writeOut(without, dir);
    assert.ok(ids().includes(stale), '默认合并：只转一份文件时不该冲掉别处来的条目');
    writeOut(without, dir, true);
    assert.ok(!ids().includes(stale), '输入盖过上一批时按本批重写，作废的 id 要清出去');
    assert.deepEqual(ids(), without.duels.map(d => d.id));
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('问题单末尾的人工补记不被自动生成冲掉', () => {
  const note = '## CC1 已处理\n\n接口都接了。\n';
  assert.equal(manualTail(`# 转换问题单\n\n表格\n\n---\n\n${MANUAL_MARK}\n${note}`), note);
  assert.equal(manualTail(`# 转换问题单\n\n表格\n\n---\n\n${note}`), note, '标记出现之前 CC1 用的写法也要认');
  assert.equal(manualTail('# 转换问题单\n\n表格\n'), '');
  assert.equal(manualTail(`# 转换问题单\n\n## CC1 接口（1）\n\n| a |\n`), '', '自动生成的小节不算补记');
});

test('整章可达性：18 场都在，从 01 出发全部走得到，没有断链', () => {
  const inputs = ['C-2-第一章前六场.md', 'C-3-第一章后十二场.md', 'C-4-第一章书信.md', 'C0-2-诗词库与对诗.md'].map(readDoc);
  const r = convertBatch(inputs);
  assert.equal(r.scenes.length, 18, '第一章 18 场一场不缺');
  const scenes = new Map(r.scenes.map(s => [s.id, s]));
  const duels = new Map(r.duels.map(d => [d.id, d]));
  const exits = (s: any) => [
    ...(s.choices ?? []).map((c: any) => c.goto),
    ...(s.goto ? [s.goto] : []),
    ...(s.duel ? [duels.get(s.duel)?.onWin?.goto, duels.get(s.duel)?.onLose?.goto] : []),
  ].filter(Boolean);
  const start = 'ch01_s01_zhaoyang';
  assert.ok(scenes.has(start), '开场必须转得出来');
  const seen = new Set([start]); const queue = [start]; const dangling: string[] = [];
  while (queue.length) {
    for (const to of exits(scenes.get(queue.pop()!))) {
      if (!scenes.has(to)) dangling.push(to);
      else if (!seen.has(to)) { seen.add(to); queue.push(to); }
    }
  }
  assert.deepEqual([...scenes.keys()].filter(id => !seen.has(id)), [], '没有孤儿场景');
  assert.deepEqual([...new Set(dangling)], [], '没有指向不存在场景的去向');
  for (const s of scenes.values()) assert.ok(exits(s).length || s.ending || s.judgeEnding || s.chapterEnd, `${s.id} 没有出口`);
  const last = r.scenes.filter((s: any) => s.chapterEnd);
  assert.equal(last.length, 1, '整章只有一个章末出口');
  assert.equal(last[0].id, 'ch01_s18_zhaoyang');
});

test('真实五份文件整批转换：结果确定，条件行只出现在 C-3 合表的场里', () => {
  const inputs = ['C-2-第一章前六场.md', 'C-3-第一章后十二场.md', 'C-4-第一章书信.md', 'C0-2-诗词库与对诗.md', 'C-B-结局树.md'].map(readDoc);
  const r = convertBatch(inputs);
  assert.deepEqual(convertBatch(inputs), r);
  assert.ok(r.scenes.length >= 12);
  const conditional = r.scenes.flatMap(s => s.lines).filter(l => l.when);
  assert.ok(conditional.length > 0, 'C-3 的 08/10/11/12/18 有条件行');
  for (const l of conditional) assert.ok(Object.keys(l.when).length > 0);
  assert.equal(r.poems.length, poemRows(inputs.find(i => i.file.startsWith('C0-2'))!.markdown));
  assert.equal(r.endings.length, 8);
});
