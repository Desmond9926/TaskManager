import type { TaskCard as TaskCardModel } from "../features/tasks/task-types";
import { TaskCard } from "./TaskCard";

type TaskListProps = {
  tasks: TaskCardModel[];
  onDelete: (id: string) => void;
};

export function TaskList({ tasks, onDelete }: TaskListProps) {
  return (
    <div className="divide-y divide-[var(--border-faint)] rounded-[28px] border border-[var(--border-subtle)] bg-[var(--surface)] transition-colors duration-200">
      {tasks.map((task) => (
        <TaskCard key={task.id} onDelete={onDelete} task={task} />
      ))}
    </div>
  );
}
