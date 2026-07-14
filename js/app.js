/* ============================================
   App Entry Point
   ============================================ */
(function () {
  // Initialize contexts
  AuthContext.init();
  UIContext.init();

  // Register routes
  Router.register('/', LandingPage);
  Router.register('/auth', AuthPage);
  Router.register('/dashboard', Dashboard);
  Router.register('/ai-wizard', AiWizard);
  Router.register('/builder/:id', ResumeBuilder);
  Router.register('/preview/:id', PreviewPage);
  Router.register('/download/:id', DownloadPage);
  Router.register('/my-resumes', MyResumes);
  Router.register('/profile', ProfileSettings);
  Router.register('*', NotFoundPage);

  // Initialize router
  Router.init();

  // Initialize Toast
  Toast.init();

  // Hide loader after a short delay
  setTimeout(() => {
    const loader = document.getElementById('loader-screen');
    if (loader) {
      loader.classList.add('hidden');
      setTimeout(() => loader.remove(), 500);
    }
  }, 1200);

  console.log('%c📄 ResumeForge', 'font-size: 24px; font-weight: bold; color: #6C63FF;');
  console.log('%cAI-Powered Resume Builder', 'font-size: 12px; color: #a0a0c0;');
})();
