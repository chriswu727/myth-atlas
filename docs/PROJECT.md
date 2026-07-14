# 寰宇神话志 Myth Atlas — 项目全貌

世界神话志异图鉴：收录全球神话体系、志怪典籍（山海经）、都市传说（日本怪谈/美洲怪谈）、失落之地的中英双语图鉴 + 交互式世界地图。

- 技术栈：Next.js 16 (App Router, SSG) + Tailwind v4 + D3 (d3-geo/zoom/selection + topojson) + MiniSearch
- 仓库：chriswu727/myth-atlas · 本地 `~/project/myth-atlas`
- 部署：Vercel

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
- 下载后 <20KB 判为 logo/图标直接拒绝（老规矩）；<450px 宽拒绝；sips 压到最长边 1400px JPEG q82
- 现代创作角色（警笛头/瘦长鬼影/后室）不配版权图，用纹章占位
- 图片存 `public/images/entries/<id>.jpg`，随仓库提交

## i18n

- 路由 `/[locale]/…`，locale ∈ {zh, en}；根路径按 navigator.language 客户端跳转，localStorage 记住选择
- UI 字符串在 `src/lib/i18n.ts` 的 dict；内容双语在数据文件里（zh/en 各自地道撰写，不是互译）
- 品牌字样「寰宇神話誌」用繁体是刊头设计（志书气质），正文一律简体

## 设计系统（别改乱）

- 夜墨 #101623 底 + 缃色 #e8dfc8 文字 + 古金 #c3a55e 刻线 + 朱印 #a43e2c 点睛；每个传统有自己的强调色（traditions.json.color）
- 字体：Cormorant（英文展示）/ EB Garamond（英文正文）/ Noto Serif SC（中文）/ IBM Plex Mono（编目号、坐标）
- 签名元素：首页雕版夜航图（D3 naturalEarth 投影 + 罗盘星标 + 菱形钉点）、博物馆编目号 № NNN
- UI 内禁 emoji 和装饰 Unicode 符号（☀✓✦ 之类），图形一律 SVG

## 已知注意点

- Next 16：`params` 是 Promise 必须 await；本机 node25 下 `next dev` 不 hydrate，测交互用 build+start
- `world-atlas` 的 topojson 由 `scripts/prebuild.mjs` 拷到 `public/map/`（pre{dev,build} 自动跑）
- Commons API 必须带 User-Agent，脚本里已设
- 地图上文明星标的标签防碰撞是手调的（`WorldMap.tsx` 的 LABEL_TWEAKS），新增体系锚点若在密集区记得调
