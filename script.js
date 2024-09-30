// Access HTML elements
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const startRecordBtn = document.getElementById('start-record-btn');
const stopRecordBtn = document.getElementById('stop-record-btn');
const saveVideoBtn = document.getElementById('save-video-btn');
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
introSound.play();
setTimeout(() => {
    intro.style.display = 'none'; // Hide intro
    cameraSection.style.display = 'block'; // Show camera section
    controlsSection.style.display = 'block'; // Show controls
    startCamera(); // Start the camera
}, 10000); // 10 seconds

// Function to start camera stream
function startCamera() {
    const constraints = {
        video: { facingMode: isUsingFrontCamera ? 'user' : 'environment' }
    };
    navigator.mediaDevices.getUserMedia(constraints)
        .then((mediaStream) => {
            stream = mediaStream;
            video.srcObject = stream;
            track = stream.getVideoTracks()[0]; // Get the video track
            checkZoomCapability(); // Check if zoom is supported
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

// Toggle between front and back cameras
toggleCameraBtn.addEventListener('click', () => {
    isUsingFrontCamera = !isUsingFrontCamera;
    stopCamera(); // Stop the current stream before switching
    startCamera(); // Start with the new camera
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
        playback.src = videoURL;
        playback.style.display = 'block';
        saveVideoBtn.style.display = 'block';
        saveVideo(blob); // Save the video locally
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

// Save the recorded video
function saveVideo(blob) {
    saveVideoBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'recorded_video.webm';
        link.click(); // Trigger the download
    });
}
