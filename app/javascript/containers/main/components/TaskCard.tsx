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

type TaskCardPreviewProps = Pick<TaskCardProps, "task" | "variant">

type BaseTaskCardProps = TaskCardProps & {
  setNodeRef: (element: HTMLElement | null) => void
  listeners?: Record<string, unknown>
  attributes?: Record<string, unknown>
  isDragging: boolean
  transform: { x: number; y: number; scaleX?: number; scaleY?: number } | null
  transition?: string
}

const BaseTaskCard = ({
  task,
  variant,
  onClick,
  onContextMenu,
  onMouseEnter,
  onMouseLeave,
  setNodeRef,
  listeners,
  attributes,
  isDragging,
  transform,
  transition,
}: BaseTaskCardProps) => {
  const isBacklog = variant === "backlog"
  const normalizedTransform = transform ? { ...transform, scaleX: 1, scaleY: 1 } : null

  const handleClick = () => {
    if (isDragging) return
    onClick?.()
  }

  const handleContextMenu = (event: MouseEvent) => {
    event.preventDefault()
    onContextMenu?.(event)
  }

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
        transform: CSS.Transform.toString(normalizedTransform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        touchAction: "none",
      }}
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      {...attributes}
      {...listeners}
      onContextMenu={handleContextMenu}
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

const SortableTaskCard = (props: TaskCardProps) => {
  const sortable = useSortable({
    id: `backlog-${props.task.id}`,
    data: { type: "backlog-item", taskId: props.task.id, listId: props.task.taskListId },
  })

  return (
    <BaseTaskCard
      {...props}
      setNodeRef={sortable.setNodeRef}
      listeners={sortable.listeners}
      attributes={sortable.attributes}
      isDragging={sortable.isDragging}
      transform={sortable.transform}
      transition={sortable.transition}
    />
  )
}

const DraggableTaskCard = (props: TaskCardProps) => {
  const draggable = useDraggable({
    id: `planned-${props.task.id}`,
    data: { type: "planned-item", taskId: props.task.id },
  })

  return (
    <BaseTaskCard
      {...props}
      setNodeRef={draggable.setNodeRef}
      listeners={draggable.listeners}
      attributes={draggable.attributes}
      isDragging={draggable.isDragging}
      transform={draggable.transform}
      transition={undefined}
    />
  )
}

const TaskCard = (props: TaskCardProps) =>
  props.variant === "backlog" ? <SortableTaskCard {...props} /> : <DraggableTaskCard {...props} />

export default TaskCard

export const TaskCardPreview = ({ task, variant }: TaskCardPreviewProps) => (
  <BaseTaskCard
    task={task}
    variant={variant}
    setNodeRef={() => {}}
    isDragging={false}
    transform={null}
  />
)
