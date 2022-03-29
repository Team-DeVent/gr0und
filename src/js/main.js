import Stats from "/js/module/stats.module.js";
import { GUI } from "/js/module/dat.gui.module.js";

let mode = 1; // 0: dev 1: prud

let player_clip, player_action, player_key;
let player_distance = 0.02; // 속도
let player_moveZ = {
  "host":0
}, player_moveX = 0; // 속도

let now_user_id = {
    u_id: 'test'
}


document.addEventListener("keydown", keyPressed, false);

function keyPressed(e) {
  console.log(e.keyCode)
  if (e.keyCode == 73) { // i
    console.log(skeleton)
    console.log(mixer)
    console.log(player_model)
    console.log(baseActions)

  }

}

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

        window.addEventListener( 'resize', this.onWindowResize );
    }


    activateAction(action, uid) {
        const clip = action.getClip();
        const settings = this.baseActions[uid][ clip.name ] || this.additiveActions[ clip.name ];
        setWeight( action, settings.weight );
        action.play();
    }

    move(player) { // 0: 앞으로 1: 뒤로 2: 왼쪽 3: 오른쪽
        player_moveZ[player] = player_distance
        player_moveX = 0
    }
    
    stop(player) {
      player_moveZ[player] = 0
      player_moveX = 0
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
            setWeight( endAction, 1 );
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
        this.onWindowResize.bind(this) 
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );
    }

    animate() {
        requestAnimationFrame( this.animate.bind(this) );
        this.model.translateZ( player_moveZ["host"]);
        this.model.translateX( player_moveX);
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
        if (mode == 0) {
            this.stats.update();
      
        }
        this.renderer.render( this.scene, this.camera );
    }
}

let p = new Player()

p.init()









function loadBackgroundSound() {
  let soundFile = 'audio/wind.mp3'
  const listener = new THREE.AudioListener();
  camera.add( listener );
  const sound = new THREE.Audio( listener );

  const audioLoader = new THREE.AudioLoader();
  audioLoader.load(soundFile , function( buffer ) {
    sound.setBuffer( buffer );
    sound.setLoop( true );
    sound.setVolume( 0.5 );
    sound.play();
  },
  function(per){
    document.getElementById("loadPer").innerText = ((per.loaded/4700000)*100).toFixed(1);
    // console.log(per);
  });
}



function addPlayer(uid) {
  //loader = new THREE.GLTFLoader();
  loader.load( '/model/Xbot.glb', function ( gltf ) {

    player_model[uid] = gltf.scene;
    player_moveZ[uid] = 0
    scene.add( player_model[uid] );
    console.log(player_model)
    //light.target = player_model.uid


    player_model[uid].traverse( function ( object ) {
      if (object.isMesh) object.castShadow = true;
    });
    console.log(gltf)

    skeleton[uid] = new THREE.SkeletonHelper( player_model[uid] );
    skeleton[uid].visible = false;
    scene.add( skeleton[uid] );

    const animations = gltf.animations;
    console.log(animations)
    player_animations[uid] = animations

    mixer[uid] = new THREE.AnimationMixer( player_model[uid] );
    addBaseActions(uid)

    
    numAnimations = animations.length;

    for ( let i = 0; i !== numAnimations; ++ i ) {

      let clip = animations[ i ];
      const name = clip.name;

      if ( baseActions[uid][ name ] ) {
        const action = mixer[uid].clipAction( clip );
        activateAction( action, uid );
        baseActions[uid][ name ].action = action;

      } else if ( additiveActions[ name ] ) {
        THREE.AnimationUtils.makeClipAdditive( clip );

        if ( clip.name.endsWith( '_pose' ) ) {
          clip = THREE.AnimationUtils.subclip( clip, clip.name, 2, 3, 30 );
        }

        const action = mixer[uid].clipAction( clip );
        activateAction( action, uid );
      }
    }
  });
}


function addBaseActions(uid) {
  baseActions[uid] = {
    idle: { weight: 1 },
    walk: { weight: 0 },
    run: { weight: 0 }
  }
}



