import { useDraggable } from "@dnd-kit/core"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { MouseEvent } from "react"
import type { Task } from "../../../graphql/generated"

type TaskCardProps = {
  task: Task
  variant: "backlog" | "planned"
  onClick?: () => void
  onContextMenu?: (event: MouseEvent) => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

const TaskCard = ({
  task,
  variant,
  onClick,
  onContextMenu,
  onMouseEnter,
  onMouseLeave,
}: TaskCardProps) => {
  const draggableId = `${variant}-${task.id}`
  const isBacklog = variant === "backlog"
  const sortable = useSortable({
    id: draggableId,
    disabled: !isBacklog,
    data: isBacklog ? { type: "backlog-item", taskId: task.id, listId: task.taskListId } : undefined,
  })
  const draggable = useDraggable({
    id: draggableId,
    data: !isBacklog ? { type: "planned-item", taskId: task.id } : undefined,
    disabled: isBacklog,
  })

  const isDragging = isBacklog ? sortable.isDragging : draggable.isDragging
  const transform = isBacklog ? sortable.transform : draggable.transform
  const transition = isBacklog ? sortable.transition : undefined
  const setNodeRef = isBacklog ? sortable.setNodeRef : draggable.setNodeRef
  const listeners = isBacklog ? sortable.listeners : draggable.listeners
  const attributes = isBacklog ? sortable.attributes : draggable.attributes

  const totalSubTasks = task.subTasks.length
  const doneSubTasks = task.subTasks.filter((subtask) => subtask.completed).length
  const progress = totalSubTasks === 0 ? 0 : Math.round((doneSubTasks / totalSubTasks) * 100)
  const ringClass =
    totalSubTasks === 0
      ? "hidden"
      : doneSubTasks === totalSubTasks
        ? "subtask-ring--complete"
        : "subtask-ring--progress"

  const plannedAccent =
    isBacklog && task.planned
      ? "!bg-emerald-50 !border-emerald-200 hover:!border-emerald-300 dark:!bg-emerald-950/60 dark:!border-emerald-700/60 dark:hover:!border-emerald-500"
      : ""
  const baseClasses =
    "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm cursor-grab active:cursor-grabbing transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-500"
  const bigClass = task.big ? "task-card--big" : ""

  return (
    <div
      ref={setNodeRef}
      className={`${baseClasses} ${bigClass} ${plannedAccent}`}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      onClick={onClick}
      onContextMenu={onContextMenu}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={`task-title ${task.big ? "task-title--big" : ""}`.trim()}>
          {task.title}
        </span>
        <div className="flex items-center gap-2">
          <span
            className={`subtask-ring ${ringClass}`}
            style={{ ["--progress" as string]: `${progress}%` }}
          ></span>
          {task.description ? (
            <span
              className={
                isBacklog && task.planned
                  ? "text-emerald-400"
                  : "text-slate-400 dark:text-slate-500"
              }
              aria-label="Has description"
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                <path d="M6 4h8a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H9.414L6 17.414V4z" />
              </svg>
            </span>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default TaskCard
