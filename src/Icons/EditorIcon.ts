import { Icon } from './Icon';

export class EditorIcon extends Icon {
  protected input: HTMLTextAreaElement;

  constructor(iconElement: HTMLDivElement) {
    super(iconElement);

    this.input = document.createElement('textarea');
    this.input.setAttribute('placeholder', 'Enter wheel items here, one per line');
    this.input.textContent = this.hashItems.join('\n');

    this.input.addEventListener('input', this.handleTextareaChange.bind(this));

    this.modal.querySelector('.inner')!.appendChild(this.input);
  }

  get hashItems(): string[] {
    return decodeURI(location.hash.substring(1, location.hash.length)).split('|') ?? [];
  }

  private handleTextareaChange(): void {
    const hashItems: string[] = this.input.value.split('\n');

    location.hash = hashItems.join('|');
  }
}

export default Object.freeze({
  EditorIcon,
});
