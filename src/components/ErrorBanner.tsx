type ErrorBannerProps = {
  title: string;
  message: string;
};

export function ErrorBanner({ title, message }: ErrorBannerProps) {
  return (
    <div className="mb-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--text-secondary)] transition-colors duration-200">
      <p className="font-medium text-[var(--text-primary)]">{title}</p>
      <p className="mt-1 text-[var(--text-secondary)]">{message}</p>
    </div>
  );
}
