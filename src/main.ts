import './style.scss';

class App {
  private options: string[];
  private app: HTMLElement;
  private wheel: HTMLElement;
  private startingPosition: number = 0;

  constructor(app: HTMLElement, options: string[] = []) {
    if (options.length < 4) {
      throw new Error('You need at least 4 options to play my game');
    }

    this.options = options;
    this.app = app;
    this.wheel = this.app.querySelector('.wheel')!;

    this.createWheelElements();
    this.alignToRandomOption();
    this.createActivateButton();
  }

  get wheelOptions(): NodeListOf<HTMLDivElement> {
    return this.app.querySelectorAll('.wheel-item')!;
  }

  private createActivateButton(): void {
    const button: HTMLButtonElement = document.createElement('button');

    button.classList.add('activate-button');
    button.textContent = 'SPIN THE WHEEL';

    button.addEventListener('click', (): void => {
      this.rotateToRandomOption();
    });

    this.app.appendChild(button);
  }

  private createWheelElements(): void {
    this.options.forEach((option: string) => {
      const optionElement: HTMLDivElement = document.createElement('div');
      const optionText: HTMLParagraphElement = document.createElement('p');

      optionElement.classList.add('wheel-item');
      optionText.classList.add('wheel-text');
      optionText.textContent = option;
      
      optionElement.appendChild(optionText);
      this.wheel.appendChild(optionElement);
    });

    const rotateAmount: number = 360 / this.wheelOptions.length;
    const skewAmount: number = Math.floor(90 - rotateAmount) * -1;

    this.wheelOptions.forEach((wheelOption: HTMLDivElement, index: number) => {
      const randomColor: string = Math.floor(Math.random() * 16777215).toString(16) + '55';
      const optionText: HTMLParagraphElement = wheelOption.querySelector('.wheel-text')!;

      optionText.style.transform = `skewY(${skewAmount * -1}deg)`;
      wheelOption.style.transform = `rotate(${rotateAmount * index}deg) skewY(${skewAmount}deg)`;
      wheelOption.style.backgroundColor = '#' + randomColor;
    });
  }

  public alignToRandomOption(): void {
    const randomIndex: number = Math.floor(Math.random() * this.wheelOptions.length);
    const sizeOfEntry: number = 360 / this.wheelOptions.length;
    const targetItem: number = (randomIndex * sizeOfEntry);
    const rotateAmount: number = targetItem + (sizeOfEntry / 2);
    
    this.rotate(rotateAmount, 0, 0);
  }

  public rotateToRandomOption(): void {
    const randomIndex: number = Math.floor(Math.random() * this.wheelOptions.length);
    const sizeOfEntry: number = 360 / this.wheelOptions.length;
    const targetItem: number = (randomIndex * sizeOfEntry);
    const rotateAmount: number = targetItem + (sizeOfEntry / 2);

    
    this.rotate(rotateAmount, 5, 10000);
  }

  private rotate(degrees: number, rotations: number = 1, duration: number = 4000): void {
    const endPosition: number = degrees + (rotations * 360);

    this.wheel.animate(
      [
        { transform: `rotate(${this.startingPosition}deg)` },
        { transform: `rotate(${endPosition}deg)` },
      ],
      {
        duration,
        iterations: 1,
        easing: 'ease-in-out',
        fill: 'forwards',
      }
    );

    this.startingPosition = endPosition % 360;
  }
};

const appElement: HTMLDivElement = document.querySelector('#app')!;
const options: string[] = [
  'Raul',
  'Chase',
  'Alejandro',
  'Brandon',
  'Sam',
  'Miranda',
  'Phil',
  'Jakrey',
  'Rachel',
  'Ana',
  'Sandra',
  'Jason',
  'Lara',
  'Zia',
  'Javier',
  'Tony',
  'Isaac',
  'Jose',
  'Gilahd',
];

new App(appElement, options);
