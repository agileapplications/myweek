import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react"
import {
  useSearchTasksLazyQuery,
  type SearchTasksQuery,
} from "../../../graphql/generated"

export type TaskSearchTask = SearchTasksQuery["searchTasks"]["tasks"][number]

export type TaskSearchHandle = {
  refresh: () => Promise<void>
}

type TaskSearchProps = {
  onOpenTask: (taskId: string) => void
  onResultsChange?: (tasks: TaskSearchTask[]) => void
}

const SEARCH_PAGE_SIZE = 10
const MIN_QUERY_LENGTH = 3
const SEARCH_DEBOUNCE_MS = 300

const TaskSearch = forwardRef<TaskSearchHandle, TaskSearchProps>(
  ({ onOpenTask, onResultsChange }, ref) => {
    const [runSearch, { loading: searchLoading }] = useSearchTasksLazyQuery({
      fetchPolicy: "network-only",
    })
    const [query, setQuery] = useState("")
    const [open, setOpen] = useState(false)
    const [results, setResults] = useState<TaskSearchTask[]>([])
    const [total, setTotal] = useState(0)
    const [index, setIndex] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)

    const trimmedQuery = query.trim()
    const canSearch = trimmedQuery.length >= MIN_QUERY_LENGTH
    const hasMoreResults = results.length < total
    const navigableCount = results.length + (hasMoreResults ? 1 : 0)

    const executeSearch = useCallback(
      async (nextQuery: string, limit: number, offset: number, append: boolean) => {
        const result = await runSearch({
          variables: { query: nextQuery, limit, offset },
        })
        const payload = result.data?.searchTasks
        if (!payload) {
          if (!append) {
            setResults([])
            setTotal(0)
          }
          return
        }
        setTotal(payload.totalCount)
        setResults((prev) => (append ? [...prev, ...payload.tasks] : payload.tasks))
      },
      [runSearch],
    )

    const refresh = useCallback(async () => {
      if (!canSearch) return
      const limit = Math.max(SEARCH_PAGE_SIZE, results.length)
      await executeSearch(trimmedQuery, limit, 0, false)
    }, [canSearch, executeSearch, results.length, trimmedQuery])

    useImperativeHandle(
      ref,
      () => ({
        refresh,
      }),
      [refresh],
    )

    const handleLoadMoreResults = useCallback(async () => {
      if (!canSearch || searchLoading) return
      await executeSearch(trimmedQuery, SEARCH_PAGE_SIZE, results.length, true)
    }, [canSearch, executeSearch, searchLoading, results.length, trimmedQuery])

    useEffect(() => {
      if (!open) return
      const handleClick = (event: globalThis.MouseEvent) => {
        const target = event.target as Node | null
        if (target && containerRef.current?.contains(target)) return
        setOpen(false)
      }
      document.addEventListener("mousedown", handleClick)
      return () => document.removeEventListener("mousedown", handleClick)
    }, [open])

    useEffect(() => {
      setIndex(0)
      if (!trimmedQuery) {
        setOpen(false)
        setResults([])
        setTotal(0)
      }
    }, [trimmedQuery])

    useEffect(() => {
      if (trimmedQuery.length < MIN_QUERY_LENGTH) {
        setResults([])
        setTotal(0)
        return
      }

      const handle = window.setTimeout(() => {
        executeSearch(trimmedQuery, SEARCH_PAGE_SIZE, 0, false)
      }, SEARCH_DEBOUNCE_MS)

      return () => window.clearTimeout(handle)
    }, [executeSearch, trimmedQuery])

    useEffect(() => {
      if (navigableCount === 0) {
        setIndex(0)
        return
      }
      setIndex((prev) => Math.min(prev, navigableCount - 1))
    }, [navigableCount])

    useEffect(() => {
      onResultsChange?.(results)
    }, [onResultsChange, results])

    return (
      <div className="relative flex-1 max-w-xl mx-auto" ref={containerRef}>
        <input
          type="search"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-800"
          placeholder="Search tasks..."
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setOpen(true)
          }}
          onFocus={() => {
            if (trimmedQuery) {
              setOpen(true)
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false)
              return
            }
            if (event.key === "ArrowDown") {
              event.preventDefault()
              if (!open) setOpen(true)
              if (navigableCount === 0) return
              setIndex((prev) => (prev + 1) % navigableCount)
              return
            }
            if (event.key === "ArrowUp") {
              event.preventDefault()
              if (!open) setOpen(true)
              if (navigableCount === 0) return
              setIndex((prev) => (prev - 1 + navigableCount) % navigableCount)
              return
            }
            if (event.key === "Enter") {
              if (navigableCount === 0) return
              event.preventDefault()
              if (hasMoreResults && index === results.length) {
                handleLoadMoreResults()
                return
              }
              const selected = results[index]
              if (selected) {
                onOpenTask(selected.id)
                setOpen(false)
              }
            }
          }}
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
                          onOpenTask(task.id)
                          setOpen(false)
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
