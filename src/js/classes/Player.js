import Stats from "/js/module/stats.module.js";
import { GUI } from "/js/module/dat.gui.module.js";
import { Ground } from "/js/classes/Ground.js"

class Player {
    constructor () {
        this.ground = new Ground()

        this.crossFadeControls = [];
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
        this.ground.init()


        this.ground.loader = new THREE.GLTFLoader();

        this.ground.loader.load.bind(this)


        this.ground.loader.load( '/model/Xbot.glb', ( gltf ) => {
            console.log(this)
            this.ground.model = gltf.scene;
            this.ground.scene.add( this.ground.model );
            this.ground.light.target = this.ground.model

            this.ground.model.add( this.ground.camera );
            this.ground.camera.position.set( 0, 4, -6 );
            this.ground.camera.lookAt( this.ground.model.position );

            this.ground.model.traverse( function ( object ) {
                if ( object.isMesh ) object.castShadow = true;
            });

            this.ground.skeleton.host = new THREE.SkeletonHelper( this.ground.model );
            this.ground.skeleton.host.visible = false;
            this.ground.scene.add( this.ground.skeleton.host );

            const animations = gltf.animations;
            this.ground.player_animations.host = animations
            
            this.ground.mixer.host = new THREE.AnimationMixer( this.ground.model );


            for ( let i = 0; i !== animations.length; ++ i ) {

                let clip = animations[ i ];
                const name = clip.name;

                if ( this.baseActions['host'][ name ] ) {
                    const action = this.ground.mixer.host.clipAction( clip );
                    this.activateAction( action, 'host' );
                    this.baseActions['host'][ name ].action = action;
                    this.allActions.push( action );

                } else if ( this.additiveActions[ name ] ) {
                    THREE.AnimationUtils.makeClipAdditive( clip );

                    if ( clip.name.endsWith( '_pose' ) ) {
                        clip = THREE.AnimationUtils.subclip( clip, clip.name, 2, 3, 30 );
                    }

                    const action = this.ground.mixer.host.clipAction( clip );
                    this.activateAction( action, 'host' );
                    this.additiveActions[ name ].action = action;
                    this.allActions.push( action );
                }
            }

            this.animate()
        });



        this.ground.renderer = new THREE.WebGLRenderer( { antialias: true } );
        this.ground.renderer.setPixelRatio( window.devicePixelRatio );
        this.ground.renderer.setSize( window.innerWidth, window.innerHeight );
        this.ground.renderer.outputEncoding = THREE.sRGBEncoding;
        this.ground.renderer.shadowMap.enabled = true;
        this.ground.container.appendChild( this.ground.renderer.domElement );
        this.ground.stat = new Stats();

        window.addEventListener.bind(this)

        window.addEventListener( 'resize', () => {
          this.onWindowResize()
        });
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
        this.ground.model.rotation.y = degree;

    }

    activateAction(action, uid) {
        const clip = action.getClip();
        const settings = this.baseActions[uid][ clip.name ] || this.additiveActions[ clip.name ];
        this.setWeight( action, settings.weight );
        action.play();
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


    zoomCamera(fov) {
      this.ground.camera.fov = fov
      this.ground.camera.updateProjectionMatrix();
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
          this.currentBaseAction = 'None';
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
        this.ground.mixer.host.addEventListener( 'loop', onLoopFinished );
    
        let self = this
        function onLoopFinished( event ) {
            if ( event.action === startAction ) {
                self.ground.mixer.host.removeEventListener( 'loop', onLoopFinished );
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
        this.ground.model.translateZ( this.player_moveZ["host"]);
        this.ground.model.translateX( this.player_moveX);
        //console.log(player_moveZ["host"])
        /*
        for (var i in this.player_model) {
          //console.log(i, String(i), player_moveZ[String(i)])
          this.player_model[i].translateZ( player_moveZ[i]);
          //model.translateX( player_moveX);
      
        }
        */
      
        const mixerUpdateDelta = this.ground.clock.getDelta();
      
        //mixer.host.update( mixerUpdateDelta );
        for (var i in this.ground.mixer) {
            this.ground.mixer[i].update( mixerUpdateDelta );
        }

        this.ground.renderer.render( this.ground.scene, this.ground.camera );
    }
}

export { Player }