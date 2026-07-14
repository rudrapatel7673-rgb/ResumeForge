/* ==========================================================================
   AI Resume Generator Wizard Component
   ========================================================================== */

const AiWizard = {
  currentStep: 1,
  tempResume: null,
  stage: '', // student, entry, experienced, switcher, freelancer
  personal: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    jobTitle: ''
  },
  focus: {},
  template: 'modern',
  isGenerating: false,
  loadingInterval: null,

  reset() {
    this.currentStep = 1;
    this.stage = '';
    const user = AuthContext.user || {};
    this.personal = {
      fullName: user.name || '',
      email: user.email || '',
      phone: '',
      location: '',
      jobTitle: ''
    };
    this.focus = {};
    this.template = 'modern';
    this.tempResume = null;
    this.isGenerating = false;
    if (this.loadingInterval) {
      clearInterval(this.loadingInterval);
      this.loadingInterval = null;
    }
  },

  render() {
    // If it's a fresh load or entering step 1 with empty stage, auto-reset
    if (this.currentStep === 1 && !this.stage) {
      this.reset();
    }

    return `
      ${Navbar.render()}
      <div style="margin-top: 70px;">
        <div class="wizard-layout fade-in">
          <!-- Step Tracker -->
          ${this.isGenerating ? '' : this.renderTracker()}

          <!-- Wizard Card -->
          <div class="wizard-card">
            ${this.isGenerating ? this.renderLoadingScreen() : this.renderStepContent()}
          </div>
        </div>
      </div>
    `;
  },

  renderTracker() {
    const steps = [
      { num: 1, label: 'Career Stage' },
      { num: 2, label: 'Basic Info' },
      { num: 3, label: 'Focus Details' },
      { num: 4, label: 'Template' }
    ];

    const progressWidth = ((this.currentStep - 1) / (steps.length - 1)) * 100;

    return `
      <div class="wizard-tracker">
        <div class="wizard-progress-bar-bg"></div>
        <div class="wizard-progress-bar-fill" style="width: ${progressWidth}%"></div>
        ${steps.map(s => {
          let stateClass = '';
          if (this.currentStep === s.num) stateClass = 'active';
          else if (this.currentStep > s.num) stateClass = 'completed';
          
          return `
            <div class="wizard-tracker-step ${stateClass}">
              <div class="wizard-step-node">
                ${this.currentStep > s.num ? '✓' : s.num}
              </div>
              <div class="wizard-step-label">${s.label}</div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  renderStepContent() {
    switch (this.currentStep) {
      case 1: return this.renderStep1();
      case 2: return this.renderStep2();
      case 3: return this.renderStep3();
      case 4: return this.renderStep4();
      default: return '';
    }
  },

  renderStep1() {
    const stages = [
      { id: 'student', icon: '🎓', title: 'Student / Intern', desc: 'Currently studying or seeking internships. No core industry work experience yet.' },
      { id: 'entry', icon: '🌟', title: 'Fresher / Entry-Level', desc: 'Recently graduated or starting your career. Less than 2 years of experience.' },
      { id: 'experienced', icon: '💼', title: 'Experienced Professional', desc: 'Established in your career with 2+ years of professional experience.' },
      { id: 'switcher', icon: '🔄', title: 'Career Switcher', desc: 'Transitioning to a new field or industry. Transferring skills.' },
      { id: 'freelancer', icon: '🚀', title: 'Freelancer / Contractor', desc: 'Self-employed, project-based worker or independent consultant.' }
    ];

    return `
      <div class="wizard-form-step">
        <div class="wizard-card-header">
          <h2>Select Career Stage</h2>
          <p>This helps the AI determine which sections to prioritize and tailor questions for.</p>
        </div>

        <div class="stage-grid">
          ${stages.map(st => `
            <div class="stage-card ${this.stage === st.id ? 'selected' : ''}" data-stage="${st.id}">
              <div class="stage-card-icon">${st.icon}</div>
              <h3>${st.title}</h3>
              <p>${st.desc}</p>
            </div>
          `).join('')}
        </div>

        <div class="wizard-footer" style="justify-content: flex-end;">
          <button class="btn btn-primary" id="btn-next" ${!this.stage ? 'disabled' : ''}>Continue →</button>
        </div>
      </div>
    `;
  },

  renderStep2() {
    return `
      <div class="wizard-form-step">
        <div class="wizard-card-header">
          <h2>Basic Details</h2>
          <p>These details will appear in the contact information section of your resume.</p>
        </div>

        <div style="display:flex; flex-direction:column; gap: var(--space-4);">
          <div class="form-group">
            <input type="text" class="form-input" id="wizard-fullName" placeholder=" " value="${Helpers.escapeHtml(this.personal.fullName)}">
            <label class="form-label">Full Name</label>
          </div>

          <div class="form-group">
            <input type="text" class="form-input" id="wizard-jobTitle" placeholder=" " value="${Helpers.escapeHtml(this.personal.jobTitle)}">
            <label class="form-label">Target Job Title (e.g. Junior Web Developer, Product Manager)</label>
          </div>

          <div class="form-group">
            <input type="email" class="form-input" id="wizard-email" placeholder=" " value="${Helpers.escapeHtml(this.personal.email)}">
            <label class="form-label">Email Address</label>
          </div>

          <div class="builder-form-row">
            <div class="form-group">
              <input type="tel" class="form-input" id="wizard-phone" placeholder=" " value="${Helpers.escapeHtml(this.personal.phone)}">
              <label class="form-label">Phone Number</label>
            </div>
            <div class="form-group">
              <input type="text" class="form-input" id="wizard-location" placeholder=" " value="${Helpers.escapeHtml(this.personal.location)}">
              <label class="form-label">Location (City, State / Country)</label>
            </div>
          </div>
        </div>

        <div class="wizard-footer">
          <button class="btn btn-secondary" id="btn-back">← Back</button>
          <button class="btn btn-primary" id="btn-next">Continue →</button>
        </div>
      </div>
    `;
  },

  renderStep3() {
    let fieldsHtml = '';

    switch (this.stage) {
      case 'student':
        fieldsHtml = `
          <div class="form-group">
            <input type="text" class="form-input focus-field" data-field="school" placeholder=" " value="${Helpers.escapeHtml(this.focus.school || '')}">
            <label class="form-label">University / School Name</label>
          </div>
          <div class="builder-form-row">
            <div class="form-group">
              <input type="text" class="form-input focus-field" data-field="degree" placeholder=" " value="${Helpers.escapeHtml(this.focus.degree || '')}">
              <label class="form-label">Degree (e.g. B.S. in Computer Science)</label>
            </div>
            <div class="form-group">
              <input type="number" class="form-input focus-field" data-field="gradYear" placeholder=" " value="${Helpers.escapeHtml(this.focus.gradYear || '2026')}">
              <label class="form-label">Graduation Year</label>
            </div>
          </div>
          <div class="form-group">
            <input type="text" class="form-input focus-field" data-field="projName" placeholder=" " value="${Helpers.escapeHtml(this.focus.projName || '')}">
            <label class="form-label">Key Academic / Side Project Name</label>
          </div>
          <div class="form-group">
            <textarea class="form-input form-textarea focus-field" data-field="projDesc" placeholder=" " rows="3">${Helpers.escapeHtml(this.focus.projDesc || '')}</textarea>
            <label class="form-label">What did you build or achieve in this project?</label>
          </div>
          <div class="form-group">
            <input type="text" class="form-input focus-field" data-field="skills" placeholder=" " value="${Helpers.escapeHtml(this.focus.skills || '')}">
            <label class="form-label">Key Skills (comma separated, e.g. Python, SQL, Git)</label>
          </div>
        `;
        break;

      case 'entry':
        fieldsHtml = `
          <div class="form-group">
            <input type="text" class="form-input focus-field" data-field="school" placeholder=" " value="${Helpers.escapeHtml(this.focus.school || '')}">
            <label class="form-label">College / University Name</label>
          </div>
          <div class="builder-form-row">
            <div class="form-group">
              <input type="text" class="form-input focus-field" data-field="degree" placeholder=" " value="${Helpers.escapeHtml(this.focus.degree || '')}">
              <label class="form-label">Degree / Major</label>
            </div>
            <div class="form-group">
              <input type="number" class="form-input focus-field" data-field="gradYear" placeholder=" " value="${Helpers.escapeHtml(this.focus.gradYear || '2025')}">
              <label class="form-label">Graduation Year</label>
            </div>
          </div>
          <div class="builder-form-row">
            <div class="form-group">
              <input type="text" class="form-input focus-field" data-field="internCompany" placeholder=" " value="${Helpers.escapeHtml(this.focus.internCompany || '')}">
              <label class="form-label">Internship / Role Company</label>
            </div>
            <div class="form-group">
              <input type="text" class="form-input focus-field" data-field="internRole" placeholder=" " value="${Helpers.escapeHtml(this.focus.internRole || '')}">
              <label class="form-label">Internship / Job Title</label>
            </div>
          </div>
          <div class="form-group">
            <textarea class="form-input form-textarea focus-field" data-field="internDesc" placeholder=" " rows="3">${Helpers.escapeHtml(this.focus.internDesc || '')}</textarea>
            <label class="form-label">Summarize your key contribution during this internship or project</label>
          </div>
          <div class="form-group">
            <input type="text" class="form-input focus-field" data-field="skills" placeholder=" " value="${Helpers.escapeHtml(this.focus.skills || '')}">
            <label class="form-label">Core Skills (comma separated)</label>
          </div>
        `;
        break;

      case 'experienced':
        fieldsHtml = `
          <div class="builder-form-row">
            <div class="form-group">
              <input type="text" class="form-input focus-field" data-field="company" placeholder=" " value="${Helpers.escapeHtml(this.focus.company || '')}">
              <label class="form-label">Most Recent Company Name</label>
            </div>
            <div class="form-group">
              <input type="text" class="form-input focus-field" data-field="role" placeholder=" " value="${Helpers.escapeHtml(this.focus.role || '')}">
              <label class="form-label">Recent Job Title</label>
            </div>
          </div>
          <div class="form-group">
            <textarea class="form-input form-textarea focus-field" data-field="desc" placeholder=" " rows="4">${Helpers.escapeHtml(this.focus.desc || '')}</textarea>
            <label class="form-label">Describe your core accomplishments and tasks (AI will format and optimize this)</label>
          </div>
          <div class="form-group">
            <input type="text" class="form-input focus-field" data-field="skills" placeholder=" " value="${Helpers.escapeHtml(this.focus.skills || '')}">
            <label class="form-label">Core Professional Skills (comma separated, e.g. React, Agile, AWS)</label>
          </div>
        `;
        break;

      case 'switcher':
        fieldsHtml = `
          <div class="builder-form-row">
            <div class="form-group">
              <input type="text" class="form-input focus-field" data-field="prevRole" placeholder=" " value="${Helpers.escapeHtml(this.focus.prevRole || '')}">
              <label class="form-label">Previous Job Title</label>
            </div>
            <div class="form-group">
              <input type="text" class="form-input focus-field" data-field="prevIndustry" placeholder=" " value="${Helpers.escapeHtml(this.focus.prevIndustry || '')}">
              <label class="form-label">Previous Industry (e.g. Sales, Education)</label>
            </div>
          </div>
          <div class="form-group">
            <input type="text" class="form-input focus-field" data-field="transferSkills" placeholder=" " value="${Helpers.escapeHtml(this.focus.transferSkills || '')}">
            <label class="form-label">Your Transferable Skills (e.g. Project Leadership, Negotiation)</label>
          </div>
          <div class="form-group">
            <input type="text" class="form-input focus-field" data-field="skills" placeholder=" " value="${Helpers.escapeHtml(this.focus.skills || '')}">
            <label class="form-label">Skills acquired for your NEW target industry (comma separated)</label>
          </div>
        `;
        break;

      case 'freelancer':
        fieldsHtml = `
          <div class="form-group">
            <input type="text" class="form-input focus-field" data-field="niche" placeholder=" " value="${Helpers.escapeHtml(this.focus.niche || '')}">
            <label class="form-label">Your Freelance Niche / Specialization (e.g. Wordpress Developer, UI Designer)</label>
          </div>
          <div class="builder-form-row">
            <div class="form-group">
              <input type="text" class="form-input focus-field" data-field="clientName" placeholder=" " value="${Helpers.escapeHtml(this.focus.clientName || '')}">
              <label class="form-label">Key Client / Project Name</label>
            </div>
            <div class="form-group">
              <input type="text" class="form-input focus-field" data-field="clientProj" placeholder=" " value="${Helpers.escapeHtml(this.focus.clientProj || '')}">
              <label class="form-label">Brief Project Title</label>
            </div>
          </div>
          <div class="form-group">
            <textarea class="form-input form-textarea focus-field" data-field="projDesc" placeholder=" " rows="3">${Helpers.escapeHtml(this.focus.projDesc || '')}</textarea>
            <label class="form-label">Briefly describe what you designed or built for this project</label>
          </div>
          <div class="form-group">
            <input type="text" class="form-input focus-field" data-field="skills" placeholder=" " value="${Helpers.escapeHtml(this.focus.skills || '')}">
            <label class="form-label">Technical & Client Management Skills (comma separated)</label>
          </div>
        `;
        break;
    }

    return `
      <div class="wizard-form-step">
        <div class="wizard-card-header">
          <h2>Background Details</h2>
          <p>These answers will help the AI construct targeted experiences, summaries, and skills.</p>
        </div>

        <div style="display:flex; flex-direction:column; gap: var(--space-4);">
          ${fieldsHtml}
        </div>

        <div class="wizard-footer">
          <button class="btn btn-secondary" id="btn-back">← Back</button>
          <button class="btn btn-primary" id="btn-next">Continue →</button>
        </div>
      </div>
    `;
  },

  renderStep4() {
    const templates = TemplateContext.getAllTemplates();
    const resumeData = this.tempResume || Helpers.getSampleResumeData('modern');

    return `
      <div class="wizard-form-step">
        <div class="wizard-card-header">
          <h2>Select a Resume Template</h2>
          <p>Choose your preferred layout. We have pre-filled the templates with your new AI-generated content so you can preview them instantly!</p>
        </div>

        <div class="template-grid">
          ${templates.map(t => TemplateCard.render(t, this.template === t.id, resumeData)).join('')}
        </div>

        <div class="wizard-footer">
          <button class="btn btn-secondary" id="btn-back">← Back</button>
          <button class="btn btn-primary" id="btn-finish" style="background: var(--gradient-primary); border: none;">✨ Finish & Open Editor</button>
        </div>
      </div>
    `;
  },

  renderLoadingScreen() {
    return `
      <div class="wizard-loading">
        <div class="loader-glow-spinner"></div>
        <div class="loading-text-status" id="loading-status-text">Gemini AI is analyzing your career stage...</div>
        <div class="loading-subtext">Optimizing formatting and aligning bullet points for ATS scanners.</div>
      </div>
    `;
  },

  init() {
    Navbar.init();

    if (this.isGenerating) {
      this.startLoadingProgression();
      return;
    }

    // Step 1: Stage Cards selection
    document.querySelectorAll('.stage-card').forEach(card => {
      card.addEventListener('click', () => {
        this.stage = card.dataset.stage;
        document.querySelectorAll('.stage-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        
        const nextBtn = document.getElementById('btn-next');
        if (nextBtn) nextBtn.removeAttribute('disabled');
      });
    });

    // Inputs collection
    const nameInput = document.getElementById('wizard-fullName');
    const jobInput = document.getElementById('wizard-jobTitle');
    const emailInput = document.getElementById('wizard-email');
    const phoneInput = document.getElementById('wizard-phone');
    const locInput = document.getElementById('wizard-location');

    if (nameInput) {
      nameInput.addEventListener('input', () => { this.personal.fullName = nameInput.value; });
    }
    if (jobInput) {
      jobInput.addEventListener('input', () => { this.personal.jobTitle = jobInput.value; });
    }
    if (emailInput) {
      emailInput.addEventListener('input', () => { this.personal.email = emailInput.value; });
    }
    if (phoneInput) {
      phoneInput.addEventListener('input', () => { this.personal.phone = phoneInput.value; });
    }
    if (locInput) {
      locInput.addEventListener('input', () => { this.personal.location = locInput.value; });
    }

    // Focus fields collection
    document.querySelectorAll('.focus-field').forEach(field => {
      field.addEventListener('input', () => {
        this.focus[field.dataset.field] = field.value;
      });
    });

    // Step 4: Template Selector
    document.querySelectorAll('.template-card').forEach(card => {
      card.addEventListener('click', () => {
        this.template = card.dataset.templateId;
        document.querySelectorAll('.template-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
      });
    });

    // Buttons
    const nextBtn = document.getElementById('btn-next');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (this.currentStep === 2 && (!this.personal.fullName.trim() || !this.personal.jobTitle.trim())) {
          Toast.warning('Validation Warning', 'Full Name and Target Job Title are required.');
          return;
        }
        if (this.currentStep === 3) {
          // Trigger AI Generation when moving from Step 3 to Step 4
          this.generateResume();
        } else {
          this.currentStep++;
          this.refreshPage();
        }
      });
    }

    const backBtn = document.getElementById('btn-back');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.currentStep--;
        this.refreshPage();
      });
    }

    const finishBtn = document.getElementById('btn-finish');
    if (finishBtn) {
      finishBtn.addEventListener('click', () => {
        if (!this.tempResume) {
          Toast.error('Error', 'No generated resume content found.');
          return;
        }
        // Save the chosen template and finish
        this.tempResume.template = this.template;
        Storage.saveResume(this.tempResume);
        ResumeContext.loadResume(this.tempResume.id);
        Toast.success('Resume Created', 'Opening your resume in the editor.');
        Router.navigate('/builder/' + this.tempResume.id);
      });
    }
  },

  refreshPage() {
    const pageContent = document.getElementById('page-content');
    if (pageContent) {
      pageContent.innerHTML = this.render();
      this.init();
    }
  },

  startLoadingProgression() {
    const statuses = [
      "Gemini AI is analyzing your career stage...",
      "Structuring ATS-optimized headings...",
      "Polishing description bullet points with active verbs...",
      "Adding customizable project details...",
      "Assembling template designs..."
    ];
    let index = 0;
    
    if (this.loadingInterval) clearInterval(this.loadingInterval);

    this.loadingInterval = setInterval(() => {
      const el = document.getElementById('loading-status-text');
      if (el) {
        index = (index + 1) % statuses.length;
        el.textContent = statuses[index];
      }
    }, 2000);
  },

  generateResume() {
    this.isGenerating = true;
    this.refreshPage();

    fetch('api/ai-generate-resume.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        stage: this.stage,
        personal: this.personal,
        focus: this.focus,
        template: this.template
      })
    })
    .then(res => {
      if (!res.ok) {
        throw new Error('API server returned status ' + res.status);
      }
      return res.json();
    })
    .then(result => {
      if (!result.success) {
        throw new Error(result.message || 'AI resume generation failed.');
      }
      
      const generatedResume = result.resume;
      
      // Ensure the resume has an ID
      if (!generatedResume.id) {
        generatedResume.id = 'resume_' + Date.now().toString(36);
      }
      
      // Store in tempResume instead of saving immediately
      this.tempResume = generatedResume;
      
      // Clear interval and variables
      if (this.loadingInterval) clearInterval(this.loadingInterval);
      this.isGenerating = false;

      if (result.warning) {
        Toast.warning('Mock AI Fallback', result.warning);
      } else {
        Toast.success('Content Generated!', 'Your AI resume content is ready. Choose a template to preview it.');
      }

      // Move to step 4 (Template Selection) and refresh
      this.currentStep = 4;
      this.refreshPage();
    })
    .catch(err => {
      if (this.loadingInterval) clearInterval(this.loadingInterval);
      this.isGenerating = false;
      this.currentStep = 3; // return to step 3 on error
      this.refreshPage();
      
      Toast.error('Generation Error', err.message || 'Could not generate resume.');
    });
  }
};
