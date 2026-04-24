import type { ResolvedConfig } from "../types/config";

type AppHeaderProps = {
  activeView: "chat" | "tasks";
  config: ResolvedConfig | null;
  onChangeView: (view: "chat" | "tasks") => void;
  onToggleTheme: () => void;
  theme: "light" | "dark";
};

export function AppHeader({
  activeView,
  config,
  onChangeView,
  onToggleTheme,
  theme,
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-[var(--border-subtle)] bg-[var(--header-bg)]/90 backdrop-blur-xl transition-colors duration-200">
      <div className="mx-auto flex h-[72px] w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-base font-medium tracking-[-0.02em] text-[var(--text-primary)]">Task Manager</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">Local task extraction desktop app</p>
        </div>

        <div className="flex items-center gap-3">
          <nav
            aria-label="Primary"
            className="flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-1 transition-colors duration-200"
          >
          <NavButton active={activeView === "chat"} label="Chat" onClick={() => onChangeView("chat")} />
          <NavButton
            active={activeView === "tasks"}
            label="View Tasks"
            onClick={() => onChangeView("tasks")}
          />
          </nav>

          <button
            className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--text-secondary)] transition-colors duration-200 hover:bg-[var(--surface-strong)] hover:text-[var(--text-primary)]"
            onClick={onToggleTheme}
            type="button"
          >
            {theme === "dark" ? "Light" : "Dark"}
          </button>
        </div>

        <div className="hidden text-right md:block">
          <p className="text-xs text-[var(--text-muted)]">{config?.provider.name ?? "Provider unavailable"}</p>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">{config?.model.name ?? "Model unavailable"}</p>
        </div>
      </div>
    </header>
  );
}

type NavButtonProps = {
  active: boolean;
  label: string;
  onClick: () => void;
};

function NavButton({ active, label, onClick }: NavButtonProps) {
  return (
    <button
      className={`rounded-full px-4 py-2 text-sm transition ${
        active
          ? "bg-[var(--inverse-bg)] text-[var(--inverse-text)]"
          : "text-[var(--text-secondary)] hover:bg-[var(--surface-strong)] hover:text-[var(--text-primary)]"
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}
