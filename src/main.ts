import { Wheel } from './Wheel';
import { Help } from './Help';

import './style.scss';

function parseHash(): string[] {
  return decodeURI(location.hash.substring(1, location.hash.length)).split('|') ?? [];
}

window.addEventListener('DOMContentLoaded', (): void => {
  const canvas: HTMLCanvasElement = document.getElementById('renderCanvas') as HTMLCanvasElement;
  const winnerDiv: HTMLDivElement = document.getElementById('winner') as HTMLDivElement;
  const fireworkDiv: HTMLDivElement = document.getElementById('fireworks') as HTMLDivElement;
  const clickToSpinDiv: HTMLDivElement = document.getElementById('clickToSpin') as HTMLDivElement;
  const wheelOptions: string[] = parseHash();
  const wheel: Wheel = new Wheel(canvas, wheelOptions);
  const help: Help = new Help();

  help.initialize();

  async function spinWheel() {
    if (winnerDiv) winnerDiv.style.display = 'none';
    if (fireworkDiv) fireworkDiv.style.display = 'none';
    if (clickToSpinDiv) clickToSpinDiv.style.display = 'none';

    const winner: string = await wheel.spin();

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
  }

  canvas.addEventListener('pointerup', spinWheel);
  clickToSpinDiv.addEventListener('pointerup', spinWheel);
  winnerDiv.addEventListener('pointerup', spinWheel);
});
