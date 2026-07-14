# 寰宇神话志 Myth Atlas — 项目全貌

世界神话志异图鉴：收录全球神话体系、志怪典籍（山海经）、都市传说（日本怪谈/美洲怪谈）、失落之地的中英双语图鉴 + 交互式世界地图。

- 技术栈：Next.js 16 (App Router, SSG) + Tailwind v4 + D3 (d3-geo/zoom/selection + topojson) + MiniSearch
- 仓库：chriswu727/myth-atlas · 本地 `~/project/myth-atlas`
- 线上：https://myth-atlas.vercel.app
- 现状（2026-07-14）：424 条目 / 24 体系 / 401 条有公版配图 / 188 条有地理坐标 / 20 条创世时间线

## 数据布局

```
data/
  traditions.json          # 体系注册表
  intros/<tid>.json        # 体系导言
  entries/<tid>/<id>.json  # 条目，一条一文件
  cosmogony/<tid>.json     # 创世时间线，一个体系一文件（只有有创世叙事的才建）
```

## 架构原则（对着这个改，别破坏）

1. **注册制 + 一条目一文件**。加条目 = 加一个 `data/entries/<tradition>/<id>.json`；加体系 = `data/traditions.json` 注册一行 + 建目录。页面、地图、筛选、搜索全部构建时扫描自动生成，没有手工维护的中间产物。
2. **`related` 是软引用**：指向不存在的条目只 warn 不 break，页面渲染时静默跳过，方便分批扩充。
3. **schema 契约唯一来源是 `docs/CONTENT_GUIDE.md`**，改 schema 必须同步改 `scripts/validate.mjs` 和 `src/lib/types.ts`。
4. **每个条目都可带 `geo` 坐标**（都市传说/失落之地必带），地图上的菱形钉点由此而来；文明星标锚点在 traditions.json 的 `anchor`。
5. **image 字段只由配图管线写**（`scripts/fetch-image.mjs`），人和内容 agent 都别手填。无图条目自动落到 7 种 type 各异的雕版纹章 SVG（`Emblem.tsx`），不放假图。

## 常用命令

```bash
npm run validate              # 全量校验数据（零 error 才能上）
npm run build && npm start    # node25 下测交互必须 build+start，dev 不 hydrate
node scripts/fetch-image.mjs search "Zeus bust"          # Commons 搜图
node scripts/fetch-image.mjs fetch "File:X.jpg" --entry zeus  # 下载+压缩+回填
```

## 内容生产流程（历史与复用）

首批 424+ 条目由 workflow 生成：29 个批次（20 神话体系 + 山海经按卷 6 批 + 怪谈 2 批 + 失落之地），每批「写作 agent → 事实审校 agent」流水线，各自跑 `validate.mjs --tradition <id>` 到零 error。以后批量扩充直接复用这个模式；单条手工加也行，跑一遍 validate 即可。

山海经卷属分工与著名角色归属（避免重复收录）：
- 西王母、黄帝、蚩尤、女娲、大禹等后世大神 → `chinese`（华夏），山海经批次不写
- 饕餮(狍鸮)→北山经、穷奇/帝江→西山经、精卫→北山经、刑天/夸父/相柳→海外经、烛龙→大荒经
- 温迪戈、剥皮行者 → `native-american`（活态信仰，措辞尊重），美洲怪谈不写

## 配图规则

- 只用 Wikimedia Commons 公有领域/CC 授权（PD/CC0/CC BY/CC BY-SA），出处、作者、许可证写进 entry.image，条目页和 About 页展示致谢

### 什么图能用（分层，别再搞错）

1. **首选：公有领域古典艺术**——绘画、版画、手抄本、文物照片。
2. **同样合法可用：自由授权的现代插画**，只要主题本身是公有领域的民间传说/神话（温迪戈、裂口女、卓柏卡布拉、多佛恶魔…）。Commons 上 CC BY / CC BY-SA 的用户创作插画就是给人合法复用的，标注作者+许可证即可。**不要因为"是现代人画的"就拒绝**——这条规则曾经被过度套用，导致二十多条能配图的条目被误判为"无图可配"。
3. **不能用：有版权的角色本身**——指有明确在世作者、角色本身受版权保护的现代创作（警笛头 Trevor Henderson 2018、瘦长鬼影 Eric Knudsen 2009）。哪怕 Commons 上有粉丝画作并声称 CC 授权，上传者也无权授权角色本身的版权。这类保持无图版。
- 尺寸门槛：<450px 宽拒绝；体积门槛分级——宽度 ≥900px 只要 >5KB 就收，否则要 >20KB
- 压缩：sips 压到最长边 1000px JPEG q72（`scripts/compress-images.mjs` 可全量重压并回填 width/height）
- 只有第 3 类（版权角色）才用无图版，其余一律尽力配图
- **配图后必须 Read 打开图片亲眼确认**：agent 靠文件名判断会配错（月神 Mama Killa 配成朗姆酒瓶、Punchao 配成同名小镇航拍都真实发生过）
- 图片存 `public/images/entries/<id>.jpg`，随仓库提交

### 配图踩坑

