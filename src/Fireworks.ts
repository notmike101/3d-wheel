import {Scene} from "@babylonjs/core/scene";
import {
    Color4,
    MeshBuilder, Particle, ParticleSystem, Scalar, Texture, TransformNode,
    Vector3,
    VertexBuffer
} from "@babylonjs/core";

export class Fireworks implements FireworksInterface {
    private scene: Scene;

    constructor(scene: Scene) {
        this.scene = scene;
    }

    public shootFirework(x: number, y: number, z: number): void {
        let firework = new TransformNode("firework", this.scene);
        firework.position = new Vector3(x, y, z + 80);
        firework.rotation.x = Math.PI / 2;

        let particleSystem = new ParticleSystem("fountain", 350, this.scene);
        let updateFunction = function(this: ParticleSystem, particles: Particle[]) {
            firework.position.z = Scalar.SmoothStep(firework.position.z, z, 0.11);
            this.emitRate = this.emitRate >= 4 ? this.emitRate - 4 : 1;
            this.maxSize = this.maxSize > this.minSize ? this.maxSize - 0.005 : this.minSize;
            for (let index = 0; index < particles.length; index++) {
                let particle = particles[index];
                particle.age += this._scaledUpdateSpeed;
                if (particle.age >= particle.lifeTime) {
                    this.recycleParticle(particle);
                    index--;
                } else {
                    particle.size -= 0.01;
                    particle.direction.scaleToRef(particleSystem._scaledUpdateSpeed, particleSystem._scaledDirection);
                    particle.position.addInPlace(particleSystem._scaledDirection);
                    particleSystem.gravity.scaleToRef(particleSystem._scaledUpdateSpeed, particleSystem._scaledGravity);
                    particle.direction.addInPlace(particleSystem._scaledGravity);
                }
            }
            if (this.emitRate === 1) {
                this.stop();
            }
        };
        particleSystem.particleTexture = new Texture('/media/flare.png', this.scene);
        particleSystem.updateFunction = updateFunction;
        particleSystem.emitter = firework;
        particleSystem.createConeEmitter(2, 0.5);
        particleSystem.particleEmitterType.emitFromSpawnPointOnly = true;
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

    private explodeFirework(position: Vector3): void {
        let centerExplosion = MeshBuilder.CreateSphere("explosion", { segments: 2, diameter: 1}, this.scene);
        centerExplosion.isVisible = false;
        centerExplosion.position = position;
        centerExplosion.rotation = new Vector3(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        centerExplosion.useVertexColors = true;
        let verticesPositions = centerExplosion.getVerticesData(VertexBuffer.PositionKind);
        let verticesNormals = centerExplosion.getVerticesData(VertexBuffer.NormalKind);
        let verticesColor = [];
        let particleSystems: ParticleSystem[] = [];

        if (verticesPositions === null || verticesNormals === null) {
            return;
        }
        for (let i = 0; i < verticesPositions.length; i += 3){
            let vertexPosition = new Vector3(
                verticesPositions[i],
                verticesPositions[i + 1],
                verticesPositions[i + 2]
            );
            let vertexNormal = new Vector3(
                verticesNormals[i],
                verticesNormals[i + 1],
                verticesNormals[i + 2]
            );
            let r = Math.random();
            let g = Math.random();
            let b = Math.random();
            let alpha = 1.0;
            let color = new Color4(r, g, b, alpha);
            verticesColor.push(r);
            verticesColor.push(g);
            verticesColor.push(b);
            verticesColor.push(alpha);
            particleSystems.push(this.createParticleSystem(vertexPosition.add(centerExplosion.position), vertexNormal.normalize().scale(1), color));

        }
        centerExplosion.setVerticesData(VertexBuffer.ColorKind, verticesColor);
        let duration = 0;

        const beforeRender = () =>{
            if ((!particleSystems[0].isReady() || !particleSystems[0].isAlive()) && duration === 0) {
                return;
            }
            if (duration > 2500) {
                this.scene.unregisterBeforeRender(beforeRender);
                centerExplosion.dispose();
                return;
            }
            duration += this.scene.deltaTime;
        };

        this.scene.registerBeforeRender(beforeRender);
    }

    private createParticleSystem(emitter: Vector3, direction: Vector3, color: Color4): ParticleSystem
    {
        let particleSystem = new ParticleSystem("particles", 500, this.scene);
        let updateFunction = function(this: ParticleSystem, particles: Particle[]) {
            for (let index = 0; index < particles.length; index++) {
                let particle = particles[index];
                particle.age += this._scaledUpdateSpeed;
                if (particle.age >= particle.lifeTime) {
                    this.recycleParticle(particle);
                    index--;
                } else {
                    if(particle.size < .162){
                        particle.size += .005;
                    }
                    particle.direction.scaleToRef(particleSystem._scaledUpdateSpeed, particleSystem._scaledDirection);
                    particle.position.addInPlace(particleSystem._scaledDirection);
                    particleSystem.gravity.scaleToRef(particleSystem._scaledUpdateSpeed, particleSystem._scaledGravity);
                    particle.direction.addInPlace(particleSystem._scaledGravity);
                }
            }
        };

        particleSystem.updateFunction = updateFunction;
        particleSystem.particleTexture = new Texture('/media/Flare.png', this.scene);
        particleSystem.emitter = emitter;
        particleSystem.minEmitBox = new Vector3(0, 0, 0);
        particleSystem.maxEmitBox = new Vector3(0, 0, 0);
        particleSystem.color1 = color;
        particleSystem.color2 = color;
        particleSystem.colorDead = new Color4(0, 0, 0, 0.0);
        particleSystem.minSize = .1;
        particleSystem.maxSize = .1;
        particleSystem.minLifeTime = 1;
        particleSystem.maxLifeTime = 2;
        particleSystem.emitRate = 500;
        particleSystem.blendMode = ParticleSystem.BLENDMODE_ONEONE;
        particleSystem.gravity = new Vector3(0, 0, 4);
        particleSystem.direction1 = direction;
        particleSystem.direction2 = direction;
        particleSystem.minEmitPower = 10;
        particleSystem.maxEmitPower = 13;
        particleSystem.updateSpeed = 1 / 60;
        particleSystem.targetStopDuration = 0.3;
        particleSystem.disposeOnStop = true;
        particleSystem.start();

        return particleSystem;
    }
}