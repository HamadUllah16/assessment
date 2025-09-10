"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Task } from "@/app/lib/task";
import { URL_CONSTANTS } from "@/app/lib/url-constants";

export const queryKeys = {
  tasks: (userEmail: string | undefined) => ["tasks", userEmail] as const,
  tasksPaginated: (userEmail: string | undefined, page: number, pageSize: number) => ["tasks-paginated", userEmail, page, pageSize] as const,
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

type GetTasksResponse = { success: true; tasks: Task[]; total?: number };
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

export function useTasksPaginated(userEmail: string | undefined, page: number, pageSize = 10) {
  return useQuery<GetTasksResponse>({
    queryKey: queryKeys.tasksPaginated(userEmail, page, pageSize),
    enabled: Boolean(userEmail),
    queryFn: async () => {
      if (!userEmail) return { success: true, tasks: [] as Task[], total: 0 };
      const url = `${URL_CONSTANTS.tasks}?userEmail=${encodeURIComponent(userEmail)}&limit=${pageSize}&page=${page}`;
      const data = await fetchJson<GetTasksResponse>(url);
      return data;
    },
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
      queryClient.invalidateQueries({ queryKey: queryKeys.tasksPaginated(userEmail, 0, 10) });
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
      const newDone = !currentDone;
      // Cancel related queries
      await Promise.all([
        queryClient.cancelQueries({ queryKey: queryKeys.tasks(userEmail) }),
        queryClient.cancelQueries({ queryKey: ["tasks-paginated", userEmail] }),
      ]);

      // Snapshot previous states
      const previousFlat = queryClient.getQueryData<Task[]>(queryKeys.tasks(userEmail));
      const previousPaginated = queryClient.getQueriesData({ queryKey: ["tasks-paginated", userEmail] });

      // Optimistically update flat list
      queryClient.setQueryData<Task[]>(queryKeys.tasks(userEmail), (old) =>
        (old ?? []).map((t) => (t.id === taskId ? { ...t, done: newDone } as Task : t))
      );

      // Optimistically update all paginated pages for this user
      previousPaginated.forEach(([key]) => {
        queryClient.setQueryData<GetTasksResponse>(key as readonly unknown[], (old) => {
          if (!old) return old as unknown as GetTasksResponse;
          return {
            ...(old as GetTasksResponse),
            tasks: ((old as GetTasksResponse).tasks ?? []).map((t) => (t.id === taskId ? { ...t, done: newDone } as Task : t)),
          } as GetTasksResponse;
        });
      });

      return { previousFlat, previousPaginated } as const;
    },
    onError: (_err, _vars, context) => {
      if (!userEmail) return;
      // Restore flat list
      if (context?.previousFlat) {
        queryClient.setQueryData(queryKeys.tasks(userEmail), context.previousFlat);
      }
      // Restore each paginated page
      if (context?.previousPaginated) {
        context.previousPaginated.forEach(([key, data]) => {
          queryClient.setQueryData(key as readonly unknown[], data);
        });
      }
    },
    onSettled: () => {
      if (!userEmail) return;
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks(userEmail) });
      queryClient.invalidateQueries({ queryKey: ["tasks-paginated", userEmail] });
    },
  });
}


