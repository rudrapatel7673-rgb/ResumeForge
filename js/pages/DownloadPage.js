/* ============================================
   Download Page
   ============================================ */
const DownloadPage = {
  selectedFormat: 'pdf',
  isDownloading: false,

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
      <div class="download-page">
        <div class="download-card fade-in-up">
          <div class="download-icon">📥</div>
          <h1>Download Resume</h1>
          <p class="subtitle">${Helpers.escapeHtml(resume.name)}</p>

          <div class="download-formats">
            <button class="format-option ${this.selectedFormat === 'pdf' ? 'active' : ''}" data-format="pdf">
              <div class="format-option-icon">📄</div>
              <div class="format-option-name">PDF</div>
              <div class="format-option-desc">Best for applications</div>
            </button>
            <button class="format-option ${this.selectedFormat === 'print' ? 'active' : ''}" data-format="print">
              <div class="format-option-icon">🖨</div>
              <div class="format-option-name">Print</div>
              <div class="format-option-desc">Print directly</div>
            </button>
          </div>

          <div class="form-group">
            <input type="text" class="form-input" id="download-filename" placeholder=" " value="${Helpers.escapeHtml(resume.name.replace(/[^a-zA-Z0-9\s-_]/g, '') || 'resume')}">
            <label class="form-label">File Name</label>
          </div>

          <button class="btn btn-primary btn-lg" style="width:100%;" id="download-btn" ${this.isDownloading ? 'disabled' : ''}>
            ${this.isDownloading ? '<span class="spinner"></span> Generating...' : '📥 Download Now'}
          </button>

          <div style="margin-top: var(--space-6); display:flex; gap: var(--space-3); justify-content:center;">
            <button class="btn btn-ghost btn-sm" onclick="Router.navigate('/preview/${resumeId}')">👁 Preview</button>
            <button class="btn btn-ghost btn-sm" onclick="Router.navigate('/builder/${resumeId}')">✏️ Edit</button>
          </div>
        </div>
      </div>

      <!-- Hidden render area for PDF generation -->
      <div id="pdf-render-area" style="position:fixed; left: -9999px; top: 0; width: 800px; background: white;">
        ${ResumeTemplates.render(resume.template, resume)}
      </div>
    `;
  },

  init() {
    Navbar.init();

    // Format selection
    document.querySelectorAll('.format-option').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectedFormat = btn.dataset.format;
        document.querySelectorAll('.format-option').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Download button
    const downloadBtn = document.getElementById('download-btn');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => this.handleDownload());
    }
  },

  async handleDownload() {
    const pathParts = Router.currentPath.split('/');
    const resumeId = pathParts[2];
    const filename = document.getElementById('download-filename')?.value || 'resume';

    if (this.selectedFormat === 'print') {
      window.print();
      return;
    }

    // PDF download using canvas approach
    this.isDownloading = true;
    const btn = document.getElementById('download-btn');
    if (btn) btn.innerHTML = '<span class="spinner"></span> Generating PDF...';
    if (btn) btn.disabled = true;

    try {
      const renderArea = document.getElementById('pdf-render-area');
      
      // Use print-style download approach
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>${Helpers.escapeHtml(filename)}</title>
            <link rel="stylesheet" href="css/resume-templates.css">
            <style>
              body { margin: 0; padding: 0; background: white; }
              .resume-render { box-shadow: none; border-radius: 0; }
              @media print {
                body { margin: 0; }
                @page { margin: 0; size: A4; }
              }
            </style>
          </head>
          <body>${renderArea.innerHTML}</body>
          </html>
        `);
        printWindow.document.close();
        
        // Wait for styles to load
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
          this.isDownloading = false;
          if (btn) {
            btn.innerHTML = '📥 Download Now';
            btn.disabled = false;
          }
          Toast.success('Ready!', 'Your resume is ready to save as PDF. Use "Save as PDF" in the print dialog.');
        }, 1000);
      } else {
        throw new Error('Pop-up blocked. Please allow pop-ups for this site.');
      }
    } catch (err) {
      this.isDownloading = false;
      if (btn) {
        btn.innerHTML = '📥 Download Now';
        btn.disabled = false;
      }
      Toast.error('Download Failed', err.message || 'An error occurred');
    }
  }
};
