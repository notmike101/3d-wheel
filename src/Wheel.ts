import '@babylonjs/core/Audio/audioSceneComponent';

import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { CreateCylinder } from '@babylonjs/core/Meshes/Builders/cylinderBuilder';
import { CreatePlane } from '@babylonjs/core/Meshes/Builders/planeBuilder';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData';
import { update as TweenUpdate, Tween } from '@tweenjs/tween.js';
import { Texture, Space } from './constants';
import { Axis } from '@babylonjs/core/Maths/math.axis';
import { Sound } from '@babylonjs/core/Audio/sound';

function makeColorGradient(frequency1: number, frequency2: number, frequency3: number, phase1: number, phase2: number, phase3: number, center: number = 128, width: number = 127, len: number = 50) : Color3[] {
  const output: Color3[] = [];

  for (let i: number = 0; i < len; i += 1) {
    const red: number = Math.sin(frequency1 * i + phase1) * width + center;
    const grn: number = Math.sin(frequency2 * i + phase2) * width + center;
    const blu: number = Math.sin(frequency3 * i + phase3) * width + center;

    output.push(new Color3(red/255, grn/255, blu/255));
  }

  return output;
}

function shuffleArrayInPlace(target: any[]): void {
  for (let i: number = target.length - 1; i > 0; i -= 1) {
    const j: number = Math.floor(Math.random() * (i + 1));
    const temp: any = target[i];

    target[i] = target[j];
    target[j] = temp;
  }
}

function easeOutElastic(x: number): number {
  const c4: number = (2 * Math.PI) / 3;
  
  return x === 0
    ? 0
    : x === 1
    ? 1
    : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
}
  

export class Wheel {
  private canvas: HTMLCanvasElement;
  private engine: Engine;
  private scene: Scene;
  private camera: ArcRotateCamera;
  private wheelItems: string[];
  private transformNode: TransformNode;
  private colors: Color3[];
  private sizeOfSlice: number;
  private spinBeforeInteraction: Tween<any>;
  private isSpinning: boolean;
  private clickHigh: Sound;
  private clickLow: Sound;
  private flipPointer: Function | null;

  constructor(canvas: HTMLCanvasElement, wheelItems: string[] = []) {
    if (!canvas) throw new Error('No canvas provided');
    if (wheelItems.length === 0) throw new Error('No wheel options provided');

    this.canvas = canvas;
    this.wheelItems = [];
    this.sizeOfSlice = 0;
    this.isSpinning = false;
    this.flipPointer = null;

    this.engine = new Engine(this.canvas, true);
    this.scene = new Scene(this.engine);
    // this.camera = new ArcRotateCamera('camera', Math.PI / 2, 0.4, 2, new Vector3(0, 0, 0), this.scene);
    this.camera = new ArcRotateCamera('camera', Math.PI / 2, 0, 1.5, new Vector3(0, 0, 0), this.scene);
    this.transformNode = new TransformNode('transformNode', this.scene);
    this.colors = makeColorGradient(0.9, 0.9, 0.9, 0, 2, 4, 164, 91);
    this.clickHigh = new Sound('ClickHigh', './media/click_high.wav', this.scene);
    this.clickLow = new Sound('ClickLow', './media/click_low.wav', this.scene);

    this.camera.attachControl(this.canvas, true);

    this.spinBeforeInteraction = new Tween(this.transformNode.rotation)
      .to({ y: this.transformNode.rotation.y + Math.PI * 2 }, 100000)
      .repeat(Infinity)
      .start();

    this.engine.runRenderLoop(this.renderLoop.bind(this));

    this.camera.setTarget(Vector3.Zero());
  
    window.addEventListener('resize', this.resizeEvent.bind(this));

    this.updateWheelItems(wheelItems);
  }

  private renderLoop(): void {
    TweenUpdate(performance.now());
    this.scene.render();
  }

  private createNotch(offset: number = 0): void {
    const notch: Mesh = CreateCylinder('notch', { height: 0.025, diameterTop: 0.01, diameterBottom: 0.01 }, this.scene);
    
    notch.position.y += 0.0125;
    notch.rotation.y = ((Math.PI * 2) * this.sizeOfSlice) * offset;

    notch.markAsDirty();
    notch.translate(Axis.X, -0.495, Space.LOCAL);

    notch.parent = this.transformNode;
  }

  private createName(name: string = '', offset: number = 0): void {
    const nameTexture: DynamicTexture = new DynamicTexture(`nametexture_${name}`, { width: 500, height: 50 }, this.scene);
    const namePlane: Mesh = CreatePlane(`namemesh_${name}`, { width: .5, height: .05 }, this.scene);
    const nameMaterial: StandardMaterial = new StandardMaterial(`namematerial_${name}`, this.scene);

    nameTexture.updateSamplingMode(Texture.BILINEAR_SAMPLINGMODE);
    nameTexture.hasAlpha = true;
    nameTexture.anisotropicFilteringLevel = 16;
    nameTexture.drawText(name, 50, null, '32px Arial', "#000000", null, true);
    nameTexture.update();

    nameMaterial.useAlphaFromDiffuseTexture = true;
    nameMaterial.diffuseTexture = nameTexture;

    namePlane.material = nameMaterial;
    namePlane.rotation.x = Math.PI / 2;
    namePlane.position.y = 0.006;
    namePlane.scaling.y = -1;
    namePlane.scaling.x = -1;
    namePlane.rotation.y = ((Math.PI * 2) * this.sizeOfSlice) * offset;

    namePlane.markAsDirty();
    namePlane.translate(Axis.X, -0.25, Space.LOCAL);
    
    namePlane.parent = this.transformNode;
  }

