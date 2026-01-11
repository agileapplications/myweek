import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  dragStart(event) {
    const taskId = event.currentTarget.dataset.taskId
    event.dataTransfer.setData("text/plain", taskId)
    event.dataTransfer.effectAllowed = "move"
  }

  allowDrop(event) {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }

  dragEnter(event) {
    const listElement = event.currentTarget.closest("[data-task-list-id]")
    if (!listElement) return
    const placeholder = listElement.querySelector("[data-tasks-board-target='placeholder']")
    if (placeholder) {
      placeholder.classList.remove("hidden")
    }
  }

  dragLeave(event) {
    const listElement = event.currentTarget.closest("[data-task-list-id]")
    if (!listElement) return
    if (listElement.contains(event.relatedTarget)) return
    const placeholder = listElement.querySelector("[data-tasks-board-target='placeholder']")
    if (placeholder) {
      placeholder.classList.add("hidden")
    }
  }

  drop(event) {
    event.preventDefault()
    const taskId = event.dataTransfer.getData("text/plain")
    if (!taskId) return

    const listElement = event.currentTarget.closest("[data-task-list-id]")
    if (!listElement) return
    const placeholder = listElement.querySelector("[data-tasks-board-target='placeholder']")
    if (placeholder) {
      placeholder.classList.add("hidden")
    }

    const taskElement = this.element.querySelector(`[data-task-id="${taskId}"]`)
    if (!taskElement) return

    const previousListId = taskElement.dataset.taskListId
    const targetListId = listElement.dataset.taskListId
    if (previousListId === targetListId) return

    const previousContainer = taskElement.parentElement
    const targetContainer = listElement.querySelector("[data-tasks-board-target='cards']")
    if (!targetContainer) return

    targetContainer.appendChild(taskElement)
    taskElement.dataset.taskListId = targetListId

    this.updateCounts(previousListId, targetListId, 1)
    this.updateTask(taskId, targetListId, taskElement, previousContainer, previousListId)
  }

  updateCounts(previousListId, targetListId, delta) {
    const previousCount = this.findCountElement(previousListId)
    const targetCount = this.findCountElement(targetListId)

    if (previousCount) {
      this.setCount(previousCount, this.readCount(previousCount) - delta)
    }

    if (targetCount) {
      this.setCount(targetCount, this.readCount(targetCount) + delta)
    }
  }

  findCountElement(listId) {
    return this.element.querySelector(`[data-task-list-id="${listId}"] [data-tasks-board-target="count"]`)
  }

  readCount(element) {
    return Number(element.dataset.taskCount || 0)
  }

  setCount(element, count) {
    const safeCount = Math.max(0, count)
    element.dataset.taskCount = safeCount
    element.textContent = `${safeCount} ${safeCount === 1 ? "task" : "tasks"}`
  }

  updateTask(taskId, targetListId, taskElement, previousContainer, previousListId) {
    const token = document.querySelector("meta[name='csrf-token']").content

    fetch(`/tasks/${taskId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-CSRF-Token": token
      },
      body: JSON.stringify({ task: { task_list_id: targetListId } })
    }).then((response) => {
      if (!response.ok) throw new Error("Failed to update task list")
    }).catch(() => {
      if (previousContainer) {
        previousContainer.appendChild(taskElement)
      }
      taskElement.dataset.taskListId = previousListId
      this.updateCounts(targetListId, previousListId, 1)
    })
  }
}
