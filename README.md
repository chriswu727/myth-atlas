# 寰宇神话志 · Myth Atlas

世界神话志异图鉴：收录全球神话体系、《山海经》、日本怪谈、美洲怪谈与失落之地的中英双语图鉴，配公有领域古典艺术，以一幅可交互的雕版夜航图作为入口。

A bilingual (中文/English) catalog of the world's myths, bestiaries, urban legends, and lost lands — browsed through an engraved night-atlas world map or a museum-style index, illustrated with public-domain classical art.

## 开发

```bash
npm install
npm run dev        # 开发（本机 node25 测交互请用 build+start）
npm run build && npm start
npm run validate   # 校验全部条目数据
```

## 加内容

一个条目 = 一个 JSON 文件，放进 `data/entries/<tradition>/`，schema 与文风契约见 `docs/CONTENT_GUIDE.md`，写完跑 `npm run validate`。新体系在 `data/traditions.json` 注册一行即可，页面与地图自动生成。

配图管线：`node scripts/fetch-image.mjs search|info|fetch`（Wikimedia Commons，只收自由许可，自动压缩与回填出处）。

项目全貌与架构原则见 `docs/PROJECT.md`。
