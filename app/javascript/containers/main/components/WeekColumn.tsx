import { useDroppable } from "@dnd-kit/core"
import type { MouseEvent } from "react"
import type { Task } from "../../../graphql/generated"
import TaskCard from "./TaskCard"

type WeekColumnProps = {
  plannedKey: string
  label: string
  tasks: Task[]
  onTaskClick: (taskId: string) => void
  onTaskContextMenu: (taskId: string, event: MouseEvent) => void
  onTaskHover: (taskId: string | null) => void
}

const WeekColumn = ({
  plannedKey,
  label,
  tasks,
  onTaskClick,
  onTaskContextMenu,
  onTaskHover,
}: WeekColumnProps) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `week-${plannedKey}`,
    data: { type: "week-column", planned: plannedKey },
  })

  const placeholderClasses = `rounded-lg border border-dashed border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-500 dark:border-emerald-700/60 dark:bg-emerald-950/50 dark:text-emerald-300 ${
    isOver ? "" : "hidden"
  }`

  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col ${
        plannedKey === "weekend" ? "bg-slate-100 text-slate-700 dark:bg-slate-900/60" : "bg-white"
      } ${plannedKey === "next_week" ? "bg-slate-100/80 text-slate-700 dark:bg-slate-900/30" : ""}`}
      data-planned={plannedKey}
    >
      <h2
        className={`text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300 ${
          plannedKey === "weekend" ? "text-slate-500" : ""
        } ${plannedKey === "next_week" ? "text-slate-400" : ""}`}
      >
        {label}
      </h2>
      <div className="mt-3 flex-1 space-y-2 overflow-y-auto">
        <div className={placeholderClasses}>Drop task here</div>
        {tasks.map((task) => (
          <TaskCard
            key={`planned-${task.id}`}
            task={task}
            variant="planned"
            onClick={() => onTaskClick(task.id)}
            onContextMenu={(event) => onTaskContextMenu(task.id, event)}
            onMouseEnter={() => onTaskHover(task.id)}
            onMouseLeave={() => onTaskHover(null)}
          />
        ))}
      </div>
    </div>
  )
}

export default WeekColumn
