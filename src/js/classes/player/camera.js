class Camara {
    constructor (self) {
        this.self = self
    }

    init() {
        this.self.camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 1, 100 );
    }

    zoom(fov) {
        this.self.camera.fov = fov
        this.self.camera.updateProjectionMatrix();
    }


    position(x,y,z) {        
        this.self.camera.position.set( x,y,z );
        this.self.camera.lookAt( this.self.model.host.position );
        this.self.camera.updateProjectionMatrix();
    }
}

export { Camara }