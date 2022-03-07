import { Wheel } from './Wheel';

import './style.scss';

function parseHash(): string[] {
  return decodeURI(location.hash.substring(1, location.hash.length)).split('|') ?? [];
}

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
  const winnerDiv = document.getElementById('winner') as HTMLDivElement;
  const fireworkDiv = document.getElementById('fireworks') as HTMLDivElement;
  const clickToSpinDiv = document.getElementById('clickToSpin') as HTMLDivElement;
  const wheelOptions = parseHash();
  const wheel = new Wheel(canvas, wheelOptions);

  window.addEventListener('pointerup', async () => {
    if (winnerDiv) winnerDiv.style.display = 'none';
    if (fireworkDiv) fireworkDiv.style.display = 'none';
    if (clickToSpinDiv) clickToSpinDiv.style.display = 'none';

    const winner = await wheel.spin();

    if (winnerDiv) {
      winnerDiv.style.display = 'block';
      winnerDiv.textContent = `${winner} wins!`
    }

    if (fireworkDiv) {
      fireworkDiv.style.display = 'block';
    }

    if (clickToSpinDiv) {
      clickToSpinDiv.textContent = 'Click to spin again!';
      clickToSpinDiv.style.top = 'calc(50% - 50px)';
      clickToSpinDiv.style.display = 'flex';
    }
  });
});
