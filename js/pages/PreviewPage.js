/* ============================================
   Preview Page
   ============================================ */
const PreviewPage = {
  device: 'desktop',

  render() {
    const pathParts = Router.currentPath.split('/');
    const resumeId = pathParts[2];
    const resume = Storage.getResume(resumeId);

    if (!resume) {
      Toast.error('Not Found', 'Resume not found');
      setTimeout(() => Router.navigate('/dashboard'), 100);
      return '';
    }

    return `
      ${Navbar.render()}
      <div class="preview-page">
        <div class="preview-toolbar">
          <div style="display:flex; align-items:center; gap: var(--space-3);">
            <button class="btn btn-ghost btn-sm" onclick="Router.navigate('/builder/${resumeId}')">← Back to Editor</button>
            <h2 style="font-size: var(--text-lg);">${Helpers.escapeHtml(resume.name)}</h2>
          </div>
          <div style="display:flex; align-items:center; gap: var(--space-3);">
            <div class="preview-device-toggle">
              <button class="preview-device-btn ${this.device === 'desktop' ? 'active' : ''}" data-device="desktop">🖥</button>
              <button class="preview-device-btn ${this.device === 'tablet' ? 'active' : ''}" data-device="tablet">📱</button>
              <button class="preview-device-btn ${this.device === 'mobile' ? 'active' : ''}" data-device="mobile">📲</button>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="window.print()">🖨 Print</button>
            <button class="btn btn-primary btn-sm" onclick="Router.navigate('/download/${resumeId}')">📥 Download PDF</button>
          </div>
        </div>
        <div class="preview-container ${this.device}" id="preview-render">
          ${ResumeTemplates.render(resume.template, resume)}
        </div>
      </div>
    `;
  },

  init() {
    Navbar.init();

    document.querySelectorAll('.preview-device-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.device = btn.dataset.device;
        document.querySelectorAll('.preview-device-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const container = document.getElementById('preview-render');
        container.className = `preview-container ${this.device}`;
      });
    });
  }
};
