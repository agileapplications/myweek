import { forwardRef, useImperativeHandle } from "react"
import useTaskSearch, { type TaskSearchTask } from "./helpers/useTaskSearch"

export type { TaskSearchTask }

export type TaskSearchHandle = {
  refresh: () => Promise<void>
}

type TaskSearchProps = {
  onOpenTask: (taskId: string) => void
  onResultsChange?: (tasks: TaskSearchTask[]) => void
}

const TaskSearch = forwardRef<TaskSearchHandle, TaskSearchProps>(
  ({ onOpenTask, onResultsChange }, ref) => {
    const {
      query,
      open,
      trimmedQuery,
      canSearch,
      results,
      total,
      index,
      hasMoreResults,
      searchLoading,
      containerRef,
      setIndex,
      handleInputChange,
      handleInputFocus,
      handleKeyDown,
      handleLoadMoreResults,
      selectTask,
      refresh,
    } = useTaskSearch({ onOpenTask, onResultsChange })

    useImperativeHandle(ref, () => ({ refresh }), [refresh])

    return (
      <div className="relative flex-1 max-w-xl mx-auto" ref={containerRef}>
        <input
          type="search"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-800"
          placeholder="Search tasks..."
          value={query}
          onChange={(event) => {
            handleInputChange(event.target.value)
          }}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
        />
        {open && trimmedQuery ? (
          <div className="absolute left-0 right-0 z-40 mt-2 rounded-2xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <span>Results</span>
              <span>{canSearch ? total : 0}</span>
            </div>
            <div className="max-h-72 overflow-y-auto py-2">
              {!canSearch ? (
                <div className="px-4 py-3 text-sm text-slate-500">
                  Type at least 3 characters to search.
                </div>
              ) : searchLoading && results.length === 0 ? (
                <div className="px-4 py-3 text-sm text-slate-500">Searching...</div>
              ) : results.length === 0 ? (
                <div className="px-4 py-3 text-sm text-slate-500">No matches found.</div>
              ) : (
                <div className="space-y-1 px-2">
                  {results.map((task, taskIndex) => {
                    const isActive = taskIndex === index
                    return (
                      <button
                        key={task.id}
                        type="button"
                        className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                          isActive
                            ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                            : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
                        }`}
                        onMouseEnter={() => setIndex(taskIndex)}
                        onClick={() => {
                          selectTask(task.id)
                        }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium">{task.title}</span>
                          <span
                            className={`text-xs font-semibold ${
                              task.archivedAt ? "text-rose-500" : "text-emerald-600"
                            }`}
                          >
                            {task.archivedAt ? "Archived" : "Active"}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-slate-500">{task.taskList.name}</div>
                      </button>
                    )
                  })}
                  {hasMoreResults ? (
                    <button
                      type="button"
                      className={`w-full rounded-lg px-3 py-2 text-left text-sm font-semibold ${
                        index === results.length
                          ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                          : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
                      }`}
                      onMouseEnter={() => setIndex(results.length)}
                      onClick={handleLoadMoreResults}
                    >
                      {searchLoading ? "Loading..." : "Load more"}
                    </button>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    )
  },
)

TaskSearch.displayName = "TaskSearch"

export default TaskSearch
