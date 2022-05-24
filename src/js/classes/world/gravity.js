class Gravity {
    constructor (self) {
        this.self = self


    }

    set() {
        this.self.gravity.world.gravity.set(0, -9.82, 0);

        this.self.gravity.shape['sphere'] = new CANNON.Sphere(0.5);

        this.self.gravity.body['sphere'] = new CANNON.Body({
          mass: 1,
          position: new CANNON.Vec3(0, 3, 0),
          shape: this.self.gravity.shape['sphere'],
        });
        this.self.gravity.world.addBody(this.self.gravity.body['sphere']);


        let floor_shape = new CANNON.Plane();
        let floor_body = new CANNON.Body();
        floor_body.mass = 0;
        floor_body.addShape(floor_shape);
        floor_body.quaternion.setFromAxisAngle(new CANNON.Vec3(- 1, 0, 0), Math.PI * 0.5) 

        this.self.gravity.world.addBody(floor_body);
    }

}

export { Gravity }