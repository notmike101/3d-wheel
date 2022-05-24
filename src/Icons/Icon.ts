export class Icon {
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

  public toggleModalVisibility(): void {
    this.isModalVisible = !this.isModalVisible;

    if (this.modal.classList.contains('show')) {
      this.modal.classList.remove('show');
    } else {
      this.modal.classList.add('show');
    }
  }

  public toggleIconVisibility(): void {
    this.isIconVisible = !this.isIconVisible;

    if (this.icon.classList.contains('show')) {
      this.icon.classList.remove('show');
    } else {
      this.icon.classList.add('show');
    }
  }

  public setModalInnerContent(content: any): void {
    this.modal.querySelector('.inner')!.innerHTML = content;
  }
}

export default Object.freeze({
  Icon,
});
