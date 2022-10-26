import { HelpIcon, EditorIcon } from './Icons';
import type { Icon } from './Icons';
import type { Wheel } from './Wheel';

interface Icons {
  [key: string]: Icon;
}

export class IconController {
  private iconContainer: HTMLDivElement;
  private icons: Icons;

  constructor(iconContainer: HTMLDivElement, wheel: Wheel) {
    this.iconContainer = iconContainer;
    this.icons = {};

    this.iconContainer.querySelectorAll('img').forEach((iconElement: HTMLDivElement) => {
      if (iconElement.dataset.modalid === 'help') {
        this.icons[iconElement.dataset.modalid!] = new HelpIcon(iconElement);
      } else if (iconElement.dataset.modalid === 'editor') {
        this.icons[iconElement.dataset.modalid!] = new EditorIcon(iconElement, wheel);
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
