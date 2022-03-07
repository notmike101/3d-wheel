import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { Vector3 } from '@babylonjs/core/Maths/math';
import { Color3 } from '@babylonjs/core/Maths/math';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { Space } from '@babylonjs/core/Maths/math.axis';
import { AxesViewer } from '@babylonjs/core/Debug/axesViewer';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import '@babylonjs/core/Materials/standardMaterial';
import * as TWEEN from '@tweenjs/tween.js';
import '@babylonjs/inspector';

import './style.scss';

const isDebug = true;
const names = [
  'Lara Pede',
  'Miranda Lee',
  'Phillip McNallen',
  'Chase Erickson',
  'Jose Vasqez',
  'Isaac Sosa',
  'Mike Orozco',
  'Alejandro Favela',
  'Adam Clinkenbeard',
  'Julie Serna',
  'Sophia Harris',
  'Yessenia Flores',
  'Victoria Alfano',
  'Rachel Nador',
  'Raul Chatham',
  'Brandon Grada',
  'Franciso (Javier ...',
  'Jason Pavik',
  'Gil Yefet',
  'Ana Nuez',
  'Denise Byrum',
  'Sam Howard',
  'Erick Rodriguez',
  'Sandra Ornelas',
];
const sizeOfSlice = 1 / names.length;

for (let i = names.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  const temp = names[i];

  names[i] = names[j];
  names[j] = temp;
}

function makeColorGradient(frequency1: any, frequency2: any, frequency3: any, phase1: any, phase2: any, phase3: any, center = 128, width = 127, len = 50) {
  const output = [];

  for (let i = 0; i < len; ++i) {
    const red = Math.sin(frequency1*i + phase1) * width + center;
    const grn = Math.sin(frequency2*i + phase2) * width + center;
    const blu = Math.sin(frequency3*i + phase3) * width + center;

    output.push(new Color3(red/255, grn/255, blu/255));
  }

  return output;
}

function initialize() {
  const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
  const winnerDiv = document.getElementById('winner') as HTMLDivElement;
  const fireworkDiv = document.getElementById('fireworks') as HTMLDivElement;
  const clickToSpinDiv = document.getElementById('clickToSpin') as HTMLDivElement;
  const engine = new Engine(canvas, true);
  const scene = new Scene(engine);
  const camera = new ArcRotateCamera('camera', Math.PI / 2, 0, 2, new Vector3(0, 0, 0), scene);
  const slices: Array<any> = [];
  const transformNode = new TransformNode('transformNode', scene);
  const colors = makeColorGradient(0.9, 0.9, 0.9, 0, 2, 4, 164, 91);

  camera.wheelPrecision = 100;
  camera.pinchPrecision = 100;
  camera.panningInertia = 0;
  camera.maxZ = 50;
  camera.minZ = 0.001;
  
  names.forEach((name, index) => {
    const slice = MeshBuilder.CreateCylinder(`cylendar_${name}`, {
      arc: sizeOfSlice,
      height: 0.01,
    }, scene);
    const nameTexture = new DynamicTexture(`name_${name}`, {
      width: 500,
      height: 50,
    }, scene);
    const namePlane = MeshBuilder.CreatePlane(`name_${name}`, {
      width: .5,
      height: .05,
    }, scene);
    const nameMaterial = new StandardMaterial("Mat", scene); 

    nameTexture.updateSamplingMode(Texture.BILINEAR_SAMPLINGMODE);
    nameTexture.hasAlpha = true;
    nameTexture.anisotropicFilteringLevel = 16;

    nameMaterial.alphaMode = Engine.ALPHA_COMBINE;
    nameMaterial.useAlphaFromDiffuseTexture = true;
    nameMaterial.diffuseTexture = nameTexture;
    nameMaterial.ambientColor = new Color3(1, 1, 1);

    const sliceColor = new StandardMaterial(`material_${name}`, scene);
    sliceColor.emissiveColor = colors[index];
    sliceColor.diffuseColor = new Color3(0, 0, 0);

    slice.material = sliceColor;
    namePlane.material = nameMaterial;

    nameTexture.drawText(name, 50, null, '32px Arial', "#000000", null, true);
    nameTexture.update();

    // Position name plate
    namePlane.rotation.x = Math.PI / 2;
    namePlane.position.y = 0.006; // Slightly above top of the pizza
    namePlane.position.x = 0.25;
    namePlane.scaling.y = -1;
    namePlane.scaling.x = -1;
    
    // Set our pivot and adjust 
    namePlane.setPivotPoint(new Vector3(0, namePlane.position.y, 0), Space.WORLD);
    
    const newPivot = namePlane.getPivotPoint();

    namePlane.position.x -= newPivot.x * 2;

    namePlane.rotation.y = ((Math.PI * 2) * sizeOfSlice) * index;

    // Setup slice position and parent
    slice.rotation.y = ((Math.PI * 2) * sizeOfSlice) * (index + 0.54);

    slice.parent = transformNode;
    // slice.visibility = false;

    namePlane.parent = transformNode;

    slices.push(slice);
  });

  const winnerPointer = MeshBuilder.CreateDisc(`winnerPointer`, {
    tessellation: 3,
    updatable: true,
  }, scene);
  const winnerPointerMaterial = new StandardMaterial('winnerPointerMaterial', scene);

  winnerPointerMaterial.emissiveColor = Color3.White();

  winnerPointer.position.set(0.52, 0.009, 0);
  winnerPointer.rotation.set(Math.PI / 2, Math.PI, 0);
  winnerPointer.scaling.set(0.08, 0.03, 0);
  winnerPointer.material = winnerPointerMaterial;

  if (isDebug) {
    (window as any).scene = scene;
    (window as any).camera = camera;
    (window as any).canvas = canvas;
    (window as any).winnerPointer = winnerPointer;
    (window as any).slices = slices;
    (window as any).transformNode = transformNode;
  }

  camera.setTarget(Vector3.Zero());

  engine.runRenderLoop(() => {
    TWEEN.update(performance.now());
    scene.render();
  });

  window.addEventListener('resize', () => {
    engine.resize();
  });

  const beforeSpin = new TWEEN.Tween(transformNode.rotation)
    .to({ y: transformNode.rotation.y + Math.PI * 2 }, 100000)
    .repeat(Infinity)
    .start()

  window.addEventListener('pointerup', () => {
    if(winnerDiv) winnerDiv.style.display = 'none';
    if (fireworkDiv) fireworkDiv.style.display = 'none';
    if (clickToSpinDiv) clickToSpinDiv.style.display = 'none';

    beforeSpin.stop();

    const spinEnd = new TWEEN.Tween(transformNode.rotation)
      .to({ y: transformNode.rotation.y + 30 }, 8000)
      .easing(x=> x<.279?2**(10*x-3.8)-0.0717936471873147:1.2-2**(-10*(x-.2))-0.19609374999999996)
      .onComplete(({ y }) => {
        const sliceArcWidth = ((Math.PI * 2) * sizeOfSlice);
        const finalAngleOfRotation = (y-sliceArcWidth / 2) % (Math.PI * 2) ;
        const winningSlot = finalAngleOfRotation / sliceArcWidth;
        const fixWinningSlot = Math.floor(names.length-winningSlot) % names.length;

        if (winnerDiv) {
          winnerDiv.style.display = 'block';
          winnerDiv.textContent = `${names[fixWinningSlot]} wins!`
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

    spinEnd.start();
  });
}

window.addEventListener('DOMContentLoaded', initialize);

