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
        this.playerJump = {
            "host": {
                velocity: 0,
                isEnable: false
            }
        };
        this.player_distance = 9; // 속도
        this.playerLocalVelocity = {
            "host": new CANNON.Vec3()
        } 


        //this.test = this.test.bind(this);
        //this.test.this = this.test.this.bind(this)

    }

    init() {
        this.ground.handle.object.addCube(10,1,1)



        this.ground.handle.object.addObject('model/objects/lowpolytree.obj', {x:5, y:1, z:1})


        this.ground.loader = new THREE.GLTFLoader();

        this.ground.loader.load.bind(this)


        this.ground.loader.load( '/model/Xbot.glb', ( gltf ) => {
            console.log(this)
            this.ground.model.host = gltf.scene;


            this.ground.object['host'] = this.ground.model.host

            this.ground.gravity.shape['host'] = new CANNON.Box(new CANNON.Vec3(0.35, 0.00000000001, 0.5));

            this.ground.gravity.body['host'] = new CANNON.Body({
              mass: 5,
              position: new CANNON.Vec3(0, 2, 0),
              shape: this.ground.gravity.shape['host'],
              angluarDamping: 0.5,
              material: this.ground.gravity.material['player']

            });
            this.ground.gravity.body['host'].collisionResponse = true;

            this.ground.gravity.world.addBody(this.ground.gravity.body['host']);


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



        setTimeout(() => {

            this.ground.gravity.body['host'].addEventListener("collide", (e) => {
                var relativeVelocity = e.contact.getImpactVelocityAlongNormal();
                this.playerJump['host'].isEnable = false

            });
        }, 800)


        
    }

    add(player, player_position) {
        this.ground.loader.load.bind(this)

        this.ground.loader.load( '/model/Xbot.glb',  ( gltf ) => {
            
            this.ground.model[player] = gltf.scene;
            this.ground.object[player] = this.ground.model[player]


            this.ground.gravity.shape[player] = new CANNON.Box(new CANNON.Vec3(2, 0, 2));

            this.ground.gravity.body[player] = new CANNON.Body({
              mass: 5,
              position: new CANNON.Vec3(0, 2, 0),
              shape: this.ground.gravity.shape[player],
              linearDamping: 0

            });
            this.ground.gravity.body[player].collisionResponse = true;

            this.ground.gravity.world.addBody(this.ground.gravity.body[player]);
            this.playerLocalVelocity[player] = new CANNON.Vec3()

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
            this.ground.handle.player.action.addBaseActions(player)
          
            this.setPosition(player, player_position)

            for ( let i = 0; i !== animations.length; ++ i ) {
        
                let clip = animations[ i ];
                const name = clip.name;
        
                if ( this.ground.player.baseActions[player][ name ] ) {
                    const action = this.ground.mixer[player].clipAction( clip );
                    this.ground.handle.player.action.activate( action, player );
                    this.ground.player.baseActions[player][ name ].action = action;
        
                } else if ( this.additiveActions[ name ] ) {
                    THREE.AnimationUtils.makeClipAdditive( clip );
        
                    if ( clip.name.endsWith( '_pose' ) ) {
                        clip = THREE.AnimationUtils.subclip( clip, clip.name, 2, 3, 30 );
                    }
            
                    const action =this.ground.mixer[player].clipAction( clip );
                    this.ground.handle.player.action.activate( action, player );
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

    jump(player, value) {
        this.playerJump[player].velocity = value
        this.playerJump[player].isEnable = true
        setTimeout(() => {
            this.playerJump[player].velocity = 0
        }, 100)
    }

    rotationY(player, degree) {
        this.ground.model[player].rotation.y = degree;
        this.ground.gravity.body[player].quaternion.setFromEuler(0, degree, 0);

    }

    getRotation(player) {
        console.log('getRotationgetRotation',this.ground.model[player].rotation)
        return this.ground.model[player].rotation
    }

    getPosition(player) {
        return this.ground.model[player].position
    }

    setPosition(player, position) {
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
        //this.ground.model.host.translateZ( this.playerMove["host"][2]);

        


        for (let i in this.playerMove) {

            if (this.playerJump['host'].isEnable) {
                this.playerLocalVelocity[ i ].set( 0, 0, this.playerMove[i][2] /3 )
                let worldVelocity = this.ground.gravity.body[i].quaternion.vmult( this.playerLocalVelocity[i] );
        
                this.ground.gravity.body[i].velocity.x = worldVelocity.x;
                this.ground.gravity.body[i].velocity.z = worldVelocity.z;
            } else {
                this.playerLocalVelocity[ i ].set( 0, 0, this.playerMove[i][2] * 2 )
                let worldVelocity = this.ground.gravity.body[i].quaternion.vmult( this.playerLocalVelocity[i] );
        
                this.ground.gravity.body[i].velocity.x = worldVelocity.x;
                this.ground.gravity.body[i].velocity.z = worldVelocity.z;
            }

            if (this.playerJump["host"].velocity != 0) { // is jump
                //this.ground.gravity.body['host'].velocity.y = this.playerJump["host"]
                console.log(this.ground.gravity.body['host'])
                const strength = 200
                const force = new CANNON.Vec3(0, strength, 0)
                const centerInWorldCoords = this.ground.gravity.body['host'].pointToWorldFrame(new CANNON.Vec3())

                this.ground.gravity.body['host'].applyForce(force, centerInWorldCoords)
            }





        }



        


        
        //this.ground.microsky.exposure += 0.0004
        //this.ground.renderer.toneMappingExposure = this.ground.microsky.exposure;

      
        const mixerUpdateDelta = this.ground.clock.getDelta();
      
        //mixer.host.update( mixerUpdateDelta );

        this.ground.gravity.world.step(1 / 60, mixerUpdateDelta, 3)

        for (let i in this.ground.object) {
            this.ground.object[i].position.copy(this.ground.gravity.body[i].position)
            this.ground.object[i].quaternion.copy (this.ground.gravity.body[i].quaternion);        
        }



        //console.log(this.ground.gravity.body['player'])


        for (var i in this.ground.mixer) {
            this.ground.mixer[i].update( mixerUpdateDelta );
        }

        this.ground.renderer.render( this.ground.scene, this.ground.camera );
    }
}

export { Player }