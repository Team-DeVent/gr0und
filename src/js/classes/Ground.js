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

        this.skyobject
        this.sun

    }

    init() {
        this.clock = new THREE.Clock();

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0xa0a0a0 );
        this.scene.fog = new THREE.Fog( 0xa0a0a0, 10, 50 );

        const hemiLight = new THREE.HemisphereLight( 0x707070, 0x444444 );
        hemiLight.position.set( 0, 120, 0 );
        this.scene.add( hemiLight );

        const dirLight = new THREE.DirectionalLight( 0xffffff );
        dirLight.position.set( 3, 10, 10 );
        dirLight.castShadow = true;
        dirLight.shadow.camera.top = 2;
        dirLight.shadow.camera.bottom = - 2;
        dirLight.shadow.camera.left = - 2;
        dirLight.shadow.camera.right = 2;
        dirLight.shadow.camera.near = 0.1;
        dirLight.shadow.camera.far = 400;
        this.scene.add( dirLight );
        this.light = dirLight

        const mesh = new THREE.Mesh( new THREE.PlaneGeometry( 100, 100 ), new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } ) );
        mesh.rotation.x = - Math.PI / 2;
        mesh.receiveShadow = true;
        this.scene.add( mesh );



        this.camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 1, 100 );
    }

    addCube(x,y,z) {
        const geometry1 = new THREE.BoxGeometry( x, y, z );
        const material1 = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
        const cube1 = new THREE.Mesh( geometry1, material1 );
        this.scene.add( cube1 );
        this.object = cube1
    }

    sky() {
        this.skyobject = new Sky();
        this.skyobject.scale.setScalar( 450000 );
        this.scene.add( this.skyobject );

        this.sun = new THREE.Vector3();

        /// GUI

        const effectController = {
            turbidity: 10,
            rayleigh: 3,
            mieCoefficient: 0.005,
            mieDirectionalG: 0.7,
            elevation: 2,
            azimuth: 180,
            exposure: 0.0904
        };

        const uniforms = this.skyobject.material.uniforms;
        uniforms[ 'turbidity' ].value = effectController.turbidity;
        uniforms[ 'rayleigh' ].value = effectController.rayleigh;
        uniforms[ 'mieCoefficient' ].value = effectController.mieCoefficient;
        uniforms[ 'mieDirectionalG' ].value = effectController.mieDirectionalG;

        const phi = THREE.MathUtils.degToRad( 90 - effectController.elevation );
        const theta = THREE.MathUtils.degToRad( effectController.azimuth );

        this.sun.setFromSphericalCoords( 1, phi, theta );

        uniforms[ 'sunPosition' ].value.copy( this.sun );

        // this.renderer.toneMappingExposure = effectController.exposure;
    }
  
}

export { Ground }