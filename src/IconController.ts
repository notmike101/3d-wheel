import { HelpIcon, EditorIcon } from '@/Icons';

import type { IconControllerInterface, Icons } from '@type/iconcontroller';
import type { Wheel } from '@/Wheel';

export class IconController implements IconControllerInterface {
  private iconContainer: HTMLDivElement;
  private icons: Icons;

  constructor(iconContainer: HTMLDivElement, wheel: Wheel) {
    this.iconContainer = iconContainer;
    this.icons = {};

    this.iconContainer.querySelectorAll('img').forEach((iconElement) => {
      if (iconElement.dataset.modalid === 'help') {
        this.icons[iconElement.dataset.modalid] = new HelpIcon(iconElement);
      } else if (iconElement.dataset.modalid === 'editor') {
        this.icons[iconElement.dataset.modalid] = new EditorIcon(iconElement, wheel);
      }
    });

    this.isVisible = true;
  }

  get isVisible() {
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
