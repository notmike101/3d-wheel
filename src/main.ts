import { Wheel } from './Wheel';
import { IconController } from './IconController';
import './style.scss';

function parseHash(): string[] {
  return decodeURI(location.hash.substring(1, location.hash.length)).split('|') ?? [];
}

window.addEventListener('DOMContentLoaded', (): void => {
  const canvas: HTMLCanvasElement = document.getElementById('renderCanvas') as HTMLCanvasElement;
  const winnerDiv: HTMLDivElement = document.getElementById('winner') as HTMLDivElement;
  const clickToSpinDiv: HTMLDivElement = document.getElementById('clickToSpin') as HTMLDivElement;
  const wheelOptions: string[] = parseHash();
  const wheel: Wheel = new Wheel(canvas, wheelOptions);
  const iconController: IconController = new IconController(document.getElementById('icons') as HTMLDivElement, wheel);

  async function spinWheel(): Promise<void> {
    if (winnerDiv) winnerDiv.style.display = 'none';
    if (clickToSpinDiv) clickToSpinDiv.style.display = 'none';
    
    iconController.isVisible = false;

    try {
      const winner: string | void = await wheel.spin();

      if (winnerDiv) {
        winnerDiv.style.display = 'block';
        winnerDiv.textContent = `${winner} wins!`
      }

      if (clickToSpinDiv) {
        clickToSpinDiv.textContent = 'Click to spin again!';
        clickToSpinDiv.style.top = 'calc(50% - 50px)';
        clickToSpinDiv.style.display = 'flex';
      }
    } catch (err) {
      console.warn(err);
    }

    iconController.isVisible = true;
  }

  window.addEventListener('hashchange', (): void => {
    try {
      if (wheel.isSpinning === false) {
        wheel.updateWheelItems(parseHash());
      }
    } catch (err) {
      console.warn(err);
    }
  });

  async function documentSpinClickHandler(event: PointerEvent): Promise<void> {
    if (event.button !== 2) {
      if (event.target === canvas || event.target === winnerDiv || event.target === clickToSpinDiv) {
        document.removeEventListener('pointerup', documentSpinClickHandler);

        await spinWheel();

        document.addEventListener('pointerup', documentSpinClickHandler);
      }
    }
  }

  // canvas.addEventListener('pointerup', spinWheel);
  document.addEventListener('pointerup', documentSpinClickHandler);
});
