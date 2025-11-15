// Pagination Manager

class PaginationManager {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 3;
    }

    setPage(page) {
        this.currentPage = page;
    }

    getCurrentPage() {
        return this.currentPage;
    }

    getTotalPages(totalItems) {
        return Math.ceil(totalItems / this.itemsPerPage) || 1;
    }

    getPageItems(items) {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        return items.slice(start, end);
    }

    reset() {
        this.currentPage = 1;
    }
}
export { PaginationManager };