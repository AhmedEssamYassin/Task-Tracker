class FilterManager {
    constructor() {
        this.currentFilter = 'all';
    }

    setFilter(filter) {
        this.currentFilter = filter;
    }

    shouldShowTask(task) {
        switch (this.currentFilter) {
            case 'all':
                return true;
            case 'active':
                return !task.completed;
            case 'completed':
                return task.completed;
            case 'high':
                return task.priority === 'high';
            default:
                return true;
        }
    }

    applyFilter(tasks) {
        return tasks.filter(task => this.shouldShowTask(task));
    }
}
export { FilterManager };