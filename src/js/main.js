import Stats from "/js/module/stats.module.js";
import { GUI } from "/js/module/dat.gui.module.js";
import { Player } from "/js/classes/Player.js";

let mode = 1; // 0: dev 1: prud

let player_clip, player_action, player_key;
let player_distance = 0.02; // 속도
let player_camara_zoom = 90; // 속도

let player_moveZ = {
  "host":0
}, player_moveX = 0; // 속도

let now_user_id = {
    u_id: 'test'
}


document.addEventListener("keydown", keyPressed, false);

button_zoom_p.addEventListener("click", () => {
  player_camara_zoom += 5
  p.zoomCamera(player_camara_zoom)
  document.querySelector("#zoom_input").value = "시야 확대 "+player_camara_zoom
});

button_zoom_m.addEventListener("click", () => {
  player_camara_zoom -= 5
  p.zoomCamera(player_camara_zoom)
  document.querySelector("#zoom_input").value = "시야 확대 "+player_camara_zoom
});


function switchConsole() {
  let body = document.querySelector("#console")

  if (body.classList.contains('div-hide')) {
    body.classList.remove('div-hide')
  } else {
    body.classList.add('div-hide')
  }
}

function addConsoleMessage(msg) {
  let body = document.querySelector("#console")
  body.insertAdjacentHTML('beforeend', `[ + ] ${msg} <br>`)
}

function keyPressed(e) {
  console.log(e.keyCode)
  if (e.keyCode == 73) { // i
    switchConsole()

  }
  if (e.keyCode == 48) { // 0 (zoom camara +)
    player_camara_zoom += 5
    p.zoomCamera(player_camara_zoom)
    addConsoleMessage(`zoom ${player_camara_zoom}`)

  } else if (e.keyCode == 57) { // 9 (zoom camara -)
    player_camara_zoom -= 5
    p.zoomCamera(player_camara_zoom)
    addConsoleMessage(`zoom ${player_camara_zoom}`)

  }

}



let p = new Player()

p.init()

p.zoomCamera(90)

p.add('o2')





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
let last_radian_temp = 0;
let last_radian = 0;



// NOTE: 더 부드러운 인터렉션을 위해 빠른 종료 애니메이션 필요
semi.on('end', function(evt, data) {
  console.log("> STOP", start_count, last_radian);

  if (start_count !== 0) {
    move_lock = 1 // 이동 제한
    start_count = 0
    p.stopAction("host") 

    p.stop("host")
    last_radian = last_radian_temp

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
      console.log("> START", start_count, last_radian);

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