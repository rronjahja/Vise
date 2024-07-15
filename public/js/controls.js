import * as THREE from 'three';

export function createCustomControls(camera, domElement) {
    const controls = {
        isMouseDown: false,
        moveForward: false,
        moveBackward: false,
        moveLeft: false,
        moveRight: false,
        velocity: new THREE.Vector3(),
        direction: new THREE.Vector3(),
        onMouseDown: function (event) {
            this.isMouseDown = true;
        },
        onMouseUp: function () {
            this.isMouseDown = false;
        },
        onMouseMove: function (event) {
            if (this.isMouseDown) {
                const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
                const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
                camera.rotation.y -= movementX * 0.002;
                camera.rotation.x -= movementY * 0.002; // Inverted y-axis movement
                camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));
            }
        },
        onKeyDown: function (event) {
            switch (event.code) {
                case 'ArrowUp':
                case 'KeyW':
                    this.moveForward = true;
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                    this.moveLeft = true;
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    this.moveBackward = true;
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.moveRight = true;
                    break;
            }
        },
        onKeyUp: function (event) {
            switch (event.code) {
                case 'ArrowUp':
                case 'KeyW':
                    this.moveForward = false;
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                    this.moveLeft = false;
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    this.moveBackward = false;
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.moveRight = false;
                    break;
            }
        },
        update: function () {
            const delta = 0.1; // Arbitrary frame rate delta
            this.velocity.x -= this.velocity.x * 1.0 * delta;
            this.velocity.z -= this.velocity.z * 1.0 * delta;

            this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
            this.direction.x = Number(this.moveLeft) - Number(this.moveRight);
            this.direction.normalize(); // This ensures consistent movements in all directions

            if (this.moveForward || this.moveBackward) this.velocity.z += this.direction.z * 2.0 * delta;
            if (this.moveLeft || this.moveRight) this.velocity.x += this.direction.x * 2.0 * delta;

            // Calculate forward movement direction based on the camera's current orientation
            const forward = new THREE.Vector3();
            camera.getWorldDirection(forward);
            forward.y = 0; // Ensure no vertical movement
            forward.normalize();

            // Calculate sideways movement direction based on the camera's current orientation
            const sideways = new THREE.Vector3();
            sideways.crossVectors(camera.up, forward).normalize();

            // Apply movement
            if (this.moveForward || this.moveBackward) {
                camera.position.addScaledVector(forward, this.velocity.z * delta);
            }
            if (this.moveLeft || this.moveRight) {
                camera.position.addScaledVector(sideways, this.velocity.x * delta);
            }
        }
    };

    domElement.addEventListener('mousedown', controls.onMouseDown.bind(controls));
    domElement.addEventListener('mouseup', controls.onMouseUp.bind(controls));
    domElement.addEventListener('mousemove', controls.onMouseMove.bind(controls));
    window.addEventListener('keydown', controls.onKeyDown.bind(controls));
    window.addEventListener('keyup', controls.onKeyUp.bind(controls));

    return controls;
}
