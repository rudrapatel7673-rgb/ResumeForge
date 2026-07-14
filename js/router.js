/* ============================================
   Hash-Based Router
   ============================================ */
const Router = {
  currentPath: '/',
  routes: {},
  protectedRoutes: ['/dashboard', '/ai-wizard', '/builder', '/preview', '/download', '/my-resumes', '/profile'],

  init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('load', () => this.handleRoute());
  },

  register(path, handler) {
    this.routes[path] = handler;
  },

  navigate(path) {
    window.location.hash = '#' + path;
  },

  handleRoute() {
    let hash = window.location.hash.slice(1) || '/';
    this.currentPath = hash;

    // Check if route is protected
    const isProtected = this.protectedRoutes.some(r => hash.startsWith(r));
    if (isProtected && !AuthContext.isAuthenticated) {
      this.navigate('/auth');
      return;
    }

    // If authenticated and going to auth page, redirect to dashboard
    if (hash === '/auth' && AuthContext.isAuthenticated) {
      this.navigate('/dashboard');
      return;
    }

    // Find matching route
    let handler = null;
    let matchedPath = hash;

    // Exact match first
    if (this.routes[hash]) {
      handler = this.routes[hash];
    } else {
      // Try pattern matching (e.g., /builder/:id)
      for (const routePath in this.routes) {
        const routeParts = routePath.split('/');
        const hashParts = hash.split('/');
        
        if (routeParts.length === hashParts.length) {
          let match = true;
          for (let i = 0; i < routeParts.length; i++) {
            if (routeParts[i].startsWith(':')) continue;
            if (routeParts[i] !== hashParts[i]) { match = false; break; }
          }
          if (match) {
            handler = this.routes[routePath];
            break;
          }
        }
      }
    }

    if (!handler) {
      handler = this.routes['*'] || { render: () => '<div>Not Found</div>', init: () => {} };
    }

    // Render
    const pageContent = document.getElementById('page-content');
    if (pageContent) {
      pageContent.innerHTML = handler.render();
      if (handler.init) handler.init();
    }

    // Scroll to top
    window.scrollTo(0, 0);
  }
};
