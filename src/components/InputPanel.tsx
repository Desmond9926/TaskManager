import { useState } from "react";
import { useImagePaste } from "../hooks/useImagePaste";

type InputPanelProps = {
  imageEnabled: boolean;
  isExtracting: boolean;
  onExtract: (input: { text: string; imageDataUrl?: string }) => void;
};

export function InputPanel({ imageEnabled, isExtracting, onExtract }: InputPanelProps) {
  const [text, setText] = useState("");
  const { imageDataUrl, clearImage, pasteHint } = useImagePaste({ enabled: imageEnabled });

  return (
    <section className="mx-auto w-full max-w-4xl">
      <div className="mb-8 text-center sm:mb-10">
        <h1 className="text-3xl font-medium tracking-[-0.03em] text-[var(--text-primary)] sm:text-4xl">
          Paste text or an image to extract tasks
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)] sm:text-base">
          输入一段自然语言，或直接粘贴截图。任务会被整理成只有任务名称和备注的轻量卡片。
        </p>
      </div>

      <div className="rounded-[28px] border border-[var(--border-subtle)] bg-[var(--surface)] p-3 shadow-[0_0_0_1px_var(--shadow-outline)] transition-colors duration-200">
        {imageDataUrl ? (
          <div className="mb-3 rounded-[22px] border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-3 transition-colors duration-200">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Pasted image</p>
                <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">图片已附加到当前输入，提取时会一并发送。</p>
              </div>
              <button
                className="rounded-full border border-[var(--border-subtle)] px-3 py-1.5 text-xs text-[var(--text-secondary)] transition-colors duration-200 hover:bg-[var(--surface-strong)] hover:text-[var(--text-primary)]"
                onClick={clearImage}
                type="button"
              >
                Remove
              </button>
            </div>

            <img alt="Pasted preview" className="mt-3 max-h-52 rounded-2xl object-contain" src={imageDataUrl} />
          </div>
        ) : null}

        <label className="block">
          <span className="sr-only">任务输入框</span>
          <textarea
            className="min-h-48 w-full resize-none rounded-[22px] border border-transparent bg-transparent px-4 py-4 text-[15px] leading-7 text-[var(--text-primary)] outline-none placeholder:text-[var(--text-placeholder)] focus:border-[var(--border-subtle)]"
            onChange={(event) => setText(event.target.value)}
            placeholder="输入待办内容，或先粘贴图片再补充说明。例如：下周一前整理客户反馈，补充报价明细，并和设计确认首页 Banner 用图。"
            value={text}
          />
        </label>

        <div className="flex flex-col gap-3 border-t border-[var(--border-faint)] px-2 pt-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Input Mode</p>
            <p className="text-sm leading-6 text-[var(--text-secondary)]">{pasteHint}</p>
          </div>

          <button
            className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--inverse-bg)] px-5 text-sm font-medium text-[var(--inverse-text)] transition-colors duration-200 hover:opacity-92 disabled:cursor-not-allowed disabled:bg-[var(--surface-strong)] disabled:text-[var(--text-placeholder)]"
            disabled={(text.trim().length === 0 && !imageDataUrl) || isExtracting}
            onClick={() => onExtract({ text, imageDataUrl: imageDataUrl ?? undefined })}
            type="button"
          >
            {isExtracting ? "Extracting..." : "Extract Tasks"}
          </button>
        </div>
      </div>
    </section>
  );
}
