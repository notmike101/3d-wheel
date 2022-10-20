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
import { easeOutElastic, easeOutSigmoid } from './easings';
import {Fireworks} from "@/Fireworks";

function makeColorGradient(frequency1: number, frequency2: number, frequency3: number, phase1: number, phase2: number, phase3: number, center: number = 128, width: number = 127, len: number = 50) : Color3[] {
  const output: Color3[] = [];

  for (let i: number = 0; i < len; i += 1) {
    const red: number = Math.sin(frequency1 * i + phase1) * width + center;
    const green: number = Math.sin(frequency2 * i + phase2) * width + center;
    const blue: number = Math.sin(frequency3 * i + phase3) * width + center;

    output.push(new Color3(red / 255, green / 255, blue / 255));
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

function waitFor(waitTime: number = 0): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, waitTime))
}

export class Wheel implements WheelInterface {
  private canvas: HTMLCanvasElement;
  private engine: Engine;
  private scene: Scene;
  private camera: ArcRotateCamera;
  private wheelItems: string[];
  private transformNode: TransformNode;
  private colors: Color3[];
  private sizeOfSlice: number;
  public isSpinning: boolean;
  private clickHigh: Sound;
  private clickLow: Sound;
  private flipPointer: Function | null;
  private currentWinner: number;  
  private wheelPhysics: WheelPhysics;
  private spinResolver: any;
  private initialDecelerationSpeed: number;

