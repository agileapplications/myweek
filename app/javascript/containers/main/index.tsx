import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"
import { gql, useLazyQuery } from "@apollo/client"
import type { MouseEvent } from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import DarkModeButton from "../../components/DarkModeButton"
import {
  useCreateSubTaskMutation,
  useCreateTaskMutation,
  useCreateTaskListMutation,
  useDeleteTaskListMutation,
  useDeleteSubTaskMutation,
  useMainBoardQuery,
  useMoveTaskMutation,
  useSetTaskPlannedMutation,
  useToggleTaskArchivedMutation,
  useUpdateSubTaskMutation,
  useUpdateTaskMutation,
  type SubTask,
  type Task,
  type TaskList,
} from "../../graphql/generated"
import Modal from "../../components/Modal"
import BacklogView from "./components/BacklogView"
import TaskDetailModal from "./components/TaskDetailModal"
import { TaskCardPreview } from "./components/TaskCard"
import WeekView from "./components/WeekView"

type Day = { key: string; label: string }

const WEEK_DAYS: Day[] = [
  { key: "monday", label: "Mon" },
  { key: "tuesday", label: "Tue" },
  { key: "wednesday", label: "Wed" },
  { key: "thursday", label: "Thu" },
  { key: "friday", label: "Fri" },
  { key: "weekend", label: "Weekend" },
  { key: "next_week", label: "Next Week" },
]

const SEARCH_PAGE_SIZE = 10

type TaskSearchTask = {
  id: string
  taskListId: string
  title: string
  description?: string | null
  big: boolean
  planned?: string | null
  position: number
  archivedAt?: any | null
  subTasks: SubTask[]
  taskList: {
    id: string
    name: string
  }
}

type TaskSearchResult = {
  totalCount: number
  tasks: TaskSearchTask[]
}

type TaskSearchData = {
  searchTasks: TaskSearchResult
}

const SEARCH_TASKS_QUERY = gql`
  query SearchTasks($query: String!, $limit: Int!, $offset: Int!) {
    searchTasks(query: $query, limit: $limit, offset: $offset, includeArchived: true) {
      totalCount
      tasks {
        id
        taskListId
        title
        description
        big
        planned
        position
        archivedAt
        subTasks {
          id
          taskId
          title
          completed
        }
        taskList {
          id
          name
        }
      }
    }
  }
`

