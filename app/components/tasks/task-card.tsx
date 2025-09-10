import React from 'react'
import { ListItem, Checkbox, ListItemText, Typography, Chip, ListItemSecondaryAction } from '@mui/material'
import { Task } from '@/app/lib/task';

type TaskCardProps = {
    task: Task;
    toggleTask: (taskId: string, currentDone: boolean) => Promise<void>;
    loading: boolean;
}

function timeAgo(input: string | Date): string {
    const date = typeof input === 'string' ? new Date(input) : input;
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

    const divisions: { amount: number; name: Intl.RelativeTimeFormatUnit }[] = [
        { amount: 60, name: 'second' },
        { amount: 60, name: 'minute' },
        { amount: 24, name: 'hour' },
        { amount: 7, name: 'day' },
        { amount: 4.34524, name: 'week' },
        { amount: 12, name: 'month' },
        { amount: Number.POSITIVE_INFINITY, name: 'year' }
    ];

    let duration = seconds;
    for (let i = 0; i < divisions.length; i++) {
        const division = divisions[i];
        if (Math.abs(duration) < division.amount) {
            return rtf.format(-Math.round(duration), division.name);
        }
        duration = duration / division.amount;
    }
    return rtf.format(0, 'second');
}

function TaskCard({ task, toggleTask, loading }: TaskCardProps) {

  return (
      <ListItem
          sx={{
              backgroundColor: task.done ? "#f8f9fa" : "white",
              opacity: task.done ? 0.7 : 1,
              borderRadius: 1,
              border: "1px solid #e0e0e0",
          }}
      >
          <Checkbox
              checked={task.done}
              onChange={() => toggleTask(task.id, task.done)}
              disabled={loading}
              sx={{ mr: 2 }}
          />

          <ListItemText
              primary={
                  <Typography
                      variant="body1"
                      sx={{
                          textDecoration: task.done ? "line-through" : "none",
                          color: task.done ? "text.secondary" : "text.primary",
                          fontWeight: 500
                      }}
                  >
                      {task.title}
                  </Typography>
              }
              secondary={
                  <Typography variant="caption" color="text.secondary">
                      {timeAgo(task.createdAt)}
                  </Typography>
              }
          />
          <ListItemSecondaryAction>
              <Chip
                  label={task.done ? "Done" : "Pending"}
                  color={task.done ? "success" : "warning"}
                  size="small"
              />
          </ListItemSecondaryAction>
      </ListItem>
  )
}

export default TaskCard