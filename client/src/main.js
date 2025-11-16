"use strict";
import { FilterManager } from "./managers/filter-manager.js";
import { AnalyticsManager } from "./managers/analytics-manager.js";
import { PaginationManager } from "./managers/pagination-manager.js";
import { ToastManager } from "./managers/toast-manager.js";
import { Utils } from "./utilities/utils.js";
import { TaskLocalStorage } from "./storage/local-storage.js";
import { TaskSessionStorage } from "./storage/session-storage.js";

// DOM elements - Cache once, use throughout
const DOM = {
    taskInput: document.getElementById("taskInput"),
    prioritySelect: document.getElementById("prioritySelect"),
    taskList: document.getElementById("taskList"),
    addButton: document.getElementById("addBtn"),
    emptyState: document.getElementById("emptyState"),
    statTotal: document.getElementById("statTotal"),
    statCompleted: document.getElementById("statCompleted"),
    statRemaining: document.getElementById("statRemaining"),
    exportBtn: document.getElementById("exportBtn"),
    clearBtn: document.getElementById("clearBtn"),
    analyticsPanel: document.getElementById("analyticsPanel"),
    filterTabs: document.querySelectorAll(".filter-tab"),
    paginationContainer: document.getElementById("paginationContainer"),
    prevPageBtn: document.getElementById("prevPage"),
    nextPageBtn: document.getElementById("nextPage"),
    currentPageSpan: document.getElementById("currentPage"),
    totalPagesSpan: document.getElementById("totalPages")
};

async function getTaskId() {
    try {
        const res = await fetch("/api/ksuid");
        const data = await res.json();
        return data.ksuid;
    } catch (error) {// Fallback to UUID
        console.error("Failed to get task ID from server, using fallback:", error);
        return crypto.randomUUID();
    }
}

class TaskTracker {
    constructor() {
        this.toast = new ToastManager();
        this.analytics = new AnalyticsManager();
        this.filter = new FilterManager();
        this.pagination = new PaginationManager();
        this.init();
    }

    init() {
        this.restoreSessionInput();
        this.loadExistingTasks();
        this.setupEventListeners();
        this.updateUI();
    }

    restoreSessionInput() {
        const savedInput = TaskSessionStorage.get();
        if (savedInput) {
            DOM.taskInput.value = savedInput;
        }
    }

    loadExistingTasks() {
        const tasks = TaskLocalStorage.getAll();
        this.renderAllTasks();
    }

