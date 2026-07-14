/* ============================================
   Sidebar Component
   ============================================ */
const Sidebar = {
  render(items, activeId) {
    const collapsed = UIContext.sidebarCollapsed;
    const mobileOpen = UIContext.sidebarMobileOpen;

    let sections = '';
    items.forEach(section => {
      let sectionItems = '';
      section.items.forEach(item => {
        sectionItems += `
          <button class="sidebar-item ${activeId === item.id ? 'active' : ''}" 
                  data-sidebar-id="${item.id}" 
                  title="${item.label}">
            <span class="sidebar-item-icon">${item.icon}</span>
            <span class="sidebar-item-text">${item.label}</span>
          </button>
        `;
      });
      sections += `
        <div class="sidebar-section">
          <div class="sidebar-section-title">${section.title}</div>
          ${sectionItems}
        </div>
      `;
    });

    return `
      <aside class="sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}" id="main-sidebar">
        <div class="sidebar-toggle">
          <button class="sidebar-toggle-btn" id="sidebar-toggle-btn" title="${collapsed ? 'Expand' : 'Collapse'}">
            ${collapsed ? '→' : '←'}
          </button>
        </div>
        ${sections}
      </aside>
    `;
  },

  init(onItemClick) {
    const toggleBtn = document.getElementById('sidebar-toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => UIContext.toggleSidebar());
    }

    document.querySelectorAll('[data-sidebar-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (onItemClick) onItemClick(btn.dataset.sidebarId);
      });
    });
  }
};
