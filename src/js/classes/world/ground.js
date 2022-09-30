import { Sky } from "/js/module/objects/Sky.js";

class Ground {
    constructor (self) {
        this.self = self
    }

    floor() {

        const texture = new THREE.TextureLoader().load( "textures/grasslight-big.jpeg" );
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 12, 12 );

        const mesh = new THREE.Mesh( new THREE.PlaneGeometry( 100, 100 ),new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: true, map: texture } ) );
        mesh.rotation.x = - Math.PI / 2;
        mesh.receiveShadow = true;
        this.self.world.octree.fromGraphNode(mesh);
        this.self.scene.add( mesh );

    }



    sky() {
        this.self.microsky.object = new Sky();
        this.self.microsky.object.scale.setScalar( 450000 );
        this.self.scene.add( this.self.microsky.object );

        this.self.microsky.exposure = 0.239;

        this.self.microsky.sun = new THREE.Vector3();

        this.self.microsky.effectController = {
            turbidity: 10,
            rayleigh: 3,
            mieCoefficient: 0.005,
            mieDirectionalG: 0.7,
            elevation: 15.9,
            azimuth: 0,
            exposure: this.self.renderer.toneMappingExposure
        };

        const uniforms = this.self.microsky.object.material.uniforms;
        uniforms[ 'turbidity' ].value = this.self.microsky.effectController.turbidity;
        uniforms[ 'rayleigh' ].value = this.self.microsky.effectController.rayleigh;
        uniforms[ 'mieCoefficient' ].value = this.self.microsky.effectController.mieCoefficient;
        uniforms[ 'mieDirectionalG' ].value = this.self.microsky.effectController.mieDirectionalG;

        const phi = THREE.MathUtils.degToRad( 90 - this.self.microsky.effectController.elevation );
        const theta = THREE.MathUtils.degToRad( this.self.microsky.effectController.azimuth );

        this.self.microsky.sun.setFromSphericalCoords( 1, phi, theta );

        uniforms[ 'sunPosition' ].value.copy( this.self.microsky.sun );

    }
  
}

export { Ground }