import * as CANNON from '/js/module/cannon-es.js'

class Gravity {
    constructor (self) {
        this.self = self


    }

    set() {
        this.self.gravity.world.gravity.set(0, -9.82, 0);
        this.self.gravity.world.broadphase = new CANNON.NaiveBroadphase();
        this.self.gravity.world.solver.iterations = 5;



        let floor_shape = new CANNON.Plane();
        let floor_body = new CANNON.Body();
        floor_body.mass = 0;
        floor_body.addShape(floor_shape);
        floor_body.quaternion.setFromAxisAngle(new CANNON.Vec3(- 1, 0, 0), Math.PI * 0.5) 

        this.self.gravity.world.addBody(floor_body);
        this.self.gravity.world.allowSleep = false
    }

}

export { Gravity }