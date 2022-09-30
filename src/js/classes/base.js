import * as CANNON from '/js/module/cannon-es.js'
import { Octree } from '/js/module/Octree.js';


import { Object } from "/js/classes/object/object.js"
import { Player } from "/js/classes/player/player.js"
import { Action } from "/js/classes/player/action.js"

import { Ground } from "/js/classes/world/ground.js"
import { Renderer } from "/js/classes/world/renderer.js";
import { Scene } from "/js/classes/world/scene.js";
import { Clock } from "/js/classes/world/clock.js";
import { Light } from "/js/classes/world/light.js";
import { Loadmanager } from "/js/classes/world/loadmanager.js";
import { Gravity } from "/js/classes/world/gravity.js"


import { Camara } from "/js/classes/player/camera.js";


class Base {
    constructor () {
        this.handle = {
            player: {
                object: new Player(this),
                camera: new Camara(this),
                action: new Action(this)
            },
            world: {
                ground: new Ground(this),
                renderer: new Renderer(this),
                clock: new Clock(this),
                scene: new Scene(this),
                light: new Light(this),
                loadmanager: new Loadmanager(this),
                gravity: new Gravity(this)
            },
            object: new Object(this)
        }

        this.page = {
            loadStatus: false
        }

        this.scene;
        this.camera;
        this.stats;
        this.loader;
        this.model = {};
        this.skeleton = {} 
        this.mixer = {};
        this.clock;
        this.light;
        this.gravity = {
            world: new CANNON.World(),
            shape: {},
            body: {},
            material: {},
            cannonDebugRenderer: {}
        }
        this.world = {
            octree: new Octree()
        }
        this.player = {
            crossFadeControls: [],
            currentBaseAction: 'idle',
            currentPlayingAction: 'idle',
            allActions: [],
            baseActions: {
                host: {
                    idle: { weight: 1 },
                    walk: { weight: 0 },
                    jump: { weight: 0 }
                }
            },
            additiveActions: {
                sneak_pose: { weight: 0 },
                sad_pose: { weight: 0 },
                agree: { weight: 0 },
                headShake: { weight: 0 }
            },
            playerMove: {
                "host":[0,0,0]
            },
            playerDistance: 0.015, // 속도
        }
        this.player_animations = {};
        this.player_model = {};
        this.container = document.getElementById( 'game' );

        this.object = {}
        this.loadmanager

        this.microsky = {}
    }

    init() {
        this.handle.world.clock.init()
        this.handle.world.scene.init()

        this.handle.world.light.hemi()
        this.handle.world.light.directional()

        this.handle.world.loadmanager.init()

        this.handle.player.camera.init()
        //this.handle.object.init()
        this.handle.world.gravity.set()

        this.handle.world.renderer.init()

        this.handle.world.ground.sky()
        this.handle.world.renderer.toneMapping()


        this.handle.world.ground.floor()

    
    }
}


export { Base }