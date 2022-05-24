import { HelpIcon, EditorIcon } from './Icons';
import type { Icon } from './Icons';

export class IconController {
  private iconContainer: HTMLDivElement;
  private icons: {[key: string]: Icon};

  constructor(iconContainer: HTMLDivElement) {
    this.iconContainer = iconContainer;
    this.icons = {};

    this.iconContainer.querySelectorAll('div').forEach((iconElement: HTMLDivElement) => {
      if (iconElement.dataset.modalid === 'help') {
        this.icons[iconElement.dataset.modalid!] = new HelpIcon(iconElement);
      } else if (iconElement.dataset.modalid === 'editor') {
        this.icons[iconElement.dataset.modalid!] = new EditorIcon(iconElement);
      }
    });

    this.isVisible = true;
  }

  get isVisible(): boolean {
    return this.iconContainer.classList.contains('show');
  }

  set isVisible(value: boolean) {
    if (value === true) {
      this.iconContainer.classList.add('show');
    } else {
      this.iconContainer.classList.remove('show');
    }
  }
}

export default Object.freeze({
  IconController,
});
