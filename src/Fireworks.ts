import {Scene} from "@babylonjs/core/scene";
import {
    Color4,
    MeshBuilder, Particle, ParticleSystem, Texture,
    Vector3,
    VertexBuffer
} from "@babylonjs/core";

export class Fireworks implements FireworksInterface {
    private scene: Scene;

    constructor(scene: Scene) {
        this.scene = scene;
    }

    public shootFirework(x: number, y: number, z: number): void {
        this.explodeFirework(new Vector3(x, y, z));
    }

    private explodeFirework(position: Vector3): void {
        let centerExplosion = MeshBuilder.CreateSphere("explosion", { segments: 2, diameter: 1}, this.scene);
        centerExplosion.isVisible = false;
        centerExplosion.position = position;
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
                        particle.size = particle.size +.005;
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