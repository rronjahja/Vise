export function animate(renderer, scene, camera) {
    function render() {
        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }
    render();
}