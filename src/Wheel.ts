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

function makeColorGradient(frequency1: number, frequency2: number, frequency3: number, phase1: number, phase2: number, phase3: number, center: number = 128, width: number = 127, len: number = 50) : Color3[] {
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
  private canvas: HTMLCanvasElement;
  private engine: Engine;
  private scene: Scene;
  private camera: ArcRotateCamera;
  private wheelOptions: string[];
  private transformNode: TransformNode;
  private colors: Color3[];
  private sizeOfSlice: number;
  private spinBeforeInteraction: Tween<any>;
  private isSpinning: boolean;

  constructor(canvas: HTMLCanvasElement, wheelOptions: string[] = []) {
    if (!canvas) throw new Error('No canvas provided');
    if (wheelOptions.length === 0) throw new Error('No wheel options provided');

    this.canvas = canvas;
    this.wheelOptions = wheelOptions;
    this.sizeOfSlice = 1 / wheelOptions.length;
    this.isSpinning = false;

    this.engine = new Engine(this.canvas, true);
    this.scene = new Scene(this.engine);
    this.camera = new ArcRotateCamera('camera', Math.PI / 2, 0, 2, new Vector3(0, 0, 0), this.scene);
    this.transformNode = new TransformNode('transformNode', this.scene);
    this.colors = makeColorGradient(0.9, 0.9, 0.9, 0, 2, 4, 164, 91);

    // this.camera.attachControl(this.canvas, true);

    this.spinBeforeInteraction = new Tween(this.transformNode.rotation)
      .to({ y: this.transformNode.rotation.y + Math.PI * 2 }, 100000)
      .repeat(Infinity);

    this.initialize();
  }

  protected initialize(): void {
    this.shuffleNames();
    this.createSlices();
    this.createWinnerPointer();

    this.engine.runRenderLoop(this.renderLoop.bind(this));

    this.camera.setTarget(Vector3.Zero());
  
    window.addEventListener('resize', this.resizeEvent.bind(this));

    this.spinBeforeInteraction.start();
  }

  private renderLoop(): void {
    TweenUpdate(performance.now());
    this.scene.render();
  }

  private createPeg(offset: number = 0, parent: any = null): void {
    const peg: Mesh = CreateCylinder('peg', { height: 1 }, this.scene);

    peg.scaling.x = 0.01;
    peg.scaling.y = 0.01;
    peg.scaling.z = 0.01;
    peg.position.x = 0.49;
    peg.position.y = 0.01;

    peg.setPivotPoint(new Vector3(0, peg.position.y, 0), Space.WORLD);

    peg.position.x -= peg.getPivotPoint().x * 0.99;
    peg.rotation.y = ((Math.PI * 2) * this.sizeOfSlice) * offset;

    if (parent) {
      peg.parent = parent;
    }
  }

  private createName(name: string = '', offset: number = 0, parent: any = null): void {
    const nameTexture: DynamicTexture = new DynamicTexture(`name_${name}`, { width: 500, height: 50 }, this.scene);
    const namePlane: Mesh = CreatePlane(`name_${name}`, { width: .5, height: .05 }, this.scene);
    const nameMaterial: StandardMaterial = new StandardMaterial("Mat", this.scene);

    nameTexture.updateSamplingMode(Texture.BILINEAR_SAMPLINGMODE);
    nameTexture.hasAlpha = true;
    nameTexture.anisotropicFilteringLevel = 16;
    nameTexture.drawText(name, 50, null, '32px Arial', "#000000", null, true);
    nameTexture.update();

    nameMaterial.alphaMode = Engine.ALPHA_COMBINE;
    nameMaterial.useAlphaFromDiffuseTexture = true;
    nameMaterial.diffuseTexture = nameTexture;
    nameMaterial.ambientColor = new Color3(1, 1, 1);

    namePlane.material = nameMaterial;
    namePlane.rotation.x = Math.PI / 2;
    namePlane.position.y = 0.006;
    namePlane.position.x = 0.25;
    namePlane.scaling.y = -1;
    namePlane.scaling.x = -1;
    
    namePlane.setPivotPoint(new Vector3(0, namePlane.position.y, 0), Space.WORLD);
      
    namePlane.position.x -= namePlane.getPivotPoint().x * 2;
    namePlane.rotation.y = ((Math.PI * 2) * this.sizeOfSlice) * offset;
    
    if (parent) {
      namePlane.parent = parent;
    }
  }

  private createSlices(): void {
    for (let index: number = 0; index < this.wheelOptions.length; ++index) {
      const wheelOption: string = this.wheelOptions[index];
      const slice: Mesh = CreateCylinder(`cylendar_${wheelOption}`, { arc: this.sizeOfSlice, height: 0.01 }, this.scene);
      const sliceColor: StandardMaterial = new StandardMaterial(`material_${wheelOption}`, this.scene);
  
      sliceColor.emissiveColor = this.colors[index];
      sliceColor.diffuseColor = Color3.Black();
  
      slice.material = sliceColor;
      slice.rotation.y = ((Math.PI * 2) * this.sizeOfSlice) * (index + 0.5);

      this.createName(wheelOption, index, this.transformNode);
      // this.createPeg(index, this.transformNode);

      slice.parent = this.transformNode;
    }
  }

  private createWinnerPointer(): void {
    const winnerPointer: Mesh = new Mesh('winnerPointer', this.scene);
    const winnerPointerBorder: Mesh = new Mesh('winnerPointer', this.scene);
    const winnerPointerMaterial: StandardMaterial = new StandardMaterial('winnerPointerMaterial', this.scene);
    const winnerPointerBorderMaterial: StandardMaterial = new StandardMaterial('winnerPointerMaterial', this.scene);

    const winnerPointerVertexData = new VertexData();

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
    winnerPointerBorder.scaling.x /= 180;
    winnerPointerBorder.scaling.y /= 180;
    winnerPointerBorder.scaling.z /= 180;
    winnerPointerBorder.rotation.y = -Math.PI / 2;
    winnerPointerBorder.position.y = 0.01;
    winnerPointerBorder.position.x = 0.52;

    VertexData.ComputeNormals(winnerPointerVertexData.positions, winnerPointerVertexData.indices, winnerPointerVertexData.normals)

    winnerPointerVertexData.applyToMesh(winnerPointer);
    winnerPointerVertexData.applyToMesh(winnerPointerBorder);

    winnerPointerMaterial.emissiveColor = Color3.White();
    winnerPointerBorderMaterial.emissiveColor = Color3.Black();
    winnerPointer.material = winnerPointerMaterial;
    winnerPointerBorder.material = winnerPointerBorderMaterial;
  }

  private resizeEvent(): void {
    this.engine.resize();
  }

  private shuffleNames(): void {
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
          const sliceArcWidth: number = ((Math.PI * 2) * this.sizeOfSlice);
          const finalAngleOfRotation: number = (y-sliceArcWidth / 2) % (Math.PI * 2);
          const winningSlot: number = finalAngleOfRotation / sliceArcWidth;
          const fixWinningSlot: number = Math.floor(this.wheelOptions.length-winningSlot) % this.wheelOptions.length;

          this.isSpinning = false;

          resolve(this.wheelOptions[fixWinningSlot]);
        })
        .start();
    });
  }
}
