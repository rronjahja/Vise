import { renderer, scene, camera } from './setup';

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();