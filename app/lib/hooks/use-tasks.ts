"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Task } from "@/app/lib/task";
import { URL_CONSTANTS } from "@/app/lib/url-constants";

export const queryKeys = {
  tasks: (userEmail: string | undefined) => ["tasks", userEmail] as const,
};

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  const data = await res.json();
  if (!res.ok || data?.success === false) {
    const message = data?.error || "Request failed";
    throw new Error(message);
  }
  return data as T;
}

type GetTasksResponse = { success: true; tasks: Task[] };
type CreateTaskResponse = { success: true; task: Task };
type UpdateTaskResponse = { success: true; task: Task };

export function useTasks(userEmail: string | undefined) {
  return useQuery({
    queryKey: queryKeys.tasks(userEmail),
    queryFn: async () => {
      if (!userEmail) return [] as Task[];
      const url = `${URL_CONSTANTS.tasks}?userEmail=${encodeURIComponent(userEmail)}`;
      const data = await fetchJson<GetTasksResponse>(url);
      return data.tasks;
    },
    enabled: Boolean(userEmail),
  });
}

export function useCreateTask(userEmail: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (title: string) => {
      const data = await fetchJson<CreateTaskResponse>(URL_CONSTANTS.tasks, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, userEmail }),
      });
      return data.task;
    },
    onMutate: async (title: string) => {
      if (!userEmail) return;
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks(userEmail) });
      const previous = queryClient.getQueryData<Task[]>(queryKeys.tasks(userEmail));
      const optimistic: Task = {
        id: `optimistic-${Date.now()}`,
        title,
        done: false,
        userId: userEmail,
        createdAt: new Date(),
      };
      queryClient.setQueryData<Task[]>(queryKeys.tasks(userEmail), (old) => [
        optimistic,
        ...(old ?? []),
      ]);
      return { previous } as const;
    },
    onError: (_err, _vars, context) => {
      if (!userEmail) return;
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.tasks(userEmail), context.previous);
      }
    },
    onSettled: () => {
      if (!userEmail) return;
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks(userEmail) });
    },
  });
}

export function useToggleTask(userEmail: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { taskId: string; currentDone: boolean }) => {
      const { taskId, currentDone } = params;
      const data = await fetchJson<UpdateTaskResponse>(`${URL_CONSTANTS.tasks}/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: !currentDone }),
      });
      return data.task;
    },
    onMutate: async ({ taskId, currentDone }) => {
      if (!userEmail) return;
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks(userEmail) });
      const previous = queryClient.getQueryData<Task[]>(queryKeys.tasks(userEmail));
      queryClient.setQueryData<Task[]>(queryKeys.tasks(userEmail), (old) =>
        (old ?? []).map((t) => (t.id === taskId ? { ...t, done: !currentDone } : t))
      );
      return { previous } as const;
    },
    onError: (_err, _vars, context) => {
      if (!userEmail) return;
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.tasks(userEmail), context.previous);
      }
    },
    onSettled: () => {
      if (!userEmail) return;
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks(userEmail) });
    },
  });
}


