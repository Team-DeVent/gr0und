import Stats from "/js/module/stats.module.js";
import { GUI } from "/js/module/dat.gui.module.js";
import { Base } from "/js/classes/base.js";
import { v4 as uuidv4 } from 'https://jspm.dev/uuid';

let mode = 1; // 0: dev 1: prud

let player_clip, player_action, player_key;
let player_distance = 0.02; // 속도
let player_camara = {
  fov: 90,
  position: {
    x:0,
    y:3,
    z:-7
  }
}; // fov

let player_moveZ = {
  "host":0
}, player_moveX = 0; // 속도

let now_user_id = {
    u_id: 'test',
    uuid: uuidv4()
}


document.addEventListener("keydown", keyPressed, false);

let last_touch = 0
document.addEventListener('touchend', function (event) {
  let now_date = new Date();
  let get_time = now_date.getTime();
  if (get_time - last_touch <= 300) {
    event.preventDefault(); 
  } 
  last_touch = now; 
}, false);

button_zoom_p.addEventListener("click", () => {
  player_camara.fov += 5
  base.handle.player.camera.zoom(player_camara.fov)
  document.querySelector("#zoom_input").value = "시야 확대 "+player_camara.fov
});

button_zoom_m.addEventListener("click", () => {
  player_camara.fov -= 5
  base.handle.player.camera.zoom(player_camara.fov)
  document.querySelector("#zoom_input").value = "시야 확대 "+player_camara.fov
});

camera_zoom_in.addEventListener("click", () => {
  if (player_camara.position.y > 2 && player_camara.position.z < -2) {
    player_camara.position.y -= 0.4
    player_camara.position.z += 0.4

    base.handle.player.camera.position(0,player_camara.position.y, player_camara.position.z)

    document.querySelector("#camera_zoom_input").value = `카메라 위치 ${player_camara.position.x},${player_camara.position.y},${player_camara.position.z}`
  }
});

camera_zoom_out.addEventListener("click", () => {
  if (player_camara.position.y < 9 && player_camara.position.z > -12) {
    player_camara.position.y += 0.4
    player_camara.position.z -= 0.4

    base.handle.player.camera.position(0,player_camara.position.y, player_camara.position.z)

    document.querySelector("#camera_zoom_input").value = `카메라 위치 ${player_camara.position.x},${player_camara.position.y},${player_camara.position.z}`
  }
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
    player_camara.zoom += 5
    base.handle.player.camera.zoom(player_camara.zoom)
    addConsoleMessage(`zoom ${player_camara.zoom}`)

  } else if (e.keyCode == 57) { // 9 (zoom camara -)
    player_camara.zoom -= 5
    base.handle.player.camera.zoom(player_camara.zoom)
    addConsoleMessage(`zoom ${player_camara.zoom}`)

  }
  if (e.keyCode == 85) { // u
    console.log(p.ground)

  }

  if (e.keyCode == 80) { // p
    p.test.log()
    console.log(p.test.getPosition('host'))

  }

  if (e.keyCode == 32) {
    base.handle.player.object.jump("host", 5)
    setTimeout(() => {
      base.handle.player.object.jump("host", 0)

    }, 100)
    

  }

}



let base = new Base()

base.init()

base.handle.player.object.init()

console.log(base.handle.player)
base.handle.player.camera.zoom(90)





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
let player_default_position = {
  x:0,
  y:0,
  z:0
}

const socket = io();

socket.emit('init', {
  uuid: now_user_id.uuid
})

socket.on('init', (data) => {
  if (now_user_id.uuid != data.uuid) {

    base.handle.player.object.add(data.uuid, player_default_position)

    player_move_lock[data.uuid] = 0
  }

})

socket.on('move', (data) => {
  if (now_user_id.uuid != data.uuid) {
    if (player_move_lock[data.uuid] == 0) {
      base.handle.player.action.start(data.uuid) 
      base.handle.player.object.move(data.uuid)
      console.log('>>>>>>>>>>>>>', data)
      player_move_lock[data.uuid] = 1

    } else {
      base.handle.player.object.move(data.uuid)
      console.log(player_move_lock[data.uuid], data)
    }
  }


})

socket.on('stop', (data) => {
  if (now_user_id.uuid != data.uuid) {
    base.handle.player.action.stop(data.uuid) 
    base.handle.player.object.stop(data.uuid)

    console.log('stop', data)
    player_move_lock[data.uuid] = 0

  }


})

socket.on('rotation', (data) => {
  if (now_user_id.uuid != data.uuid) {
    base.handle.player.object.rotationY(data.uuid, data.rotation)

  }

})

socket.on('remove', (uuid) => {
  base.handle.player.object.remove(uuid)

})

let is_first_connect = true;

socket.on('connected', (data) => {
  if (is_first_connect) {
    for (let player in data) {
      console.log(data[player])

      base.handle.player.object.add(data[player].uuid, {
        x: data[player].position.x,
        y: data[player].position.y,
        z: data[player].position.z
      })
    }
    is_first_connect = false
  }
})



// NOTE: 더 부드러운 인터렉션을 위해 빠른 종료 애니메이션 필요
semi.on('end', function(evt, data) {
  console.log("> STOP", start_count, last_radian);

  if (start_count !== 0) {
    move_lock = 1 // 이동 제한
    start_count = 0
    base.handle.player.action.stop("host") 

    base.handle.player.object.stop("host")
    last_radian = last_radian_temp

  }

  let end_position = base.handle.player.object.getPosition('host')
  let end_rotation  = base.handle.player.object.getRotation('host')
  last_radian = end_rotation.y

  console.log(end_position.x)
  try {


    socket.emit("stop", {
      uuid: now_user_id.uuid,
      position: {
        x: end_position.x,
        y: end_position.y,
        z: end_position.z

      }
    });
  } catch (error) {
    console.info('Failed to send.')
  }

  setTimeout(function () {
    move_lock = 0
  }, 1000)
})

let change_radian = 0
semi.on('start end', function(evt, data) {
  //console.log(data);
}).on('move', function(evt, data) {

  if (move_lock == 0) {
    
    change_radian = last_radian+(data.angle.radian-(90*(Math.PI/180)))
    console.log('getRotationgetRotation', change_radian)
    //console.log(last_radian, change_radian)

    base.handle.player.object.rotationY("host", change_radian)
    socket.emit("rotation", {
      uuid: now_user_id.uuid,
      rotation: data.angle.radian
    });

    if (start_count == 0) {
      console.log("> START", start_count, last_radian);

      base.handle.player.action.start("host") 

    }
    start_count += 1
    base.handle.player.object.move('host')

    try {
      socket.emit("move", {
        uuid: now_user_id.uuid,
        data: 1
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