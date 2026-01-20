import type { KeyboardEvent, RefObject } from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import {
  useSearchTasksLazyQuery,
  type SearchTasksQuery,
} from "../../../../../graphql/generated"

export type TaskSearchTask = SearchTasksQuery["searchTasks"]["tasks"][number]

type UseTaskSearchOptions = {
  onOpenTask: (taskId: string) => void
  onResultsChange?: (tasks: TaskSearchTask[]) => void
}

type UseTaskSearchResult = {
  query: string
  open: boolean
  trimmedQuery: string
  canSearch: boolean
  results: TaskSearchTask[]
  total: number
  index: number
  hasMoreResults: boolean
  searchLoading: boolean
  containerRef: RefObject<HTMLDivElement>
  setIndex: (index: number) => void
  handleInputChange: (value: string) => void
  handleInputFocus: () => void
  handleKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
  handleLoadMoreResults: () => Promise<void>
  selectTask: (taskId: string) => void
  refresh: () => Promise<void>
}

const SEARCH_PAGE_SIZE = 10
const MIN_QUERY_LENGTH = 3
const SEARCH_DEBOUNCE_MS = 300

const useTaskSearch = ({
  onOpenTask,
  onResultsChange,
}: UseTaskSearchOptions): UseTaskSearchResult => {
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

  const handleLoadMoreResults = useCallback(async () => {
    if (!canSearch || searchLoading) return
    await executeSearch(trimmedQuery, SEARCH_PAGE_SIZE, results.length, true)
  }, [canSearch, executeSearch, searchLoading, results.length, trimmedQuery])

  const selectTask = useCallback(
    (taskId: string) => {
      onOpenTask(taskId)
      setOpen(false)
    },
    [onOpenTask],
  )

  const handleInputChange = useCallback((value: string) => {
    setQuery(value)
    setOpen(true)
  }, [])

  const handleInputFocus = useCallback(() => {
    if (trimmedQuery) {
      setOpen(true)
    }
  }, [trimmedQuery])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
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
          selectTask(selected.id)
        }
      }
    },
    [
      handleLoadMoreResults,
      hasMoreResults,
      index,
      navigableCount,
      open,
      results,
      selectTask,
    ],
  )

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

  return {
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
  }
}

export default useTaskSearch
