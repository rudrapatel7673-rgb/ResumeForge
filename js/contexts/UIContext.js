/* ============================================
   UI Context
   ============================================ */
const UIContext = {
  theme: 'dark',
  sidebarCollapsed: false,
  sidebarMobileOpen: false,
  listeners: [],

  init() {
    this.theme = Storage.getTheme();
    document.documentElement.setAttribute('data-theme', this.theme);
  },

  subscribe(fn) {
    this.listeners.push(fn);
    return () => { this.listeners = this.listeners.filter(l => l !== fn); };
  },

  notify() {
    this.listeners.forEach(fn => fn(this.getState()));
  },

  getState() {
    return {
      theme: this.theme,
      sidebarCollapsed: this.sidebarCollapsed,
      sidebarMobileOpen: this.sidebarMobileOpen
    };
  },

  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', this.theme);
    Storage.setTheme(this.theme);
    this.notify();
  },

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    this.notify();
  },

  toggleMobileSidebar() {
    this.sidebarMobileOpen = !this.sidebarMobileOpen;
    this.notify();
  },

  closeMobileSidebar() {
    this.sidebarMobileOpen = false;
    this.notify();
  }
};
