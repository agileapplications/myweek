import type { FormEvent } from "react"
import { useEffect, useMemo, useState } from "react"
import Modal from "../../../components/Modal"
import type { SubTask, Task } from "../../../graphql/generated"
import SubTasks from "./SubTasks"

type TaskDetailModalProps = {
  open: boolean
  task: Task | null
  listName: string | null
  subTasks: SubTask[]
  onClose: () => void
  onSave: (payload: { title: string; description: string | null; big: boolean }) => void
  onAddSubTask: (title: string) => void
  onToggleSubTask: (id: string, completed: boolean) => void
  onSubTaskTitleChange: (id: string, title: string) => void
  onSubTaskTitleBlur: (id: string, title: string) => void
  onDeleteSubTask: (id: string) => void
}

const TaskDetailModal = ({
  open,
  task,
  listName,
  subTasks,
  onClose,
  onSave,
  onAddSubTask,
  onToggleSubTask,
  onSubTaskTitleChange,
  onSubTaskTitleBlur,
  onDeleteSubTask,
}: TaskDetailModalProps) => {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [big, setBig] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newSubTaskTitle, setNewSubTaskTitle] = useState("")

  const isEditing = !!task
  const modalTitle = useMemo(() => (isEditing ? "Edit Task" : "New Task"), [isEditing])

  useEffect(() => {
    if (!open) return
    setTitle(task?.title || "")
    setDescription(task?.description || "")
    setBig(task?.big || false)
    setError(null)
    setNewSubTaskTitle("")
  }, [open, task])

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) {
      setError("Title is required.")
      return
    }
    onSave({ title: trimmed, description: description.trim() || null, big })
  }

  const handleAddSubTask = () => {
    if (!isEditing) return
    const trimmed = newSubTaskTitle.trim()
    if (!trimmed) return
    onAddSubTask(trimmed)
    setNewSubTaskTitle("")
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{modalTitle}</h2>
          {listName ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">List: {listName}</p>
          ) : null}
        </div>
        <button type="button" className="text-slate-400 hover:text-slate-600" onClick={onClose}>
          <span className="sr-only">Close</span>✕
        </button>
      </div>
      <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="task-title">
            Title
          </label>
          <input
            id="task-title"
            name="title"
            required
            value={title}
            onChange={(event) => setTitle(event.currentTarget.value)}
            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
        </div>
        <div>
          <label
            className="text-sm font-medium text-slate-700 dark:text-slate-200"
            htmlFor="task-description"
          >
            Description (optional)
          </label>
          <textarea
            id="task-description"
            name="description"
            rows={4}
            value={description}
            onChange={(event) => setDescription(event.currentTarget.value)}
            className="mt-2 w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          ></textarea>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Subtasks</label>
            <button
              type="button"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              onClick={handleAddSubTask}
            >
              Add
            </button>
          </div>
          <SubTasks
            subTasks={subTasks}
            disabled={!isEditing}
            onToggle={onToggleSubTask}
            onTitleChange={onSubTaskTitleChange}
            onTitleBlur={onSubTaskTitleBlur}
            onDelete={onDeleteSubTask}
          />
          <div className="mt-2 flex items-center gap-2">
            <input
              type="text"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              placeholder="New subtask"
              disabled={!isEditing}
              value={newSubTaskTitle}
              onChange={(event) => setNewSubTaskTitle(event.currentTarget.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault()
                  handleAddSubTask()
                }
              }}
            />
          </div>
          {!isEditing && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Save the task before adding subtasks.
            </p>
          )}
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
          <input
            type="checkbox"
            checked={big}
            onChange={(event) => setBig(event.currentTarget.checked)}
            className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400 dark:border-slate-600 dark:bg-slate-950"
          />
          Big task (double height)
        </label>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
          >
            Save
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default TaskDetailModal
