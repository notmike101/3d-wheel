import {Scene} from "@babylonjs/core/scene";
import {
    Color4,
    MeshBuilder, Particle, ParticleSystem, Scalar, Texture, TransformNode,
    Vector3,
    StandardMaterial, Matrix, Quaternion, Mesh
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
};
window.xorshift = xorshift(); // initialize
window._xorshift = xorshift;  // save old
window.xorshift = function() { return window._xorshift() / 4294967296; }; // normalize to [0, 1]

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


function setDirection(localAxis: Vector3, yawCor: number = 0, pitchCor: number = 0, rollCor: number = 0, result: Quaternion) {
    const yaw = -Math.atan2(localAxis.z, localAxis.x) + Math.PI / 2;
    const len = Math.sqrt(localAxis.x * localAxis.x + localAxis.z * localAxis.z);
    const pitch = -Math.atan2(localAxis.y, len);
    Quaternion.RotationYawPitchRollToRef(yaw + yawCor, pitch + pitchCor, rollCor, result);
}

export class Fireworks implements FireworksInterface {
    private scene: Scene;
    private plane: Mesh;
    private instanceProps;

    constructor(scene: Scene) {
        this.scene = scene;
        // Load a texture 
        let texture = new Texture('/media/flare.png', scene);
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
    private generateSphericallyRandomVector(_r?: number): Vector3 {
        if (!_r) _r = 1;
        let theta = window.xorshift() * 2 * Math.PI;
        let phi = Math.acos(window.xorshift() * 2 - 1);
        let r = xorshift() * _r;
        return new Vector3(r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi));
    }

    private explodeFirework(position: Vector3): void {
        const color = new Color4(xorshift()+.4, xorshift()+.4, xorshift()+.4, 1);
        this.plane.material.emissiveColor = color;
        let m = Matrix.Identity();
        let matricesData = new Float32Array(16 * this.instanceProps.length);

        const rotation = Quaternion.Identity();
        const scaling = new Vector3(0.1, 1, 1);

        for (let i = 0; i < this.instanceProps.length; i++) {
            let sRandom = this.generateSphericallyRandomVector();
            this.instanceProps[i].position.set(position.x, position.y, position.z);
            this.instanceProps[i].direction = sRandom; // Send the sprites off in random directions
            this.instanceProps[i].direction.normalize();
            this.instanceProps[i].direction.scaleInPlace((9+1*xorshift())/8);  // use /10 if close to wheel
            this.instanceProps[i].scaling = scaling;
            Matrix.ComposeToRef(scaling, rotation, position, m);
            m.copyToArray(matricesData, i * 16);
        }

        this.plane.thinInstanceSetBuffer("matrix", matricesData, 16);
        this.plane.isVisible = true;

        // Temporary objects to avoid memory allocation in hot loop
        const GRAVITY = new Vector3(0, 0, 0.0033);
        const tmpVec1 = new Vector3();
        const tmpVec2 = Vector3.Zero();

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
                tmpVec1.scaleInPlace(0.02);
                tmpVec1.scaleInPlace(this.scene.getAnimationRatio());
                this.instanceProps[i].direction.subtractInPlace(tmpVec1);

                // Update angle of plane to face direction of travel
                this.instanceProps[i].position.addToRef(this.instanceProps[i].direction, tmpVec1);
                tmpVec1.subtractToRef(this.instanceProps[i].position, tmpVec2);
                tmpQuat1.copyFrom(zeroQuat);
                setDirection(tmpVec2, 0, Math.PI / 2, 0, tmpQuat1);
                this.instanceProps[i].rotation = tmpQuat1;

                // Simple scaling of y based on magnitude of velocity (Might cap the max here or use log)
                this.instanceProps[i].scaling.y = this.instanceProps[i].direction.length();
                Matrix.ComposeToRef(this.instanceProps[i].scaling, this.instanceProps[i].rotation, this.instanceProps[i].position, m);
                m.copyToArray(matricesData, i * 16);
            }

            // Fade out the original instance
            this.plane.material.alpha -= 0.0025*this.scene.getAnimationRatio();
            if (this.plane.material.alpha <= 0) {
                this.plane.material.isVisible = false;
                this.plane.dispose(false, true);
                this.scene.unregisterBeforeRender(beforeRender);
            }

            this.plane.thinInstanceBufferUpdated("matrix");
        };
        this.scene.registerBeforeRender(beforeRender);
    }

}

