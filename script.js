// Access HTML elements
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const startRecordBtn = document.getElementById('start-record-btn');
const stopRecordBtn = document.getElementById('stop-record-btn');
const capturePhotoBtn = document.getElementById('capture-photo-btn');
const toggleCameraBtn = document.getElementById('toggle-camera');
const playback = document.getElementById('playback');
const shutterSound = document.getElementById('shutter-sound');
const introSound = document.getElementById('intro-sound');
const intro = document.getElementById('intro');
const cameraSection = document.getElementById('camera-section');
const controlsSection = document.getElementById('controls-section');
const zoomSlider = document.getElementById('zoom-slider');
const zoomLabel = document.getElementById('zoom-label');

let isUsingFrontCamera = true;
let stream;
let mediaRecorder;
let recordedChunks = [];
let track; // To access the video track for zoom

// Play intro sound and show intro text for 10 seconds
introSound.play(); // Start intro sound
setTimeout(() => {
    intro.style.display = 'none'; // Hide intro
    cameraSection.style.display = 'block'; // Show camera section
    controlsSection.style.display = 'block'; // Show controls
    startCamera(); // Start the camera
}, 10000); // 10 seconds

// Function to start camera stream (with audio enabled)
function startCamera() {
    const constraints = {
        video: { facingMode: isUsingFrontCamera ? 'user' : 'environment' },
        audio: true // Enable audio for recording, but it will be muted in the video feed
    };
    navigator.mediaDevices.getUserMedia(constraints)
        .then((mediaStream) => {
            stream = mediaStream;
            video.srcObject = stream;
            track = stream.getVideoTracks()[0]; // Get the video track
            checkZoomCapability(); // Check if zoom is supported
            video.muted = true;  // Mute the video to prevent surround sound playback
        })
        .catch((err) => {
            console.error("Error accessing camera: ", err);
        });
}

// Check if zoom is supported by the camera
function checkZoomCapability() {
    const capabilities = track.getCapabilities();
    if (capabilities.zoom) {
        zoomSlider.min = capabilities.zoom.min;
        zoomSlider.max = capabilities.zoom.max;
        zoomSlider.value = capabilities.zoom.min;
        zoomSlider.style.display = 'block'; // Show zoom slider
        zoomLabel.style.display = 'block';  // Show zoom label

        // Apply zoom when slider value changes
        zoomSlider.addEventListener('input', () => {
            track.applyConstraints({
                advanced: [{ zoom: zoomSlider.value }]
            });
        });
    } else {
        console.log("Zoom is not supported on this device.");
    }
}

// Capture photo functionality
capturePhotoBtn.addEventListener('click', () => {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Play shutter sound
    shutterSound.play();

    // Open the captured photo in a new tab
    const dataUrl = canvas.toDataURL('image/png');
    const newWindow = window.open('about:blank', 'Captured Photo');
    newWindow.document.write(`<img src="${dataUrl}" alt="Captured Photo">`);
});

// Toggle between front and back cameras
toggleCameraBtn.addEventListener('click', () => {
    isUsingFrontCamera = !isUsingFrontCamera;
    stopCamera(); // Stop the current stream before switching
    startCamera(); // Start with the new camera

    // Mirror the video feed for the front camera (selfie mode)
    if (isUsingFrontCamera) {
        video.style.transform = 'scaleX(-1)'; // Mirror the image for front camera
    } else {
        video.style.transform = 'scaleX(1)';  // Reset for back camera
    }
});

// Function to stop the camera stream
function stopCamera() {
    if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
    }
}

// Start recording video
startRecordBtn.addEventListener('click', () => {
    mediaRecorder = new MediaRecorder(stream);
    recordedChunks = [];

    mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
            recordedChunks.push(event.data);
        }
    };

    mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, {
            type: 'video/webm'
        });
        const videoURL = URL.createObjectURL(blob);

        // Open the recorded video in a new page
        const newWindow = window.open('about:blank', 'Recorded Video');
        newWindow.document.write(`
            <video controls autoplay>
                <source src="${videoURL}" type="video/webm">
                Your browser does not support the video tag.
            </video>
            <a href="${videoURL}" download="recorded_video.webm">Download Video</a>
        `);
    };

    mediaRecorder.start();
    startRecordBtn.style.display = 'none';
    stopRecordBtn.style.display = 'inline';
});

// Stop recording video
stopRecordBtn.addEventListener('click', () => {
    mediaRecorder.stop();
    stopRecordBtn.style.display = 'none';
    startRecordBtn.style.display = 'inline';
});
