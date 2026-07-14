/* ============================================
   My Resumes Page
   ============================================ */
const MyResumes = {
  searchQuery: '',

  render() {
    const allResumes = ResumeContext.getAllResumes();
    const filtered = this.searchQuery 
      ? allResumes.filter(r => r.name.toLowerCase().includes(this.searchQuery.toLowerCase()))
      : allResumes;

    return `
      ${Navbar.render()}
      <div class="main-with-sidebar" style="margin-top:70px;">
        <div class="my-resumes-page fade-in">
          <div class="my-resumes-header">
            <div>
              <h1>My Resumes</h1>
              <p style="color: var(--text-secondary); font-size: var(--text-sm);">${allResumes.length} resume${allResumes.length !== 1 ? 's' : ''}</p>
            </div>
            <div style="display: flex; gap: var(--space-3); align-items:center;">
              <div class="search-bar">
                <span class="search-bar-icon">🔍</span>
                <input type="text" id="resume-search" placeholder="Search resumes..." value="${Helpers.escapeHtml(this.searchQuery)}">
              </div>
              <button class="btn btn-primary btn-sm" id="create-resume-btn">+ New Resume</button>
            </div>
          </div>

          ${filtered.length === 0 ? `
            <div class="empty-state">
              <div class="empty-state-icon">📄</div>
              <h3>${this.searchQuery ? 'No Results' : 'No Resumes Yet'}</h3>
              <p>${this.searchQuery ? 'Try a different search term' : 'Create your first resume and start building your career.'}</p>
              ${!this.searchQuery ? '<button class="btn btn-primary" id="empty-create-btn">Create Your First Resume →</button>' : ''}
            </div>
          ` : `
            <div class="resume-grid">
              ${filtered.map(r => this.renderResumeCard(r)).join('')}
            </div>
          `}
        </div>
      </div>
    `;
  },

  renderResumeCard(resume) {
    const template = TemplateContext.getTemplate(resume.template) || { name: 'Modern' };
    const preview = ResumeTemplates.renderPreview(resume.template, resume);

    return `
      <div class="resume-card" data-resume-id="${resume.id}">
        <div class="resume-card-preview">
          <div class="resume-card-preview-content">${preview}</div>
          <div class="resume-card-overlay">
            <div class="resume-card-actions">
              <button class="btn btn-primary btn-sm card-edit-btn" data-id="${resume.id}">✏️ Edit</button>
              <button class="btn btn-secondary btn-sm card-preview-btn" data-id="${resume.id}">👁</button>
              <button class="btn btn-secondary btn-sm card-duplicate-btn" data-id="${resume.id}">📋</button>
              <button class="btn btn-secondary btn-sm card-download-btn" data-id="${resume.id}">📥</button>
              <button class="btn btn-danger btn-sm card-delete-btn" data-id="${resume.id}">🗑</button>
            </div>
          </div>
        </div>
        <div class="resume-card-info">
          <div class="resume-card-title">${Helpers.escapeHtml(resume.name)}</div>
          <div class="resume-card-meta">
            <span class="resume-card-template">${template.name}</span>
            <span>·</span>
            <span>${Helpers.timeAgo(resume.updatedAt)}</span>
          </div>
        </div>
      </div>
    `;
  },

  init() {
    Navbar.init();

    // Search
    const searchInput = document.getElementById('resume-search');
    if (searchInput) {
      searchInput.addEventListener('input', Helpers.debounce(() => {
        this.searchQuery = searchInput.value;
        const pageContent = document.getElementById('page-content');
        pageContent.innerHTML = this.render();
        this.init();
      }, 300));
    }

    // Create new
    const createBtn = document.getElementById('create-resume-btn');
    const emptyCreateBtn = document.getElementById('empty-create-btn');
    const handleCreate = () => Dashboard.showTemplateSelector();
    if (createBtn) createBtn.addEventListener('click', handleCreate);
    if (emptyCreateBtn) emptyCreateBtn.addEventListener('click', handleCreate);

    // Card actions
    document.querySelectorAll('.card-edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => { e.stopPropagation(); Router.navigate('/builder/' + btn.dataset.id); });
    });
    document.querySelectorAll('.card-preview-btn').forEach(btn => {
      btn.addEventListener('click', (e) => { e.stopPropagation(); Router.navigate('/preview/' + btn.dataset.id); });
    });
    document.querySelectorAll('.card-download-btn').forEach(btn => {
      btn.addEventListener('click', (e) => { e.stopPropagation(); Router.navigate('/download/' + btn.dataset.id); });
    });
    document.querySelectorAll('.card-duplicate-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const newResume = ResumeContext.duplicateResume(btn.dataset.id);
        if (newResume) {
          Toast.success('Duplicated', 'Resume has been duplicated');
          Router.navigate('/my-resumes');
        }
      });
    });
    document.querySelectorAll('.card-delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const confirmed = await Modal.confirm({
          title: 'Delete Resume?',
          message: 'This action cannot be undone.',
          confirmText: 'Delete',
          type: 'danger',
          icon: '🗑'
        });
        if (confirmed) {
          ResumeContext.deleteResume(btn.dataset.id);
          Toast.success('Deleted', 'Resume removed');
          Router.navigate('/my-resumes');
        }
      });
    });

    // Card click → edit
    document.querySelectorAll('.resume-card').forEach(card => {
      card.addEventListener('click', () => {
        Router.navigate('/builder/' + card.dataset.resumeId);
      });
    });
  }
};
