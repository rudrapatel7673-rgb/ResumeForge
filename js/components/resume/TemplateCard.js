/* ============================================
   Template Card Component
   ============================================ */
const TemplateCard = {
  render(template, isSelected, resumeData) {
    const preview = ResumeTemplates.renderPreview(template.id, resumeData);
    return `
      <div class="template-card ${isSelected ? 'selected' : ''}" data-template-id="${template.id}">
        ${isSelected ? '<div class="template-card-selected-badge">✓</div>' : ''}
        <div class="template-card-preview">
          <div class="template-card-preview-inner">
            ${preview}
          </div>
        </div>
        <div class="template-card-info">
          <div class="template-card-name">${template.name}</div>
        </div>
      </div>
    `;
  }
};
