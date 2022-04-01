import Stats from "/js/module/stats.module.js";
import { GUI } from "/js/module/dat.gui.module.js";

class Player {
    constructor () {
        this.scene;
        this.camera;
        this.renderer;
        this.stats;
        this.loader;
        this.model;
        this.skeleton = {} 
        this.mixer = {};
        this.clock;
        this.light;
        this.player_animations = {};
        this.player_model = {};
        this.crossFadeControls = [];
        this.container = document.getElementById( 'game' );

        this.currentBaseAction = 'idle';
        this.allActions = [];
        this.baseActions = {
            host: {
                idle: { weight: 1 },
                walk: { weight: 0 },
                run: { weight: 0 }
            }
        };
        this.additiveActions = {
            sneak_pose: { weight: 0 },
            sad_pose: { weight: 0 },
            agree: { weight: 0 },
            headShake: { weight: 0 }
        };
        this.panelSettings;
        this.numAnimations;

        this.player_moveZ = {
            "host":0
        };
        this.player_moveX = 0; 
        this.player_distance = 0.02; // 속도

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

        const geometry1 = new THREE.BoxGeometry( 1, 1, 1 );
        const material1 = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
        const cube1 = new THREE.Mesh( geometry1, material1 );
        this.scene.add( cube1 );

        this.camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 1, 100 );


        this.loader = new THREE.GLTFLoader();

        this.loader.load.bind(this)


        this.loader.load( '/model/Xbot.glb', ( gltf ) => {
            console.log(this)
            this.model = gltf.scene;
            this.scene.add( this.model );
            dirLight.target = this.model

            this.model.add( this.camera );
            this.camera.position.set( 0, 4, -6 );
            this.camera.lookAt( this.model.position );

            this.model.traverse( function ( object ) {
                if ( object.isMesh ) object.castShadow = true;
            });

            this.skeleton.host = new THREE.SkeletonHelper( this.model );
            this.skeleton.host.visible = false;
            this.scene.add( this.skeleton.host );

            const animations = gltf.animations;
            this.player_animations.host = animations
            
            this.mixer.host = new THREE.AnimationMixer( this.model );


            for ( let i = 0; i !== animations.length; ++ i ) {

                let clip = animations[ i ];
                const name = clip.name;

                if ( this.baseActions['host'][ name ] ) {
                    const action = this.mixer.host.clipAction( clip );
                    this.activateAction( action, 'host' );
                    this.baseActions['host'][ name ].action = action;
                    this.allActions.push( action );

                } else if ( this.additiveActions[ name ] ) {
                    THREE.AnimationUtils.makeClipAdditive( clip );

                    if ( clip.name.endsWith( '_pose' ) ) {
                        clip = THREE.AnimationUtils.subclip( clip, clip.name, 2, 3, 30 );
                    }

                    const action = this.mixer.host.clipAction( clip );
                    this.activateAction( action, 'host' );
                    this.additiveActions[ name ].action = action;
                    this.allActions.push( action );
                }
            }

            this.animate()
        });



        this.renderer = new THREE.WebGLRenderer( { antialias: true } );
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.shadowMap.enabled = true;
        this.container.appendChild( this.renderer.domElement );
        this.stat = new Stats();

        window.addEventListener.bind(this)

