// Access HTML elements
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureBtn = document.getElementById('capture-btn');
const saveBtn = document.getElementById('save-btn');
const toggleCameraBtn = document.getElementById('toggle-camera');
const shutterSound = document.getElementById('shutter-sound');
const introSound = document.getElementById('intro-sound');
const intro = document.getElementById('intro');
const cameraSection = document.getElementById('camera-section');
const controlsSection = document.getElementById('controls-section');

let isUsingFrontCamera = true;
let stream;

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
        })
        .catch((err) => {
            console.error("Error accessing camera: ", err);
        });
}

// Capture the image from the video stream
captureBtn.addEventListener('click', () => {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    saveBtn.style.display = 'inline'; // Show the save button

    // Play the shutter sound when photo is captured
    shutterSound.play();
});

// Save the image to the user's local disk
saveBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/jpeg');
    link.download = 'captured_image_by_huska.jpg';
    link.click(); // Trigger the download
});

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