  constructor(canvas: HTMLCanvasElement, wheelItems: string[] = []) {
    if (!canvas) throw new Error('No canvas provided');
    if (wheelItems.length === 0) throw new Error('No wheel options provided');

    this.canvas = canvas;
    this.wheelItems = [];
    this.sizeOfSlice = 0;
    this.isSpinning = false;
    this.flipPointer = null;
    this.currentWinner = -1;
    this.wheelPhysics = {
      rotationSpeed: 0.005,
      rotationAcceleration: 0,
      friction: 1,
      rotation: 0,
    }
    this.spinResolver = null;
    this.initialDecelerationSpeed = 0;

    this.engine = new Engine(this.canvas, true);
    this.scene = new Scene(this.engine);
    // this.camera = new ArcRotateCamera('camera', Math.PI / 2, 0.4, 2, new Vector3(0, 0, 0), this.scene);
    this.camera = new ArcRotateCamera('camera', Math.PI / 2, 0, 1.5, new Vector3(0, 0, 0), this.scene);
    // set  camera near and far clip planes
    this.camera.minZ = 0.01;
    this.transformNode = new TransformNode('transformNode', this.scene);
    this.colors = makeColorGradient(0.9, 0.9, 0.9, 0, 2, 4, 164, 91);
    this.clickHigh = new Sound('ClickHigh', './media/click_high.wav', this.scene);
    this.clickLow = new Sound('ClickLow', './media/click_low.wav', this.scene);

    //this.camera.attachControl(this.canvas, true);

    this.camera.setTarget(Vector3.Zero());

    this.updateWheelItems(wheelItems);

    (window as any).wheel = this;

    this.engine.runRenderLoop(this.renderLoop.bind(this));
    this.scene.registerBeforeRender(this.wheelUpdate.bind(this));
    window.addEventListener('resize', this.resizeEvent.bind(this));
    document.addEventListener('click', () => Engine.audioEngine!.audioContext!.resume());

    // Register onclick for right mouse button
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();

      // Trace cursor position
      const pickResult = new Vector3(
          (this.scene.pointerX - (e.currentTarget.offsetWidth  / 2)) * -0.0465,
          -50,
          (this.scene.pointerY - (e.currentTarget.offsetHeight / 2)) * 0.0465
      );
      const firework = new Fireworks(this.scene);
      firework.explodeFirework(pickResult);
    });
  }

  private wheelUpdate(): void {
    // Update physics (scaled by frame delta time)
    this.wheelPhysics.rotationSpeed += this.wheelPhysics.rotationAcceleration * this.scene.getAnimationRatio();

    // how much to remove from current rotation speed
    const frictionSpeedChange = this.wheelPhysics.rotationSpeed - (this.wheelPhysics.rotationSpeed * this.wheelPhysics.friction)
    this.wheelPhysics.rotationSpeed -= frictionSpeedChange * this.scene.getAnimationRatio();
    this.wheelPhysics.rotation += this.wheelPhysics.rotationSpeed * this.scene.getAnimationRatio();
    this.transformNode.rotation.y = this.wheelPhysics.rotation;

    if (this.wheelPhysics.rotationSpeed && this.wheelPhysics.rotationSpeed < 0.0005) {
      this.wheelPhysics.rotationSpeed = 0;
      // resolve spin promise
      if (this.spinResolver) {
        this.spinResolver();
      }
    }

    // Rotate beta back if friction is < 1
    if (this.wheelPhysics.friction < 1) {
      this.camera.beta = 0.01+ 0.8552 * (this.wheelPhysics.rotationSpeed / this.initialDecelerationSpeed);
    }
    
    // Calculate winner and play sounds if needed
    let tempWinner = this.getCurrentWinner();
    if (tempWinner !== this.currentWinner) {
      this.currentWinner = tempWinner;
      
      if (Math.round(Math.random()) === 0) {
        this.clickHigh.play();
      } else {
        this.clickLow.play();
      }

      if (this.flipPointer) this.flipPointer(1);
    }
  }

  private renderLoop(): void {
    TweenUpdate(performance.now());
    this.scene.render();
  }

  private createNotch(offset: number = 0): void {
    const notch: Mesh = CreateCylinder('notch', { height: 0.025, diameterTop: 0.01, diameterBottom: 0.01 }, this.scene);
    const isEven = this.wheelItems.length % 2 === 0;

    notch.position.y += 0.0125;
    notch.rotation.y = ((Math.PI * 2) * this.sizeOfSlice) * (offset + (isEven ? 0.5 : 0));

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
    nameTexture.drawText(name, 50, null, '34px Verdana', "#000000", null, true);
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

    this.flipPointer = ((): void => {
      new Tween(winnerPointer.rotation)
        .to({ y: [-Math.PI / 1.5, -Math.PI / 2] }, 1000)
        .easing(easeOutElastic)
        .start();
    }).bind(this);
  }

  private resizeEvent(): void {
    this.engine.resize();
  }

  // Clear all meshes from the scene and from memory
  private newScene(): void {
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

  // Returns who would be winning based on where the pointer is pointing
  public getCurrentWinner(): number {
    const sliceArcWidth: number = ((Math.PI * 2) * this.sizeOfSlice);
    const finalAngleOfRotation: number = (this.transformNode.rotation.y - sliceArcWidth / 2) % (Math.PI * 2);
    const winningSlot: number = finalAngleOfRotation / sliceArcWidth;
    const fixWinningSlot: number = Math.floor(this.wheelItems.length - winningSlot) % this.wheelItems.length;

    return fixWinningSlot;
  }

  public async spin(): Promise<string | void> {
    this.isSpinning = true;

    new Tween({ beta: this.camera.beta })
      .to({ beta: 0.8552 }, 900)
      .easing(easeOutSigmoid(7))
      .onUpdate(({ beta }) => {
        this.camera.beta = beta;
      })
      .start();

    const spinPromise = new Promise((resolve) => {
      this.spinResolver = resolve;
    });

    this.wheelPhysics.rotationAcceleration = 0.01;
    await waitFor(500); // how long to accelerate in ms
    this.wheelPhysics.rotationAcceleration = 0;
    await waitFor(2500+500*Math.random()); // How long to hold in ms

    this.wheelPhysics.friction = 0.9825;
    this.initialDecelerationSpeed = this.wheelPhysics.rotationSpeed;

    await spinPromise;

    // Resume slow spin
    this.wheelPhysics.friction = 1;

    this.isSpinning = false;

    this.triggerFireworks();

    return this.wheelItems[this.getCurrentWinner()];

  }

  private triggerFireworks() {
    const waitTimes = [];
    for (let i = 0; i < 12; i++) {
      waitTimes.push((Math.random() * 400));
    }
    waitTimes.push(0);
    this.prepareNextFirework(waitTimes);
  }

  private prepareNextFirework(waitTimes: number[]) {
    if (this.isSpinning) {
      return;
    }
    const waitTime = waitTimes.pop();
    setTimeout(() => {
      const y = (Math.random() * 50) + 50;
      const x = (waitTimes.length % 2 === 0 ? -1 : 1) * ((Math.random() * y * 0.2) + (y * 0.4));
      const z = (Math.random() < 0.5 ? -1 : 1) * (Math.random() * y * 0.3);
      const firework = new Fireworks(this.scene);
      firework.shootFirework(x, -y, z);
      if (waitTimes.length > 0) {
        this.prepareNextFirework(waitTimes);
      }
    }, waitTime)
  }
}