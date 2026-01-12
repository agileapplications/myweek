import type { ChangeEvent, FocusEvent, KeyboardEvent } from "react"
import type { SubTask } from "../../../graphql/generated"

type SubTasksProps = {
  subTasks: SubTask[]
  disabled: boolean
  onToggle: (id: string, completed: boolean) => void
  onTitleChange: (id: string, title: string) => void
  onTitleBlur: (id: string, title: string) => void
  onDelete: (id: string) => void
}

const SubTasks = ({
  subTasks,
  disabled,
  onToggle,
  onTitleChange,
  onTitleBlur,
  onDelete,
}: SubTasksProps) => {
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault()
      event.currentTarget.blur()
    }
  }

  return (
    <div className="mt-2 space-y-2">
      {subTasks.map((subTask) => (
        <div key={subTask.id} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={subTask.completed}
            disabled={disabled}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              onToggle(subTask.id, event.currentTarget.checked)
            }
            className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400 dark:border-slate-600 dark:bg-slate-950"
          />
          <input
            type="text"
            value={subTask.title}
            disabled={disabled}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              onTitleChange(subTask.id, event.currentTarget.value)
            }
            onBlur={(event: FocusEvent<HTMLInputElement>) =>
              onTitleBlur(subTask.id, event.currentTarget.value)
            }
            onKeyDown={handleKeyDown}
            className="w-full rounded-md border border-transparent px-2 py-1 text-sm text-slate-800 hover:border-slate-200 focus:border-slate-300 focus:outline-none dark:text-slate-100 dark:hover:border-slate-700"
          />
          <button
            type="button"
            disabled={disabled}
            onClick={() => onDelete(subTask.id)}
            className="rounded-md p-1 text-slate-400 hover:text-rose-500 dark:text-slate-500"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path d="M6 6h8l-1 10H7L6 6zm2-3h4l1 2H7l1-2z" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}

export default SubTasks
