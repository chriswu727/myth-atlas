"use client";

import { useState } from "react";
import type { Locale } from "@/lib/types";

export default function DeepTimeScale({ locale }: { locale: Locale }) {
  const [windowYears, setWindowYears] = useState(200_000_000);
  const zh = locale === "zh";
  const percent = (300_000 / windowYears) * 100;
  return (
    <section
      className="deep-scale"
      aria-label={zh ? "地质与人类时间尺度" : "Geological and human timescales"}
    >
      <div className="deep-scale-controls">
        <h2>{zh ? "把时间尺拉近" : "Zoom into the timescale"}</h2>
        <div>
          {[200_000_000, 1_000_000].map((years) => (
            <button
              key={years}
              aria-pressed={windowYears === years}
              onClick={() => setWindowYears(years)}
            >
              {years === 200_000_000
                ? zh
                  ? "过去两亿年"
                  : "Last 200 million years"
                : zh
                  ? "过去一百万年"
                  : "Last million years"}
            </button>
          ))}
        </div>
      </div>
      <p>
        {zh
          ? "若把整条横线看作所选时段，智人存在的约三十万年，只占右侧这一段。"
          : "If the full line represents the selected interval, the roughly 300,000 years of Homo sapiens occupy the segment at the right."}
      </p>
      <div
        className="deep-scale-bar"
        role="img"
        aria-label={
          zh
            ? `智人存在的时段约占这条时间尺的 ${percent}%`
            : `Homo sapiens occupies approximately ${percent}% of this timescale`
        }
      >
        <div style={{ width: `${percent}%` }} />
      </div>
      <div className="deep-scale-labels">
        <span>
          {windowYears === 200_000_000
            ? zh
              ? "约两亿年前"
              : "~200 million years ago"
            : zh
              ? "约一百万年前"
              : "~1 million years ago"}
        </span>
        <span>{zh ? "今天" : "Today"}</span>
      </div>
      <p className="deep-scale-result" role="status">
        {zh
          ? `智人存在的时段约占 ${percent}%`
          : `Homo sapiens: approximately ${percent}% of this interval`}
      </p>
      <small>
        {zh
          ? "约数示意。物种出现的时间，不能用作某则神话的诞生年代。"
          : "Approximate scale. The appearance of a species does not date the origin of a particular myth."}
      </small>
    </section>
  );
}
