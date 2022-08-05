class Loadmanager {
    constructor (self) {
        this.self = self
    }

    init() {
        let body = document.querySelector("#loading")

        this.self.loadmanager = new THREE.LoadingManager();

        //console.log( 'Loading complete!');


        this.self.loadmanager.onStart = function ( url, itemsLoaded, itemsTotal ) {
            console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
        };
        
        this.self.loadmanager.onLoad = ( ) => {

        
            console.log( 'Loading complete!');
            setTimeout(() => {
                body.classList.add('animate__animated', 'animate__fadeOut')
            }, 900);
            setTimeout(() => {
                body.classList.add('div-hide')
                setTimeout(() => {
                    this.self.handle.player.object.collideEventListener('host')
                }, 1000);
            }, 1100);
        };
        
        
        this.self.loadmanager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
            console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
        };
        
        this.self.loadmanager.onError = function ( url ) {
            console.log( 'There was an error loading ' + url );
        };
    }



}

export { Loadmanager }