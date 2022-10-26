import { Wheel } from './Wheel';
import { IconController } from './IconController';
import './style.scss';

const parseHash = () => decodeURI(location.hash.substring(1, location.hash.length)).split('|').filter((item) => Boolean(item)) ?? [];

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
  const winnerDiv = document.getElementById('winner') as HTMLDivElement;
  const clickToSpinDiv = document.getElementById('clickToSpin') as HTMLDivElement;
  const wheelOptions = parseHash();
  const wheel = new Wheel(canvas, wheelOptions);
  const iconController = new IconController(document.getElementById('icons') as HTMLDivElement, wheel);

  const spinWheel = async () => {
    if (winnerDiv) winnerDiv.style.display = 'none';
    if (clickToSpinDiv) clickToSpinDiv.style.display = 'none';

    iconController.isVisible = false;

    try {
      const winner = await wheel.spin();

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
  };

  window.addEventListener('hashchange', () => {
    try {
      if (wheel.isSpinning === false) {
        wheel.updateWheelItems(parseHash());
      }
    } catch (err) {
      console.warn(err);
    }
  });

  const documentSpinClickHandler = async (event: PointerEvent) => {
    if (event.button === 2) return;

    if (event.target === canvas || event.target === winnerDiv || event.target === clickToSpinDiv) {
      document.removeEventListener('pointerup', documentSpinClickHandler);

      await spinWheel();

      document.addEventListener('pointerup', documentSpinClickHandler);
    }
  };

  // canvas.addEventListener('pointerup', spinWheel);
  document.addEventListener('pointerup', documentSpinClickHandler);
});
