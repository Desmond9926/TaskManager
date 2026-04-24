import { useEffect, useState } from "react";

type UseImagePasteOptions = {
  enabled: boolean;
};

export function useImagePaste({ enabled }: UseImagePasteOptions) {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setImageDataUrl(null);
      return;
    }

    const handlePaste = (event: ClipboardEvent) => {
      const file = Array.from(event.clipboardData?.items ?? [])
        .find((item) => item.type.startsWith("image/"))
        ?.getAsFile();

      if (!file) {
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setImageDataUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [enabled]);

  return {
    imageDataUrl,
    clearImage: () => setImageDataUrl(null),
    pasteHint: enabled
      ? "按 Ctrl/Cmd + V 粘贴截图。图片会先在本地预览，下一步再接入模型提取。"
      : "当前 provider 配置未开启 imageInputEnabled，已禁用图片粘贴。",
  };
}
