import { renderModelInModal } from './sceneSetup.js';

export function showModal(userData) {
    const modal = document.getElementById('infoModal');
    const modalCanvas = document.getElementById('modalCanvas');
    const view3DCheckbox = document.getElementById('view3DCheckbox');

    // Check if all elements are present
    if (!modal || !modalCanvas || !view3DCheckbox) {
        console.error("Required elements not found in the DOM.");
        return;
    }

    if (userData && userData.type === "hangar") {
        // Display the modal
        modal.style.display = 'block';

        // Close modal when clicking on the close button
        const closeButton = document.querySelector('.model-modal .modal-close');
        closeButton.onclick = () => {
            modal.style.display = 'none';
            // Clean up modal canvas
            const context = modalCanvas.getContext('webgl') || modalCanvas.getContext('experimental-webgl');
            if (context) {
                const ext = context.getExtension('WEBGL_lose_context');
                if (ext) ext.loseContext();
            }
        };

        // Close modal when clicking outside of the modal content
        window.onclick = function (event) {
            if (event.target === modal) {
                modal.style.display = 'none';
                // Clean up modal canvas
                const context = modalCanvas.getContext('webgl') || modalCanvas.getContext('experimental-webgl');
                if (context) {
                    const ext = context.getExtension('WEBGL_lose_context');
                    if (ext) ext.loseContext();
                }
            }
        };

        // Log checkbox state
        console.log("Checkbox checked state:", view3DCheckbox.checked);

        // Check if the checkbox is checked
        if (view3DCheckbox.checked) {
            // List of goods to be added with fixed positions
            const goods = [
                'goods12_tape.glb', 'goods12.glb', 
                'goods17.glb', 'goods19.glb', 'goods21_tape_b.glb',
                'goods21_tape.glb', 'goods21.glb', 'goods29.glb', 'palette.glb',
            ];

            const goodsWithPositions = goods.map((good, index) => {
                const row = Math.floor(index / 9);
                const col = index % 9;
                return {
                    path: `assets/models/goods/${good}`,
                    position: new THREE.Vector3(col * 2, 0, row * 2)
                };
            });

            // Render the warehouse model with the goods inside the modal's canvas
            console.log('Rendering model in modal...');
            renderModelInModal('assets/models/warehouse_scene.glb', goodsWithPositions, modalCanvas);
        } else {
            // Show a black screen
            modalCanvas.style.backgroundColor = 'black';
        }
    }
}
