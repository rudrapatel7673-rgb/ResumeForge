/* ============================================
   Resume Builder Page
   ============================================ */
const ResumeBuilder = {
  activeSection: 'personal',
  previewDevice: 'desktop',
  isSaving: false,

  sections: [
    { id: 'personal', icon: '👤', label: 'Personal Info' },
    { id: 'experience', icon: '💼', label: 'Experience' },
    { id: 'education', icon: '🎓', label: 'Education' },
    { id: 'skills', icon: '⚡', label: 'Skills' },
    { id: 'projects', icon: '🚀', label: 'Projects' },
    { id: 'template', icon: '🎨', label: 'Template' }
  ],

  render() {
    const pathParts = Router.currentPath.split('/');
    const resumeId = pathParts[2];
    
    if (!resumeId) {
      Router.navigate('/dashboard');
      return '';
    }

    const resume = ResumeContext.loadResume(resumeId);
    if (!resume) {
      Toast.error('Not Found', 'Resume not found');
      Router.navigate('/dashboard');
      return '';
    }

    return `
      ${Navbar.render()}
      <div style="margin-top: 70px;">
        <div class="builder-layout">
          <!-- Form Panel -->
          <div class="builder-form-panel" id="builder-form">
            <!-- Section Navigation -->
            <div class="builder-section-nav">
              ${this.sections.map(s => `
                <button class="builder-section-btn ${this.activeSection === s.id ? 'active' : ''}" data-section="${s.id}">
                  <span>${s.icon}</span>
                  <span>${s.label}</span>
                </button>
              `).join('')}
            </div>

            <!-- Section Content -->
            <div class="builder-section-content" id="section-content">
              ${this.renderSection()}
            </div>
          </div>

          <!-- Preview Panel -->
          <div class="builder-preview-panel">
            <div class="preview-controls">
              <div style="display:flex; align-items:center; gap: var(--space-3);">
                <div class="preview-device-toggle">
                  <button class="preview-device-btn ${this.previewDevice === 'desktop' ? 'active' : ''}" data-device="desktop" title="Desktop">🖥</button>
                  <button class="preview-device-btn ${this.previewDevice === 'tablet' ? 'active' : ''}" data-device="tablet" title="Tablet">📱</button>
                  <button class="preview-device-btn ${this.previewDevice === 'mobile' ? 'active' : ''}" data-device="mobile" title="Mobile">📲</button>
                </div>
                <div class="autosave-indicator" id="autosave-indicator">
                  <span class="autosave-dot"></span>
                  Saved
                </div>
              </div>
              <div style="display:flex; gap: var(--space-2);">
                <button class="btn btn-secondary btn-sm" onclick="Router.navigate('/preview/${resumeId}')">👁 Full Preview</button>
                <button class="btn btn-primary btn-sm" onclick="Router.navigate('/download/${resumeId}')">📥 Download</button>
              </div>
            </div>
            <div class="preview-container ${this.previewDevice}" id="resume-preview">
              ${ResumeTemplates.render(resume.template, resume)}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  renderSection() {
    const resume = ResumeContext.currentResume;
    if (!resume) return '';

    switch (this.activeSection) {
      case 'personal': return this.renderPersonalSection(resume);
      case 'experience': return this.renderExperienceSection(resume);
      case 'education': return this.renderEducationSection(resume);
      case 'skills': return this.renderSkillsSection(resume);
      case 'projects': return this.renderProjectsSection(resume);
      case 'template': return this.renderTemplateSection(resume);
      default: return '';
    }
  },

  renderPersonalSection(resume) {
    const p = resume.personal || {};
    return `
      <div class="builder-section-title">👤 Personal Information</div>

      <!-- Profile Picture Upload Row -->
      <div style="display: flex; align-items: center; gap: var(--space-4); margin-bottom: var(--space-6); background: rgba(255, 255, 255, 0.02); padding: var(--space-3); border-radius: 8px; border: 1px dashed rgba(255, 255, 255, 0.1);">
        <div id="photo-preview-circle" style="width: 60px; height: 60px; border-radius: 50%; background: ${p.photo ? `url('${p.photo}')` : 'linear-gradient(135deg, var(--primary-color), var(--accent-color))'}; background-size: cover; background-position: center; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px; font-weight: 700; border: 2px solid rgba(255,255,255,0.1); flex-shrink: 0;">
          ${p.photo ? '' : Helpers.getInitials(p.fullName || 'Your Name')}
        </div>
        <div style="flex-grow: 1;">
          <div style="font-size: var(--text-sm); font-weight: 600; margin-bottom: 4px;">Profile Photo</div>
          <div style="display: flex; gap: var(--space-2);">
            <button class="btn btn-primary btn-sm" id="btn-upload-photo" style="font-size: 11px; padding: 4px 10px; height: auto;">Choose Photo</button>
            ${p.photo ? `<button class="btn btn-ghost btn-sm" id="btn-remove-photo" style="font-size: 11px; padding: 4px 10px; color: #ff6b6b; height: auto;">Remove</button>` : ''}
          </div>
          <input type="file" id="input-profile-photo" accept="image/*" style="display: none;">
        </div>
      </div>

      <div class="form-group">
        <input type="text" class="form-input" id="field-fullName" placeholder=" " value="${Helpers.escapeHtml(p.fullName || '')}">
        <label class="form-label">Full Name</label>
      </div>
      <div class="form-group">
        <input type="text" class="form-input" id="field-jobTitle" placeholder=" " value="${Helpers.escapeHtml(p.jobTitle || '')}">
        <label class="form-label">Job Title</label>
      </div>
      <div class="builder-form-row">
        <div class="form-group">
          <input type="email" class="form-input" id="field-email" placeholder=" " value="${Helpers.escapeHtml(p.email || '')}">
          <label class="form-label">Email</label>
        </div>
        <div class="form-group">
          <input type="tel" class="form-input" id="field-phone" placeholder=" " value="${Helpers.escapeHtml(p.phone || '')}">
          <label class="form-label">Phone</label>
        </div>
      </div>
      <div class="form-group">
        <input type="text" class="form-input" id="field-location" placeholder=" " value="${Helpers.escapeHtml(p.location || '')}">
        <label class="form-label">Location</label>
      </div>
      <div class="builder-form-row">
        <div class="form-group">
          <input type="text" class="form-input" id="field-website" placeholder=" " value="${Helpers.escapeHtml(p.website || '')}">
          <label class="form-label">Website</label>
        </div>
        <div class="form-group">
          <input type="text" class="form-input" id="field-linkedin" placeholder=" " value="${Helpers.escapeHtml(p.linkedin || '')}">
          <label class="form-label">LinkedIn</label>
        </div>
      </div>
      <div class="form-group" style="margin-bottom: var(--space-2);">
        <textarea class="form-input form-textarea" id="field-summary" placeholder=" " rows="4">${Helpers.escapeHtml(p.summary || '')}</textarea>
        <label class="form-label">Professional Summary</label>
      </div>
      <button class="btn btn-secondary btn-sm" id="ai-improve-summary-btn" style="margin-bottom: var(--space-6); width: 100%;">✨ AI Improve Summary</button>
    `;
  },

  renderExperienceSection(resume) {
    const experiences = resume.experience || [];
    let items = '';

    experiences.forEach((exp, idx) => {
      items += `
        <div class="item-card" data-exp-id="${exp.id}">
          <div class="item-card-header">
            <div>
              <div class="item-card-title">${Helpers.escapeHtml(exp.title || 'New Position')}</div>
              <div class="item-card-subtitle">${Helpers.escapeHtml(exp.company || 'Company')}</div>
            </div>
            <div class="item-card-actions">
              <button class="btn btn-ghost btn-icon sm exp-edit-btn" data-idx="${idx}" title="Edit">✏️</button>
              <button class="btn btn-ghost btn-icon sm exp-delete-btn" data-id="${exp.id}" title="Delete">🗑</button>
            </div>
          </div>
        </div>
      `;
    });

    return `
      <div class="builder-section-title">💼 Experience</div>
      <div class="item-list" id="experience-list">
        ${items || '<p style="color: var(--text-tertiary); font-size: var(--text-sm); text-align:center; padding: var(--space-6);">No experience added yet</p>'}
      </div>
      <button class="add-item-btn" id="add-experience-btn">+ Add Experience</button>
      
      <div id="exp-edit-form" style="display:none; margin-top: var(--space-6); padding-top: var(--space-6); border-top: var(--glass-border);">
      </div>
    `;
  },

  renderExpEditForm(exp) {
    return `
      <div class="builder-section-title" style="font-size: var(--text-base);">✏️ Edit Experience</div>
      <div class="form-group">
        <input type="text" class="form-input exp-field" data-field="title" placeholder=" " value="${Helpers.escapeHtml(exp.title || '')}">
        <label class="form-label">Job Title</label>
      </div>
      <div class="builder-form-row">
        <div class="form-group">
          <input type="text" class="form-input exp-field" data-field="company" placeholder=" " value="${Helpers.escapeHtml(exp.company || '')}">
          <label class="form-label">Company</label>
        </div>
        <div class="form-group">
          <input type="text" class="form-input exp-field" data-field="location" placeholder=" " value="${Helpers.escapeHtml(exp.location || '')}">
          <label class="form-label">Location</label>
        </div>
      </div>
      <div class="builder-form-row">
        <div class="form-group">
          <input type="month" class="form-input has-value exp-field" data-field="startDate" value="${exp.startDate || ''}">
          <label class="form-label">Start Date</label>
        </div>
        <div class="form-group">
          <input type="month" class="form-input has-value exp-field" data-field="endDate" value="${exp.endDate || ''}" ${exp.current ? 'disabled' : ''}>
          <label class="form-label">End Date</label>
        </div>
      </div>
      <div style="margin-bottom: var(--space-4);">
        <label style="display:flex; align-items:center; gap: var(--space-2); font-size: var(--text-sm); color: var(--text-secondary); cursor:pointer;">
          <input type="checkbox" id="exp-current" ${exp.current ? 'checked' : ''}> Currently working here
        </label>
      </div>
      <div class="form-group" style="margin-bottom: var(--space-2);">
        <textarea class="form-input form-textarea exp-field" data-field="description" id="exp-desc-input" placeholder=" " rows="4">${Helpers.escapeHtml(exp.description || '')}</textarea>
        <label class="form-label">Description (use | to separate bullet points)</label>
      </div>
      <button class="btn btn-secondary btn-sm" id="ai-improve-exp-btn" style="margin-bottom: var(--space-4); width: 100%;">✨ AI Improve Description</button>
      <button class="btn btn-secondary btn-sm" id="close-exp-edit">Done</button>
    `;
  },

  renderEducationSection(resume) {
    const education = resume.education || [];
    let items = '';

    education.forEach((edu, idx) => {
      items += `
        <div class="item-card" data-edu-id="${edu.id}">
          <div class="item-card-header">
            <div>
              <div class="item-card-title">${Helpers.escapeHtml(edu.degree || 'New Degree')}</div>
              <div class="item-card-subtitle">${Helpers.escapeHtml(edu.school || 'School')}</div>
            </div>
            <div class="item-card-actions">
              <button class="btn btn-ghost btn-icon sm edu-edit-btn" data-idx="${idx}" title="Edit">✏️</button>
              <button class="btn btn-ghost btn-icon sm edu-delete-btn" data-id="${edu.id}" title="Delete">🗑</button>
            </div>
          </div>
        </div>
      `;
    });

    return `
      <div class="builder-section-title">🎓 Education</div>
      <div class="item-list" id="education-list">
        ${items || '<p style="color: var(--text-tertiary); font-size: var(--text-sm); text-align:center; padding: var(--space-6);">No education added yet</p>'}
      </div>
      <button class="add-item-btn" id="add-education-btn">+ Add Education</button>
      <div id="edu-edit-form" style="display:none; margin-top: var(--space-6); padding-top: var(--space-6); border-top: var(--glass-border);"></div>
    `;
  },

  renderEduEditForm(edu) {
    return `
      <div class="builder-section-title" style="font-size: var(--text-base);">✏️ Edit Education</div>
      <div class="form-group">
        <input type="text" class="form-input edu-field" data-field="degree" placeholder=" " value="${Helpers.escapeHtml(edu.degree || '')}">
        <label class="form-label">Degree</label>
      </div>
      <div class="builder-form-row">
        <div class="form-group">
          <input type="text" class="form-input edu-field" data-field="school" placeholder=" " value="${Helpers.escapeHtml(edu.school || '')}">
          <label class="form-label">School / University</label>
        </div>
        <div class="form-group">
          <input type="text" class="form-input edu-field" data-field="location" placeholder=" " value="${Helpers.escapeHtml(edu.location || '')}">
          <label class="form-label">Location</label>
        </div>
      </div>
      <div class="builder-form-row">
        <div class="form-group">
          <input type="month" class="form-input has-value edu-field" data-field="startDate" value="${edu.startDate || ''}">
          <label class="form-label">Start Date</label>
        </div>
        <div class="form-group">
          <input type="month" class="form-input has-value edu-field" data-field="endDate" value="${edu.endDate || ''}">
          <label class="form-label">End Date</label>
        </div>
      </div>
      <div class="form-group">
        <textarea class="form-input form-textarea edu-field" data-field="description" placeholder=" " rows="2">${Helpers.escapeHtml(edu.description || '')}</textarea>
        <label class="form-label">Additional Info (GPA, honors, etc.)</label>
      </div>
      <button class="btn btn-secondary btn-sm" id="close-edu-edit">Done</button>
    `;
  },

  renderSkillsSection(resume) {
    const skills = resume.skills || [];
    return `
      <div class="builder-section-title">⚡ Skills</div>
      <div class="tag-input-wrapper" id="skills-wrapper">
        ${skills.map(s => `
          <span class="tag">
            ${Helpers.escapeHtml(s)}
            <button class="tag-remove" data-skill="${Helpers.escapeHtml(s)}">✕</button>
          </span>
        `).join('')}
        <input type="text" class="tag-input" id="skill-input" placeholder="Type a skill and press Enter...">
      </div>
      <p style="font-size: var(--text-xs); color: var(--text-tertiary); margin-top: var(--space-2);">
        Press Enter or comma to add a skill. Click ✕ to remove.
      </p>
    `;
  },

  renderProjectsSection(resume) {
    const projects = resume.projects || [];
    let items = '';

    projects.forEach((proj, idx) => {
      items += `
        <div class="item-card" data-proj-id="${proj.id}">
          <div class="item-card-header">
            <div>
              <div class="item-card-title">${Helpers.escapeHtml(proj.name || 'New Project')}</div>
              <div class="item-card-subtitle">${Helpers.escapeHtml(proj.technologies || 'Technologies')}</div>
            </div>
            <div class="item-card-actions">
              <button class="btn btn-ghost btn-icon sm proj-edit-btn" data-idx="${idx}" title="Edit">✏️</button>
              <button class="btn btn-ghost btn-icon sm proj-delete-btn" data-id="${proj.id}" title="Delete">🗑</button>
            </div>
          </div>
        </div>
      `;
    });

    return `
      <div class="builder-section-title">🚀 Projects</div>
      <div class="item-list" id="projects-list">
        ${items || '<p style="color: var(--text-tertiary); font-size: var(--text-sm); text-align:center; padding: var(--space-6);">No projects added yet</p>'}
      </div>
      <button class="add-item-btn" id="add-project-btn">+ Add Project</button>
      <div id="proj-edit-form" style="display:none; margin-top: var(--space-6); padding-top: var(--space-6); border-top: var(--glass-border);"></div>
    `;
  },

  renderProjEditForm(proj) {
    return `
      <div class="builder-section-title" style="font-size: var(--text-base);">✏️ Edit Project</div>
      <div class="form-group">
        <input type="text" class="form-input proj-field" data-field="name" placeholder=" " value="${Helpers.escapeHtml(proj.name || '')}">
        <label class="form-label">Project Name</label>
      </div>
      <div class="form-group" style="margin-bottom: var(--space-2);">
        <textarea class="form-input form-textarea proj-field" data-field="description" id="proj-desc-input" placeholder=" " rows="3">${Helpers.escapeHtml(proj.description || '')}</textarea>
        <label class="form-label">Description</label>
      </div>
      <button class="btn btn-secondary btn-sm" id="ai-improve-proj-btn" style="margin-bottom: var(--space-4); width: 100%;">✨ AI Improve Description</button>
      <div class="builder-form-row">
        <div class="form-group">
          <input type="text" class="form-input proj-field" data-field="technologies" placeholder=" " value="${Helpers.escapeHtml(proj.technologies || '')}">
          <label class="form-label">Technologies</label>
        </div>
        <div class="form-group">
          <input type="text" class="form-input proj-field" data-field="link" placeholder=" " value="${Helpers.escapeHtml(proj.link || '')}">
          <label class="form-label">Link</label>
        </div>
      </div>
      <button class="btn btn-secondary btn-sm" id="close-proj-edit">Done</button>
    `;
  },

  renderTemplateSection(resume) {
    const templates = TemplateContext.getAllTemplates();
    return `
      <div class="builder-section-title">🎨 Choose Template</div>
      <div class="template-grid">
        ${templates.map(t => TemplateCard.render(t, resume.template === t.id, resume)).join('')}
      </div>
    `;
  },

  updatePreview() {
    const preview = document.getElementById('resume-preview');
    const resume = ResumeContext.currentResume;
    if (preview && resume) {
      preview.innerHTML = ResumeTemplates.render(resume.template, resume);
    }
    // Show autosave indicator
    const indicator = document.getElementById('autosave-indicator');
    if (indicator) {
      indicator.querySelector('.autosave-dot').classList.add('saving');
      indicator.querySelector('.autosave-dot').nextElementSibling?.remove;
      const textNode = indicator.childNodes[indicator.childNodes.length - 1];
      if (textNode.nodeType === 3) textNode.textContent = ' Saving...';
      setTimeout(() => {
        indicator.querySelector('.autosave-dot').classList.remove('saving');
        if (textNode.nodeType === 3) textNode.textContent = ' Saved';
      }, 800);
    }
  },

  refreshSection() {
    const content = document.getElementById('section-content');
    if (content) {
      content.innerHTML = this.renderSection();
      this.initSectionHandlers();
    }
  },

  init() {
    Navbar.init();

    // Section navigation
    document.querySelectorAll('.builder-section-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeSection = btn.dataset.section;
        document.querySelectorAll('.builder-section-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.refreshSection();
      });
    });

    // Device toggle
    document.querySelectorAll('.preview-device-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.previewDevice = btn.dataset.device;
        document.querySelectorAll('.preview-device-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const container = document.getElementById('resume-preview');
        container.className = `preview-container ${this.previewDevice}`;
      });
    });

    this.initSectionHandlers();
  },

  initSectionHandlers() {
    const resume = ResumeContext.currentResume;
    if (!resume) return;

    const debouncedUpdate = Helpers.debounce(() => this.updatePreview(), 300);

    if (this.activeSection === 'personal') {
      const fields = ['fullName', 'jobTitle', 'email', 'phone', 'location', 'website', 'linkedin', 'summary'];
      fields.forEach(field => {
        const el = document.getElementById('field-' + field);
        if (el) {
          el.addEventListener('input', () => {
            ResumeContext.updatePersonal(field, el.value);
            debouncedUpdate();
          });
        }
      });

      // Photo upload listeners
      const uploadBtn = document.getElementById('btn-upload-photo');
      const photoInput = document.getElementById('input-profile-photo');
      const removeBtn = document.getElementById('btn-remove-photo');

      if (uploadBtn && photoInput) {
        uploadBtn.addEventListener('click', () => {
          photoInput.click();
        });

        photoInput.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (file) {
            if (file.size > 2 * 1024 * 1024) {
              Toast.error('File size error', 'Photo must be smaller than 2MB.');
              return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
              const base64Url = event.target.result;
              ResumeContext.updatePersonal('photo', base64Url);
              this.refreshSection();
              this.updatePreview();
              Toast.success('Photo Uploaded', 'Your profile picture has been updated.');
            };
            reader.readAsDataURL(file);
          }
        });
      }

      if (removeBtn) {
        removeBtn.addEventListener('click', () => {
          ResumeContext.updatePersonal('photo', '');
          this.refreshSection();
          this.updatePreview();
          Toast.info('Photo Removed', 'Profile picture has been removed.');
        });
      }

      const aiBtn = document.getElementById('ai-improve-summary-btn');
      if (aiBtn) {
        aiBtn.addEventListener('click', () => {
          const summaryEl = document.getElementById('field-summary');
          this.improveWithAI(summaryEl.value, 'summary', summaryEl, (newVal) => {
            ResumeContext.updatePersonal('summary', newVal);
            this.updatePreview();
          });
        });
      }
    }

    if (this.activeSection === 'experience') {
      // Add experience
      const addBtn = document.getElementById('add-experience-btn');
      if (addBtn) {
        addBtn.addEventListener('click', () => {
          const item = ResumeContext.addExperience();
          this.refreshSection();
          this.showExpEdit(resume.experience.length - 1);
          this.updatePreview();
        });
      }

      // Edit buttons
      document.querySelectorAll('.exp-edit-btn').forEach(btn => {
        btn.addEventListener('click', () => this.showExpEdit(parseInt(btn.dataset.idx)));
      });

      // Delete buttons
      document.querySelectorAll('.exp-delete-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const confirmed = await Modal.confirm({
            title: 'Remove Experience?',
            message: 'This entry will be permanently removed.',
            confirmText: 'Remove',
            type: 'danger',
            icon: '🗑'
          });
          if (confirmed) {
            ResumeContext.removeExperience(btn.dataset.id);
            this.refreshSection();
            this.updatePreview();
          }
        });
      });
    }

    if (this.activeSection === 'education') {
      const addBtn = document.getElementById('add-education-btn');
      if (addBtn) {
        addBtn.addEventListener('click', () => {
          ResumeContext.addEducation();
          this.refreshSection();
          this.showEduEdit(resume.education.length - 1);
          this.updatePreview();
        });
      }

      document.querySelectorAll('.edu-edit-btn').forEach(btn => {
        btn.addEventListener('click', () => this.showEduEdit(parseInt(btn.dataset.idx)));
      });

      document.querySelectorAll('.edu-delete-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const confirmed = await Modal.confirm({
            title: 'Remove Education?',
            message: 'This entry will be permanently removed.',
            confirmText: 'Remove',
            type: 'danger',
            icon: '🗑'
          });
          if (confirmed) {
            ResumeContext.removeEducation(btn.dataset.id);
            this.refreshSection();
            this.updatePreview();
          }
        });
      });
    }

    if (this.activeSection === 'skills') {
      const skillInput = document.getElementById('skill-input');
      if (skillInput) {
        skillInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const val = skillInput.value.replace(',', '').trim();
            if (val) {
              ResumeContext.addSkill(val);
              skillInput.value = '';
              this.refreshSection();
              this.updatePreview();
            }
          }
        });
      }

      document.querySelectorAll('.tag-remove').forEach(btn => {
        btn.addEventListener('click', () => {
          ResumeContext.removeSkill(btn.dataset.skill);
          this.refreshSection();
          this.updatePreview();
        });
      });
    }

    if (this.activeSection === 'projects') {
      const addBtn = document.getElementById('add-project-btn');
      if (addBtn) {
        addBtn.addEventListener('click', () => {
          ResumeContext.addProject();
          this.refreshSection();
          this.showProjEdit(resume.projects.length - 1);
          this.updatePreview();
        });
      }

      document.querySelectorAll('.proj-edit-btn').forEach(btn => {
        btn.addEventListener('click', () => this.showProjEdit(parseInt(btn.dataset.idx)));
      });

      document.querySelectorAll('.proj-delete-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const confirmed = await Modal.confirm({
            title: 'Remove Project?',
            message: 'This project will be permanently removed.',
            confirmText: 'Remove',
            type: 'danger',
            icon: '🗑'
          });
          if (confirmed) {
            ResumeContext.removeProject(btn.dataset.id);
            this.refreshSection();
            this.updatePreview();
          }
        });
      });
    }

    if (this.activeSection === 'template') {
      document.querySelectorAll('.template-card').forEach(card => {
        card.addEventListener('click', () => {
          ResumeContext.setTemplate(card.dataset.templateId);
          this.refreshSection();
          this.updatePreview();
          Toast.success('Template Changed', `Switched to ${TemplateContext.getTemplate(card.dataset.templateId)?.name || 'template'}`);
        });
      });
    }
  },

  showExpEdit(idx) {
    const resume = ResumeContext.currentResume;
    const exp = resume.experience[idx];
    if (!exp) return;

    const form = document.getElementById('exp-edit-form');
    if (form) {
      form.style.display = 'block';
      form.innerHTML = this.renderExpEditForm(exp);

      const debouncedUpdate = Helpers.debounce(() => this.updatePreview(), 300);

      form.querySelectorAll('.exp-field').forEach(field => {
        field.addEventListener('input', () => {
          ResumeContext.updateExperience(exp.id, field.dataset.field, field.value);
          debouncedUpdate();
        });
      });

      const currentCheckbox = document.getElementById('exp-current');
      if (currentCheckbox) {
        currentCheckbox.addEventListener('change', () => {
          ResumeContext.updateExperience(exp.id, 'current', currentCheckbox.checked);
          const endDateField = form.querySelector('[data-field="endDate"]');
          if (endDateField) endDateField.disabled = currentCheckbox.checked;
          debouncedUpdate();
        });
      }

      const aiBtn = document.getElementById('ai-improve-exp-btn');
      if (aiBtn) {
        aiBtn.addEventListener('click', () => {
          const descEl = document.getElementById('exp-desc-input');
          this.improveWithAI(descEl.value, 'experience', descEl, (newVal) => {
            ResumeContext.updateExperience(exp.id, 'description', newVal);
            this.updatePreview();
          });
        });
      }

      document.getElementById('close-exp-edit').addEventListener('click', () => {
        form.style.display = 'none';
        this.refreshSection();
      });
    }
  },

  showEduEdit(idx) {
    const resume = ResumeContext.currentResume;
    const edu = resume.education[idx];
    if (!edu) return;

    const form = document.getElementById('edu-edit-form');
    if (form) {
      form.style.display = 'block';
      form.innerHTML = this.renderEduEditForm(edu);

      const debouncedUpdate = Helpers.debounce(() => this.updatePreview(), 300);

      form.querySelectorAll('.edu-field').forEach(field => {
        field.addEventListener('input', () => {
          ResumeContext.updateEducation(edu.id, field.dataset.field, field.value);
          debouncedUpdate();
        });
      });

      document.getElementById('close-edu-edit').addEventListener('click', () => {
        form.style.display = 'none';
        this.refreshSection();
      });
    }
  },

  showProjEdit(idx) {
    const resume = ResumeContext.currentResume;
    const proj = resume.projects[idx];
    if (!proj) return;

    const form = document.getElementById('proj-edit-form');
    if (form) {
      form.style.display = 'block';
      form.innerHTML = this.renderProjEditForm(proj);

      const debouncedUpdate = Helpers.debounce(() => this.updatePreview(), 300);

      form.querySelectorAll('.proj-field').forEach(field => {
        field.addEventListener('input', () => {
          ResumeContext.updateProject(proj.id, field.dataset.field, field.value);
          debouncedUpdate();
        });
      });

      const aiBtn = document.getElementById('ai-improve-proj-btn');
      if (aiBtn) {
        aiBtn.addEventListener('click', () => {
          const descEl = document.getElementById('proj-desc-input');
          this.improveWithAI(descEl.value, 'project', descEl, (newVal) => {
            ResumeContext.updateProject(proj.id, 'description', newVal);
            this.updatePreview();
          });
        });
      }

      document.getElementById('close-proj-edit').addEventListener('click', () => {
        form.style.display = 'none';
        this.refreshSection();
      });
    }
  },

  improveWithAI(prompt, context, targetInputEl, onSaveCallback) {
    if (!prompt || !prompt.trim()) {
      Toast.warning('Empty Content', 'Please type some text first for the AI to improve.');
      return;
    }
    
    const activeBtn = document.activeElement;
    const originalHtml = activeBtn ? activeBtn.innerHTML : '';
    if (activeBtn) {
      activeBtn.innerHTML = '<span class="spinner"></span> AI Writing...';
      activeBtn.disabled = true;
    }
    
    fetch('api/ai-generate.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt, context })
    })
    .then(res => res.json())
    .then(result => {
      if (!result.success) {
        throw new Error(result.message || 'AI generation failed.');
      }
      
      targetInputEl.value = result.text;
      targetInputEl.dispatchEvent(new Event('input'));
      
      if (result.warning) {
        Toast.warning('Mock AI Fallback', result.warning);
      } else {
        Toast.success('AI Suggestion Applied', 'Your content was improved by Gemini AI!');
      }
      
      if (onSaveCallback) onSaveCallback(result.text);
    })
    .catch(err => {
      Toast.error('AI Error', err.message || 'Could not improve text.');
    })
    .finally(() => {
      if (activeBtn) {
        activeBtn.innerHTML = originalHtml;
        activeBtn.disabled = false;
      }
    });
  }
};
