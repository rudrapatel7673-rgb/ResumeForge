/* ============================================
   Navbar Component
   ============================================ */
const Navbar = {
  render(options = {}) {
    const { showNav = true, transparent = false } = options;
    const isAuth = AuthContext.isAuthenticated;
    const user = AuthContext.user;

    let navLinks = '';
    let actions = '';
    let mobileMenu = '';

    if (isAuth && showNav) {
      navLinks = `
        <nav class="navbar-nav">
          <a href="#/dashboard" class="${Router.currentPath === '/dashboard' ? 'active' : ''}">Dashboard</a>
          <a href="#/my-resumes" class="${Router.currentPath === '/my-resumes' ? 'active' : ''}">My Resumes</a>
          <a href="#/profile" class="${Router.currentPath === '/profile' ? 'active' : ''}">Settings</a>
        </nav>
      `;
      const initials = Helpers.getInitials(user?.name || user?.email || '?');
      actions = `
        <div class="navbar-actions">
          <button class="theme-toggle" id="theme-toggle" aria-label="Toggle theme">
            ${UIContext.theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <div class="dropdown" id="user-dropdown">
            <div class="navbar-avatar" id="user-avatar-btn">${initials}</div>
            <div class="dropdown-menu" id="user-dropdown-menu">
              <div style="padding: var(--space-3) var(--space-4); border-bottom: var(--glass-border); margin-bottom: var(--space-2);">
                <div style="font-weight: 600; font-size: var(--text-sm);">${Helpers.escapeHtml(user?.name || 'User')}</div>
                <div style="font-size: var(--text-xs); color: var(--text-tertiary);">${Helpers.escapeHtml(user?.email || '')}</div>
              </div>
              <button class="dropdown-item" onclick="Router.navigate('/profile')">⚙️ Settings</button>
              <div class="dropdown-divider"></div>
              <button class="dropdown-item danger" onclick="AuthContext.logout()">🚪 Logout</button>
            </div>
          </div>
          <button class="mobile-menu-btn" id="mobile-menu-toggle">☰</button>
        </div>
      `;
      mobileMenu = `
        <div class="mobile-menu" id="mobile-menu">
          <a href="#/dashboard">📊 Dashboard</a>
          <a href="#/my-resumes">📄 My Resumes</a>
          <a href="#/profile">⚙️ Settings</a>
          <button onclick="AuthContext.logout()">🚪 Logout</button>
        </div>
      `;
    } else {
      navLinks = `
        <nav class="navbar-nav hide-mobile">
          <a href="#/" class="${Router.currentPath === '/' ? 'active' : ''}">Home</a>
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
        </nav>
      `;
      actions = `
        <div class="navbar-actions">
          <button class="theme-toggle" id="theme-toggle" aria-label="Toggle theme">
            ${UIContext.theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <a href="#/auth" class="btn btn-primary btn-sm">Get Started</a>
          <button class="mobile-menu-btn" id="mobile-menu-toggle">☰</button>
        </div>
      `;
      mobileMenu = `
        <div class="mobile-menu" id="mobile-menu">
          <a href="#/">Home</a>
          <a href="#features">Features</a>
          <a href="#/auth">Get Started →</a>
        </div>
      `;
    }

    return `
      <header class="navbar" id="main-navbar">
        <div class="navbar-inner">
          <a class="navbar-logo" href="#/${isAuth ? 'dashboard' : ''}">
            <div class="navbar-logo-icon">📄</div>
            <span class="navbar-logo-text">ResumeForge</span>
          </a>
          ${navLinks}
          ${actions}
        </div>
      </header>
      ${mobileMenu}
    `;
  },

  init() {
    // Theme toggle
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        UIContext.toggleTheme();
        themeBtn.textContent = UIContext.theme === 'dark' ? '☀️' : '🌙';
      });
    }

    // User dropdown
    const avatarBtn = document.getElementById('user-avatar-btn');
    const dropdownMenu = document.getElementById('user-dropdown-menu');
    if (avatarBtn && dropdownMenu) {
      avatarBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.classList.toggle('open');
      });
      document.addEventListener('click', () => {
        dropdownMenu.classList.remove('open');
      });
    }

    // Mobile menu
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileToggle && mobileMenu) {
      mobileToggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
      });
    }

    // Scroll effect
    const navbar = document.getElementById('main-navbar');
    if (navbar) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      });
    }
  }
};
