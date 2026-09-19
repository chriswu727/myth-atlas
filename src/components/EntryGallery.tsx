"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { EntryImage, EntryCoverImage, Locale } from "@/lib/types";

export default function EntryGallery({
  name,
  archive,
  cover,
  locale,
}: {
  name: string;
  archive?: EntryImage | null;
  cover?: EntryCoverImage | null;
  locale: Locale;
}) {
  const zh = locale === "zh";
  const [selected, setSelected] = useState(cover ? "cover" : "archive");
  const dialog = useRef<HTMLDialogElement>(null);
  const image = selected === "cover" ? cover : archive;
  if (!image) return null;
  const isOriginal =
    selected === "cover" || /original|原创/i.test(image.license);
  const label = isOriginal
    ? zh
      ? "当代演绎"
      : "Contemporary interpretation"
    : zh
      ? "馆藏与资料图"
      : "Archive image";
  return (
    <div className="reading-gallery">
      {cover && archive && (
        <div
          className="gallery-choices"
          aria-label={zh ? "选择图版" : "Choose a plate"}
        >
          <button
            aria-pressed={selected === "cover"}
            onClick={() => setSelected("cover")}
          >
            {zh ? "当代演绎" : "Interpretation"}
          </button>
          <button
            aria-pressed={selected === "archive"}
            onClick={() => setSelected("archive")}
          >
            {zh ? "原始图版" : "Archive plate"}
          </button>
        </div>
      )}
      <figure>
        <button
          className="gallery-open"
          onClick={() => dialog.current?.showModal()}
          aria-label={zh ? `放大${name}图版` : `Enlarge ${name} image`}
        >
          <Image
            src={image.file}
            alt={`${name} · ${label}`}
            width={image.width ?? 1000}
            height={image.height ?? 1250}
            preload
            sizes="(max-width: 760px) 90vw, 38vw"
          />
          <span>{zh ? "放大查看" : "Enlarge image"}</span>
        </button>
        <figcaption>
          <strong>{label}</strong>
          {isOriginal && (
            <p>
              {zh
                ? "据文本创作的视觉演绎，不作为古代形貌的证据。"
                : "A visual interpretation of the text, not evidence of an ancient likeness."}
            </p>
          )}
          <p>
            {image.artist}
            {image.artist ? " · " : ""}
            {image.license}
          </p>
          {"sourceUrl" in image && (
            <a href={image.sourceUrl} target="_blank" rel="noreferrer">
              {zh ? "查看图片来源" : "View image source"}
            </a>
          )}
        </figcaption>
      </figure>
      <dialog
        ref={dialog}
        className="plate-dialog"
        aria-label={zh ? `${name}图版` : `${name} image`}
      >
        <form method="dialog">
          <button autoFocus>{zh ? "关闭图版" : "Close image"}</button>
        </form>
        <Image
          src={image.file}
          alt={`${name} · ${label}`}
          width={image.width ?? 1000}
          height={image.height ?? 1250}
          sizes="90vw"
        />
        <p>
          {label} · {image.artist} · {image.license}
        </p>
      </dialog>
    </div>
  );
}
