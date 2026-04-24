import { useState } from "react";
import type { TaskCard as TaskCardModel } from "../features/tasks/task-types";

type TaskCardProps = {
  task: TaskCardModel;
  onDelete: (id: string) => void;
};

export function TaskCard({ task, onDelete }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="px-5 py-4 sm:px-6">
      <button
        aria-expanded={expanded}
        className="flex w-full items-center justify-between gap-4 rounded-2xl px-1 py-2 text-left transition-colors duration-200 hover:bg-[var(--surface-soft)]"
        onClick={() => setExpanded((current) => !current)}
        type="button"
      >
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Task</p>
          <p className="mt-2 truncate text-base font-medium text-[var(--text-primary)]">{task.title}</p>
        </div>
        <span className="shrink-0 text-sm text-[var(--text-muted)]">{expanded ? "-" : "+"}</span>
      </button>

      {expanded ? (
        <div className="mt-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-4 transition-colors duration-200">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Note</p>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[var(--text-secondary)]">
            {task.note || "暂无备注"}
          </p>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--border-faint)] pt-3">
            <p className="text-xs text-[var(--text-placeholder)]">Updated {new Date(task.updatedAt).toLocaleString()}</p>
          <button
            className="rounded-full border border-[var(--border-subtle)] px-3 py-1.5 text-xs text-[var(--text-secondary)] transition-colors duration-200 hover:bg-[var(--surface-strong)] hover:text-[var(--text-primary)]"
            onClick={() => onDelete(task.id)}
            type="button"
          >
            删除
          </button>
          </div>
        </div>
      ) : null}
    </article>
  );
}
