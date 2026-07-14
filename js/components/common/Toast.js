/* ============================================
   Toast Component
   ============================================ */
const Toast = {
  container: null,

  init() {
    this.container = document.getElementById('toast-container');
  },

  show(type, title, message, duration = 4000) {
    if (!this.container) this.init();
    
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.style.setProperty('--toast-duration', duration + 'ms');
    toast.innerHTML = `
      <div class="toast-icon">${icons[type] || 'ℹ'}</div>
      <div class="toast-body">
        <div class="toast-title">${Helpers.escapeHtml(title)}</div>
        ${message ? `<div class="toast-message">${Helpers.escapeHtml(message)}</div>` : ''}
      </div>
      <button class="toast-close" aria-label="Close">✕</button>
      <div class="toast-progress"></div>
    `;

    toast.querySelector('.toast-close').addEventListener('click', () => this.dismiss(toast));
    this.container.appendChild(toast);

    const timer = setTimeout(() => this.dismiss(toast), duration);
    toast._timer = timer;
  },

  dismiss(toast) {
    clearTimeout(toast._timer);
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  },

  success(title, message) { this.show('success', title, message); },
  error(title, message) { this.show('error', title, message); },
  warning(title, message) { this.show('warning', title, message); },
  info(title, message) { this.show('info', title, message); }
};
