/* ============================================
   Template Context
   ============================================ */
const TemplateContext = {
  templates: [
    {
      id: 'modern',
      name: 'Premium',
      description: 'Clean two-column layout with accent sidebar',
      color: '#6C63FF'
    },
    {
      id: 'classic',
      name: 'Free',
      description: 'Traditional single-column with serif typography',
      color: '#2C3E50'
    },
    {
      id: 'minimal',
      name: 'Student',
      description: 'Whitespace-focused, clean and elegant',
      color: '#95A5A6'
    },
    {
      id: 'creative',
      name: 'Professional',
      description: 'Bold gradient header with timeline layout',
      color: '#FF6B9D'
    },
    {
      id: 'executive',
      name: 'Executive',
      description: 'Elegant serif layout for business leaders',
      color: '#1B365D'
    },
    {
      id: 'tech',
      name: 'Developer/Tech',
      description: 'Clean monospace terminal layout for engineering roles',
      color: '#00D4AA'
    }
  ],

  getTemplate(id) {
    return this.templates.find(t => t.id === id);
  },

  getAllTemplates() {
    return this.templates;
  }
};
