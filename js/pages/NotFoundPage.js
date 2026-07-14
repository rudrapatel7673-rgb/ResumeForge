/* ============================================
   Not Found Page (404)
   ============================================ */
const NotFoundPage = {
  render() {
    return `
      ${Navbar.render({ showNav: false })}
      <div class="not-found-page">
        <div class="not-found-code">404</div>
        <h2>Page Not Found</h2>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <a href="#/${AuthContext.isAuthenticated ? 'dashboard' : ''}" class="btn btn-primary btn-lg">
          ← Go Home
        </a>
      </div>
    `;
  },

  init() {
    Navbar.init();
  }
};
