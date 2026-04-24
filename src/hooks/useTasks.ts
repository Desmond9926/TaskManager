import { useEffect, useMemo, useState } from "react";
import { loadTasks, saveTasks } from "../features/tasks/storage";
import type { TaskCard, TaskDraft } from "../features/tasks/task-types";

export function useTasks() {
  const [items, setItems] = useState<TaskCard[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    void loadTasks().then((loadedTasks) => {
      setItems(loadedTasks);
      setHasLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!hasLoaded) {
      return;
    }

    void saveTasks(items);
  }, [hasLoaded, items]);

  return useMemo(
    () => ({
      items,
      addTasks: (drafts: TaskDraft[]) => {
        const timestamp = new Date().toISOString();

        setItems((current) => [
          ...drafts.map((draft) => ({
            id: crypto.randomUUID(),
            title: draft.title,
            note: draft.note,
            createdAt: timestamp,
            updatedAt: timestamp,
          })),
          ...current,
        ]);
      },
      deleteTask: (id: string) => {
        setItems((current) => current.filter((task) => task.id !== id));
      },
      updateTask: (id: string, patch: Pick<TaskCard, "title" | "note">) => {
        setItems((current) =>
          current.map((task) =>
            task.id === id
              ? {
                  ...task,
                  ...patch,
                  updatedAt: new Date().toISOString(),
                }
              : task,
          ),
        );
      },
    }),
    [items],
  );
}
