// localStorage wrapper with error handling
const TaskLocalStorage = {
    key: "myApp_tasks",

    getAll() {
        try {
            const data = localStorage.getItem(this.key);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error("Failed to retrieve tasks from storage:", error);
            return [];
        }
    },

    setAll(tasks) {
        try {
            localStorage.setItem(this.key, JSON.stringify(tasks));
            return true;
        } catch (error) {
            console.error("Failed to save tasks to storage:", error);
            return false;
        }
    },

    add(task) {
        const tasks = this.getAll();

        if (!task || !task.id || typeof task.name !== 'string') {
            throw new Error("Invalid task structure");
        }

        if (tasks.some(t => t.id === task.id) || tasks.some(t => t.name === task.name)) {
            throw new Error("Task already exists");
        }

        tasks.push(task);
        return this.setAll(tasks);
    },

    exists(taskId) {
        return this.getAll().some(t => t.id === taskId);
    },

    remove(taskId) {
        const tasks = this.getAll().filter(t => t.id !== taskId);
        return this.setAll(tasks);
    },

    update(taskId, updates) {
        const tasks = this.getAll();
        const updatedTasks = tasks.map(task =>
            task.id === taskId ? { ...task, ...updates } : task
        );
        return this.setAll(updatedTasks);
    },

    clear() {
        try {
            localStorage.removeItem(this.key);
            return true;
        } catch (error) {
            console.error("Failed to clear storage:", error);
            return false;
        }
    }
};
export { TaskLocalStorage };