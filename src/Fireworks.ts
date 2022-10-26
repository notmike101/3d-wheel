import '@babylonjs/core/Meshes/thinInstanceMesh';

import { Scene } from '@babylonjs/core/scene';
import { Color4, Color3 } from '@babylonjs/core/Maths/math.color';
import { Particle } from '@babylonjs/core/Particles/particle';
import { ParticleSystem } from '@babylonjs/core/Particles/particleSystem';
import { Scalar } from '@babylonjs/core/Maths/math.scalar';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { Vector3, Matrix, Quaternion } from '@babylonjs/core/Maths/math.vector';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';
import { xorshift, createPlaneWithTexture, setQuaternionDirection, generateSphericallyRandomVector } from './utils';

import type { FireworksInterface } from '@type/fireworks';
import type { ConeParticleEmitter } from '@babylonjs/core/Particles/EmitterTypes/coneParticleEmitter';

export class Fireworks implements FireworksInterface {
    private scene: Scene;
    private plane: Mesh;
    private instanceProps;

    constructor(scene: Scene) {
        this.scene = scene;

        // Load a texture
        const texture = new Texture('./media/flare.png', scene);

        // Create a plane with the texture
        this.plane = createPlaneWithTexture(scene, texture, 2, "plane");

        this.instanceProps = [];

        for (let i = 0; i < 1000; i++) {
            this.instanceProps.push({
                position: Vector3.Zero(),
                direction: Vector3.Zero(),
                scaling: Vector3.Zero(),
                rotation: Quaternion.Zero(),
            });
        }
    }

    public shootFirework(x: number, y: number, z: number) {
        const firework = new TransformNode("firework", this.scene);

        firework.position = new Vector3(x, y, z + 80);
        firework.rotation.x = Math.PI / 2;

        const particleSystem = new ParticleSystem("fountain", 350, this.scene);

        const updateFunction = function(this: ParticleSystem, particles: Particle[]) {
            firework.position.z = Scalar.SmoothStep(firework.position.z, z, 0.11);
            this.emitRate = this.emitRate >= 4 ? this.emitRate - 4 : 1;
            this.maxSize = this.maxSize > this.minSize ? this.maxSize - 0.005 : this.minSize;

            for (let index = 0; index < particles.length; index++) {
                const particle = particles[index];

                particle.age += (this as any)._scaledUpdateSpeed;

                if (particle.age >= particle.lifeTime) {
                    this.recycleParticle(particle);
                    index--;
                } else {
                    particle.size -= 0.01;
                    particle.direction.scaleToRef((particleSystem as any)._scaledUpdateSpeed, (particleSystem as any)._scaledDirection);
                    particle.position.addInPlace((particleSystem as any)._scaledDirection);
                    particleSystem.gravity.scaleToRef((particleSystem as any)._scaledUpdateSpeed, (particleSystem as any)._scaledGravity);
                    particle.direction.addInPlace((particleSystem as any)._scaledGravity);
                }
            }

            if (this.emitRate === 1) {
                this.stop();
            }
        };

        particleSystem.particleTexture = new Texture('/media/flare.png', this.scene);
        particleSystem.updateFunction = updateFunction;
        particleSystem.emitter = firework as AbstractMesh;
        particleSystem.createConeEmitter(2, 0.5);
        (particleSystem.particleEmitterType as ConeParticleEmitter).emitFromSpawnPointOnly = true;
        particleSystem.color1 = new Color4(1, 0.9, 0.8, 1.0);
        particleSystem.color2 = new Color4(1, 0.5, 0.2, 1.0);
        particleSystem.colorDead = new Color4(0, 0, 0, 0);
        particleSystem.minSize = 0.5;
        particleSystem.maxSize = 1;
        particleSystem.minLifeTime = 0.5;
        particleSystem.maxLifeTime = 2;
        particleSystem.minScaleX = 0.4;
        particleSystem.maxScaleX = 0.9;
        particleSystem.emitRate = 350;
        particleSystem.blendMode = ParticleSystem.BLENDMODE_ONEONE;
        particleSystem.minEmitPower = 30;
        particleSystem.maxEmitPower = 30;
        particleSystem.updateSpeed = 1 / 60;
        particleSystem.disposeOnStop = true;

        particleSystem.onStoppedObservable.add(() => {
            setTimeout(() => {
                this.explodeFirework(firework.position);
                firework.dispose();
            }, 200);
        });
        particleSystem.start();
    }

