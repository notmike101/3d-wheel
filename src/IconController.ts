// @ts-ignore
import { html as ReadmeHTML } from '../README.md';

class Icon {
  protected icon: HTMLDivElement;
  protected modal: HTMLDivElement;
  protected closeIcon: HTMLDivElement | null;
  public isModalVisible: boolean;
  public isIconVisible: boolean;

  constructor(icon: HTMLDivElement) {
    this.icon = icon;
    this.modal = document.getElementById(icon.dataset.modalid!) as HTMLDivElement;
    this.isModalVisible = false;
    this.isIconVisible = true;

    this.icon.addEventListener('pointerup', this.toggleModalVisibility.bind(this));
    this.closeIcon = this.modal.querySelector('.close-icon');
    
    if (this.closeIcon) {
      this.closeIcon.addEventListener('pointerup', this.toggleModalVisibility.bind(this));
    }
  }

  public toggleModalVisibility() {
    this.isModalVisible = !this.isModalVisible;

    if (this.modal.classList.contains('show')) {
      this.modal.classList.remove('show');
    } else {
      this.modal.classList.add('show');
    }
  }

  public toggleIconVisibility() {
    this.isIconVisible = !this.isIconVisible;

    if (this.icon.classList.contains('show')) {
      this.icon.classList.remove('show');
    } else {
      this.icon.classList.add('show');
    }
  }

  public setModalInnerContent(content: any) {
    this.modal.querySelector('.inner')!.innerHTML = content;
  }
}

class HelpIcon extends Icon {
  constructor(icon: HTMLDivElement) {
    super(icon);
    
    this.setModalInnerContent(ReadmeHTML);
  }
}

class EditorIcon extends Icon {
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

  handleTextareaChange() {
    const hashItems = this.input.value.split('\n');

    location.hash = hashItems.join('|');
  }
}

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
  Icon,
})