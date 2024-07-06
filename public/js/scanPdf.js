document.addEventListener('DOMContentLoaded', function () {
    console.log('DOMContentLoaded event fired.');

    const scanPdfBtn = document.getElementById('scanPdfBtn');
    const scanPdfModal = document.getElementById('scanPdfModal');
    const scanPdfClose = scanPdfModal.querySelector('.modal-close');
    const startScanButton = document.getElementById('startScanButton');

    scanPdfBtn.addEventListener('click', function () {
        scanPdfModal.style.display = 'block';
    });

    scanPdfClose.addEventListener('click', function () {
        scanPdfModal.style.display = 'none';
    });

    window.addEventListener('click', function (event) {
        if (event.target === scanPdfModal) {
            scanPdfModal.style.display = 'none';
        }
    });

    const input = document.getElementById('image-input');
    const canvas = document.getElementById('image-canvas');
    const ctx = canvas.getContext('2d');
    const fieldValueDisplay = document.getElementById('fiscal-number');
    const fieldNameInput = document.getElementById('fieldNameInput');
    let uploadedImage = null;

    input.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            uploadedImage = new Image();
            uploadedImage.src = URL.createObjectURL(this.files[0]);
        }
    });

    startScanButton.addEventListener('click', function() {
        if (uploadedImage) {
            uploadedImage.onload = function() {
                scanPdfModal.style.display = 'none';
                canvas.width = uploadedImage.width;
                canvas.height = uploadedImage.height;
                ctx.drawImage(uploadedImage, 0, 0);
                performOCR(canvas);
            };
            uploadedImage.onload();  // Ensure the onload function is called if the image is already loaded
        } else {
            alert('Please upload an image first.');
        }
    });

    function performOCR(canvas) {
        Tesseract.recognize(
            canvas,
            'eng',
            {
                // logger: m => console.log(m)
            }
        ).then(({ data: { text } }) => {
            console.log("OCR Text:", text);
            extractFieldValue(text);
        });
    }

    function extractFieldValue(text) {
        let fieldNameOrigin = fieldNameInput.value;
        const fieldName = fieldNameInput.value.toLowerCase();
        const lines = text.split('\n');
        const fieldLine = lines.find(line => line.toLowerCase().includes(fieldName));
        if (fieldLine) {
            const parts = fieldLine.split(':');
            if (parts.length > 1) {
                let fieldValue = parts[1].trim();
                fieldValueDisplay.textContent = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}: ${fieldValue}`;
                document.dispatchEvent(new CustomEvent('fieldValueExtracted', { detail: { fieldNameOrigin, fieldValue } }));
            }
        } else {
            fieldValueDisplay.textContent = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}: Not Found`;
        }
    }

    // Add the coordinatesUpdated event listener outside of the function
    document.addEventListener('coordinatesUpdated', function (event) {
        console.log('coordinatesUpdated event fired.');
        const { type, coordinates } = event.detail;
        // console.log(`Event received: ${type.charAt(0).toUpperCase() + type.slice(1)} Position: ${coordinates.x}, ${coordinates.y}, ${coordinates.z}`);
        
        // Update the UI with coordinates
        const coordinatesDisplay = document.getElementById('coordinates-display');
        if (coordinatesDisplay) {
            // coordinatesDisplay.textContent = `Type: ${type.charAt(0).toUpperCase() + type.slice(1)}, Position: X=${coordinates.x.toFixed(2)}, Y=${coordinates.y.toFixed(2)}, Z=${coordinates.z.toFixed(2)}`;
        } else {
            console.warn('Coordinates display element not found.');
        }
    });

    console.log('coordinatesUpdated event listener added.');
});
