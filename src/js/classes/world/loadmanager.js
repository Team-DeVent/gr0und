class Loadmanager {
    constructor (self) {
        this.self = self
    }

    init() {

        console.log(this.self)


        this.self.loadmanager = new THREE.LoadingManager();

        this.self.loadmanager.onStart = function ( url, itemsLoaded, itemsTotal ) {
            console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
        };
        
        this.self.loadmanager.onLoad = function ( ) {
            let body = document.querySelector("#loading")
        
            console.log( 'Loading complete!');
            setTimeout(() => {
                body.classList.add('animate__animated', 'animate__fadeOut')
            }, 900);
            setTimeout(() => {
                body.classList.add('div-hide')

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