import {Scene} from "@babylonjs/core/scene";
import {
    Color4,
    MeshBuilder, Particle, ParticleSystem, Scalar, Texture, TransformNode,
    Vector3,
    VertexBuffer,
    SpriteManager, Sprite, StandardMaterial, Mesh, Vector4
} from "@babylonjs/core";


// https://en.wikipedia.org/wiki/Xorshift#xorwow
window.xorshift = function() {
    const a = new Uint32Array(1);
    const x = new Uint32Array(1);
    a[0] = 1337;
    return function() {
        x[0] = a[0];
        x[0] ^= x[0] << 13;
        x[0] ^= x[0] >> 17;
        x[0] ^= x[0] << 5;
        return a[0] = x[0];
    }
}
window.xorshift = xorshift(); // initialize
window._xorshift = xorshift;  // save old
window.xorshift = function() { return window._xorshift() / 4294967296; } // normalize to [0, 1]

// Function to create a plane with a texture
function createPlaneWithTexture(scene: Scene, texture: Texture, size: number, name: string) {
    const plane = MeshBuilder.CreatePlane(name, {width: size, height: size}, scene);
    plane.material = new StandardMaterial(name, scene);
    plane.material.backFaceCulling = false;
    plane.material.diffuseTexture = texture;
    plane.material.opacityTexture = plane.material.diffuseTexture;
    // Emissive color is used to make the texture visible
    plane.material.emissiveColor = new Color4(1, 1, 1, 1);
    plane.isVisible = false;
    return plane;
}


export class Fireworks implements FireworksInterface {
    private scene: Scene;

    constructor(scene: Scene) {
        this.scene = scene;
        // Load a texture 
        let texture = new Texture('/media/flare.png', scene);
        // Create a plane with the texture
        let plane = createPlaneWithTexture(scene, texture, 2, "plane");
        this.plane = plane;

        //const FlareManager = new SpriteManager('flares', '/media/flare.png', 1000, 256, scene);
        this.sprites = [];
        for (let i = 0; i < 1000; i++) {
            const flare = plane.createInstance('flare' + i);
            flare.isVisible = false;
            // Set x scale to 0.015
            flare.scaling.x = 0.15;
            this.sprites.push(flare);
        }
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

    // Use 3D polar coordinates to generate a random vector
    private generateSphereicallyRandomVector(_r): Vector3 {
        if (!_r) _r = 1;
        let theta = window.xorshift() * 2 * Math.PI;
        let phi = Math.acos(window.xorshift() * 2 - 1);
        let r = xorshift() * _r;
        return new Vector3(r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi));
    }

    private explodeFirework(position: Vector3): void {
        const color = new Color4(xorshift()+.4, xorshift()+.4, xorshift()+.4, 1);
        this.plane.material.emissiveColor = color;
        for (let i = 0; i < this.sprites.length; i++) {
            this.sprites[i].isVisible = true;

            let sRandom = this.generateSphereicallyRandomVector();
            this.sprites[i].position.set(position.x, position.y, position.z);
            this.sprites[i].direction = sRandom; // Send the sprites off in random directions
            this.sprites[i].direction.normalize();
            this.sprites[i].direction.scaleInPlace((9+1*xorshift())/8);  // use /10 if close to wheel
        }

        // Hook on to the render loop to update the sprites
        this.scene.registerBeforeRender(() => {
            for (let i = 0; i < this.sprites.length; i++) {
                // Update velocities

                // Scale direction based on 
                this.sprites[i].position.addInPlace( this.sprites[i].direction.scale(.1*this.scene.getAnimationRatio()) );
                // Apply gravity
                this.sprites[i].direction.addInPlace( new Vector3(0, 0, 0.0033) );
                // drag coefficient
                this.sprites[i].direction.scaleInPlace(0.99);

                // Update angle of plane to face direction of travel
                this.sprites[i].lookAt(this.sprites[i].position.add(this.sprites[i].direction));

                // Add 90 degrees to x angle to make plane face direction of travel
                this.sprites[i].rotation.x += Math.PI / 2;

                // Simple scaling of y based on magnitude of velocity (Might cap the max here or use log)
                this.sprites[i].scaling.y = this.sprites[i].direction.length();
            }

            // Fade out the original instance
            this.plane.material.alpha -= 0.0025*this.scene.getAnimationRatio();
            if (this.plane.material.alpha <= 0) {
                this.plane.material.isVisible = false;
            }
        });
    }

}

