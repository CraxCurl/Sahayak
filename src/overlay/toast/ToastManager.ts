export type ToastType = 'applied' | 'reverted' | 'error' | 'info';

export interface ToastOptions {
  message: string;
  type?: ToastType;
  durationMs?: number;
}

export class ToastManager {
  private containerEl: HTMLElement | null = null;

  private ensureContainer(): HTMLElement {
    if (this.containerEl && document.body.contains(this.containerEl)) {
      return this.containerEl;
    }

    const container = document.createElement('div');
    container.id = 'sahayak-toast-container';
    container.setAttribute('data-sahayak-managed', 'true');
    container.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 24px;
      z-index: 999999;
      display: flex;
      flex-col: column;
      gap: 8px;
      pointer-events: none;
      font-family: system-ui, -apple-system, sans-serif;
    `;
    document.body.appendChild(container);
    this.containerEl = container;
    return container;
  }

  public show({ message, type = 'info', durationMs = 3500 }: ToastOptions): void {
    const container = this.ensureContainer();

    const toast = document.createElement('div');
    toast.style.cssText = `
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 16px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      color: #f8fafc;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.6);
      transition: all 0.3s ease;
      opacity: 0;
      transform: translateY(10px);
    `;

    switch (type) {
      case 'applied':
        toast.style.background = 'rgba(15, 23, 42, 0.95)';
        toast.style.border = '1px solid rgba(56, 189, 248, 0.4)';
        toast.innerHTML = `<span style="color: #38bdf8;">✨</span> <span>${message}</span>`;
        break;
      case 'reverted':
        toast.style.background = 'rgba(15, 23, 42, 0.95)';
        toast.style.border = '1px solid rgba(244, 63, 94, 0.4)';
        toast.innerHTML = `<span style="color: #f43f5e;">↩️</span> <span>${message}</span>`;
        break;
      case 'error':
        toast.style.background = 'rgba(225, 29, 72, 0.95)';
        toast.style.border = '1px solid #f43f5e';
        toast.innerHTML = `<span>⚠️</span> <span>${message}</span>`;
        break;
      default:
        toast.style.background = 'rgba(15, 23, 42, 0.95)';
        toast.style.border = '1px solid rgba(148, 163, 184, 0.3)';
        toast.innerHTML = `<span style="color: #38bdf8;">ℹ️</span> <span>${message}</span>`;
    }

    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });

    let dismissTimer = setTimeout(() => this.dismiss(toast), durationMs);

    // Pause auto-dismiss on hover
    toast.addEventListener('mouseenter', () => clearTimeout(dismissTimer));
    toast.addEventListener('mouseleave', () => {
      dismissTimer = setTimeout(() => this.dismiss(toast), 2000);
    });
  }

  private dismiss(toast: HTMLElement): void {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }
}

export const toastManager = new ToastManager();