- **体积门槛误伤线稿**：一刀切「<20KB = logo」会把《古今图书集成》的木刻线稿全拒掉——线条稀疏的版画压缩后天然只有 10-18KB。已改成按尺寸分级。
- **山海经找图的正确姿势**：英文关键词搜不到，Commons 上《古今图书集成》有 2.1 万张图版，文件名形如 `File:Imperial Encyclopaedia - Animal Kingdom - pic176 - 九尾狐圖.png`。把整个 category 的文件名拉下来按汉字 grep，比关键词搜索有效得多。
- **查重复配图**：`md5 -q public/images/entries/*.jpg | sort | uniq -d`，同一张 Commons 图配给两个条目（如 xi-he 和 fu-sang-shi-ri）在图鉴里很显眼。
- **冷门异兽去汪绂《山海经存》PDF 里裁**：Commons 上单张的山海经图只覆盖几十个热门异兽，《古今图书集成》也漏一大半；但整本古籍扫描件（PDF）里几乎每只异兽都有带名款的木刻。`fetch-image.mjs fetch "File:...pdf" --entry <id> --page N --crop x,y,w,h`（crop 是页面比例 0–1）会渲染指定页再裁出单只。汪绂《山海经存》10 卷 PDF：文件名 `NLC403-312001066460-*`，卷 N 的文件 = 书里的「卷之 N−1」（卷二=南山经 … 卷九=大荒经，卷十=海内经）。每页跨两叶、原图仅 1997px，一只异兽裁出来只有 450–700px，别再往上放大。
- **两条已排除的线索**，别再翻：Commons 的 `Category:Kaiki Chōjū Zukan`（怪奇鸟兽图卷）只有 2 个文件，不是传说中的 76 幅；胡文焕《新刻山海经图》PDF 的目录 133 条里没有獓狠/虎蛟/峳峳/鱼妇/三青鸟/雷神/女魃/王亥。
- **山名条目宁可留空**：青丘之山、跂踵之山、崦嵫之山这类，古籍只画山里的异兽不画山。拿九尾狐去配「青丘之山」会误导（而且和 jiu-wei-hu 撞图），保持 null 用纹章占位。

## i18n

- 路由 `/[locale]/…`，locale ∈ {zh, en}；根路径按 navigator.language 客户端跳转，localStorage 记住选择
- UI 字符串在 `src/lib/i18n.ts` 的 dict；内容双语在数据文件里（zh/en 各自地道撰写，不是互译）
- 品牌字样「寰宇神話誌」用繁体是刊头设计（志书气质），正文一律简体

## 设计系统（别改乱）

- 夜墨 #101623 底 + 缃色 #e8dfc8 文字 + 古金 #c3a55e 刻线 + 朱印 #a43e2c 点睛；每个传统有自己的强调色（traditions.json.color）
- 字体：Cormorant（英文展示）/ EB Garamond（英文正文）/ Noto Serif SC（中文）/ IBM Plex Mono（编目号、坐标）
- 签名元素：首页雕版夜航图（D3 naturalEarth 投影 + 罗盘星标 + 菱形钉点）、博物馆编目号 № NNN
- UI 内禁 emoji 和装饰 Unicode 符号（☀✓✦ 之类），图形一律 SVG

## 创世时间线（/[locale]/cosmogony）

20 个体系各一条创世叙事时间线，schema 与写作契约见 `docs/COSMOGONY_GUIDE.md`。

关键设计是每个 stage 挂一个 `motif`（太初/最初的存在/天地分离/世界成形/人类诞生/洪水与劫/当世）——它是跨文明对照页的对齐轴。**改 motif 枚举要同时改** `src/lib/types.ts` 的 `MOTIFS`（顺序即对照页列序）、`src/lib/i18n.ts` 的 `motifLabels`、`scripts/validate.mjs` 的 `MOTIFS`、`docs/COSMOGONY_GUIDE.md` 的母题表。

**母题缺格是信息，不是 bug**：凯尔特的「太初」「天地分离」两格是空的，因为爱尔兰神话根本没有创世叙事（现存的《夺取爱尔兰记》是把爱尔兰史嫁接到圣经框架上的入侵序列）；希腊的「人类诞生」是空的，因为《神谱》没有正典的造人叙事。对照页把空格渲染成破折号，别去「补全」它们。

## 搜索

图鉴的 MiniSearch 用 CJK 感知分词（汉字/假名切单字 + bigram，拉丁词整词），搜索时 `combineWith: 'AND'`、只对 ≥4 字母的拉丁词开 fuzzy。**别改回 OR + 全局 fuzzy**：那样搜「九尾」会因为单字 `九`/`尾` 命中 58 条不相关条目（贝希摩斯排第一）。

## 已知注意点

- Next 16：`params` 是 Promise 必须 await；本机 node25 下 `next dev` 不 hydrate，测交互用 build+start
- `world-atlas` 的 topojson 由 `scripts/prebuild.mjs` 拷到 `public/map/`（pre{dev,build} 自动跑）
- Commons API 必须带 User-Agent，脚本里已设
- 地图上文明星标的标签防碰撞是手调的（`WorldMap.tsx` 的 LABEL_TWEAKS），新增体系锚点若在密集区记得调
