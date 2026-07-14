/* ============================================
   Modal Component
   ============================================ */
const Modal = {
  show(options) {
    const { title, content, footer, onClose, size = 'default' } = options;
    const root = document.getElementById('modal-root');
    
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = `
      <div class="modal" style="${size === 'lg' ? 'max-width:700px' : ''}">
        <div class="modal-header">
          <h3 class="modal-title">${title || ''}</h3>
          <button class="modal-close" aria-label="Close modal">✕</button>
        </div>
        <div class="modal-body">${content || ''}</div>
        ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
      </div>
    `;

    const close = () => {
      backdrop.classList.add('closing');
      setTimeout(() => {
        backdrop.remove();
        if (onClose) onClose();
      }, 200);
    };

    backdrop.querySelector('.modal-close').addEventListener('click', close);
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) close();
    });

    root.appendChild(backdrop);
    return { close, element: backdrop };
  },

  confirm(options) {
    return new Promise(resolve => {
      const { title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'danger', icon = '⚠' } = options;
      
      const content = `
        <div class="text-center">
          <div class="confirm-dialog-icon ${type}">
            ${icon}
          </div>
          <h3 style="margin-bottom: var(--space-2);">${title}</h3>
          <p style="color: var(--text-secondary); font-size: var(--text-sm);">${message}</p>
        </div>
      `;

      const footer = `
        <button class="btn btn-secondary modal-cancel-btn">${cancelText}</button>
        <button class="btn btn-${type} modal-confirm-btn">${confirmText}</button>
      `;

      const modal = this.show({ title: '', content, footer });
      
      modal.element.querySelector('.modal-header').style.display = 'none';
      modal.element.querySelector('.modal-confirm-btn').addEventListener('click', () => {
        modal.close();
        resolve(true);
      });
      modal.element.querySelector('.modal-cancel-btn').addEventListener('click', () => {
        modal.close();
        resolve(false);
      });
    });
  }
};