function createPanel() {
  const panel = new GUI( { width: 310 } );
  const folder1 = panel.addFolder( 'Base Actions' );
  const folder2 = panel.addFolder( 'Additive Action Weights' );
  const folder3 = panel.addFolder( 'General Speed' );
  panelSettings = {
    'modify time scale': 1.0
  };
  const baseNames = [ 'None', ...Object.keys( baseActions ) ];

  for ( let i = 0, l = baseNames.length; i !== l; ++ i ) {
    const name = baseNames[ i ];
    const settings = baseActions[ name ];
    panelSettings[ name ] = function () {
      const currentSettings = baseActions[ currentBaseAction ];
      const currentAction = currentSettings ? currentSettings.action : null;
      const action = settings ? settings.action : null;
      prepareCrossFade( currentAction, action, 0.35 );
    };
    crossFadeControls.push( folder1.add( panelSettings, name ) );
  }

  for ( const name of Object.keys( additiveActions ) ) {
    const settings = additiveActions[ name ];
    panelSettings[ name ] = settings.weight;
    folder2.add( panelSettings, name, 0.0, 1.0, 0.01 ).listen().onChange( function ( weight ) {
      setWeight( settings.action, weight );
      settings.weight = weight;
    });
  }

  folder3.add( panelSettings, 'modify time scale', 0.0, 1.5, 0.01 ).onChange( modifyTimeScale );
  folder1.open();
  folder2.open();
  folder3.open();

  crossFadeControls.forEach( function ( control ) {
    control.classList1 = control.domElement.parentElement.parentElement.classList;
    control.classList2 = control.domElement.previousElementSibling.classList;

    control.setInactive = function () {
      control.classList2.add( 'control-inactive' );
    };

    control.setActive = function () {
      control.classList2.remove( 'control-inactive' );
    };
    const settings = baseActions[ control.property ];
    if ( ! settings || ! settings.weight ) {
      control.setInactive();
    }
  });
}








function modifyTimeScale(speed) {
  mixer.host.timeScale = speed;
}









// animationAction.crossFadeTo()가 시작 동작을 비활성화하고 설정하므로 이 기능이 필요합니다.
// 시작 동작의 시간스케일 (애니메이션 시작 기간) / (애니메이션 종료 기간)로 설정합니다.

function setWeight(action, weight) {
  action.enabled = true;
  action.setEffectiveTimeScale( 1 );
  action.setEffectiveWeight( weight );
}







/*
=====================================================================
              *  모든 플레이어 애니메이션 처리 부분  *
=====================================================================
*/





/*
========================================================
              *  PeerJS  *
========================================================
*/
let peer_rand_id = ((Math.random()*( 999999999 - 111111111)) +111111111).toString(36).substring(8).substr(0, 4)+"-"+((Math.random()*( 999999999 - 111111111)) +111111111).toString(36).substring(8).substr(0, 4); // 4-4자리
let user_rand_id = String(Math.round((Math.random()*( 999999999 - 111111111)) +111111111))


let peer, conn, page_peer = peer_rand_id, is_host = window.location.href.split('#')[1] == undefined ? 1 : 0, player_peer = [], local_uid = now_user_id.u_id == null ? user_rand_id : now_user_id.u_id;

    if (window.location.href.split('#')[1] == undefined) {
    peer = new Peer(peer_rand_id, {
      config: {'iceServers': [
        { url: 'stun:stun.l.google.com:19302' },
        { url: 'turn:13.250.13.83:3478?transport=udp', username: "YzYNCouZM1mhqhmseWk6",  credential: 'YzYNCouZM1mhqhmseWk6' }
      ]}
    })
    } else {
      peer = new Peer({
        config: {'iceServers': [
          { url: 'stun:stun.l.google.com:19302' },
          { url: 'turn:13.250.13.83:3478?transport=udp', username: "YzYNCouZM1mhqhmseWk6",  credential: 'YzYNCouZM1mhqhmseWk6' }
        ]}
      }); 
    }


function selectGround(check) {
    console.log(1)
    if (check == 1) { // 호스트
        is_host = 1
    } else { // 게스트
        is_host = 0
    }
    }
    

function addPlayerPeer(peer) {
    player_peer.push(peer)
}

function broadcastData(data) {
    console.log(peer.connections)
    for (let i = 0; i < player_peer.length; i++) {
        try {
        peer.connections[player_peer[i]][0].send(data)
        } catch (error) {
        idx = player_peer.indexOf(player_peer[i])
        if (idx > -1) player_peer.splice(idx, 1)
        
        }
    }
    }





let player_move_lock = {}

