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



function move(p_model, uid, d) { // 0: 앞으로 1: 뒤로 2: 왼쪽 3: 오른쪽
  switch (d) {
    case 0: // w
      p_model.translateZ( player_distance);
      player_moveZ[uid] = player_distance
      player_moveX = 0

      break;

    case 1: // s
    
      p_model.translateZ( -player_distance);
      player_moveZ = -player_distance
      player_moveX = 0
      break;

    case 2: // a
      p_model.translateX( player_distance);
      player_moveX = player_distance
      player_moveZ = 0


      break;

    case 3: // d
      p_model.translateX( -player_distance);
      player_moveX = -player_distance
      player_moveZ = 0

      break;
    default:
      break;
  }
}

function nomove(p_model, uid) {
  p_model.translateZ( 0);
  player_moveZ[uid] = 0
  player_moveX = 0
}


function moveAction(uid) {
  const settings = baseActions[uid][ 'walk' ];
  const currentSettings = baseActions[uid][ 'idle' ];
  const currentAction = currentSettings ? currentSettings.action : null;
  const action = settings ? settings.action : null;
  console.log("> >>", currentAction, action)
  prepareCrossFade( currentAction, action, 0.25, uid);
}

function nomoveAction(uid) {
  const settings = baseActions[uid][ 'idle' ];
  const currentSettings = baseActions[uid][ 'walk' ];
  const currentAction = currentSettings ? currentSettings.action : null;
  const action = settings ? settings.action : null;
  prepareCrossFade( currentAction, action, 0.25, uid);
}


let scene, camera, renderer, stats, loader, model, skeleton = {}, mixer = {}, clock, light;
let player_animations = {}, player_model = {};

const crossFadeControls = [];
const container = document.getElementById( 'game' );

let currentBaseAction = 'idle';
const allActions = [];
const baseActions = {
  host: {
    idle: { weight: 1 },
    walk: { weight: 0 },
    run: { weight: 0 }
  }
};
const additiveActions = {
  sneak_pose: { weight: 0 },
  sad_pose: { weight: 0 },
  agree: { weight: 0 },
  headShake: { weight: 0 }
};
let panelSettings, numAnimations;

init();

addPlayer('bbb')


function init() {
          clock = new THREE.Clock();


  scene = new THREE.Scene();
          scene.background = new THREE.Color( 0xa0a0a0 );
          scene.fog = new THREE.Fog( 0xa0a0a0, 10, 50 );

          const hemiLight = new THREE.HemisphereLight( 0x707070, 0x444444 );
          hemiLight.position.set( 0, 120, 0 );
          scene.add( hemiLight );

  const dirLight = new THREE.DirectionalLight( 0xffffff );
  dirLight.position.set( 3, 10, 10 );
  dirLight.castShadow = true;
  dirLight.shadow.camera.top = 2;
  dirLight.shadow.camera.bottom = - 2;
  dirLight.shadow.camera.left = - 2;
  dirLight.shadow.camera.right = 2;
  dirLight.shadow.camera.near = 0.1;
  dirLight.shadow.camera.far = 400;
  scene.add( dirLight );
  light = dirLight

  const mesh = new THREE.Mesh( new THREE.PlaneGeometry( 100, 100 ), new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } ) );
  mesh.rotation.x = - Math.PI / 2;
  mesh.receiveShadow = true;
  scene.add( mesh );



  const geometry1 = new THREE.BoxGeometry( 1, 1, 1 );
  const material1 = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
  const cube1 = new THREE.Mesh( geometry1, material1 );
  scene.add( cube1 );




  // camera
  camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 1, 100 );

  /*
  let model_dir = '/model/_ground/Xbot.glb';
  caches.open('grond').then(function (cacheStorage) {
    return {
      responsedCache:cacheStorage.match(model_dir), 
      cacheStorage:cacheStorage
    };
  }).then(function (data) {
    console.log(data.responsedCache, data.cacheStorage);
    fetch(model_dir).then(function (response) {
      data.cacheStorage.put(model_dir, response);
      console.log(response);
    })
  }).catch(function (err) {
    console.log('res', err);
  })
*/


  loader = new THREE.GLTFLoader();
  loader.load( '/model/Xbot.glb', function ( gltf ) {

    model = gltf.scene;
    scene.add( model );
    dirLight.target = model

    model.add( camera );
    camera.position.set( 0, 4, -6 );
    camera.lookAt( model.position );
    console.log(model)

    model.traverse( function ( object ) {

      if ( object.isMesh ) object.castShadow = true;

    } );
    console.log(gltf)

    skeleton.host = new THREE.SkeletonHelper( model );
    skeleton.host.visible = false;
    scene.add( skeleton.host );

    const animations = gltf.animations;
    console.log(animations)
    player_animations.host = animations
    
    mixer.host = new THREE.AnimationMixer( model );

    numAnimations = animations.length;

    for ( let i = 0; i !== numAnimations; ++ i ) {

      let clip = animations[ i ];
      const name = clip.name;

      if ( baseActions['host'][ name ] ) {
        const action = mixer.host.clipAction( clip );
        activateAction( action, 'host' );
        baseActions['host'][ name ].action = action;
        allActions.push( action );

      } else if ( additiveActions[ name ] ) {
        THREE.AnimationUtils.makeClipAdditive( clip );

        if ( clip.name.endsWith( '_pose' ) ) {
          clip = THREE.AnimationUtils.subclip( clip, clip.name, 2, 3, 30 );
        }

        const action = mixer.host.clipAction( clip );
        activateAction( action, 'host' );
        additiveActions[ name ].action = action;
        allActions.push( action );
      }
    }

    if (mode == 0) {
      createPanel();
    }

    animate();
  });

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true;
  container.appendChild( renderer.domElement );


  /*
const controls = new OrbitControls( camera, renderer.domElement );
controls.enablePan = false;
controls.enableZoom = false;
controls.target.set( 0, 3, 0 );
controls.update();
  */

  stats = new Stats();

  if (mode == 0) {
    container.appendChild( stats.dom );
  }

  setTimeout(() => {
    //loadBackgroundSound()
  }, 1800);

  window.addEventListener( 'resize', onWindowResize );
}


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




