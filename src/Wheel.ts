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
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import '@babylonjs/core/Materials/standardMaterial';
import { update as TweenUpdate, Tween } from '@tweenjs/tween.js';

function makeColorGradient(frequency1: number, frequency2: number, frequency3: number, phase1: number, phase2: number, phase3: number, center: number = 128, width: number = 127, len: number = 50) {
  const output = [];

  for (let i = 0; i < len; ++i) {
    const red = Math.sin(frequency1 * i + phase1) * width + center;
    const grn = Math.sin(frequency2 * i + phase2) * width + center;
    const blu = Math.sin(frequency3 * i + phase3) * width + center;

    output.push(new Color3(red/255, grn/255, blu/255));
  }

  return output;
}

function shuffleArrayInPlace(target: any[]): void {
  for (let i = target.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = target[i];

    target[i] = target[j];
    target[j] = temp;
  }
}

export class Wheel {
  canvas: HTMLCanvasElement;
  engine: Engine;
  scene: Scene;
  camera: ArcRotateCamera;
  wheelOptions: string[];
  transformNode: TransformNode;
  colors: Color3[];
  sizeOfSlice: number;
  spinBeforeInteraction: Tween<any>;
  isSpinning: boolean;

  constructor(canvas: HTMLCanvasElement, wheelOptions: string[] = []) {
    if (!canvas) throw new Error('No canvas provided');
    if (wheelOptions.length === 0) throw new Error('No wheel options provided');

    this.canvas = canvas;
    this.wheelOptions = wheelOptions;
    this.sizeOfSlice = 1 / wheelOptions.length;
    this.isSpinning = false;

    this.engine = new Engine(this.canvas, true);
    this.scene = new Scene(this.engine);;
    this.camera = new ArcRotateCamera('camera', Math.PI / 2, 0, 2, new Vector3(0, 0, 0), this.scene);
    this.transformNode = new TransformNode('transformNode', this.scene);
    this.colors = makeColorGradient(0.9, 0.9, 0.9, 0, 2, 4, 164, 91);

    this.spinBeforeInteraction = new Tween(this.transformNode.rotation)
      .to({ y: this.transformNode.rotation.y + Math.PI * 2 }, 100000)
      .repeat(Infinity);

    this.initialize();
  }

  initialize(): void {
    this.shuffleNames();
    this.#createSlices();
    this.#createWinnerPointer();

    this.engine.runRenderLoop(this.#renderLoop.bind(this));

    this.camera.setTarget(Vector3.Zero());
  
    window.addEventListener('resize', this.#resizeEvent.bind(this));

    this.spinBeforeInteraction.start();
  }

  #renderLoop(): void {
    TweenUpdate(performance.now());
    this.scene.render();
  }

  #createSlices(): void {
    for (let index = 0; index < this.wheelOptions.length; ++index) {
      const wheelOption = this.wheelOptions[index];
      const slice = MeshBuilder.CreateCylinder(`cylendar_${wheelOption}`, { arc: this.sizeOfSlice, height: 0.01 }, this.scene);
      const sliceColor = new StandardMaterial(`material_${wheelOption}`, this.scene);
      const nameTexture = new DynamicTexture(`name_${wheelOption}`, { width: 500, height: 50 }, this.scene);
      const namePlane = MeshBuilder.CreatePlane(`name_${wheelOption}`, { width: .5, height: .05 }, this.scene);
      const nameMaterial = new StandardMaterial("Mat", this.scene);
      let namePivot = null;
  
      nameTexture.updateSamplingMode(Texture.BILINEAR_SAMPLINGMODE);
      nameTexture.hasAlpha = true;
      nameTexture.anisotropicFilteringLevel = 16;
      nameTexture.drawText(wheelOption, 50, null, '32px Arial', "#000000", null, true);
      nameTexture.update();
  
      nameMaterial.alphaMode = Engine.ALPHA_COMBINE;
      nameMaterial.useAlphaFromDiffuseTexture = true;
      nameMaterial.diffuseTexture = nameTexture;
      nameMaterial.ambientColor = new Color3(1, 1, 1);
  
      sliceColor.emissiveColor = this.colors[index];
      sliceColor.diffuseColor = Color3.Black();
  
      slice.material = sliceColor;

      namePlane.material = nameMaterial;
      namePlane.rotation.x = Math.PI / 2;
      namePlane.position.y = 0.006;
      namePlane.position.x = 0.25;
      namePlane.scaling.y = -1;
      namePlane.scaling.x = -1;
      
      namePlane.setPivotPoint(new Vector3(0, namePlane.position.y, 0), Space.WORLD);
      
      namePivot = namePlane.getPivotPoint();
  
      namePlane.position.x -= namePivot.x * 2;
      namePlane.rotation.y = ((Math.PI * 2) * this.sizeOfSlice) * index;
  
      slice.rotation.y = ((Math.PI * 2) * this.sizeOfSlice) * (index + 0.54);
  
      slice.parent = this.transformNode;
  
      namePlane.parent = this.transformNode;
    }
  }

  #createWinnerPointer(): void {
    const winnerPointer = MeshBuilder.CreateDisc(`winnerPointer`, { tessellation: 3, updatable: true }, this.scene);
    const winnerPointerMaterial = new StandardMaterial('winnerPointerMaterial', this.scene);
  
    winnerPointerMaterial.emissiveColor = Color3.White();
  
    winnerPointer.position.set(0.52, 0.009, 0);
    winnerPointer.rotation.set(Math.PI / 2, Math.PI, 0);
    winnerPointer.scaling.set(0.08, 0.03, 0);
    winnerPointer.material = winnerPointerMaterial;
  }

  #resizeEvent(): void {
    this.engine.resize();
  }

  shuffleNames(): void {
    shuffleArrayInPlace(this.wheelOptions);
  }

  spin(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (this.isSpinning) return reject('Wheel is already spinning');

      this.spinBeforeInteraction.stop();

      this.isSpinning = true;

      new Tween(this.transformNode.rotation)
        .to({ y: this.transformNode.rotation.y + 30 }, 8000)
        .easing(x=> x<.279?2**(10*x-3.8)-0.0717936471873147:1.2-2**(-10*(x-.2))-0.19609374999999996)
        .onComplete(({ y }) => {
          const sliceArcWidth = ((Math.PI * 2) * this.sizeOfSlice);
          const finalAngleOfRotation = (y-sliceArcWidth / 2) % (Math.PI * 2) ;
          const winningSlot = finalAngleOfRotation / sliceArcWidth;
          const fixWinningSlot = Math.floor(this.wheelOptions.length-winningSlot) % this.wheelOptions.length;

          resolve(this.wheelOptions[fixWinningSlot]);
        })
        .start();
    });
  }
}
