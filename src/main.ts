import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { UniversalCamera } from '@babylonjs/core/Cameras/universalCamera';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { Vector3 } from '@babylonjs/core/Maths/math';
import { Color3 } from '@babylonjs/core/Maths/math';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { Space } from '@babylonjs/core/Maths/math.axis';
import '@babylonjs/core/Materials/standardMaterial';
import * as TWEEN from '@tweenjs/tween.js';

import './style.scss';

function makeColorGradient(frequency1, frequency2, frequency3, phase1, phase2, phase3, center = 128, width = 127, len = 50) {
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
  const engine = new Engine(canvas, true);
  const scene = new Scene(engine);
  const camera = new ArcRotateCamera('camera', 0, 0, 2, new Vector3(0, 0, 0), scene);
  // const camera = new UniversalCamera('camera1', new Vector3(0, 3, 0), scene);
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
  const slices: Array<any> = [];
  const transformNode = new TransformNode('transformNode', scene);
  const colors = makeColorGradient(0.9, 0.9, 0.9, 0, 2, 4, 164, 91);
  const light = new HemisphericLight("light1", new Vector3(0, 0, -1), scene);

  camera.attachControl(canvas, true);

  light.intensity = 10;
  
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

    slice.material = new StandardMaterial(`material_${name}`, scene);
    slice.material.emissiveColor = colors[index];
    slice.material.diffuseColor = new Color3(0, 0, 0);

    nameMaterial.diffuseTexture = nameTexture;
    namePlane.material = nameMaterial;
    nameMaterial.ambientColor = new Color3(1, 1, 1);

    // nameTexture.hasAlpha = true;
    nameTexture.drawText(name, 200, null, '30px Arial', "#ffffff", null, true);
    nameTexture.update();

    // Position name plate
    namePlane.rotation.x = Math.PI / 2;
    namePlane.position.y = 0.01;
    // namePlane.position.z = 0.1;
    namePlane.position.x = 0.25;

    namePlane.scaling.y = -1;
    namePlane.scaling.x = -1;
    
    const currentPivot = namePlane.getAbsolutePivotPoint();

    console.log(currentPivot);

    // namePlane.position = currentPivot;

    // namePlane.setPivotPoint(new Vector3(-0.125, namePlane.position.y, 0), Space.WORLD);
    // namePlane.rotation.y = ((Math.PI * 2) * sizeOfSlice) * index;

    // Setup slice position and parent
    slice.rotation.y = ((Math.PI * 2) * sizeOfSlice) * (index + 0.5);

    slice.parent = transformNode;
    // slice.visibility = false;

    slices.push(slice);
  });

  window.slices = slices;

  camera.setTarget(Vector3.Zero());

  engine.runRenderLoop(() => {
    TWEEN.update(performance.now());
    scene.render();
  });

  window.addEventListener('resize', () => {
    engine.resize();
  });

  document.getElementById('spin')?.addEventListener('click', () => {
    new TWEEN.Tween(transformNode.rotation)
      .to({ y: transformNode.rotation.y + Math.random() * 5 + 50 }, 5000)
      .easing(TWEEN.Easing.Quartic.InOut)
      .start();
  });
}

window.addEventListener('DOMContentLoaded', initialize);
