import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { CASES, sceneId, lineId, choiceId, parseCondition, parseEffects, convert, convertBatch, tableCells, writeOut, issueReport, classify, manualTail, MANUAL_MARK, outputPathFor, storyGraph, flagAudit, flagIssues, FLAG_LEDGER, FLAG_VERDICTS, sceneEdges, SONG_BLACKLIST, SPEAKERS, SPEAKER_LABELS } from "../tools/convert-story.ts";
import { readFileSync, mkdtempSync, rmSync } from "node:fs";
import { AFFINITY_BANDS, SOLAR_TERMS } from "../src/engine/types.ts";
import { NAMES } from "../src/ui/names.ts";
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
  // 门槛取引擎档位表里识档的下限：这条用例测的是选项解析，档位再调（D-065、D-078）也不该让它变红
  const floor = AFFINITY_BANDS.find(b => b.label === '识')!.min;
  const first = scene('ch01-01', '', '') + `
| # | 选项文本 | 需要 | 效果 | 去向 | 备注 |
|---|---|---|---|---|---|
| A | 留下 | 好感.shenheng >= ${floor} | xin +1, flag.stay = 真 | ch01-02 | 不可逆；提示「交情未到」 |
`;
  const r = convertBatch([{ markdown: first, file: 'a' }, { markdown: scene('ch01-02'), file: 'b' }]);
  assert.deepEqual(r.issues, []);
  assert.deepEqual(r.scenes[0].choices[0], { id: 'ch01_s01_shuge.cA', text: '留下', require: { 'affinity.shenheng': { gte: floor } }, effects: { xin: 1, 'flag.stay': true }, goto: 'ch01_s02_shuge', irreversible: true, lockHint: '交情未到' });
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
  assert.ok(convert(scene('ch01-01', '', '| 去向 | ch01-07 |'), 'bad').issues.some(i => i.message.includes('取不到 id')));
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

/** B33 之后的四个节令：七夕让位给重阳；中秋键不动，玩家看见的是「八月望夜」，两个名字都要认 */
test('四节气与五种笺、缺反应和缺留信必须报告', () => {
  const asTerm = (cn: string) => letter.replace('| 触发 | 场景 ch01-01 之后第 3 场 |', `| 节气 | ${cn} |`).replace('| 会被截 | 是 |', '| 会被截 | 否 |').replace('| 被截去向 | ch01-01 |', '| 被截去向 | |');
  for (const [cn, key] of [['上元', 'shangyuan'], ['寒食', 'hanshi'], ['八月望夜', 'zhongqiu'], ['中秋', 'zhongqiu'], ['重阳', 'chongyang']]) {
    assert.deepEqual(convert(asTerm(cn), 'l').letters[0].trigger, { kind: 'solarTerm', term: key, minAffinity: 5 }, cn);
  }
  const qixi = convert(asTerm('七夕'), 'l');
  assert.equal(qixi.letters.length, 0, '七夕已经不是节令（B33），不能悄悄转出来');
  assert.ok(qixi.issues.some(i => i.message.includes('未知节气')), '七夕要报「未知节气」');
  for (const [cn, key] of [['黄麻纸','huangma'], ['军中素笺','junzhong'], ['泥金笺','nijin'], ['自制花笺','huajian'], ['常笺','chang']]) {
    assert.equal(convert(scene() + letter.replace('秘书省黄麻纸', cn), 'l').letters[0].paper, key);
  }
  assert.ok(convert(scene() + letter.replace('| 直言 A | 她留灯。 |', ''), 'l').issues.some(i => i.message.includes('缺少她的反应')));
  assert.ok(convert(scene('ch01-01', '| 留信 | shenheng, wenqiao |'), 'l').issues.some(i => i.message.includes('wenqiao')));
});

/** D-215：说话的人不在 src/ui/names.ts 的 NAMES 里，名牌会打出 key。转换这一步就要报，但戏照转 */
test('D-215 说话人不在 NAMES 里：报 CC1 接口、一人一场只报一次、这一场照常输出', () => {
  const md = scene().replace('| 3 | wuze | open | 说 | 我来。 |', '| 3 | shenheng | open | 说 | 我来。 |');
  assert.ok(!convert(md, 'a.md').issues.some(i => i.message.includes('NAMES')), '名单齐全时不报');
  const saved = NAMES.shenheng;
  delete NAMES.shenheng;   // 模拟「加了人、忘了加名字」：直接从 names.ts 那张表里拿掉，不另造一张名单
  try {
    const r = convert(md, 'a.md');
    const hits = r.issues.filter(i => i.message.includes('NAMES'));
    assert.equal(hits.length, 1, '沈衡在这一场说了两句，只报一次');
    assert.equal(hits[0].kind, 'CC1 接口');
    assert.ok(hits[0].message.includes('shenheng'));
    assert.equal(r.scenes.length, 1, '缺的只是名牌上的字，这一场照常输出');
  } finally {
    NAMES.shenheng = saved;
  }
  // 旁白、内心、题记、事件图、空镜不上名牌，不该被当成漏了名字
  for (const w of ['narr', 'self', ...Object.values(SPEAKER_LABELS)]) assert.ok(w in NAMES || Object.values(SPEAKER_LABELS).includes(w), w);
});

