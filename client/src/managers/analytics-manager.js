import { Chart, registerables } from 'chart.js';

// Register all Chart.js components
Chart.register(...registerables);

class AnalyticsManager {
    constructor() {
        this.completionChart = null;
        this.priorityChart = null;
        this.initCharts();
    }

    initCharts() {
        const commonOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#cbd5e1',
                        font: { size: 12 }
                    }
                }
            }
        };

        // Completion Chart
        const completionCtx = document.getElementById('completionChart');
        this.completionChart = new Chart(completionCtx, {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'Remaining'],
                datasets: [{
                    data: [0, 0],
                    backgroundColor: ['#10b981', '#334155'],
                    borderWidth: 0
                }]
            },
            options: {
                ...commonOptions,
                cutout: '70%'
            }
        });

        // Priority Chart
        const priorityCtx = document.getElementById('priorityChart');
        this.priorityChart = new Chart(priorityCtx, {
            type: 'bar',
            data: {
                labels: ['High', 'Medium', 'Low'],
                datasets: [{
                    label: 'Tasks',
                    data: [0, 0, 0],
                    backgroundColor: ['#ef4444', '#f59e0b', '#10b981'],
                    borderRadius: 8
                }]
            },
            options: {
                ...commonOptions,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#cbd5e1',
                            stepSize: 1
                        },
                        grid: {
                            color: '#334155'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#cbd5e1'
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    updateCharts(tasks) {
        const completed = tasks.filter(t => t.completed).length;
        const remaining = tasks.length - completed;

        // Update completion chart with smooth animation
        this.completionChart.data.datasets[0].data = [completed, remaining];
        this.completionChart.options.animation = {
            duration: 800,
            easing: 'easeInOutQuart'
        };
        this.completionChart.update();

        // Update priority chart with smooth animation
        const high = tasks.filter(t => t.priority === 'high').length;
        const medium = tasks.filter(t => t.priority === 'medium').length;
        const low = tasks.filter(t => t.priority === 'low').length;

        this.priorityChart.data.datasets[0].data = [high, medium, low];
        this.priorityChart.options.animation = {
            duration: 800,
            easing: 'easeInOutQuart'
        };
        this.priorityChart.update();
    }
}
export { AnalyticsManager };
