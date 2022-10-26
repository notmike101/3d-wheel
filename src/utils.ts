import { Color3 } from '@babylonjs/core/Maths/math.color';
import { CreatePlane } from '@babylonjs/core/Meshes/Builders/planeBuilder';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Quaternion, Vector3 } from '@babylonjs/core/Maths/math.vector';

import type { Scene } from '@babylonjs/core/scene';
import type { Texture } from '@babylonjs/core/Materials/Textures/texture';

export const splitHash = (splitter = '|') => decodeURI(location.hash.substring(1, location.hash.length)).split(splitter).filter((item) => Boolean(item)) ?? [];

export const shuffleArrayInPlace = (target: unknown[]) => {
  for (let i = target.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = target[i];

    target[i] = target[j];
    target[j] = temp;
  }
};

export const waitFor = (waitTime = 0) => new Promise<void>((resolve) => setTimeout(resolve, waitTime));

export const makeColorGradient = (frequency1: number, frequency2: number, frequency3: number, phase1: number, phase2: number, phase3: number, center = 128, width = 127, len = 50) => {
  const output: Color3[] = [];

  for (let i = 0; i < len; i += 1) {
    const red = Math.sin(frequency1 * i + phase1) * width + center;
    const green = Math.sin(frequency2 * i + phase2) * width + center;
    const blue = Math.sin(frequency3 * i + phase3) * width + center;

    output.push(new Color3(red / 255, green / 255, blue / 255));
  }

  return output;
};

const shift = (() => {
  const a = new Uint32Array(1);
  const x = new Uint32Array(1);

  a[0] = 1337;

  return () => {
    x[0] = a[0];
    x[0] ^= x[0] << 13;
    x[0] ^= x[0] >> 17;
    x[0] ^= x[0] << 5;

    return a[0] = x[0];
  }
})();

export const xorshift = () => shift() / 4294967296;

export const createPlaneWithTexture = (scene: Scene, texture: Texture, size: number, name: string) => {
  const plane = CreatePlane(name, {width: size, height: size}, scene);

  plane.material = new StandardMaterial(name, scene);
  plane.material.backFaceCulling = false;
  (plane.material as StandardMaterial).diffuseTexture = texture;
  (plane.material as StandardMaterial).opacityTexture = (plane.material as StandardMaterial).diffuseTexture;
  // Emissive color is used to make the texture visible
  (plane.material as StandardMaterial).emissiveColor = new Color3(1, 1, 1);
  plane.isVisible = false;

  return plane;
};

export const setQuaternionDirection = (localAxis: Vector3, yawCor = 0, pitchCor = 0, rollCor = 0, result: Quaternion) => {
  const yaw = -Math.atan2(localAxis.z, localAxis.x) + Math.PI / 2;
  const len = Math.sqrt(localAxis.x * localAxis.x + localAxis.z * localAxis.z);
  const pitch = -Math.atan2(localAxis.y, len);

  Quaternion.RotationYawPitchRollToRef(yaw + yawCor, pitch + pitchCor, rollCor, result);
};

export const generateSphericallyRandomVector = (seed = 1) => {
  const theta = xorshift() * 2 * Math.PI;
  const phi = Math.acos(xorshift() * 2 - 1);
  const random = xorshift() * seed;

  return new Vector3(random * Math.sin(phi) * Math.cos(theta), random * Math.sin(phi) * Math.sin(theta), random * Math.cos(phi));
};
