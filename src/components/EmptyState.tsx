export function EmptyState() {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[28px] border border-dashed border-[var(--border-subtle)] bg-[var(--surface-soft)] p-8 text-center transition-colors duration-200">
      <div className="max-w-md space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">No Tasks Yet</p>
        <h2 className="text-2xl font-medium text-[var(--text-primary)]">还没有任务</h2>
        <p className="text-sm leading-6 text-[var(--text-secondary)]">
          回到 Chat 页面输入文本或粘贴图片后，提取出的任务会在这里以极简列表方式展示。
        </p>
      </div>
    </div>
  );
}