const MainBoard = () => {
  const { data, loading, error, refetch } = useMainBoardQuery()
  const [runSearch, { loading: searchLoading }] = useLazyQuery<TaskSearchData>(
    SEARCH_TASKS_QUERY,
    { fetchPolicy: "network-only" },
  )
  const [createTask] = useCreateTaskMutation()
  const [createTaskList] = useCreateTaskListMutation()
  const [updateTask] = useUpdateTaskMutation()
  const [moveTask] = useMoveTaskMutation()
  const [setTaskPlanned] = useSetTaskPlannedMutation()
  const [toggleTaskArchived] = useToggleTaskArchivedMutation()
  const [createSubTask] = useCreateSubTaskMutation()
  const [updateSubTask] = useUpdateSubTaskMutation()
  const [deleteSubTask] = useDeleteSubTaskMutation()
  const [deleteTaskList] = useDeleteTaskListMutation()

  const [board, setBoard] = useState<TaskList[]>([])
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; taskId: string } | null>(
    null,
  )
  const [modalOpen, setModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<TaskSearchTask[]>([])
  const [searchTotal, setSearchTotal] = useState(0)
  const [searchIndex, setSearchIndex] = useState(0)
  const [listModalOpen, setListModalOpen] = useState(false)
  const [listName, setListName] = useState("")
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [activeListId, setActiveListId] = useState<string | null>(null)
  const [modalSubTasks, setModalSubTasks] = useState<SubTask[]>([])
  const [activeDrag, setActiveDrag] = useState<{
    taskId: string
    variant: "backlog" | "planned"
  } | null>(null)

  const searchRef = useRef<HTMLDivElement>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const executeSearch = useCallback(
    async (query: string, limit: number, offset: number, append: boolean) => {
      const result = await runSearch({
        variables: { query, limit, offset },
      })
      const payload = result.data?.searchTasks
      if (!payload) {
        if (!append) {
          setSearchResults([])
          setSearchTotal(0)
        }
        return
      }
      setSearchTotal(payload.totalCount)
      setSearchResults((prev) => (append ? [...prev, ...payload.tasks] : payload.tasks))
    },
    [runSearch],
  )

  useEffect(() => {
    if (data?.taskLists) {
      setBoard(data.taskLists)
    }
  }, [data])

  useEffect(() => {
    if (!contextMenu) return
    const close = () => setContextMenu(null)
    document.addEventListener("click", close)
    document.addEventListener("contextmenu", close)
    return () => {
      document.removeEventListener("click", close)
      document.removeEventListener("contextmenu", close)
    }
  }, [contextMenu])

  useEffect(() => {
    if (!searchOpen) return
    const handleClick = (event: globalThis.MouseEvent) => {
      const target = event.target as Node | null
      if (target && searchRef.current?.contains(target)) return
      setSearchOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [searchOpen])

  useEffect(() => {
    setSearchIndex(0)
    if (!searchQuery.trim()) {
      setSearchOpen(false)
      setSearchResults([])
      setSearchTotal(0)
    }
  }, [searchQuery])

  useEffect(() => {
    const trimmed = searchQuery.trim()
    if (trimmed.length < 3) {
      setSearchResults([])
      setSearchTotal(0)
      return
    }

    const handle = window.setTimeout(() => {
      executeSearch(trimmed, SEARCH_PAGE_SIZE, 0, false)
    }, 300)

    return () => window.clearTimeout(handle)
  }, [executeSearch, searchQuery])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (modalOpen) return
      if (!hoveredTaskId) return
      if (event.key === "c") {
        event.preventDefault()
        handleArchive(hoveredTaskId)
      }
      if (event.key === "e") {
        event.preventDefault()
        openEdit(hoveredTaskId)
      }
    }

    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [hoveredTaskId, modalOpen])

  const taskLists = board.length ? board : data?.taskLists || []
  const backlogCount = taskLists.reduce((count, list) => count + list.tasks.length, 0)
  const trimmedQuery = searchQuery.trim()
  const canSearch = trimmedQuery.length >= 3
  const searchResultCount = searchResults.length
  const visibleResults = searchResults
  const hasMoreResults = searchResultCount < searchTotal
  const totalResults = searchTotal
  const navigableCount = visibleResults.length + (hasMoreResults ? 1 : 0)
  const listNameById = useMemo(() => {
    const entries = taskLists.map((list) => [list.id, list.name] as const)
    const searchEntries = searchResults.map(
      (task) => [task.taskListId, task.taskList.name] as const,
    )
    return new Map([...entries, ...searchEntries])
  }, [searchResults, taskLists])

  const refreshSearch = useCallback(async () => {
    if (!canSearch) return
    const limit = Math.max(SEARCH_PAGE_SIZE, searchResultCount)
    await executeSearch(trimmedQuery, limit, 0, false)
  }, [canSearch, executeSearch, searchResultCount, trimmedQuery])

  const handleLoadMoreResults = useCallback(async () => {
    if (!canSearch || searchLoading) return
    await executeSearch(trimmedQuery, SEARCH_PAGE_SIZE, searchResultCount, true)
  }, [canSearch, executeSearch, searchLoading, searchResultCount, trimmedQuery])

  useEffect(() => {
    if (navigableCount === 0) {
      setSearchIndex(0)
      return
    }
    setSearchIndex((prev) => Math.min(prev, navigableCount - 1))
  }, [navigableCount])

  const plannedByDay = useMemo(() => {
    const byDay: Record<string, Task[]> = Object.fromEntries(
      WEEK_DAYS.map((day) => [day.key, [] as Task[]]),
    )
    taskLists.forEach((list) => {
      list.tasks.forEach((task) => {
        if (task.planned && byDay[task.planned]) {
          byDay[task.planned].push(task)
        }
      })
    })
    return byDay
  }, [taskLists])

  const getTaskFromBoard = (taskId: string) =>
    taskLists.flatMap((list) => list.tasks).find((task) => task.id === taskId) || null

  const getTaskForModal = (taskId: string) =>
    getTaskFromBoard(taskId) || searchResults.find((task) => task.id === taskId) || null

  const getListName = (listId: string | null) =>
    listId ? listNameById.get(listId) || null : null

  const updateTaskInBoard = (taskId: string, updater: (task: Task) => Task) => {
    setBoard((prev) =>
      prev.map((list) => ({
        ...list,
        tasks: list.tasks.map((task) => (task.id === taskId ? updater(task) : task)),
      })),
    )
  }

  const removeTaskFromBoard = (taskId: string) => {
    setBoard((prev) =>
      prev.map((list) => ({ ...list, tasks: list.tasks.filter((t) => t.id !== taskId) })),
    )
  }

  const removeListFromBoard = (listId: string) => {
    setBoard((prev) => prev.filter((list) => list.id !== listId))
  }

  const moveTaskInBoard = (taskId: string, targetListId: string, targetIndex: number) => {
    setBoard((prev) => {
      let movingTask: Task | null = null
      const listsWithoutTask = prev.map((list) => {
        const tasks = list.tasks.filter((task) => {
          if (task.id === taskId) {
            movingTask = { ...task, taskListId: targetListId }
            return false
          }
          return true
        })
        return { ...list, tasks }
      })
      if (!movingTask) return prev

      return listsWithoutTask.map((list) => {
        if (list.id !== targetListId) return list
        const clamped = Math.max(0, Math.min(targetIndex, list.tasks.length))
        const tasks = [
          ...list.tasks.slice(0, clamped),
          { ...movingTask, position: clamped },
          ...list.tasks.slice(clamped),
        ]
        return { ...list, tasks: tasks.map((task, index) => ({ ...task, position: index })) }
      })
    })
  }

  const openNew = (listId: string) => {
    setActiveListId(listId)
    setActiveTaskId(null)
    setModalSubTasks([])
    setModalOpen(true)
  }

  const openEdit = (taskId: string) => {
    const task = getTaskForModal(taskId)
    if (!task) return
    setActiveTaskId(task.id)
    setActiveListId(task.taskListId)
    setModalSubTasks([...task.subTasks])
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setActiveTaskId(null)
    setActiveListId(null)
    setModalSubTasks([])
  }

  const closeListModal = () => {
    setListModalOpen(false)
    setListName("")
  }

  const handleSaveTask = async (payload: {
    title: string
    description: string | null
    big: boolean
  }) => {
    if (activeTaskId) {
      await updateTask({ variables: { id: activeTaskId, ...payload } })
    } else if (activeListId) {
      await createTask({ variables: { taskListId: activeListId, ...payload } })
    }
    await refetch()
    await refreshSearch()
    closeModal()
  }

  const handleArchive = async (taskId: string) => {
    removeTaskFromBoard(taskId)
    await toggleTaskArchived({ variables: { id: taskId } })
    await refetch()
    await refreshSearch()
  }

  const handleUnplan = async (taskId: string) => {
    updateTaskInBoard(taskId, (task) => ({ ...task, planned: null }))
    await setTaskPlanned({ variables: { id: taskId, planned: null } })
    await refetch()
    await refreshSearch()
  }

  const handleDeleteList = async (listId: string) => {
    const list = taskLists.find((item) => item.id === listId)
    const name = list?.name || "this list"
    const taskCount = list?.tasks.length ?? 0
    const confirmMessage = `Delete ${name} and ${taskCount === 1 ? "its 1 task" : `its ${taskCount} tasks`} (including all subtasks)? This cannot be undone.`
    if (!window.confirm(confirmMessage)) return

    removeListFromBoard(listId)
    if (activeListId === listId) {
      closeModal()
    }
    await deleteTaskList({ variables: { id: listId } })
    await refetch()
    await refreshSearch()
  }

  const openCreateList = () => {
    setListName("")
    setListModalOpen(true)
  }

  const handleCreateList = async () => {
    const trimmed = listName.trim()
    if (!trimmed) return
    await createTaskList({ variables: { name: trimmed } })
    await refetch()
    await refreshSearch()
    closeListModal()
  }

  const handleContextMenu = (taskId: string, event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setContextMenu({ x: event.clientX + 8, y: event.clientY + 8, taskId })
  }

  const handleDragStart = (event: DragStartEvent) => {
    const activeData = event.active.data.current as
      | { type: "backlog-item"; taskId: string }
      | { type: "planned-item"; taskId: string }
      | undefined

    if (!activeData) return
    setActiveDrag({
      taskId: activeData.taskId,
      variant: activeData.type === "planned-item" ? "planned" : "backlog",
    })
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) {
      setActiveDrag(null)
      return
    }

    const activeData = active.data.current as
      | { type: "backlog-item"; taskId: string; listId: string }
      | { type: "planned-item"; taskId: string }
      | undefined
    const overData = over.data.current as
      | { type: "backlog-item"; taskId: string; listId: string }
      | { type: "backlog-list"; listId: string }
      | { type: "week-column"; planned: string }
      | undefined

    if (!activeData || !overData) {
      setActiveDrag(null)
      return
    }

    try {
      if (activeData.type === "planned-item" && overData.type === "week-column") {
        updateTaskInBoard(activeData.taskId, (task) => ({ ...task, planned: overData.planned }))
        await setTaskPlanned({ variables: { id: activeData.taskId, planned: overData.planned } })
        await refetch()
        await refreshSearch()
        return
      }

      if (activeData.type !== "backlog-item") return

      if (overData.type === "week-column") {
        updateTaskInBoard(activeData.taskId, (task) => ({ ...task, planned: overData.planned }))
        await setTaskPlanned({ variables: { id: activeData.taskId, planned: overData.planned } })
        await refetch()
        await refreshSearch()
        return
      }

      const sourceListId = activeData.listId
      const targetListId = overData.type === "backlog-item" ? overData.listId : overData.listId
      const sourceList = taskLists.find((list) => list.id === sourceListId)
      const targetList = taskLists.find((list) => list.id === targetListId)
      if (!sourceList || !targetList) return

      const sourceIndex = sourceList.tasks.findIndex((task) => task.id === activeData.taskId)
      let targetIndex =
        overData.type === "backlog-item"
          ? targetList.tasks.findIndex((task) => task.id === overData.taskId)
          : targetList.tasks.length

      if (sourceListId === targetListId && sourceIndex === targetIndex) return
      if (sourceListId === targetListId) {
        const reordered = arrayMove(sourceList.tasks, sourceIndex, targetIndex)
        setBoard((prev) =>
          prev.map((list) =>
            list.id === sourceListId
              ? { ...list, tasks: reordered.map((task, index) => ({ ...task, position: index })) }
              : list,
          ),
        )
        await moveTask({
          variables: { id: activeData.taskId, taskListId: sourceListId, position: targetIndex },
        })
        await refetch()
        await refreshSearch()
        return
      }

      moveTaskInBoard(activeData.taskId, targetListId, targetIndex)
      await moveTask({
        variables: { id: activeData.taskId, taskListId: targetListId, position: targetIndex },
      })
      await refetch()
      await refreshSearch()
    } finally {
      setActiveDrag(null)
    }
  }

  const handleAddSubTask = async (title: string) => {
    if (!activeTaskId) return
    const result = await createSubTask({ variables: { taskId: activeTaskId, title } })
    if (!result.data?.createSubTask) return
    const newSubTask = result.data.createSubTask
    setModalSubTasks((prev) => [...prev, newSubTask])
    updateTaskInBoard(activeTaskId, (task) => ({
      ...task,
      subTasks: [...task.subTasks, newSubTask],
    }))
    await refetch()
    await refreshSearch()
  }

  const handleToggleSubTask = async (id: string, completed: boolean) => {
    setModalSubTasks((prev) => prev.map((sub) => (sub.id === id ? { ...sub, completed } : sub)))
    const result = await updateSubTask({ variables: { id, completed } })
    const updated = result.data?.updateSubTask
    if (!updated || !activeTaskId) return
    updateTaskInBoard(activeTaskId, (task) => ({
      ...task,
      subTasks: task.subTasks.map((sub) => (sub.id === id ? updated : sub)),
    }))
    await refetch()
    await refreshSearch()
  }

  const handleSubTaskTitleChange = (id: string, title: string) => {
    setModalSubTasks((prev) => prev.map((sub) => (sub.id === id ? { ...sub, title } : sub)))
  }

  const handleSubTaskTitleBlur = async (id: string, title: string) => {
    const trimmed = title.trim()
    if (!trimmed) return
    setModalSubTasks((prev) =>
      prev.map((sub) => (sub.id === id ? { ...sub, title: trimmed } : sub)),
    )
    const result = await updateSubTask({ variables: { id, title: trimmed } })
    const updated = result.data?.updateSubTask
    if (!updated || !activeTaskId) return
    updateTaskInBoard(activeTaskId, (task) => ({
      ...task,
      subTasks: task.subTasks.map((sub) => (sub.id === id ? updated : sub)),
    }))
    await refetch()
    await refreshSearch()
  }

  const handleDeleteSubTask = async (id: string) => {
    if (!activeTaskId) return
    setModalSubTasks((prev) => prev.filter((sub) => sub.id !== id))
    await deleteSubTask({ variables: { id } })
    updateTaskInBoard(activeTaskId, (task) => ({
      ...task,
      subTasks: task.subTasks.filter((sub) => sub.id !== id),
    }))
    await refetch()
    await refreshSearch()
  }

  const activeTask = activeTaskId ? getTaskForModal(activeTaskId) : null
  const activeDragTask = activeDrag ? getTaskFromBoard(activeDrag.taskId) : null
  const activeListName = getListName(activeListId)

  if (loading && taskLists.length === 0) {
    return <p className="p-6 text-slate-500">Loading...</p>
  }

  if (error) {
    return <p className="p-6 text-rose-500">Failed to load tasks.</p>
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col">
      <div className="w-full px-6 py-10 flex-1 flex flex-col">
        <header className="mb-6 flex items-center gap-4">
          <h1 className="text-3xl font-semibold tracking-tight shrink-0">This Week</h1>
          <div className="relative flex-1 max-w-xl mx-auto" ref={searchRef}>
            <input
              type="search"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-800"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value)
                setSearchOpen(true)
              }}
              onFocus={() => {
                if (searchQuery.trim()) {
                  setSearchOpen(true)
                }
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setSearchOpen(false)
                  return
                }
                if (event.key === "ArrowDown") {
                  event.preventDefault()
                  if (!searchOpen) setSearchOpen(true)
                  if (navigableCount === 0) return
                  setSearchIndex((prev) => (prev + 1) % navigableCount)
                  return
                }
                if (event.key === "ArrowUp") {
                  event.preventDefault()
                  if (!searchOpen) setSearchOpen(true)
                  if (navigableCount === 0) return
                  setSearchIndex((prev) => (prev - 1 + navigableCount) % navigableCount)
                  return
                }
                if (event.key === "Enter") {
                  if (navigableCount === 0) return
                  event.preventDefault()
                  if (hasMoreResults && searchIndex === visibleResults.length) {
                    handleLoadMoreResults()
                    return
                  }
                  const selected = visibleResults[searchIndex]
                  if (selected) {
                    openEdit(selected.id)
                    setSearchOpen(false)
                  }
                }
              }}
            />
            {searchOpen && trimmedQuery ? (
              <div className="absolute left-0 right-0 z-40 mt-2 rounded-2xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <span>Results</span>
                  <span>{canSearch ? totalResults : 0}</span>
                </div>
                <div className="max-h-72 overflow-y-auto py-2">
                  {!canSearch ? (
                    <div className="px-4 py-3 text-sm text-slate-500">
                      Type at least 3 characters to search.
                    </div>
                  ) : searchLoading && visibleResults.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-slate-500">Searching...</div>
                  ) : visibleResults.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-slate-500">No matches found.</div>
                  ) : (
                    <div className="space-y-1 px-2">
                      {visibleResults.map((task, index) => {
                        const isActive = index === searchIndex
                        return (
                          <button
                            key={task.id}
                            type="button"
                            className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                              isActive
                                ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                                : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
                            }`}
                            onMouseEnter={() => setSearchIndex(index)}
                            onClick={() => {
                              openEdit(task.id)
                              setSearchOpen(false)
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
                            <div className="mt-1 text-xs text-slate-500">
                              {task.taskList.name}
                            </div>
                          </button>
                        )
                      })}
                      {hasMoreResults ? (
                        <button
                          type="button"
                          className={`w-full rounded-lg px-3 py-2 text-left text-sm font-semibold ${
                            searchIndex === visibleResults.length
                              ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                              : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
                          }`}
                          onMouseEnter={() => setSearchIndex(visibleResults.length)}
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
          <div className="shrink-0">
            <DarkModeButton />
          </div>
        </header>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveDrag(null)}
        >
          <WeekView
            days={WEEK_DAYS}
            plannedByDay={plannedByDay}
            onTaskClick={openEdit}
            onTaskContextMenu={handleContextMenu}
            onTaskHover={setHoveredTaskId}
          />

          <BacklogView
            lists={taskLists}
            backlogCount={backlogCount}
            onTaskClick={openEdit}
            onTaskContextMenu={handleContextMenu}
            onTaskHover={setHoveredTaskId}
            onCreateTask={openNew}
            onDeleteList={handleDeleteList}
            onCreateList={openCreateList}
          />
          <DragOverlay>
            {activeDrag && activeDragTask ? (
              <TaskCardPreview task={activeDragTask} variant={activeDrag.variant} />
            ) : null}
          </DragOverlay>
        </DndContext>

        {contextMenu ? (
          <div
            className="fixed z-50 w-40 rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg dark:border-slate-700 dark:bg-slate-900"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              type="button"
              className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              onClick={() => {
                openEdit(contextMenu.taskId)
                setContextMenu(null)
              }}
            >
              Edit
            </button>
            {getTask(contextMenu.taskId)?.planned ? (
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                onClick={() => {
                  handleUnplan(contextMenu.taskId)
                  setContextMenu(null)
                }}
              >
                Unplan
              </button>
            ) : null}
            <button
              type="button"
              className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              onClick={() => {
                handleArchive(contextMenu.taskId)
                setContextMenu(null)
              }}
            >
              Archive
            </button>
          </div>
        ) : null}

        <TaskDetailModal
          open={modalOpen}
          task={activeTask}
          listName={activeListName}
          subTasks={modalSubTasks}
          onClose={closeModal}
          onSave={handleSaveTask}
          onAddSubTask={handleAddSubTask}
          onToggleSubTask={handleToggleSubTask}
          onSubTaskTitleChange={handleSubTaskTitleChange}
          onSubTaskTitleBlur={handleSubTaskTitleBlur}
          onDeleteSubTask={handleDeleteSubTask}
        />

        <Modal open={listModalOpen} onClose={closeListModal}>
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                New Task List
              </h2>
              <p className="mt-1 text-sm text-slate-500">Give your list a short name.</p>
            </div>
            <form
              className="space-y-4"
              onSubmit={async (event) => {
                event.preventDefault()
                await handleCreateList()
              }}
            >
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Title
                <input
                  type="text"
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-800"
                  value={listName}
                  onChange={(event) => setListName(event.target.value)}
                  autoFocus
                />
              </label>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  onClick={closeListModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                  disabled={!listName.trim()}
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </Modal>
      </div>
    </main>
  )
}

export default MainBoard