  private createSlices(): void {
    for (let index: number = 0; index < this.wheelItems.length; index += 1) {
      const wheelOption: string = this.wheelItems[index];
      const slice: Mesh = CreateCylinder(`cylendar_${wheelOption}`, { arc: this.sizeOfSlice, height: 0.01 }, this.scene);
      const sliceColor: StandardMaterial = new StandardMaterial(`material_${wheelOption}`, this.scene);
  
      sliceColor.emissiveColor = this.colors[index];
      sliceColor.diffuseColor = Color3.Black();
  
      slice.material = sliceColor;
      slice.rotation.y = ((Math.PI * 2) * this.sizeOfSlice) * (index + 0.5);

      this.createName(wheelOption, index);
      this.createNotch(index);

      slice.parent = this.transformNode;
    }
  }

  private createWinnerPointer(): void {
    const winnerPointer: Mesh = new Mesh('winnerPointer', this.scene);
    const winnerPointerBorder: Mesh = new Mesh('winnerPointer', this.scene);
    const winnerPointerMaterial: StandardMaterial = new StandardMaterial('winnerPointerMaterial', this.scene);
    const winnerPointerBorderMaterial: StandardMaterial = new StandardMaterial('winnerPointerMaterial', this.scene);
    const winnerPointerVertexData: VertexData = new VertexData();

    winnerPointerBorder.scaling.x /= 150;
    winnerPointerBorder.scaling.y /= 150;
    winnerPointerBorder.scaling.z /= 150;

    winnerPointerVertexData.positions = [
      3, 0, -2,
      0, 0, 6,
      -3, 0, -2,
    ];

    winnerPointerVertexData.indices = [0, 1, 2];
    winnerPointerVertexData.normals = [];

    winnerPointer.scaling.x /= 200;
    winnerPointer.scaling.y /= 200;
    winnerPointer.scaling.z /= 200;
    winnerPointer.rotation.y = -Math.PI / 2;
    winnerPointer.position.y = 0.011;
    winnerPointer.position.x = 0.52;

    winnerPointerBorder.parent = winnerPointer;

    VertexData.ComputeNormals(winnerPointerVertexData.positions, winnerPointerVertexData.indices, winnerPointerVertexData.normals)

    winnerPointerVertexData.applyToMesh(winnerPointer);
    winnerPointerVertexData.applyToMesh(winnerPointerBorder);

    winnerPointerMaterial.emissiveColor = Color3.White();
    winnerPointerBorderMaterial.emissiveColor = Color3.Black();
    winnerPointer.material = winnerPointerMaterial;
    winnerPointerBorder.material = winnerPointerBorderMaterial;

    this.flipPointer = ((velocity: number): void => {
      new Tween(winnerPointer.rotation)
        .to({ y: [-Math.PI / 1.28, -Math.PI / 2] }, 1000 / velocity)
        .easing(easeOutElastic)
        .start();
    }).bind(this);
    
    (window as any).flipPointer = this.flipPointer;
  }

  private resizeEvent(): void {
    this.engine.resize();
  }

  // Clear all meshes from the scene and from memory
  public newScene(): void {
    for (let i: number = this.scene.meshes.length - 1; i >= 0; i -= 1) {
      this.scene.meshes[i].dispose();
    }
  }

  public updateWheelItems(wheelItems: string[] = []): void {
    if (this.isSpinning === true) throw new Error('Wheel is spinning');
    if (wheelItems.length === 0) throw new Error('No wheel options provided');

    this.isSpinning = false;

    this.newScene();

    this.wheelItems = wheelItems;
    this.sizeOfSlice = 1 / wheelItems.length;

    shuffleArrayInPlace(this.wheelItems);

    this.createSlices();
    this.createWinnerPointer();
  }

  public spin(): Promise<string | void> {
    return new Promise((resolve, reject): void => {
      if (this.isSpinning) return reject('Wheel is already spinning');

      this.spinBeforeInteraction.stop();

      this.isSpinning = true;

      let lastWholeRotation: number = 0;

      new Tween(this.transformNode.rotation)
        .to({ y: this.transformNode.rotation.y + 100 }, 8000)
        .easing((x: number) => x<.279?2**(10*x-3.8)-0.0717936471873147:1.2-2**(-10*(x-.2))-0.19609374999999996)
        .onComplete(({ y }): void => {
          const sliceArcWidth: number = ((Math.PI * 2) * this.sizeOfSlice);
          const finalAngleOfRotation: number = (y-sliceArcWidth / 2) % (Math.PI * 2);
          const winningSlot: number = finalAngleOfRotation / sliceArcWidth;
          const fixWinningSlot: number = Math.floor(this.wheelItems.length - winningSlot) % this.wheelItems.length;

          this.isSpinning = false;

          resolve(this.wheelItems[fixWinningSlot]);
        })
        .onUpdate(({ y }) => {
          const wholeY: number = Math.floor(y);

          if (wholeY !== lastWholeRotation) {
            lastWholeRotation = wholeY;

            if (wholeY % 4 === 0) {
              this.clickHigh.play();
            } else {
              this.clickLow.play();
            }
          }
        })
        .onStop((): void => {
          this.transformNode.rotation.y = 0;
          this.isSpinning = false;

          reject();
        })
        .start();
    });
  }
}
