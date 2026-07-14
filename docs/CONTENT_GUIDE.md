# Myth Atlas 内容创作规范

本文档是所有内容条目的唯一契约。任何人（或 agent）新增/修改条目都必须遵守本规范，写完必须跑 `node scripts/validate.mjs` 直到零错误。

## 数据布局（注册制，随时可扩充）

```
data/
  traditions.json                 # 传统/合集注册表（静态元数据：名称、地图锚点、颜色、分类）
  intros/<traditionId>.json       # 每个传统的导言 { "zh": "…", "en": "…" }，段落用 \n\n 分隔
  entries/<traditionId>/<id>.json # 一个条目一个文件
```

- **加条目** = 在对应目录加一个 JSON 文件，别的什么都不用改。
- **加新体系/合集**（例：聊斋、克苏鲁）= 在 `traditions.json` 注册一条记录 + 建 `data/entries/<id>/` 目录。地图、图鉴、筛选、搜索由构建时扫描自动生成。
- 条目之间的 `related` 是软引用：引用了还不存在的条目只会 warning，不会 break，方便分批扩充。

## 条目 Schema

文件名必须是 `<id>.json`，与内部 `id` 字段一致。

```json
{
  "id": "zeus",
  "tradition": "greek",
  "type": "deity",
  "era": "ancient",
  "name": {
    "zh": "宙斯",
    "en": "Zeus",
    "original": "Ζεύς",
    "originalLang": "古希腊语"
  },
  "title": { "zh": "众神之王", "en": "King of the Gods" },
  "summary": { "zh": "一到两句话概括。", "en": "One or two sentences." },
  "description": { "zh": "正文，2-4 段，段落用 \\n\\n 分隔。", "en": "Body text, 2-4 paragraphs." },
  "domains": { "zh": ["天空", "雷霆", "王权"], "en": ["Sky", "Thunder", "Kingship"] },
  "traits": [
    { "label": { "zh": "圣物", "en": "Symbol" }, "value": { "zh": "雷霆与鹰", "en": "Thunderbolt and eagle" } }
  ],
  "related": ["hera", "athena", "cronus"],
  "sources": [
    { "zh": "赫西俄德《神谱》", "en": "Hesiod, Theogony" }
  ],
  "geo": { "lat": 40.08, "lon": 22.35, "label": { "zh": "奥林波斯山", "en": "Mount Olympus" } },
  "volume": { "zh": "南山经", "en": "Classic of the Southern Mountains" },
  "image": null
}
```

### 字段说明

| 字段 | 必填 | 说明 |
|---|---|---|
| `id` | ✅ | 全局唯一，小写 kebab-case，用拉丁转写（如 `xing-tian`、`kisaragi-station`）。与其他传统撞名时加后缀（如 `phoenix-greek`） |
| `tradition` | ✅ | 必须是 `traditions.json` 里已注册的 id |
| `type` | ✅ | `deity` 神祇 / `creature` 异兽·妖怪 / `hero` 英雄·人物 / `spirit` 精怪·幽灵 / `place` 地点·国度 / `artifact` 神器·圣物 / `tale` 传说·事件 |
| `era` | ✅ | `ancient` 上古·古典 / `folk` 民间·中世纪以降 / `modern` 近现代·网络时代 |
| `name` | ✅ | `zh`/`en` 必填；`original` 为源语言写法（希腊字母、汉字原名、日文假名等），没有则省略；有 `original` 必须带 `originalLang`（中文写，如 "古希腊语"、"日语"） |
| `title` | ✅ | 称号/身份一句话，zh/en |
| `summary` | ✅ | zh ≤ 80 字，en ≤ 40 词。用于卡片和搜索结果 |
| `description` | ✅ | zh ≥ 180 字，en ≥ 100 词，2-4 段。见下方写作要求 |
| `domains` | ✅ | 2-5 个关键词标签（司掌领域/特征），zh/en 数组等长 |
| `traits` | 可选 | 2-4 条速览事实（武器、圣兽、出没地、初次记载等） |
| `related` | 可选 | 相关条目 id 数组，软引用 |
| `sources` | ✅ | ≥1 条真实出典（文献、最早记载、流传渠道）。**严禁编造文献** |
| `geo` | 视情况 | 都市传说、失落之地、有明确圣地的条目**尽量给**；泛神类可省略 |
| `volume` | 视情况 | 子分卷，山海经条目必填（南山经/西山经/北山经/东山经/中山经/海外经/海内经/大荒经） |
| `image` | ✅ | 初始一律为 `null`，由配图管线填充，作者不要碰 |

## 写作要求

### 双语各自地道
- 中文不是英文的翻译腔，英文也不是中文的直译。各写各的，事实一致。
- 专有名词中文用通行译名（奥丁不写"欧丁"），生僻的可在首次出现时括注原文。

### description 结构（2-4 段）
1. **形象与身份**：外形、职能、在体系中的位置，写具体细节（几只眼、什么颜色、住在哪）。
2. **核心事迹/出典**：最著名的神话事件或最早的文字记载，讲清楚故事本身。
3. **流变与回响**（视条目取舍）：后世如何演绎、进入了哪些文化场景。

### 文风红线
- 禁 AI 腔：不写"不是X，而是Y"式论证句、不写空洞拔高（"承载着人类对未知的想象"这类废话）、不写总结性抒情结尾。
- 用具体细节说话：尺寸、数量、颜色、地名、年代。
- 禁止任何 emoji 和装饰性 Unicode 符号。
- 语气是博物馆图录：克制、准确、有画面感。

### 尊重与准确
- 活态信仰（圣经传统、北美原住民、澳洲原住民等）：按"传统叙事"客观陈述，禁"迷信""愚昧"等评判词，禁猎奇口吻。温迪戈等条目须写明其在原住民信仰中的严肃语境。
- 现代创作角色（警笛头、瘦长鬼影等）：必须写明创作者与创作年份（如 Trevor Henderson, 2018），描述用自己的话，不复制原文案。
- 都市传说：写清最早流传时间与渠道（BBS、2ch、报纸），区分"传说内容"与"可考事实"。
- 不确定的事实宁可不写，**严禁编造**细节、文献、年代。

## 校验

```bash
node scripts/validate.mjs                    # 校验全部
node scripts/validate.mjs --tradition greek  # 只校验一个传统
```

零 error 才算完成；warning（如 related 指向暂不存在的条目）可保留。
