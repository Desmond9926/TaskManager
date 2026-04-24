import { useEffect, useState } from "react";
import { AppHeader } from "../components/AppHeader";
import { EmptyState } from "../components/EmptyState";
import { ErrorBanner } from "../components/ErrorBanner";
import { InputPanel } from "../components/InputPanel";
import { TaskList } from "../components/TaskList";
import { loadAppConfig } from "../config/load-config";
import { extractTasks } from "../features/extraction/extract-tasks";
import type { ResolvedConfig } from "../types/config";
import { useTasks } from "../hooks/useTasks";

type ThemeMode = "light" | "dark";

const THEME_STORAGE_KEY = "taskmanager2.theme";

function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "dark";
  }

  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function App() {
  const [config, setConfig] = useState<ResolvedConfig | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"chat" | "tasks">("chat");
  const [isExtracting, setIsExtracting] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
  const tasks = useTasks();

  useEffect(() => {
    void loadAppConfig()
      .then((resolved) => {
        setConfig(resolved);
        setConfigError(null);
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : "Failed to load config.json";
        setConfig(null);
        setConfigError(message);
      });
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  async function handleExtract(input: { imageDataUrl?: string; text: string }) {
    if (!config) {
      setExtractError("配置尚未加载完成，暂时无法提取任务");
      return;
    }

    setIsExtracting(true);
    setExtractError(null);

    try {
      const drafts = await extractTasks(config, input);

      if (drafts.length === 0) {
        setExtractError("未从当前输入中提取到明确任务");
        return;
      }

      tasks.addTasks(drafts);
      setActiveView("tasks");
    } catch (error) {
      const message = error instanceof Error ? error.message : "任务提取失败";
      setExtractError(message);
    } finally {
      setIsExtracting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--app-bg)] text-[var(--text-primary)] transition-colors duration-200">
      <AppHeader
        activeView={activeView}
        config={config}
        onChangeView={setActiveView}
        onToggleTheme={() => setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"))}
        theme={theme}
      />

      <div className="mx-auto flex min-h-[calc(100vh-72px)] w-full max-w-6xl flex-col px-4 pb-8 pt-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-4xl">
          {configError ? <ErrorBanner message={configError} title="配置错误" /> : null}
          {extractError ? <ErrorBanner message={extractError} title="提取状态" /> : null}
        </div>

        {activeView === "chat" ? (
          <section className="flex flex-1 items-center justify-center py-10 sm:py-14">
            <InputPanel
              imageEnabled={Boolean(config?.provider.options.imageInputEnabled)}
              isExtracting={isExtracting}
              onExtract={handleExtract}
            />
          </section>
        ) : (
          <section className="mx-auto flex w-full max-w-4xl flex-1 flex-col py-6 sm:py-8">
            <div className="mb-8 border-b border-[var(--border-subtle)] pb-5 transition-colors duration-200">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">View Tasks</p>
              <h2 className="mt-2 text-2xl font-medium text-[var(--text-primary)]">任务列表</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
                这里展示模型提取后的任务名称和备注，保持轻量、可编辑、易浏览。
              </p>
            </div>

            {tasks.items.length === 0 ? (
              <EmptyState />
            ) : (
              <TaskList tasks={tasks.items} onDelete={tasks.deleteTask} />
            )}
          </section>
        )}
      </div>
    </main>
  );
}
