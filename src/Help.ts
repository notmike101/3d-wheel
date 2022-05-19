// @ts-ignore
import { html as ReadmeHTML } from '../README.md';

export class Help {
  private container: HTMLDivElement;
  private helpIcon: HTMLDivElement;
  private closeIcon: HTMLDivElement;

  constructor() {
    this.container = document.createElement('div');
    this.helpIcon = document.createElement('div');
    this.closeIcon = document.createElement('div');

    this.container.id = 'help-content';
    this.helpIcon.id = 'help-icon';
    this.closeIcon.id = 'help-close';

    this.helpIcon.textContent = '?';
    this.closeIcon.textContent = 'X';

    this.helpIcon.addEventListener('pointerup', this.toggleHelpModal.bind(this));
    this.closeIcon.addEventListener('pointerup', this.toggleHelpModal.bind(this));
  }

  initialize(): void {
    this.container.innerHTML = ReadmeHTML;

    this.container.appendChild(this.closeIcon);

    document.body.appendChild(this.container);
    document.body.appendChild(this.helpIcon);
  }

  toggleHelpModal(): void {
    this.container.classList.toggle('show');
  }
}

export default {
  Help,
};
