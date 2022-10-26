import { Wheel } from '@/Wheel';
import { IconController } from '@/IconController';
import { splitHash } from '@/utils';

import '@/style.scss';

const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
const winnerDiv = document.getElementById('winner') as HTMLDivElement;
const clickToSpinDiv = document.getElementById('clickToSpin') as HTMLDivElement;
const wheelOptions = splitHash('|');
const wheel = new Wheel(canvas, wheelOptions.length === 0 ? [''] : wheelOptions);
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

const hashChangeListener = () => {
  try {
    if (wheel.isSpinning === false) {
      const options = splitHash('|');

      wheel.updateWheelItems(options.length === 0 ? [''] : options);
    }
  } catch (err) {
    console.warn(err);
  }
};

const documentSpinClickHandler = async (event: PointerEvent) => {
  if (event.button === 2) return;

  if (event.target === canvas || event.target === winnerDiv || event.target === clickToSpinDiv) {
    document.removeEventListener('pointerup', documentSpinClickHandler);

    await spinWheel();

    document.addEventListener('pointerup', documentSpinClickHandler);
  }
};

window.addEventListener('hashchange', hashChangeListener);
document.addEventListener('pointerup', documentSpinClickHandler);
