class Camera {
    constructor() {
        canvas = document.getElementById('webgl');
        this.speed = .2;
        this.turn = 3;
        this.eye = new Vector3([20, 2, 0]);
        this.at = new Vector3([0, 0, 0]);
        this.up = new Vector3([0, 1, 0]);
        this.fov = 60;
        this.viewMatrix = new Matrix4().setLookAtV3(this.eye, this.at, this.up);
        this.projectionMatrix = new Matrix4().setPerspective(this.fov, canvas.width / canvas.height, .1, 1000);
        this.f = new Vector3();
    }

    moveForward() {
        let f = this.f;
        f.set(this.at);
        f.sub(this.eye);
        f.normalize();
        f.mul(this.speed);
        this.eye.add(f);
        this.at.add(f);
        this.update();
    }

    moveUp() {
        let f = new Vector3([0, 1, 0]);
        f.mul(this.speed);
        this.eye.add(f);
        this.at.add(f);
        this.update();
    }

    moveDown() {
        let f = new Vector3([0, 1, 0]);
        f.mul(this.speed);
        this.eye.sub(f);
        this.at.sub(f);
        this.update();
    }

    moveBackward() {
        let b = this.f;
        b.set(this.eye);
        b.sub(this.at);
        b.normalize();
        b.mul(this.speed);
        this.eye.add(b);
        this.at.add(b);
        this.update();
    }

    moveLeft() {
        let f = this.f;
        f.set(this.at);
        f.sub(this.eye);
        let s = Vector3.cross(this.up, f);
        s.normalize();
        s.mul(this.speed);
        this.eye.add(s);
        this.at.add(s);
        this.update();
    }

    moveRight() {
        let f = this.f;
        f.set(this.at);
        f.sub(this.eye);
        let s = Vector3.cross(f, this.up);
        s.normalize();
        s.mul(this.speed);
        this.eye.add(s);
        this.at.add(s);
        this.update();
    }

    panLeft() {
        let f = this.f;
        f.set(this.at);
        f.sub(this.eye);
        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(this.turn, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        let f_prime = rotationMatrix.multiplyVector3(f);
        f_prime.add(this.eye);
        this.at = f_prime;
        this.update();
    }

    panRight() {
        let f = this.f;
        f.set(this.at);
        f.sub(this.eye);
        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(-this.turn, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        let f_prime = rotationMatrix.multiplyVector3(f);
        f_prime.add(this.eye);
        this.at = f_prime;
        this.update();
    }

    pan(angleX, angleY) {
        let f = this.f;
        f.set(this.at);
        f.sub(this.eye);

        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(angleX, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        let f_prime = rotationMatrix.multiplyVector3(f);

        let s = Vector3.cross(f_prime, this.up);
        rotationMatrix.setRotate(angleY, s.elements[0], s.elements[1], s.elements[2]);
        let s_prime = rotationMatrix.multiplyVector3(f_prime);


        s_prime.add(this.eye);
        this.at = s_prime;
        this.update();
    }

    update() {
        this.viewMatrix.setLookAtV3(this.eye, this.at, this.up);
    }

    getPosition() {
        return this.eye; // Return the position of the camera
    }

    getDirection() {
        const direction = new Vector3();
        direction.set(this.at);
        direction.sub(this.eye);
        direction.normalize();
        return direction;
    }

}