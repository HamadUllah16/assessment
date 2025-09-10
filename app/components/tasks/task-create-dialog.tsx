import { Dialog, TextField, DialogContent, DialogTitle, DialogActions, Button } from '@mui/material';
import React from 'react'

type TaskCreateDialogProps = {
    createTask: () => void;
    isDialogOpen: boolean;
    setIsDialogOpen: (isDialogOpen: boolean) => void;
    loading: boolean;
    newTaskTitle: string;
    setNewTaskTitle: (newTaskTitle: string) => void;
}

function TaskCreateDialog({ createTask, isDialogOpen, setIsDialogOpen, loading, newTaskTitle, setNewTaskTitle }: TaskCreateDialogProps) {
  return (
      <Dialog open={isDialogOpen} onClose={() => !loading && setIsDialogOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>Create Task</DialogTitle>
          <DialogContent>
              <TextField
                  autoFocus
                  margin="dense"
                  label="Task title"
                  type="text"
                  fullWidth
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                      if (e.key === 'Enter' && newTaskTitle.trim() && !loading) {
                          e.preventDefault();
                          createTask();
                      }
                  }}
                  disabled={loading}
              />
          </DialogContent>
          <DialogActions>
              <Button onClick={() => setIsDialogOpen(false)} disabled={loading}>Cancel</Button>
              <Button onClick={createTask} variant="contained" disabled={!newTaskTitle.trim() || loading}>
                  {loading ? 'Creating…' : 'Create'}
              </Button>
          </DialogActions>
      </Dialog>
  )
}

export default TaskCreateDialog