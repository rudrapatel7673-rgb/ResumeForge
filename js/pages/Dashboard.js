/* ============================================
   Dashboard Page
   ============================================ */
const Dashboard = {
  render() {
    const user = AuthContext.user;
    const resumes = ResumeContext.getAllResumes();
    const userName = user?.name || user?.email?.split('@')[0] || 'User';

    // Stats
    const totalResumes = resumes.length;
    const lastEdited = resumes.length ? Helpers.timeAgo(resumes[0].updatedAt) : 'N/A';
    const templates = new Set(resumes.map(r => r.template)).size;

    return `
      ${Navbar.render()}
      <div class="main-with-sidebar" style="margin-top:70px;">
        <div class="dashboard-page fade-in">
          <!-- Welcome -->
          <div class="dashboard-welcome">
            <h1>Welcome back, <span class="text-gradient">${Helpers.escapeHtml(userName)}</span> 👋</h1>
            <p>Create, edit, and manage your professional resumes.</p>
          </div>

          <!-- Stats -->
          <div class="dashboard-stats">
            <div class="stat-card">
              <div class="stat-card-icon" style="background: rgba(108, 99, 255, 0.12); color: #6C63FF;">📄</div>
              <div class="stat-card-value">${totalResumes}</div>
              <div class="stat-card-label">Total Resumes</div>
            </div>
            <div class="stat-card">
              <div class="stat-card-icon" style="background: rgba(0, 212, 170, 0.12); color: #00D4AA;">🕐</div>
              <div class="stat-card-value" style="font-size: var(--text-lg);">${lastEdited}</div>
              <div class="stat-card-label">Last Edited</div>
            </div>
            <div class="stat-card">
              <div class="stat-card-icon" style="background: rgba(255, 107, 157, 0.12); color: #FF6B9D;">🎨</div>
              <div class="stat-card-value">${templates}</div>
              <div class="stat-card-label">Templates Used</div>
            </div>
            <div class="stat-card">
              <div class="stat-card-icon" style="background: rgba(255, 179, 71, 0.12); color: #FFB347;">⭐</div>
              <div class="stat-card-value">4</div>
              <div class="stat-card-label">Available Templates</div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="quick-actions">
            <div class="quick-action-card" id="quick-create-new">
              <div class="quick-action-icon">✨</div>
              <h3>Create New Resume</h3>
              <p>Start from a premium template</p>
            </div>
            <div class="quick-action-card" id="quick-browse-templates">
              <div class="quick-action-icon">🎨</div>
              <h3>Browse Templates</h3>
              <p>Explore our template collection</p>
            </div>
            <div class="quick-action-card" onclick="Router.navigate('/my-resumes')">
              <div class="quick-action-icon">📂</div>
              <h3>My Resumes</h3>
              <p>View all saved resumes</p>
            </div>
          </div>

          <!-- Recent Resumes -->
          <div>
            <h2 style="font-size: var(--text-xl); margin-bottom: var(--space-6); display: flex; align-items: center; gap: var(--space-3);">
              📄 Recent Resumes
            </h2>
            <div class="resume-grid" id="resume-grid">
              <div class="create-new-card" id="create-new-card">
                <div class="create-new-icon">+</div>
                <h3>Create New</h3>
                <p>Start building your resume</p>
              </div>
              ${resumes.slice(0, 5).map(r => this.renderResumeCard(r)).join('')}
            </div>
          </div>
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
              <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); Router.navigate('/builder/${resume.id}')">✏️ Edit</button>
              <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); Router.navigate('/preview/${resume.id}')">👁 View</button>
              <button class="btn btn-secondary btn-sm resume-delete-btn" data-id="${resume.id}" onclick="event.stopPropagation();">🗑</button>
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

    // Create new resume
    const createNew = document.getElementById('create-new-card');
    const quickCreate = document.getElementById('quick-create-new');
    
    const handleCreate = () => {
      this.showCreateOptions();
    };

    if (createNew) createNew.addEventListener('click', handleCreate);
    if (quickCreate) quickCreate.addEventListener('click', handleCreate);

    // Browse templates
    const browseTemplates = document.getElementById('quick-browse-templates');
    if (browseTemplates) {
      browseTemplates.addEventListener('click', () => this.showTemplateSelector());
    }

    // Resume card click → edit
    document.querySelectorAll('.resume-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.resumeId;
        if (id) Router.navigate('/builder/' + id);
      });
    });

    // Delete buttons
    document.querySelectorAll('.resume-delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const confirmed = await Modal.confirm({
          title: 'Delete Resume?',
          message: 'This action cannot be undone. Your resume data will be permanently removed.',
          confirmText: 'Delete',
          type: 'danger',
          icon: '🗑'
        });
        if (confirmed) {
          ResumeContext.deleteResume(id);
          Toast.success('Deleted', 'Resume has been deleted');
          Router.navigate('/dashboard');
        }
      });
    });
  },

  showCreateOptions() {
    const content = `
      <div class="wizard-choice-layout">
        <div class="wizard-choice-option recommended" id="option-ai-wizard">
          <div class="wizard-choice-icon">✨</div>
          <div class="wizard-choice-text">
            <h4>Build with AI Wizard <span class="badge-recommended">Recommended</span></h4>
            <p>Select your career stage and answer simple questions. Gemini AI will generate a complete, professional, and ATS-friendly resume for you.</p>
          </div>
        </div>
        <div class="wizard-choice-option" id="option-template">
          <div class="wizard-choice-icon">🎨</div>
          <div class="wizard-choice-text">
            <h4>Start from Template</h4>
            <p>Select a design template to start building manually. Ideal if you already have your resume text ready.</p>
          </div>
        </div>
      </div>
    `;

    const modal = Modal.show({
      title: '🚀 Create New Resume',
      content,
      size: 'default'
    });

    modal.element.querySelector('#option-ai-wizard').addEventListener('click', () => {
      modal.close();
      Router.navigate('/ai-wizard');
    });

    modal.element.querySelector('#option-template').addEventListener('click', () => {
      modal.close();
      this.showTemplateSelector();
    });
  },

  showTemplateSelector() {
    const templates = TemplateContext.getAllTemplates();
    const sample = Helpers.getSampleResumeData();
    
    const content = `
      <p style="color: var(--text-secondary); font-size: var(--text-sm); margin-bottom: var(--space-4);">Choose a template to get started. You can change it anytime.</p>
      <div class="template-grid">
        ${templates.map(t => TemplateCard.render(t, false, sample)).join('')}
      </div>
    `;

    const modal = Modal.show({
      title: '🎨 Choose a Template',
      content,
      size: 'lg'
    });

    modal.element.querySelectorAll('.template-card').forEach(card => {
      card.addEventListener('click', () => {
        const templateId = card.dataset.templateId;
        const resume = ResumeContext.createResume(templateId);
        modal.close();
        Toast.success('Resume Created', 'Start editing your new resume!');
        Router.navigate('/builder/' + resume.id);
      });
    });
  }
};
