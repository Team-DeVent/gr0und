import Stats from "/js/module/stats.module.js";
import { GUI } from "/js/module/dat.gui.module.js";


class Player {
    constructor (self) {

        this.ground = self


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
        this.player_distance = 0.015; // 속도

        //this.test = this.test.bind(this);
        //this.test.this = this.test.this.bind(this)

    }

    init() {


        this.ground.handle.object.addCube(1,1,1)

        this.ground.handle.object.addObject('objects/lowpolytree.obj', {x:5, y:1, z:1})


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

                if ( this.ground.player.baseActions['host'][ name ] ) {
                    const action = this.ground.mixer.host.clipAction( clip );
                    this.ground.handle.player.action.activate( action, 'host' );
                    this.ground.player.baseActions['host'][ name ].action = action;
                    this.ground.player.allActions.push( action );

                } else if ( this.ground.player.additiveActions[ name ] ) {
                    THREE.AnimationUtils.makeClipAdditive( clip );

                    if ( clip.name.endsWith( '_pose' ) ) {
                        clip = THREE.AnimationUtils.subclip( clip, clip.name, 2, 3, 30 );
                    }

                    const action = this.ground.mixer.host.clipAction( clip );
                    this.ground.handle.player.action.activate( action, 'host' );
                    this.ground.player.additiveActions[ name ].action = action;
                    this.ground.player.allActions.push( action );
                }
            }

            this.animate()
        });





        this.ground.container.appendChild( this.ground.renderer.domElement );
        this.ground.stat = new Stats();

        window.addEventListener.bind(this)

        window.addEventListener( 'resize', () => {
          this.onWindowResize()
        });

    }

    add(player, player_position) {
        this.ground.loader.load.bind(this)

        this.ground.loader.load( '/model/Xbot.glb',  ( gltf ) => {
            
            this.ground.model[player] = gltf.scene;
            this.playerMove[player] = [0,0,0]
            this.ground.scene.add( this.ground.model[player] );
      
      
            this.ground.model[player].traverse( function ( object ) {
                if (object.isMesh) object.castShadow = true;
            });
      
            this.ground.skeleton[player] = new THREE.SkeletonHelper( this.ground.model[player] );
            this.ground.skeleton[player].visible = false;
            this.ground.scene.add( this.ground.skeleton[player] );
        
            const animations = gltf.animations;
            this.ground.player_animations[player] = animations
        
            this.ground.mixer[player] = new THREE.AnimationMixer( this.ground.model[player] );
            this.addBaseActions(player)
          
            this.setPosition(player, player_position)

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
    
    


    remove(player) {
        this.ground.scene.remove( this.ground.model[player] );
        this.ground.scene.remove( this.ground.skeleton[player] );
        delete this.ground.skeleton[player]
    }



    setWeight(action, weight) {
        action.enabled = true;
        action.setEffectiveTimeScale( 1 );
        action.setEffectiveWeight( weight );
    }

    move(player) { // 0: 앞으로 1: 뒤로 2: 왼쪽 3: 오른쪽
        this.playerMove[player][2] = this.player_distance
    }
    
    stop(player) {
        this.playerMove[player][2] = 0
    }

    rotationY(player, degree) {
        this.ground.model[player].rotation.y = degree;

    }

    getRotation(player) {
        //console.log(this.ground.model[player].rotation)
        return this.ground.model[player].rotation
    }

    getPosition(player) {
        return this.ground.model[player].position
    }

    setPosition(player, position) {
        console.log(this.ground.model[player].position, position)
        this.ground.model[player].position.setX( position['x'] );
        this.ground.model[player].position.setY( position['y'] );
        this.ground.model[player].position.setZ( position['z'] );
        this.ground.model[player].updateMatrix();
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
        //console.log(player_moveZ["host"])
        
        for (var i in this.ground.model) {
          //console.log(i, String(i), player_moveZ[String(i)])
          this.ground.model[i].translateZ( this.playerMove[i][2]);
      
        }
        
        //this.ground.microsky.exposure += 0.0004
        //this.ground.renderer.toneMappingExposure = this.ground.microsky.exposure;

      
        const mixerUpdateDelta = this.ground.clock.getDelta();
      
        //mixer.host.update( mixerUpdateDelta );

        this.ground.gravity.world.step(1 / 60, mixerUpdateDelta, 3)
        this.ground.object.position.copy(this.ground.gravity.body['sphere'].position)


        for (var i in this.ground.mixer) {
            this.ground.mixer[i].update( mixerUpdateDelta );
        }

        this.ground.renderer.render( this.ground.scene, this.ground.camera );
    }
}

export { Player }