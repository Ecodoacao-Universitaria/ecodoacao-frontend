export type ConfirmOptions = {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary' | 'warning' | 'success' | 'secondary';
};

export type ConfirmInputOptions = {
  title: string;
  message?: string;
  label?: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary' | 'warning' | 'success' | 'secondary';
  required?: boolean;
  minLength?: number;
};

export function confirmAction(opts: ConfirmOptions): Promise<boolean> {
  const { title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', variant = 'danger' } = opts;

  return new Promise<boolean>((resolve) => {
    const modalEl = document.createElement('div');
    modalEl.className = 'modal fade';
    modalEl.tabIndex = -1;
    modalEl.setAttribute('aria-hidden', 'true');
    modalEl.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title">${escapeHtml(title)}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
          </div>
          <div class="modal-body">
            <p class="mb-0">${escapeHtml(message)}</p>
          </div>
          <div class="modal-footer border-0 pt-0">
            <button type="button" class="btn btn-outline-secondary" data-cancel>${escapeHtml(cancelText)}</button>
            <button type="button" class="btn btn-${variant}" data-confirm>${escapeHtml(confirmText)}</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modalEl);

    const ModalCtor = (window as any).bootstrap?.Modal;
    let instance: any;

    const cleanup = () => {
      modalEl.removeEventListener('hidden.bs.modal', onHidden);
      modalEl.remove();
    };
    const onHidden = () => {
      // Caso feche por ESC ou backdrop, considera "cancelado"
      cleanup();
      resolve(false);
    };
    modalEl.addEventListener('hidden.bs.modal', onHidden);

    const onConfirm = () => {
      resolve(true);
      instance?.hide();
    };
    const onCancel = () => {
      resolve(false);
      instance?.hide();
    };

    (modalEl.querySelector('[data-confirm]') as HTMLButtonElement).addEventListener('click', onConfirm);
    (modalEl.querySelector('[data-cancel]') as HTMLButtonElement).addEventListener('click', onCancel);

    if (ModalCtor) {
      instance = new ModalCtor(modalEl, { backdrop: 'static', keyboard: true });
      instance.show();
    } else {
      // Fallback mínimo
      const ok = window.confirm(`${title}\n\n${message}`);
      resolve(ok);
      cleanup();
    }
  });
}

export function confirmWithInput(opts: ConfirmInputOptions): Promise<string | null> {
  const {
    title,
    message = '',
    label = 'Motivo',
    placeholder = 'Digite o motivo...',
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'danger',
    required = true,
    minLength = 3
  } = opts;

  return new Promise((resolve) => {
    const el = document.createElement('div');
    el.className = 'modal fade';
    el.tabIndex = -1;
    el.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title">${escapeHtml(title)}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
          </div>
          <div class="modal-body">
            ${message ? `<p class="mb-2">${escapeHtml(message)}</p>` : ''}
            <label class="form-label">${escapeHtml(label)}</label>
            <textarea class="form-control" rows="3" placeholder="${escapeHtml(placeholder)}" data-input></textarea>
            <div class="invalid-feedback" data-error>Informe pelo menos ${minLength} caracteres.</div>
          </div>
          <div class="modal-footer border-0 pt-0">
            <button type="button" class="btn btn-outline-secondary" data-cancel>${escapeHtml(cancelText)}</button>
            <button type="button" class="btn btn-${variant}" data-confirm>${escapeHtml(confirmText)}</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(el);

    const ModalCtor = (window as any).bootstrap?.Modal;
    const instance = ModalCtor ? new ModalCtor(el, { backdrop: 'static' }) : null;
    const input = el.querySelector('[data-input]') as HTMLTextAreaElement;
    const errorBox = el.querySelector('[data-error]') as HTMLElement;
    const btnConfirm = el.querySelector('[data-confirm]') as HTMLButtonElement;
    const btnCancel = el.querySelector('[data-cancel]') as HTMLButtonElement;

    const cleanup = () => {
      el.removeEventListener('hidden.bs.modal', onHidden);
      el.remove();
    };
    const onHidden = () => {
      cleanup();
      resolve(null);
    };
    el.addEventListener('hidden.bs.modal', onHidden);

    btnCancel.addEventListener('click', () => {
      resolve(null);
      instance?.hide();
    });

    btnConfirm.addEventListener('click', () => {
      const val = (input.value || '').trim();
      if (required && val.length < minLength) {
        input.classList.add('is-invalid');
        errorBox.style.display = 'block';
        return;
      }
      resolve(val || null);
      instance?.hide();
    });

    input.addEventListener('input', () => {
      input.classList.remove('is-invalid');
      errorBox.style.display = 'none';
    });

    if (instance) {
      instance.show();
      setTimeout(() => input.focus(), 150);
    } else {
      const val = window.prompt(`${title}\n${message}\n${label}:`, '') || '';
      cleanup();
      if (required && val.trim().length < minLength) {
        resolve(null);
      } else {
        resolve(val.trim() || null);
      }
    }
  });
}

function escapeHtml(t: string): string {
  const d = document.createElement('div');
  d.textContent = t ?? '';
  return d.innerHTML;
}