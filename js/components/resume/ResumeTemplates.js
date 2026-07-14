/* ============================================
   Resume Template Renderers
   ============================================ */
const ResumeTemplates = {
  render(templateId, data) {
    let html = '';
    switch (templateId) {
      case 'modern': html = this.renderModern(data); break;
      case 'classic': html = this.renderClassic(data); break;
      case 'minimal': html = this.renderMinimal(data); break;
      case 'creative': html = this.renderCreative(data); break;
      case 'executive': html = this.renderExecutive(data); break;
      case 'tech': html = this.renderTech(data); break;
      default: html = this.renderModern(data); break;
    }

    if (data) {
      const themeColor = data.themeColor || '';
      const accentColor = data.accentColor || '';
      const fontFamily = data.fontFamily || '';

      let inlineStyles = '';
      if (themeColor) inlineStyles += `--primary-color: ${themeColor}; `;
      if (accentColor) inlineStyles += `--accent-color: ${accentColor}; `;
      if (fontFamily) inlineStyles += `font-family: ${fontFamily}, sans-serif; `;

      if (inlineStyles) {
        html = html.replace('class="resume-render', `style="${inlineStyles}" class="resume-render`);
      }
    }
    return html;
  },

  renderPreview(templateId, data) {
    return this.render(templateId, data || this._getSampleData());
  },

  _getSampleData() {
    const s = Helpers.getSampleResumeData();
    return { personal: s.personal, experience: s.experience, education: s.education, skills: s.skills, projects: s.projects, certifications: s.certifications, languages: s.languages };
  },

  _descriptionToList(desc) {
    if (!desc) return '';
    const items = desc.split('|').filter(Boolean);
    if (items.length <= 1) return `<p class="exp-desc">${Helpers.escapeHtml(desc)}</p>`;
    return `<ul class="exp-desc">${items.map(i => `<li>${Helpers.escapeHtml(i.trim())}</li>`).join('')}</ul>`;
  },

  _formatRange(start, end, current) {
    const s = start ? Helpers.formatDate(start) : '';
    const e = current ? 'Present' : (end ? Helpers.formatDate(end) : '');
    if (s && e) return `${s} — ${e}`;
    return s || e || '';
  },

  _initials(name) {
    return Helpers.getInitials(name);
  },

  /* ============ MODERN ============ */
  renderModern(data) {
    const p = data.personal || {};
    const exp = data.experience || [];
    const edu = data.education || [];
    const skills = data.skills || [];
    const projects = data.projects || [];
    const certs = data.certifications || [];
    const langs = data.languages || [];

    // Sidebar
    let sidebarContent = '';
    
    // Contact
    const contactItems = [];
    if (p.email) contactItems.push(`<div class="sidebar-item"><span class="sidebar-item-icon">✉</span>${Helpers.escapeHtml(p.email)}</div>`);
    if (p.phone) contactItems.push(`<div class="sidebar-item"><span class="sidebar-item-icon">📱</span>${Helpers.escapeHtml(p.phone)}</div>`);
    if (p.location) contactItems.push(`<div class="sidebar-item"><span class="sidebar-item-icon">📍</span>${Helpers.escapeHtml(p.location)}</div>`);
    if (p.website) contactItems.push(`<div class="sidebar-item"><span class="sidebar-item-icon">🌐</span>${Helpers.escapeHtml(p.website)}</div>`);
    if (p.linkedin) contactItems.push(`<div class="sidebar-item"><span class="sidebar-item-icon">💼</span>${Helpers.escapeHtml(p.linkedin)}</div>`);

    if (contactItems.length) {
      sidebarContent += `<div class="sidebar-section"><div class="sidebar-section-title">Contact</div>${contactItems.join('')}</div>`;
    }

    // Skills
    if (skills.length) {
      const skillBars = skills.map((s, i) => {
        const level = Math.max(40, 100 - i * 8);
        return `<div class="skill-bar"><div class="skill-name">${Helpers.escapeHtml(s)}</div><div class="skill-track"><div class="skill-fill" style="width:${level}%"></div></div></div>`;
      }).join('');
      sidebarContent += `<div class="sidebar-section"><div class="sidebar-section-title">Skills</div>${skillBars}</div>`;
    }

    // Languages
    if (langs.length) {
      const langItems = langs.map(l => `<div class="sidebar-item"><span class="sidebar-item-icon">🗣</span>${Helpers.escapeHtml(l.name)} — ${Helpers.escapeHtml(l.level)}</div>`).join('');
      sidebarContent += `<div class="sidebar-section"><div class="sidebar-section-title">Languages</div>${langItems}</div>`;
    }

    // Certifications
    if (certs.length) {
      const certItems = certs.map(c => `<div class="sidebar-item"><span class="sidebar-item-icon">🏅</span>${Helpers.escapeHtml(c.name)}<br><small style="opacity:0.6">${Helpers.escapeHtml(c.issuer || '')}</small></div>`).join('');
      sidebarContent += `<div class="sidebar-section"><div class="sidebar-section-title">Certifications</div>${certItems}</div>`;
    }

    // Main content
    let mainContent = '';

    // Summary
    if (p.summary) {
      mainContent += `<div class="main-section"><div class="main-section-title"><span class="main-section-title-icon">👤</span> Professional Summary</div><p style="font-size:12px;color:#444;line-height:1.7;">${Helpers.escapeHtml(p.summary)}</p></div>`;
    }

    // Experience
    if (exp.length) {
      const expItems = exp.map(e => `
        <div class="exp-item">
          <div class="exp-header">
            <div class="exp-title">${Helpers.escapeHtml(e.title)}</div>
            <div class="exp-date">${this._formatRange(e.startDate, e.endDate, e.current)}</div>
          </div>
          <div class="exp-company">${Helpers.escapeHtml(e.company)}${e.location ? ' · ' + Helpers.escapeHtml(e.location) : ''}</div>
          ${this._descriptionToList(e.description)}
        </div>
      `).join('');
      mainContent += `<div class="main-section"><div class="main-section-title"><span class="main-section-title-icon">💼</span> Experience</div>${expItems}</div>`;
    }

    // Education
    if (edu.length) {
      const eduItems = edu.map(e => `
        <div class="exp-item">
          <div class="exp-header">
            <div class="exp-title">${Helpers.escapeHtml(e.degree)}</div>
            <div class="exp-date">${this._formatRange(e.startDate, e.endDate)}</div>
          </div>
          <div class="exp-company">${Helpers.escapeHtml(e.school)}${e.location ? ' · ' + Helpers.escapeHtml(e.location) : ''}</div>
          ${e.description ? `<p style="font-size:12px;color:#555;">${Helpers.escapeHtml(e.description)}</p>` : ''}
        </div>
      `).join('');
      mainContent += `<div class="main-section"><div class="main-section-title"><span class="main-section-title-icon">🎓</span> Education</div>${eduItems}</div>`;
    }

    // Projects
    if (projects.length) {
      const projItems = projects.map(p => `
        <div class="exp-item">
          <div class="exp-title">${Helpers.escapeHtml(p.name)}</div>
          <p style="font-size:12px;color:#555;margin-bottom:4px;">${Helpers.escapeHtml(p.description)}</p>
          ${p.technologies ? `<p style="font-size:11px;color:#6C63FF;font-weight:600;">Tech: ${Helpers.escapeHtml(p.technologies)}</p>` : ''}
        </div>
      `).join('');
      mainContent += `<div class="main-section"><div class="main-section-title"><span class="main-section-title-icon">🚀</span> Projects</div>${projItems}</div>`;
    }

    return `
      <div class="resume-render resume-modern">
        <div class="resume-sidebar">
          <div class="resume-avatar" style="${p.photo ? `background-image: url('${p.photo}'); background-size: cover; background-position: center; color: transparent; border: 2px solid rgba(255,255,255,0.2);` : ''}">
            ${p.photo ? '' : this._initials(p.fullName)}
          </div>
          <div class="resume-name">${Helpers.escapeHtml(p.fullName || 'Your Name')}</div>
          <div class="resume-jobtitle">${Helpers.escapeHtml(p.jobTitle || 'Job Title')}</div>
          ${sidebarContent}
        </div>
        <div class="resume-main">
          ${mainContent}
        </div>
      </div>
    `;
  },

  /* ============ CLASSIC ============ */
  renderClassic(data) {
    const p = data.personal || {};
    const exp = data.experience || [];
    const edu = data.education || [];
    const skills = data.skills || [];
    const projects = data.projects || [];

    const contactItems = [];
    if (p.email) contactItems.push(`<span class="classic-contact-item">✉ ${Helpers.escapeHtml(p.email)}</span>`);
    if (p.phone) contactItems.push(`<span class="classic-contact-item">📱 ${Helpers.escapeHtml(p.phone)}</span>`);
    if (p.location) contactItems.push(`<span class="classic-contact-item">📍 ${Helpers.escapeHtml(p.location)}</span>`);
    if (p.website) contactItems.push(`<span class="classic-contact-item">🌐 ${Helpers.escapeHtml(p.website)}</span>`);

    let sections = '';

    if (p.summary) {
      sections += `<div class="classic-section"><div class="classic-section-title">Professional Summary</div><p class="classic-summary">${Helpers.escapeHtml(p.summary)}</p></div>`;
    }

    if (exp.length) {
      const items = exp.map(e => `
        <div class="classic-exp-item">
          <div class="classic-exp-header">
            <span class="classic-exp-title">${Helpers.escapeHtml(e.title)}</span>
            <span class="classic-exp-date">${this._formatRange(e.startDate, e.endDate, e.current)}</span>
          </div>
          <div class="classic-exp-company">${Helpers.escapeHtml(e.company)}${e.location ? ', ' + Helpers.escapeHtml(e.location) : ''}</div>
          ${e.description ? `<ul class="classic-exp-desc">${e.description.split('|').filter(Boolean).map(d => `<li>${Helpers.escapeHtml(d.trim())}</li>`).join('')}</ul>` : ''}
        </div>
      `).join('');
      sections += `<div class="classic-section"><div class="classic-section-title">Experience</div>${items}</div>`;
    }

    if (edu.length) {
      const items = edu.map(e => `
        <div class="classic-exp-item">
          <div class="classic-exp-header">
            <span class="classic-exp-title">${Helpers.escapeHtml(e.degree)}</span>
            <span class="classic-exp-date">${this._formatRange(e.startDate, e.endDate)}</span>
          </div>
          <div class="classic-exp-company">${Helpers.escapeHtml(e.school)}${e.location ? ', ' + Helpers.escapeHtml(e.location) : ''}</div>
          ${e.description ? `<p style="font-size:12px;color:#555;margin-top:4px;">${Helpers.escapeHtml(e.description)}</p>` : ''}
        </div>
      `).join('');
      sections += `<div class="classic-section"><div class="classic-section-title">Education</div>${items}</div>`;
    }

    if (skills.length) {
      sections += `<div class="classic-section"><div class="classic-section-title">Skills</div><div class="classic-skills">${skills.map(s => `<span class="classic-skill-tag">${Helpers.escapeHtml(s)}</span>`).join('')}</div></div>`;
    }

    if (projects.length) {
      const items = projects.map(pr => `
        <div class="classic-exp-item">
          <div class="classic-exp-title">${Helpers.escapeHtml(pr.name)}</div>
          <p style="font-size:12px;color:#555;">${Helpers.escapeHtml(pr.description)}</p>
          ${pr.technologies ? `<p style="font-size:11px;color:#888;margin-top:4px;">Technologies: ${Helpers.escapeHtml(pr.technologies)}</p>` : ''}
        </div>
      `).join('');
      sections += `<div class="classic-section"><div class="classic-section-title">Projects</div>${items}</div>`;
    }

    return `
      <div class="resume-render resume-classic">
        <div class="classic-header">
          <div class="classic-name">${Helpers.escapeHtml(p.fullName || 'Your Name')}</div>
          <div class="classic-title">${Helpers.escapeHtml(p.jobTitle || 'Job Title')}</div>
          <div class="classic-contact">${contactItems.join('')}</div>
        </div>
        ${sections}
      </div>
    `;
  },

  /* ============ MINIMAL ============ */
  renderMinimal(data) {
    const p = data.personal || {};
    const exp = data.experience || [];
    const edu = data.education || [];
    const skills = data.skills || [];

    const contactItems = [];
    if (p.email) contactItems.push(Helpers.escapeHtml(p.email));
    if (p.phone) contactItems.push(Helpers.escapeHtml(p.phone));
    if (p.location) contactItems.push(Helpers.escapeHtml(p.location));
    if (p.website) contactItems.push(Helpers.escapeHtml(p.website));

    let sections = '';

    if (p.summary) {
      sections += `<div class="minimal-section"><div class="minimal-section-title">About</div><p style="font-size:13px;color:#555;line-height:1.8;">${Helpers.escapeHtml(p.summary)}</p></div>`;
    }

    if (exp.length) {
      const items = exp.map(e => `
        <div class="minimal-exp-item">
          <div class="minimal-exp-date">${this._formatRange(e.startDate, e.endDate, e.current)}</div>
          <div>
            <div class="minimal-exp-title">${Helpers.escapeHtml(e.title)}</div>
            <div class="minimal-exp-company">${Helpers.escapeHtml(e.company)}</div>
            ${e.description ? `<p class="minimal-exp-desc">${Helpers.escapeHtml(e.description.split('|').join('. '))}</p>` : ''}
          </div>
        </div>
      `).join('');
      sections += `<div class="minimal-section"><div class="minimal-section-title">Experience</div>${items}</div>`;
    }

    if (edu.length) {
      const items = edu.map(e => `
        <div class="minimal-exp-item">
          <div class="minimal-exp-date">${this._formatRange(e.startDate, e.endDate)}</div>
          <div>
            <div class="minimal-exp-title">${Helpers.escapeHtml(e.degree)}</div>
            <div class="minimal-exp-company">${Helpers.escapeHtml(e.school)}</div>
          </div>
        </div>
      `).join('');
      sections += `<div class="minimal-section"><div class="minimal-section-title">Education</div>${items}</div>`;
    }

    if (skills.length) {
      sections += `<div class="minimal-section"><div class="minimal-section-title">Skills</div><div class="minimal-skills">${skills.map(s => `<span>${Helpers.escapeHtml(s)}</span>`).join('')}</div></div>`;
    }

    return `
      <div class="resume-render resume-minimal">
        <div class="minimal-header">
          <div class="minimal-name">${Helpers.escapeHtml(p.fullName || 'Your Name')}</div>
          <div class="minimal-title">${Helpers.escapeHtml(p.jobTitle || 'Job Title')}</div>
          <div class="minimal-contact">${contactItems.join(' · ')}</div>
        </div>
        ${sections}
      </div>
    `;
  },

  /* ============ CREATIVE ============ */
  renderCreative(data) {
    const p = data.personal || {};
    const exp = data.experience || [];
    const edu = data.education || [];
    const skills = data.skills || [];
    const projects = data.projects || [];

    const contactItems = [];
    if (p.email) contactItems.push(`<span class="creative-contact-item">✉ ${Helpers.escapeHtml(p.email)}</span>`);
    if (p.phone) contactItems.push(`<span class="creative-contact-item">📱 ${Helpers.escapeHtml(p.phone)}</span>`);
    if (p.location) contactItems.push(`<span class="creative-contact-item">📍 ${Helpers.escapeHtml(p.location)}</span>`);

    let mainContent = '';

    if (p.summary) {
      mainContent += `<div class="creative-main-section"><div class="creative-section-title">🎯 About Me</div><p style="font-size:12px;color:#555;line-height:1.7;">${Helpers.escapeHtml(p.summary)}</p></div>`;
    }

    if (exp.length) {
      const items = exp.map(e => `
        <div class="creative-timeline-item">
          <div class="creative-exp-title">${Helpers.escapeHtml(e.title)}</div>
          <div class="creative-exp-company">${Helpers.escapeHtml(e.company)}</div>
          <div class="creative-exp-date">${this._formatRange(e.startDate, e.endDate, e.current)}</div>
          ${e.description ? `<p class="creative-exp-desc">${Helpers.escapeHtml(e.description.split('|').join('. '))}</p>` : ''}
        </div>
      `).join('');
      mainContent += `<div class="creative-main-section"><div class="creative-section-title">💼 Experience</div>${items}</div>`;
    }

    if (edu.length) {
      const items = edu.map(e => `
        <div class="creative-timeline-item">
          <div class="creative-exp-title">${Helpers.escapeHtml(e.degree)}</div>
          <div class="creative-exp-company">${Helpers.escapeHtml(e.school)}</div>
          <div class="creative-exp-date">${this._formatRange(e.startDate, e.endDate)}</div>
        </div>
      `).join('');
      mainContent += `<div class="creative-main-section"><div class="creative-section-title">🎓 Education</div>${items}</div>`;
    }

    // Sidebar skills
    let sidebarContent = '';
    if (skills.length) {
      sidebarContent += `<div class="creative-sidebar-section"><div class="creative-section-title" style="font-size:13px;">⚡ Skills</div>${skills.map(s => `<span class="creative-skill-item">${Helpers.escapeHtml(s)}</span>`).join('')}</div>`;
    }

    if (projects.length) {
      const projItems = projects.map(pr => `<div style="margin-bottom:10px;"><div style="font-weight:600;font-size:12px;color:#1a1a2e;">${Helpers.escapeHtml(pr.name)}</div><div style="font-size:11px;color:#666;">${Helpers.escapeHtml(pr.description)}</div></div>`).join('');
      sidebarContent += `<div class="creative-sidebar-section"><div class="creative-section-title" style="font-size:13px;">🚀 Projects</div>${projItems}</div>`;
    }

    return `
      <div class="resume-render resume-creative">
        <div class="creative-header">
          <div class="creative-avatar" style="${p.photo ? `background-image: url('${p.photo}'); background-size: cover; background-position: center; color: transparent; border: 2px solid rgba(255,255,255,0.2);` : ''}">
            ${p.photo ? '' : this._initials(p.fullName)}
          </div>
          <div>
            <div class="creative-name">${Helpers.escapeHtml(p.fullName || 'Your Name')}</div>
            <div class="creative-title">${Helpers.escapeHtml(p.jobTitle || 'Job Title')}</div>
            <div class="creative-contact">${contactItems.join('')}</div>
          </div>
        </div>
        <div class="creative-body">
          <div>${mainContent}</div>
          <div>${sidebarContent}</div>
        </div>
      </div>
    `;
  },

  /* ============ EXECUTIVE ============ */
  renderExecutive(data) {
    const p = data.personal || {};
    const exp = data.experience || [];
    const edu = data.education || [];
    const skills = data.skills || [];
    const projects = data.projects || [];

    const contactItems = [];
    if (p.email) contactItems.push(Helpers.escapeHtml(p.email));
    if (p.phone) contactItems.push(Helpers.escapeHtml(p.phone));
    if (p.location) contactItems.push(Helpers.escapeHtml(p.location));
    if (p.website) contactItems.push(Helpers.escapeHtml(p.website));

    let sections = '';
    if (p.summary) {
      sections += `<div class="exec-section"><div class="exec-section-title">Summary</div><p style="font-size:12px;color:#333;line-height:1.7;margin-bottom:12px;">${Helpers.escapeHtml(p.summary)}</p></div>`;
    }

    if (exp.length) {
      const items = exp.map(e => `
        <div class="exec-item">
          <div class="exec-item-header">
            <span>${Helpers.escapeHtml(e.title)} — ${Helpers.escapeHtml(e.company)}</span>
            <span>${this._formatRange(e.startDate, e.endDate, e.current)}</span>
          </div>
          <div class="exec-item-sub">${e.location ? Helpers.escapeHtml(e.location) : ''}</div>
          ${this._descriptionToList(e.description)}
        </div>
      `).join('');
      sections += `<div class="exec-section"><div class="exec-section-title">Professional Experience</div>${items}</div>`;
    }

    if (edu.length) {
      const items = edu.map(e => `
        <div class="exec-item">
          <div class="exec-item-header">
            <span>${Helpers.escapeHtml(e.degree)}</span>
            <span>${this._formatRange(e.startDate, e.endDate)}</span>
          </div>
          <div class="exec-item-sub">${Helpers.escapeHtml(e.school)}${e.location ? ', ' + Helpers.escapeHtml(e.location) : ''}</div>
          ${e.description ? `<p style="font-size:11px;color:#555;margin-top:2px;">${Helpers.escapeHtml(e.description)}</p>` : ''}
        </div>
      `).join('');
      sections += `<div class="exec-section"><div class="exec-section-title">Education</div>${items}</div>`;
    }

    if (skills.length) {
      sections += `<div class="exec-section"><div class="exec-section-title">Skills</div><p style="font-size:12px;color:#333;line-height:1.5;">${skills.map(s => Helpers.escapeHtml(s)).join('  ·  ')}</p></div>`;
    }

    if (projects.length) {
      const items = projects.map(pr => `
        <div class="exec-item">
          <div class="exec-item-header">
            <span>${Helpers.escapeHtml(pr.name)}</span>
            <span>${Helpers.escapeHtml(pr.technologies || '')}</span>
          </div>
          <p style="font-size:11px;color:#444;margin-top:2px;">${Helpers.escapeHtml(pr.description)}</p>
        </div>
      `).join('');
      sections += `<div class="exec-section"><div class="exec-section-title">Projects</div>${items}</div>`;
    }

    return `
      <div class="resume-render resume-executive">
        <div class="exec-header">
          <div class="exec-name">${Helpers.escapeHtml(p.fullName || 'Your Name')}</div>
          <div class="exec-title">${Helpers.escapeHtml(p.jobTitle || 'Job Title')}</div>
          <div class="exec-contact">${contactItems.join('  |  ')}</div>
        </div>
        ${sections}
      </div>
    `;
  },

  /* ============ TECH ============ */
  renderTech(data) {
    const p = data.personal || {};
    const exp = data.experience || [];
    const edu = data.education || [];
    const skills = data.skills || [];
    const projects = data.projects || [];

    let leftContent = '';
    const contactInfo = [];
    if (p.email) contactInfo.push(`<div>✉ ${Helpers.escapeHtml(p.email)}</div>`);
    if (p.phone) contactInfo.push(`<div>📱 ${Helpers.escapeHtml(p.phone)}</div>`);
    if (p.location) contactInfo.push(`<div>📍 ${Helpers.escapeHtml(p.location)}</div>`);
    if (p.website) contactInfo.push(`<div>🌐 ${Helpers.escapeHtml(p.website)}</div>`);

    if (contactInfo.length) {
      leftContent += `<div style="margin-bottom:20px;"><div class="tech-section-title">Info</div><div style="font-size:10px;line-height:1.6;color:#555;">${contactInfo.join('')}</div></div>`;
    }

    if (skills.length) {
      leftContent += `<div style="margin-bottom:20px;"><div class="tech-section-title">Stack</div><div>${skills.map(s => `<span class="tech-tag">${Helpers.escapeHtml(s)}</span>`).join('')}</div></div>`;
    }

    let rightContent = '';
    if (p.summary) {
      rightContent += `<div style="margin-bottom:15px;"><div class="tech-section-title">Profile</div><p style="font-size:12px;color:#444;line-height:1.7;margin-bottom:10px;">${Helpers.escapeHtml(p.summary)}</p></div>`;
    }

    if (exp.length) {
      const items = exp.map(e => `
        <div class="tech-item">
          <div style="display:flex;justify-content:space-between;font-weight:700;font-size:12px;color:#222;">
            <span>${Helpers.escapeHtml(e.title)} @ ${Helpers.escapeHtml(e.company)}</span>
            <span style="font-size:10px;color:#888;">${this._formatRange(e.startDate, e.endDate, e.current)}</span>
          </div>
          ${this._descriptionToList(e.description)}
        </div>
      `).join('');
      rightContent += `<div style="margin-bottom:15px;"><div class="tech-section-title">Experience</div>${items}</div>`;
    }

    if (edu.length) {
      const items = edu.map(e => `
        <div class="tech-item">
          <div style="display:flex;justify-content:space-between;font-weight:700;font-size:12px;color:#222;">
            <span>${Helpers.escapeHtml(e.degree)}</span>
            <span style="font-size:10px;color:#888;">${this._formatRange(e.startDate, e.endDate)}</span>
          </div>
          <div style="font-size:11px;color:#666;">${Helpers.escapeHtml(e.school)}</div>
        </div>
      `).join('');
      rightContent += `<div style="margin-bottom:15px;"><div class="tech-section-title">Education</div>${items}</div>`;
    }

    if (projects.length) {
      const items = projects.map(pr => `
        <div class="tech-item">
          <div style="font-weight:700;font-size:12px;color:#222;">${Helpers.escapeHtml(pr.name)}</div>
          <p style="font-size:11px;color:#555;margin-bottom:4px;">${Helpers.escapeHtml(pr.description)}</p>
          ${pr.technologies ? `<div style="font-size:10px;color:var(--primary-color,#00D4AA);font-weight:600;"># ${Helpers.escapeHtml(pr.technologies)}</div>` : ''}
        </div>
      `).join('');
      rightContent += `<div style="margin-bottom:15px;"><div class="tech-section-title">Projects</div>${items}</div>`;
    }

    return `
      <div class="resume-render resume-tech">
        <div class="tech-left">
          <div class="tech-name">${Helpers.escapeHtml(p.fullName || 'Your Name')}</div>
          <div class="tech-title">${Helpers.escapeHtml(p.jobTitle || 'Job Title')}</div>
          ${leftContent}
        </div>
        <div class="tech-right">
          ${rightContent}
        </div>
      </div>
    `;
  }
};