    public explodeFirework(position: Vector3) {
        const color = new Color3(xorshift() + 0.4, xorshift() + 0.4, xorshift() + 0.4);

        (this.plane.material as StandardMaterial).emissiveColor = color;
        let m = Matrix.Identity();
        let matricesData = new Float32Array(16 * this.instanceProps.length);

        const rotation = Quaternion.Identity();
        const scaling = new Vector3(0.1, 1, 1);

        for (let i = 0; i < this.instanceProps.length; i++) {
            const sRandom = generateSphericallyRandomVector();

            this.instanceProps[i].position.set(position.x, position.y, position.z);
            this.instanceProps[i].direction = sRandom; // Send the sprites off in random directions
            this.instanceProps[i].direction.normalize();
            this.instanceProps[i].direction.scaleInPlace((9 + 1 * xorshift()) / 8);  // use /10 if close to wheel
            this.instanceProps[i].scaling = scaling;
            Matrix.ComposeToRef(scaling, rotation, position, m);
            m.copyToArray(matricesData, i * 16);
        }

        this.plane.thinInstanceSetBuffer("matrix", matricesData, 16);
        this.plane.isVisible = true;

        // Temporary objects to avoid memory allocation in hot loop
        const GRAVITY = new Vector3(0, 0, 0.0033);
        const tmpVec1 = new Vector3();

        const zeroQuat = Quaternion.Zero();
        const tmpQuat1 = new Quaternion();

        // Hook on to the render loop to update the sprites
        const beforeRender = () => {
            for (let i = 0; i < this.instanceProps.length; i++)
            {
                // Update velocities

                // Apply velocity to position
                tmpVec1.copyFrom(this.instanceProps[i].direction);
                tmpVec1.scaleInPlace(.1*this.scene.getAnimationRatio());
                this.instanceProps[i].position.addInPlace(tmpVec1);

                // Apply gravity
                tmpVec1.copyFrom(GRAVITY);
                tmpVec1.scaleInPlace(this.scene.getAnimationRatio());
                this.instanceProps[i].direction.addInPlace(tmpVec1);

                // drag coefficient
                tmpVec1.copyFrom(this.instanceProps[i].direction);
                tmpVec1.scaleInPlace(0.015);
                tmpVec1.scaleInPlace(this.scene.getAnimationRatio());
                this.instanceProps[i].direction.subtractInPlace(tmpVec1);

                // Update angle of plane to face direction of travel
                tmpQuat1.copyFrom(zeroQuat);
                setQuaternionDirection(this.instanceProps[i].direction, 0, Math.PI / 2, 0, tmpQuat1);
                this.instanceProps[i].rotation = tmpQuat1;

                // Simple scailing of y based on magnitude of velocity (Might cap the max here or use log)
                this.instanceProps[i].scaling.y = this.instanceProps[i].direction.length();
                Matrix.ComposeToRef(this.instanceProps[i].scaling, this.instanceProps[i].rotation, this.instanceProps[i].position, m);
                m.copyToArray(matricesData, i * 16);
            }

            // Fade out the original instance
            if (this.plane?.material) {
                this.plane.material.alpha -= 0.0025 * this.scene.getAnimationRatio();

                if (this.plane.material.alpha <= 0) {
                    // this.plane.material.isVisible = false;
                    this.plane.dispose(false, true);
                    this.scene.unregisterBeforeRender(beforeRender);
                }
            }

            this.plane.thinInstanceBufferUpdated("matrix");
        };
        this.scene.registerBeforeRender(beforeRender);
    }
}
