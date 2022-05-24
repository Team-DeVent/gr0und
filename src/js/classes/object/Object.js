
class Object {
    constructor (self) {
        this.self = self;

    }


    addCube(x,y,z) {
        const geometry1 = new THREE.BoxGeometry( x, y, z );
        const material1 = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
        const cube1 = new THREE.Mesh( geometry1, material1 );
        this.self.scene.add( cube1 );
        this.self.object['sphere'] = cube1
        
    }

    addObject(url, position) {
        console.log(this.self)
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
}

export { Object }