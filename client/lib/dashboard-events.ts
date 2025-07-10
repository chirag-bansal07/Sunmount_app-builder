// Simple event system for dashboard refresh
class DashboardEventEmitter {
  private listeners: (() => void)[] = [];

  addListener(callback: () => void) {
    this.listeners.push(callback);

    // Return cleanup function
    return () => {
      this.listeners = this.listeners.filter(
        (listener) => listener !== callback,
      );
    };
  }

  refreshDashboard() {
    this.listeners.forEach((listener) => listener());
  }
}

export const dashboardEvents = new DashboardEventEmitter();