    setupEventListeners() {
        // Save input to sessionStorage on typing
        DOM.taskInput.addEventListener("input", Utils.debounce((e) => {
            TaskSessionStorage.set(e.target.value);
        }, 300));

        // Add task button
        DOM.addButton.addEventListener("click", () => this.handleAddTask());

        // Enter key support
        DOM.taskInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                this.handleAddTask();
            }
        });

        // Export button
        DOM.exportBtn.addEventListener("click", () => this.exportTasks());

        // Clear button
        DOM.clearBtn.addEventListener("click", () => this.clearAllTasks());

        // Filter tabs
        DOM.filterTabs.forEach(tab => {
            tab.addEventListener("click", (e) => this.handleFilterChange(e.target));
        });

        // Pagination buttons
        DOM.prevPageBtn.addEventListener("click", () => this.handlePreviousPage());
        DOM.nextPageBtn.addEventListener("click", () => this.handleNextPage());
    }

    async handleAddTask() {
        const taskName = Utils.sanitizeHTML(DOM.taskInput.value.trim());
        const priority = DOM.prioritySelect.value;

        if (taskName === "") {
            this.toast.warning("Please enter a task name");
            return;
        }

        if (taskName.length > 200) {
            this.toast.error("Task name is too long (max 200 characters)");
            return;
        }

        try {
            const taskId = await getTaskId();
            const newTask = {
                id: taskId,
                name: taskName,
                completed: false,
                priority: priority,
                createdAt: new Date().toISOString()
            };

            if (TaskLocalStorage.add(newTask)) {
                DOM.taskInput.value = "";
                DOM.prioritySelect.value = "medium";

                // Reset to first page when adding new task
                this.pagination.reset();
                this.renderAllTasks();
                this.updateUI();

                this.toast.success("Task added successfully!");
            }
            TaskSessionStorage.clear();
        } catch (error) {
            this.toast.error(error.message);
        }
    }

    renderAllTasks() {
        DOM.taskList.innerHTML = "";
        const tasks = TaskLocalStorage.getAll();

        // Get filtered tasks
        const filteredTasks = this.getFilteredTasks(tasks);

        // Get paginated tasks
        const paginatedTasks = this.pagination.getPageItems(filteredTasks);

        // Render each task
        paginatedTasks.forEach(task => {
            this.renderTask(task.id, task.name, task.completed, task.priority || 'medium', task.createdAt);
        });

        // Update pagination controls
        this.updatePaginationControls(filteredTasks.length);
    }

    getFilteredTasks(tasks) {
        switch (this.filter.currentFilter) {
            case 'active':
                return tasks.filter(t => !t.completed);
            case 'completed':
                return tasks.filter(t => t.completed);
            case 'high':
                return tasks.filter(t => t.priority === 'high');
            default:
                return tasks;
        }
    }

    updatePaginationControls(totalFilteredItems) {
        const totalPages = this.pagination.getTotalPages(totalFilteredItems);
        const currentPage = this.pagination.getCurrentPage();

        // Show/hide pagination - hide if no items or only one page
        if (totalPages > 1) {
            DOM.paginationContainer.classList.remove('hidden');
        } else {
            DOM.paginationContainer.classList.add('hidden');
            return; // Exit early if pagination is hidden
        }

        // Update page numbers
        DOM.currentPageSpan.textContent = currentPage;
        DOM.totalPagesSpan.textContent = totalPages;

        // Enable/disable buttons
        DOM.prevPageBtn.disabled = currentPage === 1;
        DOM.nextPageBtn.disabled = currentPage === totalPages;
    }

    handlePreviousPage() {
        if (this.pagination.getCurrentPage() > 1) {
            this.pagination.setPage(this.pagination.getCurrentPage() - 1);
            this.renderAllTasks();
            this.scrollToTop();
        }
    }

    handleNextPage() {
        const tasks = TaskLocalStorage.getAll();
        const filteredTasks = this.getFilteredTasks(tasks);
        const totalPages = this.pagination.getTotalPages(filteredTasks.length);

        if (this.pagination.getCurrentPage() < totalPages) {
            this.pagination.setPage(this.pagination.getCurrentPage() + 1);
            this.renderAllTasks();
            this.scrollToTop();
        }
    }

    scrollToTop() {
        DOM.taskList.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    renderTask(taskId, taskName, isCompleted, priority = 'medium', createdAt) {
        const taskElement = document.createElement("li");
        taskElement.classList.add("task-item");
        taskElement.dataset.taskId = taskId;

        if (isCompleted) {
            taskElement.classList.add("completed");
        }

        // Create checkbox
        const checkbox = this.createCheckbox(taskId, isCompleted);

        // Create task content
        const taskContent = document.createElement("div");
        taskContent.classList.add("task-content");

        const taskText = this.createTaskText(taskName);
        const taskMeta = this.createTaskMeta(priority, createdAt);

        taskContent.append(taskText, taskMeta);

        // Create delete button
        const deleteButton = this.createDeleteButton(taskId);

        taskElement.append(checkbox, taskContent, deleteButton);
        DOM.taskList.appendChild(taskElement);
    }

    createCheckbox(taskId, isCompleted) {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.classList.add("task-checkbox");
        checkbox.checked = isCompleted;
        checkbox.setAttribute("aria-label", "Mark task as complete");

        checkbox.addEventListener("change", (e) => {
            this.handleTaskToggle(taskId, e.target.checked);
        });

        return checkbox;
    }

    createTaskText(taskName) {
        const span = document.createElement("span");
        span.classList.add("task-text");
        span.textContent = taskName;
        return span;
    }

    createTaskMeta(priority, createdAt) {
        const meta = document.createElement("div");
        meta.classList.add("task-meta");

        const priorityBadge = document.createElement("span");
        priorityBadge.classList.add("priority-badge", priority);
        priorityBadge.textContent = priority;

        const dateSpan = document.createElement("span");
        dateSpan.classList.add("task-date");
        dateSpan.textContent = Utils.formatDate(createdAt);

        meta.append(priorityBadge, dateSpan);
        return meta;
    }

    createDeleteButton(taskId) {
        const button = document.createElement("button");
        button.classList.add("delete-btn");
        button.textContent = "Delete";
        button.setAttribute("aria-label", "Delete task");

        button.addEventListener("click", () => {
            this.handleTaskDelete(taskId);
        });

        return button;
    }

    handleTaskToggle(taskId, isCompleted) {
        if (TaskLocalStorage.update(taskId, { completed: isCompleted })) {
            const taskElement = this.getTaskElement(taskId); // Get the specific task element
            if (taskElement) {
                taskElement.classList.toggle("completed", isCompleted); // Toggle the 'completed' class
            }
            this.updateUI();
            this.toast.success(isCompleted ? "Task completed! 🎉" : "Task reopened");
        }
    }

    handleTaskDelete(taskId) {
        const taskElement = this.getTaskElement(taskId);
        if (!taskElement) return;

        taskElement.style.animation = 'toastSlide 0.3s ease reverse';
        setTimeout(() => {
            TaskLocalStorage.remove(taskId);

            // Check if we need to go back a page
            const tasks = TaskLocalStorage.getAll();
            const filteredTasks = this.getFilteredTasks(tasks);
            const totalPages = this.pagination.getTotalPages(filteredTasks.length);

            if (this.pagination.getCurrentPage() > totalPages && totalPages > 0) {
                this.pagination.setPage(totalPages);
            }

            this.renderAllTasks();
            this.updateUI();
            this.toast.info("Task deleted");
        }, 300);
    }

    getTaskElement(taskId) {
        return DOM.taskList.querySelector(`[data-task-id="${taskId}"]`);
    }

    handleFilterChange(tab) {
        DOM.filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const filterType = tab.dataset.filter;
        this.filter.setFilter(filterType);

        // Reset to first page when changing filter
        this.pagination.reset();
        this.renderAllTasks();
        this.updateUI();
    }

    updateUI() {
        this.updateEmptyState();
        this.updateStats();
        this.updateAnalytics();
    }

    updateStats() {
        const tasks = TaskLocalStorage.getAll();
        const total = tasks.length;
        const completed = tasks.filter(task => task.completed).length;
        const remaining = total - completed;

        DOM.statTotal.textContent = total;
        DOM.statCompleted.textContent = completed;
        DOM.statRemaining.textContent = remaining;
    }

    updateEmptyState() {
        const tasks = TaskLocalStorage.getAll();
        const filteredTasks = this.getFilteredTasks(tasks);
        const hasNoTasks = filteredTasks.length === 0;

        DOM.emptyState.style.display = hasNoTasks ? "flex" : "none";

        // Update message based on filter
        if (hasNoTasks) {
            const svg = DOM.emptyState.querySelector('svg');
            const text = DOM.emptyState.querySelector('p');

            if (this.filter.currentFilter === 'completed') {
                svg.innerHTML = '<circle cx="12" cy="12" r="10"></circle><path d="M16 16s-1.5-2-4-2-4 2-4 2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line>';
                text.textContent = 'No completed tasks yet, go on finish some of them';
            } else {
                svg.innerHTML = '<circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line>';
                text.textContent = 'No tasks yet. Add one above!';
            }
        }

        // Hide analytics if no tasks
        if (tasks.length === 0) {
            DOM.analyticsPanel.classList.add('hidden');
        } else {
            DOM.analyticsPanel.classList.remove('hidden');
        }
    }

    updateAnalytics() {
        const tasks = TaskLocalStorage.getAll();

        // Only update if there are tasks
        if (tasks.length > 0) {
            this.analytics.updateCharts(tasks);
        }
    }

    clearAllTasks() {
        if (confirm("Are you sure you want to clear all tasks?")) {
            DOM.taskList.innerHTML = "";
            TaskLocalStorage.clear();
            this.updatePaginationControls(0);
            this.updateUI();
            this.toast.info("All tasks cleared");
        }
    }

    exportTasks() {
        const tasks = TaskLocalStorage.getAll();

        if (tasks.length === 0) {
            this.toast.warning("No tasks to export");
            return;
        }

        const dataStr = JSON.stringify(tasks, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `todo-tasks-${new Date().toISOString().split('T')[0]}.json`;
        link.click();

        this.toast.success("Tasks exported successfully!");
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.TaskTracker = new TaskTracker();
});