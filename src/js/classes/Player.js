import Stats from "/js/module/stats.module.js";
import { GUI } from "/js/module/dat.gui.module.js";

import { Ground } from "/js/classes/Ground.js"
import { Object } from "/js/classes/Object.js"

class Player {
    constructor () {
        this.ground = new Ground()
        this.object = new Object()

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

        // x,y,z
        this.playerMove = {
            "host":[0,0,0]
        };
        this.player_moveX = 0; 
        this.player_distance = 0.015; // 속도

    }

    init() {
        this.ground.init()
        this.object.init()


        this.ground.addCube(1,1,1)


        this.ground.loader = new THREE.GLTFLoader();

        this.ground.loader.load.bind(this)


        this.ground.loader.load( '/model/Xbot.glb', ( gltf ) => {
            console.log(this)
            this.ground.model.host = gltf.scene;
            this.ground.scene.add( this.ground.model.host );
            this.ground.light.target = this.ground.model.host

            this.ground.model.host.add( this.ground.camera );
            this.ground.camera.position.set( 0, 3, -7 );
            this.ground.camera.lookAt( this.ground.model.host.position );

            this.ground.model.host.traverse( function ( object ) {
                if ( object.isMesh ) object.castShadow = true;
            });

            this.ground.skeleton.host = new THREE.SkeletonHelper( this.ground.model.host );
            this.ground.skeleton.host.visible = false;
            this.ground.scene.add( this.ground.skeleton.host );

            const animations = gltf.animations;
            this.ground.player_animations.host = animations
            
            this.ground.mixer.host = new THREE.AnimationMixer( this.ground.model.host );


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

        this.ground.sky()

        this.ground.renderer.toneMappingExposure = this.ground.microsky.effectController.exposure;
        this.ground.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.ground.renderer.toneMappingExposure = 0.239;


        this.ground.container.appendChild( this.ground.renderer.domElement );
        this.ground.stat = new Stats();

        window.addEventListener.bind(this)

        window.addEventListener( 'resize', () => {
          this.onWindowResize()
        });
    }

    add(player, player_position) {
        this.ground.loader.load.bind(this)
        console.log(this, player, this.playerMove)


        this.ground.loader.load( '/model/Xbot.glb',  ( gltf ) => {
            
            this.ground.model[player] = gltf.scene;
            
            this.playerMove[player] = [0,0,0]
            
            this.ground.scene.add( this.ground.model[player] );
            console.log(this.ground.model[player])
      
      
            this.ground.model[player].traverse( function ( object ) {
                if (object.isMesh) object.castShadow = true;
            });
            console.log(gltf)
      
            this.ground.skeleton[player] = new THREE.SkeletonHelper( this.ground.model[player] );
            this.ground.skeleton[player].visible = false;
            this.ground.scene.add( this.ground.skeleton[player] );
        
            const animations = gltf.animations;
            console.log(animations)
            this.ground.player_animations[player] = animations
        
            this.ground.mixer[player] = new THREE.AnimationMixer( this.ground.model[player] );
            this.addBaseActions(player)
        
          
            console.log(this.ground.model[player].position, player_position)
            this.ground.model[player].position.setX( player_position['x'] );
            this.ground.model[player].position.setY( player_position['y'] );
            this.ground.model[player].position.setZ( player_position['z'] );

            //,  position.y,  position.z
            this.ground.model[player].updateMatrix();

      
            for ( let i = 0; i !== animations.length; ++ i ) {
        
                let clip = animations[ i ];
                const name = clip.name;
        
                if ( this.baseActions[player][ name ] ) {
                const action = this.ground.mixer[player].clipAction( clip );
                this.activateAction( action, player );
                this.baseActions[player][ name ].action = action;
        
                } else if ( this.additiveActions[ name ] ) {
                THREE.AnimationUtils.makeClipAdditive( clip );
        
                if ( clip.name.endsWith( '_pose' ) ) {
                    clip = THREE.AnimationUtils.subclip( clip, clip.name, 2, 3, 30 );
                }
        
                const action =this.ground.mixer[player].clipAction( clip );
                this.activateAction( action, player );
                }
            }
        });



    }

    addBaseActions(player) {
        this.baseActions[player] = {
          idle: { weight: 1 },
          walk: { weight: 0 },
          run: { weight: 0 }
        }
    }

    setWeight(action, weight) {
        action.enabled = true;
        action.setEffectiveTimeScale( 1 );
        action.setEffectiveWeight( weight );
    }

    move(player) { // 0: 앞으로 1: 뒤로 2: 왼쪽 3: 오른쪽
        this.playerMove[player][2] = this.player_distance
        this.player_moveX = 0
    }
    
    stop(player) {
        this.playerMove[player][2] = 0
        this.player_moveX = 0
    }

    rotationY(player, degree) {
        this.ground.model[player].rotation.y = degree;

    }

    getPosition(player) {
        return this.ground.model[player].position
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

    positionCamera(x,y,z) {        
        this.ground.camera.position.set( x,y,z );
        this.ground.camera.lookAt( this.ground.model.host.position );
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
        this.ground.mixer[player].addEventListener( 'loop', onLoopFinished );
    
        let self = this
        function onLoopFinished( event ) {
            if ( event.action === startAction ) {
                self.ground.mixer[player].removeEventListener( 'loop', onLoopFinished );
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
        this.ground.camera.aspect = window.innerWidth / window.innerHeight;
        this.ground.camera.updateProjectionMatrix();
        this.ground.renderer.setSize( window.innerWidth, window.innerHeight );
    }

    animate() {
        requestAnimationFrame( this.animate.bind(this) );
        this.ground.model.host.translateZ( this.playerMove["host"][2]);
        this.ground.model.host.translateX( this.player_moveX);
        //console.log(player_moveZ["host"])
        
        for (var i in this.ground.model) {
          //console.log(i, String(i), player_moveZ[String(i)])
          this.ground.model[i].translateZ( this.playerMove[i][2]);
          //model.translateX( player_moveX);
      
        }
        
        //this.ground.microsky.exposure += 0.0004
        //this.ground.renderer.toneMappingExposure = this.ground.microsky.exposure;

      
        const mixerUpdateDelta = this.ground.clock.getDelta();
      
        //mixer.host.update( mixerUpdateDelta );

        this.object.world.step(1 / 60, mixerUpdateDelta, 3)
        this.ground.object.position.copy(this.object.body.position)


        for (var i in this.ground.mixer) {
            this.ground.mixer[i].update( mixerUpdateDelta );
        }

        this.ground.renderer.render( this.ground.scene, this.ground.camera );
    }
}

export { Player }