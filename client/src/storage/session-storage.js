// sessionStorage wrapper
const TaskSessionStorage = {
    key: "myApp_session",

    set(value) {
        try {
            sessionStorage.setItem(this.key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error("Failed to save session data:", error);
            return false;
        }
    },

    get() {
        try {
            const data = sessionStorage.getItem(this.key);
            return JSON.parse(data) || "";
        } catch (error) {
            console.error("Failed to retrieve session data:", error);
            return "";
        }
    },

    clear() {
        try {
            sessionStorage.removeItem(this.key);
            return true;
        } catch (error) {
            console.error("Failed to clear session data:", error);
            return false;
        }
    }
};
export { TaskSessionStorage };