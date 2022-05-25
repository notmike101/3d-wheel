import { Icon } from './Icon';
import type { Wheel } from '../Wheel';

export class EditorIcon extends Icon {
  protected input: HTMLTextAreaElement;
  private wheel: Wheel;

  constructor(iconElement: HTMLDivElement, wheel: Wheel) {
    super(iconElement);

    this.input = document.createElement('textarea');
    this.wheel = wheel;

    this.input.setAttribute('placeholder', 'Enter wheel items here, one per line');
    this.input.textContent = this.hashItems.join('\n');

    this.input.addEventListener('input', this.handleTextareaChange.bind(this));

    this.modal.querySelector('.inner')!.appendChild(this.input);

    window.addEventListener('hashchange', (): void => {
      if (this.wheel.isSpinning === false) {
        this.input.value = this.hashItems.join('\n');
      }
    });
  }

  get hashItems(): string[] {
    return decodeURI(location.hash.substring(1, location.hash.length)).split('|') ?? [];
  }

  private handleTextareaChange(): void {
    if (this.wheel.isSpinning === false) {
      const hashItems: string[] = this.input.value.split('\n');

      location.hash = hashItems.join('|');
    }
  }

  public toggleModalVisibility(): void {
    this.isModalVisible = !this.isModalVisible;

    if (this.modal.classList.contains('show')) {
      this.modal.classList.remove('show');
    } else {
      this.modal.classList.add('show');
    }
  }
}

export default Object.freeze({
  EditorIcon,
});
