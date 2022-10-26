import type { Scene } from '@babylonjs/core/scene';
import type { Mesh } from '@babylonjs/core/Meshes/mesh';
import type { Vector3 } from '@babylonjs/core/Maths/math.vector';

export interface FireworksInterface {
  shootFirework(x: number, y: number, z: number);
  explodeFirework(position: Vector3);
}