function activateAction(action, uid) {
  const clip = action.getClip();
  const settings = baseActions[uid][ clip.name ] || additiveActions[ clip.name ];
  setWeight( action, settings.weight );
  action.play();
}



function modifyTimeScale(speed) {
  mixer.host.timeScale = speed;
}



function prepareCrossFade( startAction, endAction, duration, player ) {

  // 현재 동작이 '유휴'인 경우 크로스페이드(crossfade)를 즉시 실행합니다;
  // 그렇지 않으면 현재 작업이 현재 루프를 완료할 때까지 기다립니다.
  if ( currentBaseAction === 'idle' || ! startAction || ! endAction ) {
    executeCrossFade( startAction, endAction, duration, player );
  } else {
    synchronizeCrossFade( startAction, endAction, duration, player );
  }

  // Update control colors
  if ( endAction ) {
    const clip = endAction.getClip();
    currentBaseAction = clip.name;
  } else {
    currentBaseAction = 'None';
  }

  crossFadeControls.forEach( function ( control ) {
    const name = control.property;
    if ( name === currentBaseAction ) {
      control.setActive();
    } else {
      control.setInactive();
    }
  });
}



function synchronizeCrossFade(startAction, endAction, duration, player) {
  mixer[player].addEventListener( 'loop', onLoopFinished );
  //console.log("synchronizeCrossFade",startAction, endAction)

  function onLoopFinished( event ) {
    if ( event.action === startAction ) {
      mixer[player].removeEventListener( 'loop', onLoopFinished );
      executeCrossFade( startAction, endAction, duration, player );
    }
  }
}



function executeCrossFade(startAction, endAction, duration, player) {
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



// animationAction.crossFadeTo()가 시작 동작을 비활성화하고 설정하므로 이 기능이 필요합니다.
// 시작 동작의 시간스케일 (애니메이션 시작 기간) / (애니메이션 종료 기간)로 설정합니다.

function setWeight(action, weight) {
  action.enabled = true;
  action.setEffectiveTimeScale( 1 );
  action.setEffectiveWeight( weight );
}




function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}



/*
=====================================================================
              *  모든 플레이어 애니메이션 처리 부분  *
=====================================================================
*/


function animate() {
  requestAnimationFrame( animate );
  model.translateZ( player_moveZ["host"]);
  model.translateX( player_moveX);
  for (var i in player_model) {
    //console.log(i, String(i), player_moveZ[String(i)])
    player_model[i].translateZ( player_moveZ[i]);
    //model.translateX( player_moveX);

  }

  const mixerUpdateDelta = clock.getDelta();

  //mixer.host.update( mixerUpdateDelta );
  for (var i in mixer) {
    mixer[i].update( mixerUpdateDelta );
  }
  if (mode == 0) {
    stats.update();

  }
  renderer.render( scene, camera );
}


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
  move_lock = 1 // 이동 제한
  start_count = 0
  /*
  const settings = baseActions[ 'idle' ];
  const currentSettings = baseActions[ 'walk' ];
  const currentAction = currentSettings ? currentSettings.action : null;
  const action = settings ? settings.action : null;
  prepareCrossFade( currentAction, action, 0.25);
  */
  nomoveAction("host") 

  nomove(model, "host")

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
    model.rotation.y = data.angle.degree/57.8;
    if (start_count == 0) {
      console.log("> START", start_count);
      /*
      const settings = baseActions[ 'walk' ];
      const currentSettings = baseActions[ 'idle' ];
      const currentAction = currentSettings ? currentSettings.action : null;
      const action = settings ? settings.action : null;
      prepareCrossFade( currentAction, action, 0.25);
      */
      moveAction("host") 

    }
    start_count += 1
    move(model, "host", 0)

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