/** D-189：节令信的好感门槛写在信表里（上元 3、寒食 4），空着仍是引擎默认的 5 */
test('D-189 信表 minAffinity：写了就写进触发；只对节令信有用；不是整数要报', () => {
  const asTerm = (cn: string) => letter.replace('| 触发 | 场景 ch01-01 之后第 3 场 |', `| 节气 | ${cn} |`).replace('| 会被截 | 是 |', '| 会被截 | 否 |').replace('| 被截去向 | ch01-01 |', '| 被截去向 | |');
  const withMin = (cn: string, val: string) => asTerm(cn).replace(`| 节气 | ${cn} |`, `| minAffinity | ${val} |\n| 节气 | ${cn} |`);
  assert.deepEqual(convert(withMin('上元', '3'), 'l').letters[0].trigger, { kind: 'solarTerm', term: 'shangyuan', minAffinity: 3 });
  assert.deepEqual(convert(withMin('寒食', '4'), 'l').letters[0].trigger, { kind: 'solarTerm', term: 'hanshi', minAffinity: 4 });
  assert.deepEqual(convert(withMin('重阳', ''), 'l').letters[0].trigger, { kind: 'solarTerm', term: 'chongyang', minAffinity: 5 }, '空栏走引擎默认的 5');

  // 场次触发的信不看好感：写在那儿等于没写，要报出来，别当成转出来的信还带着门槛
  const onScene = letter.replace('| 触发 |', '| minAffinity | 3 |\n| 触发 |');
  const r = convert(scene() + onScene, 'l');
  assert.equal(r.letters.length, 0);
  assert.ok(r.issues.some(i => i.message.includes('只对节令信有用')), '场次触发的信写 minAffinity 要报');

  const bad = convert(withMin('上元', '三'), 'l');
  assert.equal(bad.letters.length, 0, '门槛不是整数就别转出来');
  assert.ok(bad.issues.some(i => i.message.includes('应为整数')));

  // 高过最高档只是警告：也许有意为之，人看一眼；转换照走
  const high = convert(withMin('上元', '99'), 'l');
  assert.equal(high.letters[0].trigger.minAffinity, 99);
  assert.ok(high.issues.some(i => i.kind === '警告' && i.message.includes('送不出去')));
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

/** 封数不写死：C43 起第一章多了一封节令信，以后还会加，数目从原文的信表头数来 */
test('真实 C-4：信一封不少，要么转出要么有问题；不静默丢信', () => {
  const inputs = ['C-2-第一章前六场.md', 'C-3-第一章后十二场.md', 'C-4-第一章书信.md'].map(readDoc);
  const r = convertBatch(inputs);
  const headings = [...inputs[2].markdown.matchAll(/^### 信 (lt-[a-z0-9-]+)/gm)].map(m => m[1].replace(/-/g, '_'));
  assert.ok(headings.length >= 4, `C-4 至少四封，现在数到 ${headings.length}`);
  for (const id of headings) {
    const ok = r.letters.some(l => l.id === id) || r.issues.some(i => i.file === 'C-4-第一章书信.md');
    assert.ok(ok, `${id} 既没转出也没有问题记录`);
  }
  for (const l of r.letters) {
    if (l.trigger.kind === 'solarTerm') {
      // 节令信按剧情时间投递（D-184）：没有触发场景，也不该写截获支
      assert.ok(SOLAR_TERMS.includes(l.trigger.term), `${l.id} 的节令键 ${l.trigger.term} 不在 types.ts 那张表里`);
      assert.ok(!l.interceptable && !l.onIntercept, `${l.id} 是节令信，不该会被截`);
      continue;
    }
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
  assert.equal(classify('去向 ch02-13 的场景全文尚未交付，大纲里也没有它的地点 key，取不到 id'), '待交付');
  assert.equal(classify('留了 x 的信，但本批输入没有对应完整信件；请交付并一同转换 C-4'), '待交付');
  const report = issueReport({ scenes: [], poems: [], duels: [], letters: [], endings: [], issues: [
    { file: 'f', line: 1, excerpt: 'a', message: '台词表列不合规范' },
    { file: 'f', line: 2, excerpt: 'b', message: 'schema 尚未收录' },
  ] });
  assert.ok(report.includes('## ChatGPT 格式（1）'));
  assert.ok(report.includes('## CC1 接口（1）'));
  assert.ok(!report.includes('## 待交付'));
});

/** 同一场戏，台词表按 story-schema 1.3 的列序写：「条件」在「台词」之前 */
const sceneCondSpec = `### 场景 ch01-01 测试

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

| # | 说话人 | 表情 | 类型 | 条件 | 台词 |
|---|---|---|---|---|---|
| 1 | narr | | 旁白 | | 灯亮着。 |
| 2 | wuze | open | 说 | flag.trial_recopy | 我抄过了。 |
| 3 | wuze | open | 说 | 非 flag.trial_recopy 且 cai >= 3 | 我附改过了。 |
| 4 | shenheng | guarded | 说 | | 坐。 |
`;

test('台词表按列名取值：「条件」在「台词」前后都认，列名写错才报', () => {
  // 规范（story-schema 1.3、第二章 C-7）把「条件」写在「台词」前，第一章 C-3 写在最后
  const r = convert(sceneCondSpec, 'w');
  assert.deepEqual(r.issues, []);
  assert.equal(r.scenes[0].lines[0].text, '灯亮着。');
  assert.deepEqual(r.scenes[0].lines[1].when, { 'flag.trial_recopy': true });
  assert.deepEqual(r.scenes[0].lines, convert(sceneCond(''), 'w').scenes[0].lines, '两种列序转出来的东西必须一样');
  for (const header of ['| # | 说话人 | 表情 | 类型 | 台词 | 条件说明 |\n|---|---|---|---|---|---|',
                        '| # | 说话人 | 表情 | 类型 | 台词 | 台词 |\n|---|---|---|---|---|---|']) {
    const bad = convert(sceneCond('', header), 'w');
    assert.ok(bad.issues.some(i => i.message.includes('列名不合规范')), header);
    assert.equal(bad.scenes.length, 0);
  }
  const missing = convert(sceneCond('', '| # | 说话人 | 表情 | 条件 | 台词 |\n|---|---|---|---|---|'), 'w');
  assert.ok(missing.issues.length && missing.scenes.length === 0, '少一列「类型」要拦下');
});

const outlineDoc = `## 第二章大纲

| 场景标题 | 地点 key | 色板 | 去向 |
|---|---|---|---|
| ch01-02 下一场 | hanyuan | gold | ch01-03 |
`;

test('正文分批交付：下一批的场次用大纲的地点 key 接上，并记一条待交付', () => {
  const r = convertBatch([{ markdown: scene('ch01-01', '', '| 去向 | ch01-02 |'), file: 'text' }, { markdown: outlineDoc, file: 'outline' }]);
  assert.equal(r.scenes.length, 1);
  assert.equal(r.scenes[0].goto, 'ch01_s02_hanyuan', '大纲写明了地点 key，就照它接');
  assert.equal(r.issues.length, 1);
  assert.equal(r.issues[0].kind, '待交付');
  assert.equal(r.issues[0].file, 'outline', '问题指到大纲那一行，人一眼知道等的是哪一场');
  assert.ok(r.issues[0].message.includes('ch01_s02_hanyuan') && r.issues[0].message.includes('重跑'));
});

test('大纲里也没有那一场：不猜 id，本场不输出', () => {
  const r = convert(scene('ch01-01', '', '| 去向 | ch01-09 |'), 'text');
  assert.equal(r.scenes.length, 0);
  assert.equal(r.issues.length, 1);
  assert.ok(r.issues[0].message.includes('大纲里也没有'));
  assert.equal(classify(r.issues[0].message), '待交付');
});

test('大纲不会盖掉正文：两边都在时用正文的地点 key', () => {
  const full = scene('ch01-02');   // 正文里 ch01-02 在 shuge，大纲写的是 hanyuan
  const r = convertBatch([{ markdown: scene('ch01-01', '', '| 去向 | ch01-02 |'), file: 'a' }, { markdown: full, file: 'b' }, { markdown: outlineDoc, file: 'outline' }]);
  assert.deepEqual(r.issues, []);
  assert.equal(r.scenes[0].goto, 'ch01_s02_shuge');
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

test('写盘与清理共用一条路径规则：场景按章分目录，信进 letters', () => {
  const dir = mkdtempSync(join(tmpdir(), 'wuzetian-path-'));
  try {
    assert.equal(outputPathFor('ch02_s25_yeting', dir), join(dir, 'chapters', 'ch02', 'ch02_s25_yeting.json'));
    assert.equal(outputPathFor('lt_ch02_shenheng_01', dir), join(dir, 'letters', 'lt_ch02_shenheng_01.json'));
    assert.throws(() => outputPathFor('随便什么', dir), /第几章/);
    // 写出来的位置必须就是这条规则算出来的位置，否则清理会删错或删不掉
    const r = convert([scene('ch01-01'), letter].join('\n'), 'p');
    writeOut(r, dir);
    assert.equal(JSON.parse(readFileSync(outputPathFor(r.scenes[0].id, dir), 'utf8')).id, r.scenes[0].id);
    assert.equal(JSON.parse(readFileSync(outputPathFor(r.letters[0].id, dir), 'utf8')).id, r.letters[0].id);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('问题单末尾的人工补记不被自动生成冲掉', () => {
  const note = '## CC1 已处理\n\n接口都接了。\n';
  assert.equal(manualTail(`# 转换问题单\n\n表格\n\n---\n\n${MANUAL_MARK}\n${note}`), note);
  assert.equal(manualTail(`# 转换问题单\n\n表格\n\n---\n\n${note}`), note, '标记出现之前 CC1 用的写法也要认');
  assert.equal(manualTail('# 转换问题单\n\n表格\n'), '');
  assert.equal(manualTail(`# 转换问题单\n\n## CC1 接口（1）\n\n| a |\n`), '', '自动生成的小节不算补记');
});

test('整章可达性：交了几场就出几场，从开场出发全部走得到，没有断链', () => {
  // 第 18 场按 D-039 接第二章第一场，所以这一批要带上第二章的正文才解析得了那个去向
  const inputs = ['C-2-第一章前六场.md', 'C-3-第一章后十二场.md', 'C-4-第一章书信.md', 'C0-2-诗词库与对诗.md', 'C-7-第二章前十二场.md'].map(readDoc);
  const all = convertBatch(inputs);
  const r = { ...all, scenes: all.scenes.filter(s => s.chapter === 1) };
  // 序幕 ch01-00 交了之后第一章是 19 场；场次数从原文数，别写死
  const expected = inputs.filter(i => i.file.startsWith('C-2') || i.file.startsWith('C-3'))
    .flatMap(i => [...i.markdown.matchAll(/^### 场景 ch01-/gm)]).length;
  assert.equal(r.scenes.length, expected, `第一章 ${expected} 场一场不缺`);
  const last = r.scenes.find(s => (s as any).chapterEnd)!;
  assert.equal(last.id, 'ch01_s18_zhaoyang');
  assert.equal(last.goto, 'ch02_s01_yeting', 'D-039：先出章末结算页，再进第二章第一场');
  // 连第二章的场一起放进图里：第一章最后一场的去向落在那边，不算断链
  const scenes = new Map(all.scenes.map(s => [s.id, s]));
  const duels = new Map(r.duels.map(d => [d.id, d]));
  const exits = (s: any) => [
    ...(s.choices ?? []).map((c: any) => c.goto),
    ...(s.goto ? [s.goto] : []),
    ...(s.duel ? [duels.get(s.duel)?.onWin?.goto, duels.get(s.duel)?.onLose?.goto] : []),
  ].filter(Boolean);
  // 开场是章里编号最小的那一场：有序幕就是 00，没有就是 01
  const start = r.scenes.map(s => s.id).sort()[0];
  assert.ok(scenes.has(start), '开场必须转得出来');
  const seen = new Set([start]); const queue = [start]; const dangling: string[] = [];
  while (queue.length) {
    for (const to of exits(scenes.get(queue.pop()!))) {
      if (!scenes.has(to)) dangling.push(to);
      // 走到第二章就停：那一章有它自己的用例，这里只管第一章走不走得通
      else if (!seen.has(to) && scenes.get(to)!.chapter === 1) { seen.add(to); queue.push(to); }
    }
  }
  assert.deepEqual(r.scenes.map(s => s.id).filter(id => !seen.has(id)), [], '第一章没有孤儿场景');
  assert.deepEqual([...new Set(dangling)], [], '没有指向不存在场景的去向');
  for (const s of r.scenes) assert.ok(exits(s).length || s.ending || s.judgeEnding || s.chapterEnd, `${s.id} 没有出口`);
  assert.deepEqual(r.scenes.filter((s: any) => s.chapterEnd).map(s => s.id), ['ch01_s18_zhaoyang'], '整章只有一个章末出口');
});

test('D-039 章末与去向并存：「章末 | 是」加一个去向，先结算再进下一章', () => {
  const r = convertBatch([{ markdown: scene('ch01-01', '| 章末 | 是 |', '| 去向 | ch01-02 |'), file: 'a' }, { markdown: scene('ch01-02'), file: 'b' }]);
  assert.deepEqual(r.issues, []);
  assert.equal(r.scenes[0].chapterEnd, true);
  assert.equal(r.scenes[0].goto, 'ch01_s02_shuge', '去向照旧解析，章末只是多出一页结算');
  // 老写法还得认：第一章的 C-3 就是「去向 | 章末」，没有下一章去向
  const old = convert(scene('ch01-01', '', '| 去向 | 章末 |'), 'a');
  assert.equal(old.scenes[0].chapterEnd, true);
  assert.equal(old.scenes[0].goto, undefined);
  assert.equal(convert(scene('ch01-01', '| 章末 | 否 |'), 'a').scenes[0].chapterEnd, undefined);
});

test('D-039 信件表「截获场景」-> interceptAt：被截由剧本定，不由读信节奏定', () => {
  const md = scene('ch01-01', '| 留信 | shenheng |') + '\n' + letter.replace('| 会被截 | 是 |', '| 会被截 | 是 |\n| 截获场景 | ch01-01 |');
  const r = convert(md, 'l');
  assert.deepEqual(r.issues, []);
  assert.equal(r.letters[0].interceptAt, 'ch01_s01_shuge');
  assert.equal(r.letters[0].onIntercept.goto, 'ch01_s01_shuge');
  const bad = convert(md.replace('| 截获场景 | ch01-01 |', '| 截获场景 | ch09-09 |'), 'l');
  assert.equal(bad.letters.length, 0, '截获场景指向不存在的场就不能出信');
});

test('选项的去向写「章末」：说清楚卡在哪两条规则上，不悄悄丢掉选项', () => {
  const md = scene('ch01-01', '', '| 去向 | 章末 |') + `
| # | 选项文本 | 需要 | 效果 | 去向 | 备注 |
|---|---|---|---|---|---|
| A | 留一会儿 | | flag.stay = 真 | 章末 | |
`;
  const r = convert(md, 'c');
  if (r.scenes.length) {
    // schema 放开之后（D-043）：选项照常结算效果，然后出章末结算页，所以没有 goto
    assert.deepEqual(r.issues, []);
    assert.equal(r.scenes[0].chapterEnd, true);
    assert.equal(r.scenes[0].choices!.length, 1);
    assert.equal(r.scenes[0].choices![0].goto, undefined);
    assert.deepEqual(r.scenes[0].choices![0].effects, { 'flag.stay': true });
  } else {
    assert.ok(r.issues.some(i => i.message.includes('章末')), '转不了就要说清楚卡在哪');
    assert.equal(classify(r.issues[0].message), 'CC1 接口');
  }
  // 不管 schema 放没放开，这一条都不许过：选项说走章末，场景却没标章末
  const mismatch = convert(md.replace('| 去向 | 章末 |', '| 结局 | done |'), 'c');
  assert.equal(mismatch.scenes.length, 0);
  assert.ok(mismatch.issues.some(i => i.message.includes('章末')));
});

test('D-044 信的分条件附页：一封信多段正文，「宣读」列决定被截时念不念', () => {
  const pages = `
| 附页 | 条件 | 正文 | 宣读 |
|---|---|---|---|
| 公务甲 | flag.joint_reading | 旧驳语请依原句读。 | |
| 私段甲 | flag.private_yes | 读完也想见你。 | 是 |
| 尚未宣读的末句 | | 等你愿意听的时候再说。 | 否 |
`;
  const r = convert(scene('ch01-01', '| 留信 | shenheng |') + '\n' + letter + pages, 'l');
  if (r.letters.length) {
    assert.deepEqual(r.issues, []);
    const got = (r.letters[0].body as any).pages;
    assert.equal(got.length, 3, '顺序即表格顺序，一段都不能少');
    assert.deepEqual(got[0], { key: '公务甲', when: { 'flag.joint_reading': true }, text: '旧驳语请依原句读。', readAloud: true });
    assert.equal(got[2].when, undefined, '条件空 = 总是出现');
    assert.equal(got[2].readAloud, false, '这一段是戏眼：公议上没念出来的那句');
  } else {
    const pageIssue = r.issues.find(i => i.message.includes('附页') || i.message.includes('pages'));
    assert.ok(pageIssue, '装不下就要说清楚，不能当七段只有一段');
    assert.equal(classify(pageIssue!.message), 'CC1 接口');
  }
  const bad = convert(scene('ch01-01', '| 留信 | shenheng |') + '\n' + letter + pages.replace('| 私段甲 | flag.private_yes | 读完也想见你。 | 是 |', '| 私段甲 | flag.private_yes | | 是 |'), 'l');
  assert.equal(bad.letters.length, 0, '附页缺正文不能当它不存在');
});

test('D-046 场景表「布置 | 公议」-> dressing；认不出的布置要报', () => {
  const r = convert(scene('ch01-01', '| 布置 | 公议 |'), 's');
  assert.equal(r.scenes.length, 1, '布置接不上也不该把整场扣下：丢的是道具，不是台词');
  if ((r.scenes[0] as any).dressing) {
    assert.equal((r.scenes[0] as any).dressing, 'gongyi');
    assert.deepEqual(r.issues, []);
  } else {
    assert.ok(r.issues.some(i => i.message.includes('Scene.dressing')), 'schema 没跟上就要留一条提醒');
    assert.equal(classify(r.issues[0].message), 'CC1 接口');
  }
  // 认不出的布置同样不扣整场：丢的是道具，不是台词（R-011 的原则）
  const unknown = convert(scene('ch01-01', '| 布置 | 夜宴 |'), 's');
  assert.equal(unknown.scenes.length, 1);
  assert.equal((unknown.scenes[0] as any).dressing, undefined);
  const note = unknown.issues.find(i => i.message.includes('夜宴'));
  assert.ok(note && note.message.includes('dressings.ts'), '要指到那张表，不是让人去翻转换器');
  assert.equal(note!.kind, 'CC1 接口');
});

test('认不出的角色 key：两条路都写出来，不含糊说一句 enum 不过', () => {
  const cast = convert(scene('ch01-01').replace('| 在场 | wuze, shenheng |', '| 在场 | wuze, zhangsanfeng |'), 's');
  assert.equal(cast.scenes.length, 0);
  assert.ok(cast.issues.some(i => i.message.includes('zhangsanfeng') && i.message.includes('CHARACTER_KEYS') && i.message.includes('笔误')));
  const speaker = convert(scene('ch01-01').replace('| 3 | wuze | open | 说 | 我来。 |', '| 3 | zhangsanfeng | open | 说 | 我来。 |'), 's');
  assert.ok(speaker.issues.some(i => i.message.includes('说话人') && i.message.includes('zhangsanfeng')));
  assert.equal(speaker.scenes.length, 0);
});

test('字段表里多出来的行不会被静默丢掉；剧作自查那几行是明知故不转', () => {
  const withNew = convert(scene('ch01-01', '| 折法 | 双鲤 |'), 's');
  assert.ok(withNew.issues.some(i => i.message.includes('折法') && i.message.includes('静默')), 'D-035 若真加了新机制，必须被看见');
  assert.equal(withNew.issues[0].kind, 'ChatGPT 格式');
  const notes = convert(scene('ch01-01', '| 进场想要 | 想留下 |\n| 阻碍 | 她不肯 |\n| 行动 | 再问一次 |\n| 翻转 | 以为→原来 |\n| 出场所知 | 她也没把握 |'), 's');
  assert.deepEqual(notes.issues, [], '剧作自查的行不转成数据，但也不该天天报');
  assert.equal(notes.scenes.length, 1);
  const badLetter = convert(scene('ch01-01', '| 留信 | shenheng |') + '\n' + letter.replace('| 笺 | 秘书省黄麻纸 |', '| 笺 | 秘书省黄麻纸 |\n| 折法 | 双鲤 |'), 'l');
  assert.ok(badLetter.issues.some(i => i.message.includes('折法')));
});

test('第二章前十二场：12 场都在，从 02-01 出发全部走得到，只差未交的 13', () => {
  const inputs = ['C-6-第二章大纲.md', 'C-7-第二章前十二场.md'].map(readDoc);
  const r = convertBatch(inputs);
  // 原文本身不该有格式错：剩下的只能是等下一批交付，或者等 CC1 的接口
  for (const i of r.issues) assert.notEqual(i.kind ?? classify(i.message), 'ChatGPT 格式', i.message);
  const scenes = new Map(r.scenes.map(s => [s.id, s]));
  assert.equal(scenes.size, 12, '前十二场一场不缺');
  assert.ok([...scenes.values()].every(s => s.chapter === 2 && s.act === 2));
  const exits = (s: any) => [...(s.choices ?? []).map((c: any) => c.goto), ...(s.goto ? [s.goto] : [])];
  const start = 'ch02_s01_yeting';
  const seen = new Set([start]); const queue = [start]; const dangling: string[] = [];
  while (queue.length) {
    for (const to of exits(scenes.get(queue.pop()!))) {
      if (!scenes.has(to)) dangling.push(to);
      else if (!seen.has(to)) { seen.add(to); queue.push(to); }
    }
  }
  assert.deepEqual([...scenes.keys()].filter(id => !seen.has(id)), [], '没有孤儿场景');
  assert.deepEqual([...new Set(dangling)], ['ch02_s13_hanyuan'], '唯一的断链是还没交的 13');
  for (const s of scenes.values()) assert.ok(exits(s).length, `${s.id} 没有出口`);
  // D-035 的紫、簪、私册、双鲤都是正文里的字，不需要新字段；信件表在 C-8，这一批没有
  assert.equal(r.letters.length, 0);
  assert.deepEqual(convertBatch(inputs), r, '同一批转两次结果相同');
});

test('第二章整章：交了几场就该出几场，出不来的每一场都要有一条说清为什么', () => {
  const inputs = ['C-6-第二章大纲.md', 'C-7-第二章前十二场.md', 'C-8-第二章后十二场与书信.md'].map(readDoc);
  const r = convertBatch(inputs);
  const labels = inputs.flatMap(i => [...i.markdown.matchAll(/^### 场景 (ch\d+-\d+)/gm)].map(m => m[1].replace('-', '_s')));
  assert.equal(new Set(labels).size, 26, '第二章交了 26 场（含 D-038 的 25、26）');
  // 没转出来的场次必须留下解释。CC1 补好接口之后这些会自动变成"转出来了"，用例照样过
  for (const label of new Set(labels)) {
    if (r.scenes.some(s => s.id.startsWith(label))) continue;
    assert.ok(r.issues.some(i => i.line >= 1), `${label} 没转出来，问题单里却没有任何记录`);
  }
  for (const s of r.scenes) {
    assert.ok((s.choices?.length || s.goto || s.ending || s.judgeEnding || (s as any).chapterEnd), `${s.id} 没有出口`);
  }
  // 断链只允许指向还没转出来的场；不允许指向一个谁也没写过的场次
  const ids = new Set(r.scenes.map(s => s.id));
  const dangling = new Set(r.scenes.flatMap(s => [...(s.choices ?? []).map(c => c.goto), ...(s.goto ? [s.goto] : [])]).filter((to): to is string => !!to && !ids.has(to)));
  for (const to of dangling) assert.ok(labels.some(l => to.startsWith(l)), `断链 ${to} 不对应任何一份场景表`);
  if (!r.issues.length) assert.equal(dangling.size, 0, '没有问题就不该有断链');
  assert.deepEqual(convertBatch(inputs), r, '同一批转两次结果相同');
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


// ------------------------------------------------------------ Prompt D7

test('D-043 章末场带选项：选项不写 goto，场景级去向照样写出来（ch02-24 的形状）', () => {
  const md = scene('ch01-01', '| 章末 | 是 |', '| 去向 | ch01-02 |') + `
| # | 选项文本 | 需要 | 效果 | 去向 | 备注 |
|---|---|---|---|---|---|
| A | 留一会儿 | | flag.stay = 真 | 章末 | |
| B | 今夜想独处 | | flag.leave = 真 | 章末 | |
`;
  const r = convertBatch([{ markdown: md, file: 'a' }, { markdown: scene('ch01-02'), file: 'b' }]);
  assert.deepEqual(r.issues, []);
  const s = r.scenes.find(x => x.id === 'ch01_s01_shuge')! as any;
  assert.equal(s.chapterEnd, true);
  assert.equal(s.goto, 'ch01_s02_shuge', '选完 → 结算页 → 场景级去向，少了它就进不了下一章');
  assert.deepEqual(s.choices.map((c: any) => c.goto), [undefined, undefined]);
  // 普通场景有选项表时，场景级去向仍不写：两处都写会互相打架
  const plain = convertBatch([{ markdown: scene('ch01-01', '', '| 去向 | ch01-02 |') + '\n| # | 选项文本 | 需要 | 效果 | 去向 | 备注 |\n|---|---|---|---|---|---|\n| A | 走 | | | ch01-02 | |\n', file: 'a' }, { markdown: scene('ch01-02'), file: 'b' }]);
  assert.equal((plain.scenes.find(x => x.id === 'ch01_s01_shuge') as any).goto, undefined);
});

test('表格中间多一个空行：整段只报一条，说清是空行，不刷一串「缺少分隔行」', () => {
  const md = scene().replace('| 3 | wuze | open | 说 | 我来。 |', '\n| 3 | wuze | open | 说 | 我来。 |');
  const r = convert(md, 't');
  const blank = r.issues.filter(i => i.message.includes('空行'));
  assert.equal(blank.length, 1);
  assert.ok(!r.issues.some(i => i.message.includes('缺少匹配表头')), '不再逐行报看不懂的错');
  assert.equal(r.scenes.length, 0, '后半截台词读不进来，这一场不能当完整的输出');
});

test('大纲只贡献场次索引：夹在大纲里的样稿、出口合同不转成数据', () => {
  const outline = `# 第九章大纲

| 场景标题 | 地点 key | 色板 | 去向 |
|---|---|---|---|
| ch01-02 下一场 | hanyuan | gold | ch01-03 |

### 11 出口合同

| # | 选项文本 | 需要 | 效果 | 去向 | 备注 |
|---|---|---|---|---|---|
| A | 办 | | flag.x = 真 | ch01-12 | |

` + scene('ch01-05').replace('| 幕 | 1 |', '| 幕 | 4 |');
  const r = convertBatch([{ markdown: scene('ch01-01', '', '| 去向 | ch01-02 |'), file: 'text' }, { markdown: outline, file: 'C-99-第九章大纲.md' }]);
  assert.equal(r.scenes.length, 1, '大纲里那一场样稿不转');
  assert.equal(r.scenes[0].goto, 'ch01_s02_hanyuan', '场次索引照样拿来接前向去向');
  assert.ok(!r.issues.some(i => i.message.includes('ch01-12')), '出口合同里的去向不报');
  assert.ok(!r.issues.some(i => i.message.includes('幕')), '样稿的字段错误不报');
});

test('章末身份核对表：每行都去场景级去向就放行；按身份去不同的场就报接口', () => {
  const table = (a: string, b: string) => `
章末后分别核对：

| 已定身份 | 条件 | 章末后去向 | 下章所读段 |
|---|---|---|---|
| 已受位 | flag.enthroned | ${a} | 亲自命名 |
| 已拒位 | flag.declined_crown | ${b} | 领旧物 |
`;
  const base = scene('ch01-01', '| 章末 | 是 |', '| 去向 | ch01-02 |');
  const same = convertBatch([{ markdown: base + table('ch01-02', 'ch01-02'), file: 'a' }, { markdown: scene('ch01-02'), file: 'b' }]);
  assert.deepEqual(same.issues, []);
  assert.equal(same.scenes.find(s => s.id === 'ch01_s01_shuge')!.goto, 'ch01_s02_shuge');
  const split = convertBatch([{ markdown: base + table('ch01-02', 'ch01-03'), file: 'a' }, { markdown: scene('ch01-02'), file: 'b' }, { markdown: scene('ch01-03'), file: 'c' }]);
  assert.ok(split.issues.some(i => i.message.includes('按身份去不同的场')));
  assert.equal(classify(split.issues.find(i => i.message.includes('按身份'))!.message), 'CC1 接口');
  assert.equal(split.scenes.filter(s => s.id === 'ch01_s01_shuge').length, 0);
});

test('宋以后诗词黑名单：命中报警告，不挡转换、不算错', () => {
  assert.ok(SONG_BLACKLIST.length >= 30, '至少三五十条最常见的');
  assert.ok(SONG_BLACKLIST.every(e => e.key.length >= 4), '片段太短会和普通行文撞车');
  const md = scene().replace('| 4 | shenheng | guarded | 诗 | 明月松间照。 |', '| 4 | shenheng | guarded | 诗 | 疏影横斜水清浅。 |');
  const r = convert(md, 'p');
  assert.equal(r.scenes.length, 1, '警告不挡输出');
  const w = r.issues.filter(i => i.kind === '警告');
  assert.equal(w.length, 1);
  assert.ok(w[0].message.includes('林逋') && w[0].message.includes('北宋'));
  assert.equal(w[0].line, md.split('\n').findIndex(l => l.includes('疏影横斜')) + 1, '报到那一行');
  // 断句和标点不一样也要认得
  assert.equal(convert(scene().replace('明月松间照。', '暗香，浮动月黄昏'), 'p').issues.filter(i => i.kind === '警告').length, 1);
  // 表格外的编剧说明不扫：那里常常正是在讨论这条禁令
  assert.equal(convert(scene() + '\n说明：不要写林逋「疏影横斜水清浅」。\n', 'p').issues.length, 0);
  assert.ok(issueReport(r).includes('## 警告（1）'));
});

test('分支图：每章一张，孤儿描朱砂，章末边画虚线，未交付的场画虚框', () => {
  const r = convertBatch([
    { markdown: scene('ch01-01', '| 章末 | 是 |', '| 去向 | ch02-01 |'), file: 'a' },
    { markdown: scene('ch02-01').replace('| 章 | 1 |', '| 章 | 2 |').replace('| 结局 | done |', '| 去向 | ch02-02 |'), file: 'b' },
    { markdown: scene('ch02-05').replace('| 章 | 1 |', '| 章 | 2 |'), file: 'c' },
    { markdown: '# 大纲\n\n| 场景标题 | 地点 key |\n|---|---|\n| ch02-02 未来 | yeting |\n', file: 'x-大纲.md' },
  ]);
  const g = storyGraph(r);
  assert.ok(g.includes('## 第 1 章') && g.includes('## 第 2 章'));
  assert.ok(g.includes('class ch02_s05_shuge orphan'), '没人指向的场要描朱砂');
  assert.ok(!g.includes('class ch02_s01_shuge orphan'));
  assert.ok(/ch01_s01_shuge -\.->\|"章末"\| ch02_s01_shuge/.test(g), '章末结算后的去向画虚线');
  assert.ok(g.includes('未交付 ch02_s02_yeting'), '指向还没交的场画成虚框');
  assert.ok(sceneEdges(r).every(e => e.to), '章末选项没有 goto 的不画成指向 undefined 的边');
});

test('flag 体检：真正的空缺／空转与「已知预期」分开，① 待发布章节、② 连带假警报、引擎读取', () => {
  // 第一章：读 ghost（谁也不写）、known_gap（缺口清单点过名）、cascade（写它的那一场转不出来）、
  // future（写它的在待发布的第二章）、ch09_plan（第九章还没发布）；写 lonely（引擎在读）、idle（真空转）
  const reader = scene('ch01-01', '| 进入条件 | flag.ghost 且 flag.cascade 且 flag.future 且 flag.ch09_plan |', '') + `
| # | 选项文本 | 需要 | 效果 | 去向 | 备注 |
|---|---|---|---|---|---|
| A | 走 | flag.known_gap | flag.lonely = 真, flag.idle = 真 | ch01-02 | |
`;
  // 第二场转不出来（说话人是认不出的 key），但它原文里写着 flag.cascade
  const broken = scene('ch01-02', '', '').replace('| 3 | wuze |', '| 3 | nobody |') + `
| # | 选项文本 | 需要 | 效果 | 去向 | 备注 |
|---|---|---|---|---|---|
| A | 写 | | flag.cascade = 真 | ch01-03 | |
`;
  const r = convertBatch([{ markdown: reader, file: 'a' }, { markdown: broken, file: 'b' }, { markdown: scene('ch01-03'), file: 'c' }]);
  assert.ok(r.unconverted!.some(u => u.label === 'ch01-02' && u.writes.includes('cascade')), '转不出来的场也要记下它写了什么');
  const future = scene('ch02-01', '', '').replace('| 章 | 1 |', '| 章 | 2 |') + `
| # | 选项文本 | 需要 | 效果 | 去向 | 备注 |
|---|---|---|---|---|---|
| A | 后来 | | flag.future = 真 | ch01-03 | |
`;
  const pending = convertBatch([{ markdown: reader, file: 'a' }, { markdown: broken, file: 'b' }, { markdown: scene('ch01-03'), file: 'c' }, { markdown: future, file: 'p' }]);
  const a = flagAudit(r, { engineText: 'const RULES = ["lonely"];', outlineText: '', knownText: '缺口：flag.known_gap 没人写', pending });
  const [one, two] = a.split('## 二');
  const [realOne, knownOne] = one.split('### 已知预期');
  assert.ok(/`ghost`/.test(realOne) && /`known_gap`.*已点名/.test(realOne), '真空缺留在前面');
  assert.ok(/`cascade`.*② 连带：ch01-02/.test(knownOne), '写入点那一场没转出来：连带假警报');
  assert.ok(/`future`.*① 写入点在待发布的第 2 章/.test(knownOne), '写入点在待发布的章里');
  assert.ok(/`ch09_plan`.*① 第 9 章还没发布.*大纲里也没有/.test(knownOne), '按章号前缀认出未发布的章，并提醒大纲里也没有');
  assert.ok(!/`cascade`|`future`|`ch09_plan`/.test(realOne), '已知预期的不许混进真空缺');
  const [realTwo, knownTwo] = two.split('### 已知预期');
  assert.ok(/`idle`/.test(realTwo), '真空转');
  assert.ok(/`lonely`.*引擎读取/.test(knownTwo), '引擎在读的不算空转');
});

test('D-061 回信回声表：逐封逐回法标出已读、待发布、无', () => {
  // 第一场留信，信的「直言 A」写 flag.echo_a，第二场有一句按它分岔；其余回法没人读
  const withLetter = scene('ch01-01', '| 留信 | shenheng |', '| 去向 | ch01-02 |') + '\n' +
    letter.replace('| 直言 A | 来。 | 好感.shenheng +2 | |', '| 直言 A | 来。 | flag.echo_a = 真 | |')
          .replace('| 直言 B | 等。 | xin +1 | |', '| 直言 B | 等。 | flag.echo_b = 真 | |')
          .replace('| 被截去向 | ch01-01 |', '| 被截去向 | ch01-02 |');
  const echoed = scene('ch01-02').replace('| 1 | narr | | 旁白 | 灯亮着。 |', '| 1 | narr | | 旁白 | 灯亮着。 |')
    .replace('| # | 说话人 | 表情 | 类型 | 台词 |\n|---|---|---|---|---|', '| # | 说话人 | 表情 | 类型 | 台词 | 条件 |\n|---|---|---|---|---|---|')
    .replace(/^(\| \d \| [^\n]*\|)$/gm, '$1 |')
    .replace('| 3 | wuze | open | 说 | 我来。 | |', '| 3 | wuze | open | 说 | 我来。 | flag.echo_a |');
  const r = convertBatch([{ markdown: withLetter, file: 'a' }, { markdown: echoed, file: 'b' }]);
  assert.deepEqual(r.issues.filter(i => i.kind !== '待交付'), []);
  const later = scene('ch02-01').replace('| 章 | 1 |', '| 章 | 2 |').replace('| 进入条件 |', '| 进入条件 |') + '';
  const pending = convertBatch([{ markdown: withLetter, file: 'a' }, { markdown: echoed, file: 'b' },
    { markdown: later.replace('| 一句话目的 | 共读 |', '| 一句话目的 | 共读 |\n| 进入条件 | flag.echo_b |'), file: 'p' }]);
  const table = flagAudit(r, { engineText: '', outlineText: '', knownText: '', pending }).split('## 三')[1];
  const row = table.split('\n').find(l => l.startsWith('| `lt_ch01_shenheng_01`'))!;
  const cells = row.split(' | ');
  assert.ok(cells[1].startsWith('✓'), '直言 A 在已发布的章里读了');
  assert.ok(cells[2].startsWith('待发布'), '直言 B 只有待发布的章在读');
  assert.ok(cells[3].includes('（不写 flag）') || cells[3].includes('**无**'), '直言 C 没人提');
  assert.ok(row.includes('**无**'), '不回写了 flag 却没人读，要标无');
});


// ------------------------------------------------------------ Prompt D10

test('布置的中文名到 key 只从 src/scene/dressings.ts 取：表里每一行都转得出来', async () => {
  const { DRESSINGS } = await import('../src/scene/dressings.ts');
  for (const [cn, d] of Object.entries(DRESSINGS) as [string, { key: string }][]) {
    const r = convert(scene('ch01-01', `| 布置 | ${cn} |`), 's');
    assert.equal((r.scenes[0] as any).dressing, d.key, `「${cn}」应当转成 ${d.key}`);
    assert.ok(!r.issues.some(i => i.message.includes('布置')), `「${cn}」不该再报认不出`);
  }
});

test('D-063 说话人写「题记」转成 tiji；标签表里的 key 必须是 schema 认的说话人', () => {
  for (const key of Object.values(SPEAKER_LABELS)) assert.ok(SPEAKERS.has(key), `${key} 不在 schema 的 SpeakerKey 里`);
  const r = convert(scene().replace('| 1 | narr | | 旁白 | 灯亮着。 |', '| 1 | 题记 | | 旁白 | 灯亮着。 |'), 't');
  assert.deepEqual(r.issues, []);
  assert.equal(r.scenes[0].lines[0].who, 'tiji');
  assert.equal(r.scenes[0].lines[1].who, 'self', '别的说话人不受影响');
});

test('D-065 好感门槛不是档位下限：报警告指名原文，不挡转换、不替原文改数', () => {
  const gate = (n: number) => scene('ch01-01', `| 进入条件 | 好感.shenheng >= ${n} |`, '') + `
| # | 选项文本 | 需要 | 效果 | 去向 | 备注 |
|---|---|---|---|---|---|
| A | 去看墨渍 | 好感.shenheng >= ${n} 且 flag.x | | ch01-02 | |
`;
  const old = convertBatch([{ markdown: gate(10), file: 'a' }, { markdown: scene('ch01-02'), file: 'b' }]);
  const warns = old.issues.filter(i => i.kind === '警告');
  assert.equal(warns.length, 2, '进入条件与选项需要各报一次');
  assert.ok(warns.every(w => w.message.includes('D-065') && w.message.includes('ChatGPT')));
  assert.equal(old.scenes.length, 2, '警告不挡转换');
  assert.deepEqual((old.scenes[0] as any).require, { 'affinity.shenheng': { gte: 10 } }, '转换器照原文转，不偷偷改成 8');
  const fixed = convertBatch([{ markdown: gate(8), file: 'a' }, { markdown: scene('ch01-02'), file: 'b' }]);
  assert.ok(!fixed.issues.some(i => i.message.includes('D-065')));
});

test('结局走不到：有结局表、没有终局判定、最后一场是空章末，要当场报出来', () => {
  const last = scene('ch01-02', '| 章末 | 是 |', '');
  const r = convertBatch([{ markdown: scene('ch01-01', '', '| 去向 | ch01-02 |'), file: 'a' }, { markdown: last, file: 'b' }, { markdown: ending(''), file: 'e' }]);
  const hit = r.issues.find(i => i.message.includes('终局判定'));
  assert.ok(hit, '一个结局都出不来，必须报');
  assert.equal(hit!.kind, 'ChatGPT 格式');
  assert.equal(hit!.file, 'b', '报到最后那一场');
  // 有一场做了终局判定就不报
  const judged = convertBatch([{ markdown: scene('ch01-01', '| 终局判定 | 是 |', ''), file: 'a' }, { markdown: ending(''), file: 'e' }]);
  assert.ok(!judged.issues.some(i => i.message.includes('终局判定')));
  // 最后的章末还接着下一章（第一到三章转的时候就是这样）：不提前响
  const chained = convertBatch([{ markdown: scene('ch01-01', '| 章末 | 是 |', '| 去向 | ch01-02 |'), file: 'a' }, { markdown: scene('ch01-02', '', '| 去向 | ch01-01 |'), file: 'b' }, { markdown: ending(''), file: 'e' }]);
  assert.ok(!chained.scenes.some(s => s.ending || (s as any).judgeEnding), '这一例里确实没有终局判定，测的是章末还接着走的那一支');
  assert.ok(!chained.issues.some(i => i.message.includes('终局判定')));
});

// ------------------------------------------------------------ Prompt D12

test('D-091：拼错的 flag 两头都挡转换，行号指回原文；登记过的降为待交付；登记表过期要报', () => {
  // 第一场写 took_seal（拼对了）和 idle；第二场按拼错的 took_seel 分岔
  const writer = scene('ch01-01', '', '') + `
| # | 选项文本 | 需要 | 效果 | 去向 | 备注 |
|---|---|---|---|---|---|
| A | 收印 | | flag.took_seal = 真, flag.idle = 真 | ch01-02 | |
`;
  const reader = scene('ch01-02', '| 进入条件 | flag.took_seel |');
  const inputs = [{ markdown: writer, file: 'a.md' }, { markdown: reader, file: 'b.md' }];
  const r = convertBatch(inputs);
  assert.deepEqual(r.issues, [], '每一场单看都合法，convertBatch 自己抓不到');
  const ctx = { engineText: '', outlineText: '', knownText: '' };
  const ledgerText = '{\n  "entries": [\n    { "flag": "idle", "verdict": "真死" },\n    { "flag": "gone", "verdict": "漏读" }\n  ]\n}';
  const ledger = [
    { flag: 'idle', verdict: '真死' as const, why: '恒真', fix: 'ChatGPT 删掉' },
    { flag: 'gone', verdict: '漏读' as const, why: '早就修了', fix: '—' },
  ];
  const issues = flagIssues(r, ctx, inputs, ledger, ledgerText, 'ledger.json');
  const blocking = issues.filter(i => i.kind === 'ChatGPT 格式');
  const lineOf = (md: string, needle: string) => md.split('\n').findIndex(l => l.includes(needle)) + 1;
  assert.deepEqual(blocking.map(i => [i.file, i.line]).sort(), [['a.md', lineOf(writer, '| A | 收印 |')], ['b.md', lineOf(reader, '| 进入条件 |')]], '写的那头和读的那头各挡一条，行号指到原文那一行');
  assert.ok(blocking.every(i => i.message.includes('拼错')), '文案要提拼错这一种可能');
  const pending = issues.find(i => i.kind === '待交付')!;
  assert.ok(pending.message.includes('flag.idle') && pending.message.includes('真死') && pending.message.includes('ChatGPT 删掉'), '登记过的带上判定与了结');
  const stale = issues.find(i => i.kind === '警告')!;
  assert.deepEqual([stale.file, stale.line, stale.excerpt], ['ledger.json', 4, 'gone'], '已经不空的登记行要报出来删掉');
  // 判定和缺的那头对不上：登记成漏读，其实是没人写
  const wrong = flagIssues(r, ctx, inputs, [{ flag: 'took_seel', verdict: '漏读', why: '', fix: '' }], '', 'ledger.json');
  assert.ok(wrong.some(i => i.kind === '警告' && i.message.includes('对不上')));
  // 引擎在读、或对面在未发布的章：不算
  const engine = flagIssues(r, { ...ctx, engineText: 'flags.idle' }, inputs, [], '', 'ledger.json');
  assert.ok(!engine.some(i => i.message.includes('flag.idle')), '引擎读取不挡');
});

test('flag 体检报告：登记过的空转单列判定与了结，未登记的留在原表', () => {
  const writer = scene('ch01-01', '', '') + `
| # | 选项文本 | 需要 | 效果 | 去向 | 备注 |
|---|---|---|---|---|---|
| A | 走 | | flag.idle = 真, flag.open_gap = 真 | ch01-02 | |
`;
  const r = convertBatch([{ markdown: writer, file: 'a' }, { markdown: scene('ch01-02'), file: 'b' }]);
  const two = flagAudit(r, { engineText: '', outlineText: '', knownText: '', ledger: [{ flag: 'idle', verdict: '漏读', why: '备注点了名', fix: 'ChatGPT 加附页' }] }).split('## 二')[1].split('## 三')[0];
  assert.ok(/未登记的 1 个挡转换；登记了判定的 1 个/.test(two));
  assert.ok(/\| `open_gap` \|.*\| — \|$/m.test(two), '未登记的照旧格式');
  assert.ok(/\| `idle` \| `ch01_s01_shuge\.cA` \| 漏读 \| 备注点了名 \| ChatGPT 加附页 \|/.test(two), '登记过的单列');
});

test('flag 登记表本身：判定只有三种，理由与了结不许空，一个 flag 只登记一次', () => {
  const names = FLAG_LEDGER.map(e => e.flag);
  assert.equal(new Set(names).size, names.length);
  for (const e of FLAG_LEDGER) {
    assert.ok(FLAG_VERDICTS.includes(e.verdict), `${e.flag} 的判定「${e.verdict}」`);
    assert.ok(e.why.trim() && e.fix.trim(), `${e.flag} 缺理由或了结`);
    assert.match(e.flag, /^[a-z0-9_]+$/, '登记的是 flag 名本身，不带 flag. 前缀');
  }
});

// ------------------------------------------------------------ Prompt D18

test('D18：说话人「事件图」→ cg，类型可以留空，文本是 cgs.ts 里的 key', async () => {
  const { CGS } = await import('../src/scene/cgs.ts');
  const key = Object.keys(CGS)[0]!;
  const md = scene('ch01-01').replace('| 4 | shenheng | guarded | 诗 | 明月松间照。 |', `| 4 | 事件图 |  |  | ${key} |`);
  const r = convert(md, 'cg.md');
  assert.deepEqual(r.issues, []);
  const l = r.scenes[0].lines[3] as any;
  assert.equal(l.who, 'cg');
  assert.equal(l.text, key);
  assert.equal(l.kind, 'aside', '事件图不是说出口的话，按旁白记，不进对话框');
  assert.equal(l.expr, undefined);
});

test('D18：事件图的 key 表里没有——这一场照常输出，但挡转换，并列出名字相近的 key', async () => {
  const { CGS } = await import('../src/scene/cgs.ts');
  // 造一个「改名撞车」：把表里某个 key 的序号段去掉，或者干脆编一个
  const real = Object.keys(CGS).find(k => /_\d+_/.test(k)) ?? Object.keys(CGS)[0]!;
  const renamed = real.replace(/_\d+_/, '_');
  const md = scene('ch01-01').replace('| 4 | shenheng | guarded | 诗 | 明月松间照。 |', `| 4 | 事件图 |  |  | ${renamed === real ? 'nobody_9_nothing' : renamed} |`);
  const r = convert(md, 'cg.md');
  assert.equal(r.scenes.length, 1, '丢的是一张图，戏文一句不少，不扣整场');
  const hit = r.issues.find(i => i.message.includes('cgs.ts'))!;
  assert.ok(hit, '必须报出来：引擎找不到图会静默跳过');
  assert.equal(hit.kind, 'ChatGPT 格式', '静默失效挡转换（R-019）');
  assert.equal(hit.line, md.split('\n').findIndex(x => x.includes('| 4 | 事件图 |')) + 1, '行号指到事件图那一行');
  if (renamed !== real) assert.ok(hit.message.includes(real), '改名撞车时把表里相近的那个 key 列出来');
});

// ------------------------------------------------------------ Prompt D20

test('D20：关系键的条件——等于、其中之一、不是其中之一、真假、计数', () => {
  assert.deepEqual(parseCondition('pact.shenheng = active'), { 'pact.shenheng': 'active' });
  assert.deepEqual(parseCondition('pact.liqinghe = active/paused'), { 'pact.liqinghe': { in: ['active', 'paused'] } });
  assert.deepEqual(parseCondition('pact.shenheng != none/declined'), { 'pact.shenheng': { not: ['none', 'declined'] } });
  assert.deepEqual(parseCondition('pact.liqinghe != active'), { 'pact.liqinghe': { not: ['active'] } }, '单个值的不等也写成 not，引擎只认这一种');
  assert.deepEqual(parseCondition('told.wenqiao 且 非 love.shenheng 且 非 asked.liqinghe'), { 'told.wenqiao': true, 'love.shenheng': false, 'asked.liqinghe': false });
  assert.deepEqual(parseCondition('pacts.active >= 2 且 pacts.love = 0'), { 'pacts.active': { gte: 2 }, 'pacts.love': { eq: 0 } });
  assert.deepEqual(parseCondition('intent = solo 且 flag.enthroned 且 cai >= 6'), { intent: 'solo', 'flag.enthroned': true, cai: { gte: 6 } });
});

test('D20：关系键写错——人、字段、取值、真假当枚举、计数当枚举，都当场说清', () => {
  const bad: [string, RegExp][] = [
    ['pact.liuchenghuan = active', /人只能是/],
    ['pact.shenheng = open', /没有「open」这个值/],
    ['told.wenqiao = active', /真假值/],
    ['pacts.active = active', /是个数/],
    ['pact.shenheng', /不是真假值/],
    ['love.shenheng >= 1', /不是个数/],
    ['pact.shenheng = active/active', /重复/],
  ];
  for (const [text, why] of bad) assert.throws(() => parseCondition(text), why, text);
});

test('D20：关系键的效果——枚举、真假；算出来的键不能写', () => {
  assert.deepEqual(parseEffects('pact.shenheng = ended, told.wenqiao = 真, answer.peizhaoye = open, intent = only, flag.x = 假'),
    { 'pact.shenheng': 'ended', 'told.wenqiao': true, 'answer.peizhaoye': 'open', intent: 'only', 'flag.x': false });
  assert.throws(() => parseEffects('love.shenheng = 真'), /算出来的/);
  assert.throws(() => parseEffects('pacts.active = 2'), /算出来的/);
  assert.throws(() => parseEffects('pact.shenheng = active/paused'), /一次只能写一个值/);
  assert.throws(() => parseEffects('asked.wenqiao = active'), /只能写真或假/);
});

test('D20：自动去向 → branches + 兜底 goto；写法不对当场报', () => {
  const md = (auto: string, extra = '') => scene('ch04-05c', `| 自动去向 | ${auto} |${extra}`, '').replace('| 章 | 1 |', '| 章 | 4 |').replace('| 幕 | 1 |', '| 幕 | 4 |')
    + '\n' + scene('ch04-05ca').replace('| 章 | 1 |', '| 章 | 4 |').replace('| 幕 | 1 |', '| 幕 | 4 |')
    + '\n' + scene('ch04-08z').replace('| 章 | 1 |', '| 章 | 4 |').replace('| 幕 | 1 |', '| 幕 | 4 |');
  const ok = convert(md('pact.shenheng = active/paused 且 非 asked.shenheng → ch04-05ca；兜底 → ch04-08z'), 'a.md');
  assert.deepEqual(ok.issues, []);
  const s = ok.scenes.find(x => x.id === 'ch04_s05c_shuge') as any;
  assert.deepEqual(s.branches, [{ require: { 'pact.shenheng': { in: ['active', 'paused'] }, 'asked.shenheng': false }, goto: 'ch04_s05ca_shuge' }]);
  assert.equal(s.goto, 'ch04_s08z_shuge', '兜底就是场景级 goto');
  assert.ok(sceneEdges(ok).some(e => e.from === s.id && e.to === 'ch04_s05ca_shuge' && e.locked), '分支图画出自动去向，带锁');
  const noFallback = convert(md('flag.enthroned → ch04-05ca'), 'a.md');
  assert.ok(noFallback.issues.some(i => /卡住|goto/.test(i.message)), '每条都带条件又没兜底：schema 拦（会卡死）');
  const late = convert(md('兜底 → ch04-08z；flag.enthroned → ch04-05ca'), 'a.md');
  assert.ok(late.issues.some(i => i.message.includes('兜底」要写在自动去向的最后')));
  const clash = convert(md('flag.enthroned → ch04-05ca；兜底 → ch04-08z', '\n| 去向 | ch04-05ca |'), 'a.md');
  assert.ok(clash.issues.some(i => i.message.includes('两处要一致')));
  const noArrow = convert(md('flag.enthroned ch04-05ca'), 'a.md');
  assert.ok(noArrow.issues.some(i => i.message.includes('条件 → 场次')));
});

// ------------------------------------------------------------ Prompt D21

test('D21：台词表空着的中转场（D-169）被 schema 拒——报成 CC1 接口，不算原文写错', () => {
  const md = scene('ch01-01', '', '| 去向 | ch01-02 |').replace(/\| 1 \| narr[^\n]*\n\| 2 \|[^\n]*\n\| 3 \|[^\n]*\n\| 4 \|[^\n]*\n/, '') + '\n' + scene('ch01-02');
  const r = convert(md, 'a.md');
  const hit = r.issues.find(i => i.message.includes('D-169'));
  if (r.scenes.some(s => s.id === 'ch01_s01_shuge')) {
    assert.ok(!hit, 'schema 放开之后就不该再报');
  } else {
    assert.ok(hit, '被拒要说清原因');
    assert.equal(hit!.kind, 'CC1 接口');
  }
});

// ------------------------------------------------------------ Prompt D22

test('D22：说话人「空镜」→ who: "empty"，类型写旁白或留空都记 aside', () => {
  const md = (kind: string) => scene('ch01-01').replace('| 2 | self | | 内心 | {名},看\\|纸。 |', `| 2 | 空镜 | | ${kind} | 瓦沟里横着一片枯叶。 |`);
  for (const kind of ['旁白', '']) {
    const r = convert(md(kind), 'a.md');
    assert.deepEqual(r.issues, [], `类型「${kind}」`);
    const l = r.scenes[0].lines[1] as any;
    assert.equal(l.who, 'empty');
    assert.equal(l.kind, 'aside');
    assert.equal(l.text, '瓦沟里横着一片枯叶。');
    assert.equal(l.expr, undefined);
  }
});

test('D22：空镜格违规——带表情、类型不是旁白、两格连着、选项前最后一格——都报出来，行号指到那一格', () => {
  const lineOf = (m: string, needle: string) => m.split('\n').findIndex(x => x.includes(needle)) + 1;
  const expr = scene('ch01-01').replace('| 2 | self | | 内心 | {名},看\\|纸。 |', '| 2 | 空镜 | open | 旁白 | 瓦上有霜。 |');
  const r1 = convert(expr, 'a.md');
  const h1 = r1.issues.find(i => i.message.includes('不能带表情'))!;
  assert.ok(h1, '带表情要拦');
  assert.equal(h1.line, lineOf(expr, '| 2 | 空镜 |'), '行号指到那一格，不指场景标题');
  const say = scene('ch01-01').replace('| 2 | self | | 内心 | {名},看\\|纸。 |', '| 2 | 空镜 | | 说 | 瓦上有霜。 |');
  assert.ok(convert(say, 'a.md').issues.some(i => i.message.includes('旁白')), '类型写成「说」要拦');
  const twice = scene('ch01-01').replace('| 2 | self | | 内心 | {名},看\\|纸。 |', '| 2 | 空镜 | | 旁白 | 瓦上有霜。 |').replace('| 3 | wuze | open | 说 | 我来。 |', '| 3 | 空镜 | | 旁白 | 檐下没有人。 |');
  const r3 = convert(twice, 'a.md');
  const h3 = r3.issues.find(i => i.message.includes('两格连着'))!;
  assert.ok(h3, '两格连着没人要拦');
  assert.equal(h3.line, lineOf(twice, '| 2 | 空镜 |'));
  const last = scene('ch01-01', '', '').replace('| 4 | shenheng | guarded | 诗 | 明月松间照。 |', '| 4 | 空镜 | | 旁白 | 灯芯结了一粒黑花。 |') + `
| # | 选项文本 | 需要 | 效果 | 去向 | 备注 |
|---|---|---|---|---|---|
| A | 走 | | | ch01-02 | |
` + '\n' + scene('ch01-02');
  assert.ok(convert(last, 'a.md').issues.some(i => i.message.includes('选项前的最后一格')), '空镜不许是选项前最后一格');
});

// D32 前半：独立样例，不读取 C52 未解锁工作稿。
function imageScene(columns = ['#', '说话人', '表情', '类型', '条件', '台词', '画面']) {
  const rows: Record<string, string>[] = [
    { '#': '1', '说话人': 'narr', '类型': '旁白', '台词': '雨落在窗边。', '画面': 'shenheng_3_zhibei', '条件': '非 flag.name_tian 且 affinity.shenheng >= 10' },
    { '#': '2', '说话人': 'shenheng', '表情': 'open', '类型': '说', '台词': '这里。', '画面': 'shenheng_3_zhibei' },
    { '#': '3', '说话人': 'wuze', '类型': '说', '台词': '我来。' },
  ];
  return scene().split('| # | 说话人')[0] +
    '| ' + columns.join(' | ') + ' |\n| ' + columns.map(() => '---').join(' | ') + ' |\n' +
    rows.map(row => '| ' + columns.map(c => row[c] ?? '').join(' | ') + ' |').join('\n') + '\n';
}

test('D32 画面与条件按列名读取：同拍不增格，同 key 不合并，空列不输出', () => {
  const orders = [
    ['#', '说话人', '表情', '类型', '条件', '台词', '画面'],
    ['#', '画面', '台词', '类型', '表情', '说话人', '条件'],
    ['#', '说话人', '表情', '类型', '台词', '画面', '条件'],
  ];
  const expected = convert(imageScene(), 'd32.md');
  assert.deepEqual(expected.issues, []);
  const lines = expected.scenes[0].lines;
  assert.deepEqual(lines.map(l => l.id), [1, 2, 3].map(n => `ch01_s01_shuge.l${n}`));
  assert.deepEqual(lines.map(l => l.image), ['shenheng_3_zhibei', 'shenheng_3_zhibei', undefined]);
  assert.deepEqual(lines[0].when, { 'flag.name_tian': false, 'affinity.shenheng': { gte: 10 } });
  assert.equal(lines[1].when, undefined);
  assert.ok(!('image' in lines[2]));
  assert.ok(lines.every(l => l.who !== 'cg'));
  for (const order of orders) assert.deepEqual(convert(imageScene(order), 'd32.md'), expected);
});

test('D32 无画面列旧表兼容；空画面列与缺列结果一致', () => {
  const cols = ['#', '说话人', '表情', '类型', '台词'];
  const old = convert(imageScene(cols), 'old.md');
  const blank = convert(imageScene([...cols, '画面']).replaceAll('shenheng_3_zhibei', ''), 'old.md');
  assert.deepEqual(blank, old);
  assert.deepEqual(old.issues, []);
});

test('D32 unknown key 原样保留给 B45 校验器，不丢图、不补图、不丢正文', async () => {
  const key = 'd32_nonexistent_image_key';
  const { CGS } = await import('../src/scene/cgs.ts');
  assert.ok(!(key in CGS));
  const r = convert(imageScene().replaceAll('shenheng_3_zhibei', key), 'd32.md');
  assert.deepEqual(r.issues, []); // story-schema 1.3.1：合法性由 validate-story 负责。
  assert.equal(r.scenes[0].lines[0].image, key);
  assert.equal(r.scenes[0].lines[0].text, '雨落在窗边。');
});

test('D32 画面列重复或拼错仍拒绝；坏条件不因带图绕过', () => {
  for (const md of [imageScene(['#', '说话人', '表情', '类型', '台词', '画面', '画面']), imageScene().replace('台词 | 画面', '台词 | 画图')]) {
    const r = convert(md, 'd32.md');
    assert.equal(r.scenes.length, 0);
    assert.ok(r.issues.some(i => i.message.includes('列名不合规范')));
  }
  const bad = convert(imageScene().replace('非 flag.name_tian 且 affinity.shenheng >= 10', '不认识的条件'), 'd32.md');
  assert.equal(bad.scenes.length, 0);
  assert.ok(bad.issues.some(i => i.message.includes('不能解析条件')));
});

test('D32 空镜可带画面；既有独立 cg 格仍保持', () => {
  const r = convert(imageScene().replace('| 1 | narr |', '| 1 | 空镜 |'), 'd32.md');
  assert.deepEqual(r.issues, []);
  assert.equal(r.scenes[0].lines[0].who, 'empty');
  assert.equal(r.scenes[0].lines[0].image, 'shenheng_3_zhibei');
  const legacy = convert(scene().replace('| 1 | narr | | 旁白 | 灯亮着。 |', '| 1 | 事件图 | | | shenheng_3_zhibei |'), 'old.md');
  assert.deepEqual(legacy.issues, []);
  assert.equal(legacy.scenes[0].lines[0].who, 'cg');
  assert.equal(legacy.scenes[0].lines[0].image, undefined);
});

test('D32 图文同格落盘，连续两次转换逐字节相同', () => {
  const dir = mkdtempSync(join(tmpdir(), 'wuzetian-d32-'));
  try {
    const r = convert(imageScene(), 'd32.md');
    writeOut(r, dir);
    const path = outputPathFor(r.scenes[0].id, dir);
    const first = readFileSync(path);
    writeOut(convert(imageScene(), 'd32.md'), dir);
    assert.deepEqual(readFileSync(path), first);
    const parsed = JSON.parse(first.toString('utf8'));
    assert.equal(parsed.lines.length, 3);
    assert.equal(parsed.lines[0].image, 'shenheng_3_zhibei');
    assert.deepEqual(parsed.lines[0].when, r.scenes[0].lines[0].when);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('D32 C52 实际承欢信：六回法在归还前后都不改数值、flag、关系或跳场', async () => {
  const { Store } = await import('../src/engine/state.ts');
  const { Letters } = await import('../src/engine/letters.ts');
  const r = convertBatch(['C-7-第二章前十二场.md', 'C-8-第二章后十二场与书信.md', 'C0-2-诗词库与对诗.md'].map(readDoc));
  const l = r.letters.find(l => l.id === 'lt_ch02_liuchenghuan_01');
  assert.ok(l, '实际源稿必须转出承欢信');
  assert.deepEqual(l.trigger, { kind: 'scene', sceneId: 'ch02_s26_shuge', afterScenes: 1 });
  assert.equal(l.delayMinutes, 5);
  assert.equal(l.paper, 'chang');
  assert.equal(l.interceptable, false);
  assert.equal(l.interceptAt, undefined);
  assert.equal(l.onIntercept, undefined);
  assert.ok(r.scenes.find(s => s.id === 'ch02_s26_shuge')?.leavesLetter.includes('liuchenghuan'));
  const kinds = ['plainA', 'plainB', 'plainC', 'poemResonant', 'poemMismatch', 'silence'] as const;
  for (const returned of [false, true]) for (const kind of kinds) {
    const store = new Store();
    store.state.flags.chenghuan_returned = returned;
    store.state.affinity.liuchenghuan = 4;
    const before = JSON.stringify([store.state.stats, store.state.affinity, store.state.flags, store.state.relation]);
    // 这里只验证已经送到的旧信，投递场次门由 CC1 管；不以此测试声称时间门正确。
    store.state.letters.push({ id: l.id, state: 'arrived', dueAt: 1, repliedWith: null });
    const inbox = new Letters([l], store);
    inbox.markRead(l.id);
    const reply = inbox.reply(l.id, kind, kind === 'poemResonant' ? l.replies.poem.resonantTags : []);
    assert.ok(reply?.reaction, `${kind} 有反应`);
    assert.equal(reply.goto, undefined);
    assert.equal(JSON.stringify([store.state.stats, store.state.affinity, store.state.flags, store.state.relation]), before);
    assert.equal(inbox.reply(l.id, 'plainA'), null, '六回法互斥，不能再结算');
  }
});
