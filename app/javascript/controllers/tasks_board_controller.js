import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [
    "modal",
    "modalTitle",
    "titleInput",
    "descriptionInput",
    "bigCheckbox",
    "error"
  ]

  dragStart(event) {
    const taskId = event.currentTarget.dataset.taskId
    event.dataTransfer.setData("text/plain", taskId)
    event.dataTransfer.effectAllowed = "move"
    this.draggedElement = event.currentTarget
    this.draggedNextSibling = event.currentTarget.nextElementSibling
    this.draggedParent = event.currentTarget.parentElement
    this.dropHandled = false

    setTimeout(() => {
      if (this.draggedElement) {
        this.draggedElement.classList.add("hidden")
      }
    }, 0)
  }

  dragEnd() {
    this.clearPlaceholders()
    if (this.draggedElement) {
      this.draggedElement.classList.remove("hidden")
      if (!this.dropHandled && this.draggedParent && this.draggedElement.parentElement !== this.draggedParent) {
        if (this.draggedNextSibling && this.draggedNextSibling.parentElement === this.draggedParent) {
          this.draggedParent.insertBefore(this.draggedElement, this.draggedNextSibling)
        } else {
          this.draggedParent.appendChild(this.draggedElement)
        }
      }
    }
    this.draggedElement = null
    this.draggedNextSibling = null
    this.draggedParent = null
    this.dropHandled = false
  }

  hoverCard(event) {
    this.hoveredCard = event.currentTarget
  }

  leaveCard(event) {
    if (this.hoveredCard === event.currentTarget) {
      this.hoveredCard = null
    }
  }

  keyDown(event) {
    if (this.hasModalTarget && !this.modalTarget.classList.contains("hidden")) {
      if (event.key === "Escape") {
        event.preventDefault()
        this.closeModal()
      }
      return
    }
    if (!this.hoveredCard) return
    if (this.draggedElement) return

    if (event.key === "c") {
      event.preventDefault()
      this.archiveHoveredCard()
      return
    }

    if (event.key === "e") {
      event.preventDefault()
      this.openEdit()
    }
  }

  openNew(event) {
    const listId = event.currentTarget.dataset.taskListId ||
      event.currentTarget.closest("[data-task-list-id]")?.dataset.taskListId
    this.activeListId = listId
    this.editingTaskId = null
    this.activeCard = null
    this.showModal("New Task")
  }

  openEdit() {
    if (!this.hoveredCard) return
    const card = this.hoveredCard
    this.editingTaskId = card.dataset.taskId
    this.activeListId = card.dataset.taskListId
    this.activeCard = card
    this.showModal(
      "Edit Task",
      card.dataset.taskTitle,
      card.dataset.taskDescription,
      card.dataset.taskBig === "true"
    )
  }

  showModal(title, taskTitle = "", taskDescription = "", isBig = false) {
    this.modalTarget.classList.remove("hidden")
    this.modalTarget.classList.add("flex")
    this.modalTitleTarget.textContent = title
    this.titleInputTarget.value = taskTitle
    this.descriptionInputTarget.value = taskDescription
    this.bigCheckboxTarget.checked = isBig
    this.errorTarget.classList.add("hidden")
    this.errorTarget.textContent = "Title is required."
    this.titleInputTarget.focus()
  }

  closeModal() {
    this.modalTarget.classList.add("hidden")
    this.modalTarget.classList.remove("flex")
    this.editingTaskId = null
    this.activeListId = null
    this.activeCard = null
  }

  submitForm(event) {
    event.preventDefault()
    const title = this.titleInputTarget.value.trim()
    const description = this.descriptionInputTarget.value.trim()
    const isBig = this.bigCheckboxTarget.checked
    if (!title) {
      this.errorTarget.classList.remove("hidden")
      this.titleInputTarget.focus()
      return
    }

    if (!this.editingTaskId && !this.activeListId) {
      this.errorTarget.textContent = "Select a list before creating a task."
      this.errorTarget.classList.remove("hidden")
      return
    }

    const token = document.querySelector("meta[name='csrf-token']").content
    const payload = { task: { title: title, description: description || null, big: isBig } }
    const request = this.editingTaskId
      ? { url: `/tasks/${this.editingTaskId}`, method: "PATCH" }
      : { url: "/tasks", method: "POST" }

    if (!this.editingTaskId) {
      payload.task.task_list_id = this.activeListId
    }

    fetch(request.url, {
      method: request.method,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-CSRF-Token": token
      },
      body: JSON.stringify(payload)
    }).then((response) => {
      if (!response.ok) {
        return response.json().then((data) => {
          throw new Error(data.errors?.[0] || "Failed to save task")
        })
      }
      return response.json()
    }).then((data) => {
      if (this.editingTaskId && this.activeCard) {
        this.applyCardUpdate(this.activeCard, data.title, data.description, data.big)
      } else {
        this.insertNewCard(data)
      }
      this.closeModal()
    }).catch((error) => {
      this.errorTarget.textContent = error.message || "Could not save task."
      this.errorTarget.classList.remove("hidden")
    })
  }

  applyCardUpdate(card, title, description, isBig) {
    card.dataset.taskTitle = title
    card.dataset.taskDescription = description || ""
    card.dataset.taskBig = isBig

    const titleSpan = card.querySelector("span")
    if (titleSpan) {
      titleSpan.textContent = title
    }

    this.syncBigStyles(card, isBig)
    this.syncDescriptionIcon(card, description)
  }

  insertNewCard(data) {
    const listElement = this.element.querySelector(`[data-task-list-id="${data.task_list_id}"]`)
    if (!listElement) return
    const container = listElement.querySelector("[data-tasks-board-target='cards']")
    if (!container) return

    const card = this.buildCardElement(data)
    container.appendChild(card)
    this.adjustCount(data.task_list_id, 1)
  }

  buildCardElement(data) {
    const card = document.createElement("div")
    card.className = "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm cursor-grab active:cursor-grabbing"
    card.setAttribute("draggable", "true")
    card.dataset.taskId = data.id
    card.dataset.taskListId = data.task_list_id
    card.dataset.taskTitle = data.title
    card.dataset.taskDescription = data.description || ""
    card.dataset.taskBig = data.big
    card.dataset.action = "dragstart->tasks-board#dragStart dragend->tasks-board#dragEnd mouseenter->tasks-board#hoverCard mouseleave->tasks-board#leaveCard"
    if (data.big) {
      card.classList.add("task-card--big")
    }

    const wrapper = document.createElement("div")
    wrapper.className = "flex items-center justify-between gap-2"

    const titleSpan = document.createElement("span")
    titleSpan.textContent = data.title
    titleSpan.className = `task-title ${data.big ? "task-title--big" : ""}`.trim()

    wrapper.appendChild(titleSpan)
    if (data.description) {
      wrapper.appendChild(this.buildDescriptionIcon())
    }

    card.appendChild(wrapper)
    return card
  }

  buildDescriptionIcon() {
    const icon = document.createElement("span")
    icon.className = "text-slate-400"
    icon.setAttribute("aria-label", "Has description")
    icon.innerHTML = `
      <svg viewBox="0 0 20 20" class="h-4 w-4" fill="currentColor" aria-hidden="true">
        <path d="M6 4h8a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H9.414L6 17.414V4z" />
      </svg>
    `
    return icon
  }

  syncDescriptionIcon(card, description) {
    const wrapper = card.firstElementChild
    if (!wrapper) return
    const existingIcon = wrapper.querySelector("span.text-slate-400")
    if (description && !existingIcon) {
      wrapper.appendChild(this.buildDescriptionIcon())
    } else if (!description && existingIcon) {
      existingIcon.remove()
    }
  }

  syncBigStyles(card, isBig) {
    if (isBig) {
      card.classList.add("task-card--big")
    } else {
      card.classList.remove("task-card--big")
    }
    const titleSpan = card.querySelector(".task-title")
    if (titleSpan) {
      if (isBig) {
        titleSpan.classList.add("task-title--big")
      } else {
        titleSpan.classList.remove("task-title--big")
      }
    }
  }

  archiveHoveredCard() {
    const card = this.hoveredCard
    if (!card) return
    const taskId = card.dataset.taskId
    const listId = card.dataset.taskListId
    const parent = card.parentElement
    const nextSibling = card.nextElementSibling

    card.classList.add("hidden")
    this.adjustCount(listId, -1)

    const token = document.querySelector("meta[name='csrf-token']").content
    fetch(`/tasks/${taskId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-CSRF-Token": token
      },
      body: JSON.stringify({ task: { archived_at: new Date().toISOString() } })
    }).then((response) => {
      if (!response.ok) throw new Error("Failed to archive task")
      card.remove()
      this.hoveredCard = null
    }).catch(() => {
      card.classList.remove("hidden")
      if (parent) {
        if (nextSibling && nextSibling.parentElement === parent) {
          parent.insertBefore(card, nextSibling)
        } else {
          parent.appendChild(card)
        }
      }
      this.adjustCount(listId, 1)
    })
  }

  allowDrop(event) {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
    this.positionPlaceholder(event)
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
    this.dropHandled = true
    const placeholder = listElement.querySelector("[data-tasks-board-target='placeholder']")
    if (placeholder) {
      placeholder.classList.add("hidden")
    }

    const taskElement = this.element.querySelector(`[data-task-id="${taskId}"]`)
    if (!taskElement) return

    const previousListId = taskElement.dataset.taskListId
    const targetListId = listElement.dataset.taskListId

    const previousContainer = taskElement.parentElement
    const targetContainer = listElement.querySelector("[data-tasks-board-target='cards']")
    if (!targetContainer) return

    if (placeholder && placeholder.parentElement === targetContainer) {
      targetContainer.insertBefore(taskElement, placeholder)
    } else {
      targetContainer.appendChild(taskElement)
    }

    const targetPosition = Array.from(targetContainer.querySelectorAll("[data-task-id]")).indexOf(taskElement)
    taskElement.dataset.taskListId = targetListId
    taskElement.classList.remove("hidden")

    if (previousListId !== targetListId) {
      this.updateCounts(previousListId, targetListId, 1)
    }

    this.updateTask(
      taskId,
      targetListId,
      targetPosition,
      taskElement,
      previousContainer,
      previousListId,
      this.draggedNextSibling
    )
  }

  positionPlaceholder(event) {
    const listElement = event.currentTarget.closest("[data-task-list-id]")
    if (!listElement) return

    const container = listElement.querySelector("[data-tasks-board-target='cards']")
    const placeholder = listElement.querySelector("[data-tasks-board-target='placeholder']")
    if (!container || !placeholder) return

    placeholder.classList.remove("hidden")

    const cards = Array.from(container.querySelectorAll("[data-task-id]")).filter(
      (card) => card !== this.draggedElement
    )
    const y = event.clientY
    let insertBefore = null

    for (const card of cards) {
      const rect = card.getBoundingClientRect()
      if (y < rect.top + rect.height / 2) {
        insertBefore = card
        break
      }
    }

    if (insertBefore) {
      container.insertBefore(placeholder, insertBefore)
    } else {
      container.appendChild(placeholder)
    }
  }

  updateCounts(previousListId, targetListId, delta) {
    const previousCount = this.findCountElement(previousListId)
    const targetCount = this.findCountElement(targetListId)

    if (previousCount) {
      this.setCount(previousCount, this.readCount(previousCount) - delta)
    }

    if (targetCount && previousListId !== targetListId) {
      this.setCount(targetCount, this.readCount(targetCount) + delta)
    }
  }

  adjustCount(listId, delta) {
    const count = this.findCountElement(listId)
    if (count) {
      this.setCount(count, this.readCount(count) + delta)
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

  updateTask(taskId, targetListId, targetPosition, taskElement, previousContainer, previousListId, previousNextSibling) {
    const token = document.querySelector("meta[name='csrf-token']").content

    fetch(`/tasks/${taskId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-CSRF-Token": token
      },
      body: JSON.stringify({ task: { task_list_id: targetListId, position: targetPosition } })
    }).then((response) => {
      if (!response.ok) throw new Error("Failed to update task list")
    }).catch(() => {
      if (previousContainer) {
        if (previousNextSibling && previousNextSibling.parentElement === previousContainer) {
          previousContainer.insertBefore(taskElement, previousNextSibling)
        } else {
          previousContainer.appendChild(taskElement)
        }
      }
      taskElement.dataset.taskListId = previousListId
      taskElement.classList.remove("hidden")
      if (previousListId !== targetListId) {
        this.updateCounts(targetListId, previousListId, 1)
      }
    })
  }

  clearPlaceholders() {
    this.element.querySelectorAll("[data-tasks-board-target='placeholder']").forEach((placeholder) => {
      placeholder.classList.add("hidden")
    })
  }
}
