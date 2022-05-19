// @ts-ignore
import { html as ReadmeHTML } from '../README.md';

export class Help {
  private container: HTMLDivElement;
  private helpIcon: HTMLDivElement;
  private closeIcon: HTMLDivElement;
  private isEnabled: boolean;
  private isVisible: boolean;

  constructor() {
    this.container = document.createElement('div');
    this.helpIcon = document.createElement('div');
    this.closeIcon = document.createElement('div');
    this.isEnabled = true;
    this.isVisible = false;

    this.container.id = 'help-content';
    this.helpIcon.id = 'help-icon';
    this.closeIcon.id = 'help-close';

    this.helpIcon.textContent = '?';
    this.closeIcon.textContent = 'X';

    this.container.innerHTML = ReadmeHTML;

    this.container.appendChild(this.closeIcon);
    document.body.appendChild(this.container);
    document.body.appendChild(this.helpIcon);

    this.helpIcon.addEventListener('pointerup', () => {
      this.toggleHelpModal();
    });
    this.closeIcon.addEventListener('pointerup', () => {
      this.toggleHelpModal();
    });
  }

  get enabled(): boolean {
    return this.isEnabled;
  }

  set enabled(value) {
    this.isEnabled = value;

    if (value === false) {
      this.container.classList.remove('show');
    }
  }

  toggleHelpModal(): void {
    if (this.isEnabled === false) return;
    
    if (this.isVisible === true) {
      this.isVisible = false;
      this.container.classList.remove('show');
    } else {
      this.isVisible = true;
      this.container.classList.add('show');
    }
  }
}

export default {
  Help,
};
