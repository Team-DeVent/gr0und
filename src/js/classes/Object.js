
class Object {
    constructor (self) {
        this.self = self;

        this.world = new CANNON.World();
        this.shape;
        this.body; 

    }

    init() {

        this.world.gravity.set(0, -9.82, 0);

        this.shape = new CANNON.Sphere(0.5);

        this.body = new CANNON.Body({
          mass: 1,
          position: new CANNON.Vec3(0, 3, 0),
          shape: this.shape,
        });
        this.world.addBody(this.body);


        let floor_shape = new CANNON.Plane();
        let floor_body = new CANNON.Body();
        floor_body.mass = 0;
        floor_body.addShape(floor_shape);
        floor_body.quaternion.setFromAxisAngle(new CANNON.Vec3(- 1, 0, 0), Math.PI * 0.5) 

        this.world.addBody(floor_body);


    }

    addCube(x,y,z) {
        const geometry1 = new THREE.BoxGeometry( x, y, z );
        const material1 = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
        const cube1 = new THREE.Mesh( geometry1, material1 );
        this.self.ground.scene.add( cube1 );
        this.self.ground.object = cube1
    }

    addObject(url, position) {
        console.log(this.self)
        const loader = new THREE.OBJLoader(this.self.ground.loadmanager);

        loader.load( url, ( object ) => {
            object.position.setX( position.x );
            object.position.setY( position.y );
            object.position.setZ( position.z );

            this.self.ground.scene.add( object );
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