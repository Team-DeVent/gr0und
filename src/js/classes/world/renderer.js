class Renderer {
    constructor (self) {
        this.self = self

    }

    init() {
        this.self.renderer = new THREE.WebGLRenderer( { antialias: true } );
        this.self.renderer.setPixelRatio( window.devicePixelRatio );
        this.self.renderer.setSize( window.innerWidth, window.innerHeight );
        this.self.renderer.outputEncoding = THREE.sRGBEncoding;
        this.self.renderer.shadowMap.enabled = true;

        //this.self.sky()


    }

    toneMapping() {
        this.self.renderer.toneMappingExposure = this.self.microsky.effectController.exposure;
        this.self.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.self.renderer.toneMappingExposure = 0.239;
    }
}

export { Renderer }