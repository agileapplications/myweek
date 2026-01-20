import type { MouseEvent } from "react"
import BacklogColumn from "./BacklogColumn"
import type { TaskList } from "../../../graphql/generated"

type BacklogViewProps = {
  lists: TaskList[]
  backlogCount: number
  onTaskClick: (taskId: string) => void
  onTaskContextMenu: (taskId: string, event: MouseEvent) => void
  onTaskHover: (taskId: string | null) => void
  onCreateTask: (listId: string) => void
  onDeleteList: (listId: string) => void
  onCreateList: () => void
}

const BacklogView = ({
  lists,
  backlogCount,
  onTaskClick,
  onTaskContextMenu,
  onTaskHover,
  onCreateTask,
  onDeleteList,
  onCreateList,
}: BacklogViewProps) => {
  return (
    <details className="group mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <summary className="flex cursor-pointer items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Backlog
          </span>
          <button
            type="button"
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            aria-label="Add task list"
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              onCreateList()
            }}
          >
            +
          </button>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {backlogCount}
        </span>
      </summary>
      <div className="px-5 pb-5">
        <div className="h-0 overflow-hidden transition-all duration-300 group-open:h-[40vh]">
          <div className="h-full overflow-x-auto">
            <div className="flex h-full min-w-max gap-4 pr-4">
              {lists.map((list) => (
                <BacklogColumn
                  key={list.id}
                  list={list}
                  onTaskClick={onTaskClick}
                  onTaskContextMenu={onTaskContextMenu}
                  onTaskHover={onTaskHover}
                  onCreateTask={onCreateTask}
                  onDeleteList={onDeleteList}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </details>
  )
}

export default BacklogView
