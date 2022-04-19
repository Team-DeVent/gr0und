import { Sky } from "/js/objects/Sky.js";



class Ground {
    constructor () {
        this.scene;
        this.camera;
        this.renderer;
        this.stats;
        this.loader;
        this.model = {};
        this.skeleton = {} 
        this.mixer = {};
        this.clock;
        this.light;
        this.player_animations = {};
        this.player_model = {};
        this.container = document.getElementById( 'game' );

        this.object

        this.microsky = {}

    }

    init() {
        this.clock = new THREE.Clock();

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0xa0a0a0 );
        this.scene.fog = new THREE.Fog( 0xa0a0a0, 10, 50 );

        const hemiLight = new THREE.HemisphereLight( 0x707070, 0x444444 );
        hemiLight.position.set( 0, 120, 0 );
        this.scene.add( hemiLight );

        const dirLight = new THREE.DirectionalLight( 0xf7e5df );
        dirLight.position.set( 3, 1000, 2500 );
        dirLight.castShadow = true;
        dirLight.shadow.camera.top = 2;
        dirLight.shadow.camera.bottom = - 2;
        dirLight.shadow.camera.left = - 2;
        dirLight.shadow.camera.right = 2;
        dirLight.shadow.camera.near = 0.06;
        dirLight.shadow.camera.far = 4000;
        this.scene.add( dirLight );
        this.light = dirLight

        const texture = new THREE.TextureLoader().load( "textures/grasslight-big.jpeg" );
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 12, 12 );

        const mesh = new THREE.Mesh( new THREE.PlaneGeometry( 100, 100 ),new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: true, map: texture } ) );
        mesh.rotation.x = - Math.PI / 2;
        mesh.receiveShadow = true;
        this.scene.add( mesh );



        this.camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 1, 100 );
    }



    sky() {
        this.microsky.object = new Sky();
        this.microsky.object.scale.setScalar( 450000 );
        this.scene.add( this.microsky.object );

        this.microsky.exposure = 0.239;

        this.microsky.sun = new THREE.Vector3();

        this.microsky.effectController = {
            turbidity: 10,
            rayleigh: 3,
            mieCoefficient: 0.005,
            mieDirectionalG: 0.7,
            elevation: 15.9,
            azimuth: 0,
            exposure: this.renderer.toneMappingExposure
        };

        const uniforms = this.microsky.object.material.uniforms;
        uniforms[ 'turbidity' ].value = this.microsky.effectController.turbidity;
        uniforms[ 'rayleigh' ].value = this.microsky.effectController.rayleigh;
        uniforms[ 'mieCoefficient' ].value = this.microsky.effectController.mieCoefficient;
        uniforms[ 'mieDirectionalG' ].value = this.microsky.effectController.mieDirectionalG;

        const phi = THREE.MathUtils.degToRad( 90 - this.microsky.effectController.elevation );
        const theta = THREE.MathUtils.degToRad( this.microsky.effectController.azimuth );

        this.microsky.sun.setFromSphericalCoords( 1, phi, theta );

        uniforms[ 'sunPosition' ].value.copy( this.microsky.sun );

    }
  
}

export { Ground }