        window.addEventListener( 'resize', () => {
          this.onWindowResize()
        });
    }


    activateAction(action, uid) {
        const clip = action.getClip();
        const settings = this.baseActions[uid][ clip.name ] || this.additiveActions[ clip.name ];
        this.setWeight( action, settings.weight );
        action.play();
    }


    setWeight(action, weight) {
        action.enabled = true;
        action.setEffectiveTimeScale( 1 );
        action.setEffectiveWeight( weight );
    }

    move(player) { // 0: 앞으로 1: 뒤로 2: 왼쪽 3: 오른쪽
        this.player_moveZ[player] = this.player_distance
        this.player_moveX = 0
    }
    
    stop(player) {
        this.player_moveZ[player] = 0
        this.player_moveX = 0
    }

    rotationY(degree) {
        this.model.rotation.y = degree;

    }

    moveAction(uid) {
        const settings = this.baseActions[uid][ 'walk' ];
        const currentSettings = this.baseActions[uid][ 'idle' ];
        const currentAction = currentSettings ? currentSettings.action : null;
        const action = settings ? settings.action : null;
        console.log("> >>", currentAction, action)
        this.prepareCrossFade( currentAction, action, 0.25, uid);
    }
    
    stopAction(uid) {
        const settings = this.baseActions[uid][ 'idle' ];
        const currentSettings = this.baseActions[uid][ 'walk' ];
        const currentAction = currentSettings ? currentSettings.action : null;
        const action = settings ? settings.action : null;
        this.prepareCrossFade( currentAction, action, 0.25, uid);
    }

    addCube(x,y,z) {
      const geometry1 = new THREE.BoxGeometry( x, y, z );
      const material1 = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
      const cube1 = new THREE.Mesh( geometry1, material1 );
      this.scene.add( cube1 );
    }

    zoomCamera(fov) {
      this.camera.fov = fov
      this.camera.updateProjectionMatrix();
    }
    
    prepareCrossFade( startAction, endAction, duration, player ) {

        // 현재 동작이 '유휴'인 경우 크로스페이드(crossfade)를 즉시 실행합니다;
        // 그렇지 않으면 현재 작업이 현재 루프를 완료할 때까지 기다립니다.
        if ( this.currentBaseAction === 'idle' || ! startAction || ! endAction ) {
            this.executeCrossFade( startAction, endAction, duration, player );
        } else {
            this.synchronizeCrossFade( startAction, endAction, duration, player );
        }
      
        // Update control colors
        if ( endAction ) {
          const clip = endAction.getClip();
          this.currentBaseAction = clip.name;
        } else {
          cthis.urrentBaseAction = 'None';
        }
      
        this.crossFadeControls.forEach( function ( control ) {
          const name = control.property;
          if ( name === currentBaseAction ) {
            control.setActive();
          } else {
            control.setInactive();
          }
        });
      }
      



    synchronizeCrossFade(startAction, endAction, duration, player) {
        this.mixer.host.addEventListener( 'loop', onLoopFinished );
    
        let self = this
        function onLoopFinished( event ) {
            if ( event.action === startAction ) {
                self.mixer.host.removeEventListener( 'loop', onLoopFinished );
                self.executeCrossFade( startAction, endAction, duration, player );
            }
        }
    }
    
    
  
     executeCrossFade(startAction, endAction, duration, player) {
        // 시작 동작뿐만 아니라 종료 동작도 페이딩 전에 1의 가중치를 얻어야 합니다.
        // (이 플레이스에서 이미 보장된 시작 동작과 관련하여)
        //console.log("executeCrossFade",startAction, endAction)
    
        if (endAction) {
            this.setWeight( endAction, 1 );
            endAction.time = 0;
        
            if (startAction) {  // Crossfade with warping
                startAction.crossFadeTo( endAction, duration, true );
            } else {  // Fade in
                endAction.fadeIn( duration );
            }
        } else {  // Fade out
            startAction.fadeOut( duration );
        }
    }

    onWindowResize() {
        //this.onWindowResize.bind(this) 
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );
    }

    animate() {
        requestAnimationFrame( this.animate.bind(this) );
        this.model.translateZ( this.player_moveZ["host"]);
        this.model.translateX( this.player_moveX);
        //console.log(player_moveZ["host"])
        /*
        for (var i in this.player_model) {
          //console.log(i, String(i), player_moveZ[String(i)])
          this.player_model[i].translateZ( player_moveZ[i]);
          //model.translateX( player_moveX);
      
        }
        */
      
        const mixerUpdateDelta = this.clock.getDelta();
      
        //mixer.host.update( mixerUpdateDelta );
        for (var i in this.mixer) {
            this.mixer[i].update( mixerUpdateDelta );
        }

        this.renderer.render( this.scene, this.camera );
    }
}

export { Player }