peer.on('open', function(id) {

  if (window.location.href.split('#')[1] == undefined) { // 호스트
    console.log("HOST")
    console.log(peer_rand_id)
    document.querySelector("#menu_peer").innerHTML = peer_rand_id
    document.querySelector("#modal_feed_info_body_url").value = window.location.href +"#"+ peer_rand_id
    

    document.querySelector("#menu_uid").innerHTML = local_uid
  } else {
    page_peer =  window.location.href.split('#')[1]
    conn = peer.connect(page_peer);
    console.log(">", peer)
    document.querySelector("#menu_uid").innerHTML = local_uid

    conn.on('open', function(){
      conn.send({
        status:100,
        user_id:local_uid,
        user_peer:peer.id
      });
    });

    conn.on('data', function(data){
      switch (data.status) {
        case 100:
          player_move_lock[data.user_id] = 0

          addPlayer(data.uid)

          console.log(data)
          setTimeout(() => {
            player_model[data.user_id].position.set(data.location.x, data.location.y, data.location.z);
          }, 1000);


          break;

        case 600: // 게스트 움직임
          if (data.uid != local_uid) {
            player_model[data.uid].rotation.y = data.rotation
            move(player_model[data.uid], data.uid, 0)
            if (player_move_lock[data.user_id] == 0) { // 움직임 허용
              moveAction(data.uid)
              player_move_lock[data.user_id] = 1
            }
            // broadcastData(data)
          }


          break;
      
        case 601: // 게스트 멈춤
          if (data.uid != local_uid) {
            nomoveAction(data.uid)
            console.log(">", data.uid)
            player_move_lock[data.user_id] = 0 // 움직임 제한 해제
            //player_model[data.uid].rotation.y = 0
            nomove(player_model[data.uid], data.uid)
          }


          break;
        default:
          break;
      }
    });
  }
});



peer.on('connection', function(nconn) {
  if (window.location.href.split('#')[1] == undefined) { // 호스트일 경우
    conn = nconn
    nconn.on('data', function(data){
      console.log(data);
      switch (data.status) {
        case 100: // 초기 접속
          console.log("NEW USER")
          player_move_lock[data.user_id] = 0
          addPlayer(data.user_id)
          addPlayerPeer(data.user_peer)
          broadcastData({
            status:100,
            uid:local_uid,
            location:model.position
          })

          break;

        case 600: // 호스트 움직임
          if (data.uid != local_uid) {
            player_model[data.uid].rotation.y = data.rotation
            move(player_model[data.uid], data.uid, 0)
            if (player_move_lock[data.user_id] == 0) { // 움직임 허용
              moveAction(data.uid)
              player_move_lock[data.user_id] = 1
            }
            console.log("<", data.uid, player_model[data.uid])
            broadcastData(data)
          }


          break;
      
        case 601: // 호스트 멈춤
          if (data.uid != local_uid) {
            //player_model[data.uid].rotation.y = 0
            nomoveAction(data.uid)
            console.log(">", data.uid)
            player_move_lock[data.user_id] = 0 // 움직임 제한 해제
            nomove(player_model[data.uid], data.uid)
          }


          break;
        default:
          break;
      }
    });
  }

});


  
/*
========================================================
              *  플레이어 조이스틱 제어  *
========================================================
*/

var semi = nipplejs.create({
zone: document.getElementById('game'),
  mode: 'semi',
  catchDistance: 150,
  color: 'white'
});

let start_count = 0, move_lock = 0;




// NOTE: 더 부드러운 인터렉션을 위해 빠른 종료 애니메이션 필요
semi.on('end', function(evt, data) {
  console.log("> STOP", start_count);

  if (start_count !== 0) {
    move_lock = 1 // 이동 제한
    start_count = 0
    p.stopAction("host") 

    p.stop("host")
  }


  try {
    conn.send({
      status:601,
      uid:local_uid
    });
  } catch (error) {
    console.info('Failed to send.')
  }

  setTimeout(function () {
    move_lock = 0
  }, 1000)
})


semi.on('start end', function(evt, data) {
  //console.log(data);
}).on('move', function(evt, data) {

  if (move_lock == 0) {
    p.rotationY(data.angle.radian)

    if (start_count == 0) {
      console.log("> START", start_count);

      p.moveAction("host") 

    }
    start_count += 1
    p.move('host')


    try {
      conn.send({
        status:600,
        uid:local_uid,
        rotation: data.angle.degree/57.8
      });
    } catch (error) {
      console.info('Failed to send.')
    }
  }

    }).on('dir:up plain:up dir:left plain:left dir:down ' +
          'plain:down dir:right plain:right',
          function(evt, data) {
    }
    ).on('pressure', function(evt, data) {
      console.log({
    pressure: data
  });
});