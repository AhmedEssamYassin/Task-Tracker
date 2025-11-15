class FilterManager {
    constructor() {
        this.currentFilter = 'all';
    }

    setFilter(filter) {
        this.currentFilter = filter;
    }

    shouldShowTask(taskElement) {
        const isCompleted = taskElement.classList.contains('completed');
        const priority = taskElement.querySelector('.priority-badge')?.classList[1];

        switch (this.currentFilter) {
            case 'all':
                return true;
            case 'active':
                return !isCompleted;
            case 'completed':
                return isCompleted;
            case 'high':
                return priority === 'high';
            default:
                return true;
        }
    }

    applyFilter() {
        const tasks = document.querySelectorAll('.task-item');
        tasks.forEach(task => {
            if (this.shouldShowTask(task)) {
                task.classList.remove('hidden');
            } else {
                task.classList.add('hidden');
            }
        });
    }
}
export { FilterManager };