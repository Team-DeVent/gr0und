import * as CANNON from '/js/module/cannon-es.js'


class Object {
    constructor (self) {
        this.self = self;

    }


    addCube(x,y,z) {
        // 마찰
        this.self.gravity.material['concrete'] = new CANNON.Material('concrete')
        this.self.gravity.material['player'] = new CANNON.Material('player')

        const concretePlayerContactMaterial = new CANNON.ContactMaterial(
            this.self.gravity.material['concrete'],
            this.self.gravity.material['player'],
            {
                friction: 0.5,
                restitution: 0
            }
        )
        this.self.gravity.world.addContactMaterial(concretePlayerContactMaterial)


        // 큐브

        const boxGalfExtents = new CANNON.Vec3(x,y,z);
        this.self.gravity.shape['sphere'] = new CANNON.Box(boxGalfExtents);
        const geometry1 = new THREE.BoxGeometry( boxGalfExtents.x*2, boxGalfExtents.y*2, boxGalfExtents.z*2 );
        const material1 = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
        const cube1 = new THREE.Mesh( geometry1, material1 );
        cube1.receiveShadow = true;
        this.self.scene.add( cube1 );


        // 중력
        this.self.gravity.body['sphere'] = new CANNON.Body({
          mass: -1,
          position: new CANNON.Vec3(0, 0, 0),
          shape: this.self.gravity.shape['sphere'],
          linearDamping: 0,
          material: this.self.gravity.material['concrete']

        });
        this.self.gravity.body['sphere'].quaternion.setFromAxisAngle(new CANNON.Vec3(- 1, 0, 0), Math.PI * 0.5) 

        this.self.gravity.body['sphere'].collisionResponse = true;
        this.self.gravity.world.addBody(this.self.gravity.body['sphere']);

        this.self.object['sphere'] = cube1
    }


    addObject(url, position) {
        const loader = new THREE.OBJLoader(this.self.loadmanager);

        loader.load( url, ( object ) => {
            object.position.setX( position.x );
            object.position.setY( position.y );
            object.position.setZ( position.z );

            this.self.scene.add( object );
        },
        function ( xhr ) {
            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        },
        function ( error ) {
            console.log( 'An error happened' , error);
        });
    }

    addGlb(url, position) {

        let loader = new THREE.GLTFLoader(this.self.loadmanager);

        loader.load( url, ( gltf ) => {

            gltf.scene.position.setX( position.x );
            gltf.scene.position.setY( position.y );
            gltf.scene.position.setZ( position.z );



            this.self.scene.add( gltf.scene );

        },
        function ( xhr ) {
            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        },
        function ( error ) {
            console.log( 'An error happened' , error);
        });

    }
}

export { Object }