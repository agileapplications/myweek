import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import type { MouseEvent } from "react"
import type { TaskList } from "../../../graphql/generated"
import TaskCard from "./TaskCard"

type BacklogColumnProps = {
  list: TaskList
  onTaskClick: (taskId: string) => void
  onTaskContextMenu: (taskId: string, event: MouseEvent) => void
  onTaskHover: (taskId: string | null) => void
  onCreateTask: (listId: string) => void
  onDeleteList: (listId: string) => void
}

const BacklogColumn = ({
  list,
  onTaskClick,
  onTaskContextMenu,
  onTaskHover,
  onCreateTask,
  onDeleteList,
}: BacklogColumnProps) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `backlog-list-${list.id}`,
    data: { type: "backlog-list", listId: list.id },
  })

  const placeholderClasses = `rounded-lg border border-dashed border-slate-300 bg-white/70 px-3 py-2 text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-500 ${
    isOver ? "" : "hidden"
  }`

  const items = list.tasks.map((task) => `backlog-${task.id}`)

  return (
    <div
      ref={setNodeRef}
      className="w-56 flex-shrink-0 rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-col dark:border-slate-800 dark:bg-slate-950"
      data-task-list-id={list.id}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{list.name}</h3>
          <p className="mt-1 text-xs text-slate-500">{`${list.tasks.length} ${
            list.tasks.length === 1 ? "task" : "tasks"
          }`}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-md border border-rose-200 bg-white px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-800/70 dark:bg-slate-900 dark:text-rose-300 dark:hover:bg-rose-950/40"
            aria-label={`Delete ${list.name}`}
            title="Delete list"
            onClick={() => onDeleteList(list.id)}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              className="h-4 w-4"
              fill="currentColor"
            >
              <path d="M7 3h6l1 2h3v2H3V5h3l1-2zm1 6h2v6H8V9zm4 0h-2v6h2V9zm-6-1h8l-.5 9H6.5L6 8z" />
            </svg>
          </button>
          <button
            type="button"
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            data-task-list-id={list.id}
            onClick={() => onCreateTask(list.id)}
          >
            +
          </button>
        </div>
      </div>
      <div className="mt-3 flex-1 space-y-2 overflow-y-auto">
        <div className={placeholderClasses}>Drop task here</div>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {list.tasks.map((task) => (
            <TaskCard
              key={`backlog-${task.id}`}
              task={task}
              variant="backlog"
              onClick={() => onTaskClick(task.id)}
              onContextMenu={(event) => onTaskContextMenu(task.id, event)}
              onMouseEnter={() => onTaskHover(task.id)}
              onMouseLeave={() => onTaskHover(null)}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  )
}

export default BacklogColumn
