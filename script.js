const video = document.getElementById('camera');
const snapBtn = document.getElementById('snap');
const previewStrip = document.getElementById('preview-strip');
const downloadBtn = document.getElementById('download');
const shutterSound = document.getElementById('shutter');
const countdownEl = document.getElementById('countdown');
const filterSelect = document.getElementById('filter-select');
const cameraSelect = document.getElementById('camera-select');
const introScreen = document.getElementById('intro-screen');
const startButton = document.getElementById('start-button');

let photos = [];
let selectedLayout = 'vertical';
let currentStream = null;
let selectedFilter = 'none';

// Start camera with optional deviceId
function startCamera(deviceId = null) {
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
  }

  const constraints = {
    video: deviceId ? { deviceId: { exact: deviceId } } : true
  };

  navigator.mediaDevices.getUserMedia(constraints)
    .then(stream => {
      video.srcObject = stream;
      currentStream = stream;
    });
}

// Populate camera dropdown
navigator.mediaDevices.enumerateDevices().then(devices => {
  devices.forEach(device => {
    if (device.kind === 'videoinput') {
      const option = document.createElement('option');
      option.value = device.deviceId;
      option.textContent = device.label || `Camera ${cameraSelect.length + 1}`;
      cameraSelect.appendChild(option);
    }
  });
});

cameraSelect.addEventListener('change', () => {
  startCamera(cameraSelect.value);
});

// Filter change
filterSelect.addEventListener('change', () => {
  selectedFilter = filterSelect.value;
  video.style.filter = selectedFilter;
});

// Mirror video
video.style.transform = 'scaleX(-1)';

// Start camera initially
startCamera();

// Snap photo with countdown
snapBtn.addEventListener('click', () => {
  let count = 3;
  countdownEl.textContent = count;

  const interval = setInterval(() => {
    count--;
    if (count === 0) {
      countdownEl.textContent = '';
      clearInterval(interval);

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');

      ctx.filter = selectedFilter;
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0);
      shutterSound.play();

      const imgURL = canvas.toDataURL();
      const img = new Image();
      img.src = imgURL;
      img.classList.add('photo-preview');

      // Click to remove image
      img.addEventListener('click', () => {
        previewStrip.removeChild(img);
        photos = photos.filter(p => p !== imgURL);
      });

      previewStrip.appendChild(img);
      photos.push(imgURL);
    } else {
      countdownEl.textContent = count;
    }
  }, 1000);
});

// Layout selection
document.querySelectorAll('.layout-options button').forEach(btn => {
  btn.addEventListener('click', () => {
    selectedLayout = btn.dataset.layout;
  });
});

// Download photo strip and save to localStorage for customization page
downloadBtn.addEventListener('click', () => {
  const stripCanvas = document.createElement('canvas');
  const photoWidth = 300;
  const photoHeight = 225;

  let width = 300, height = 900;
  if (selectedLayout === 'grid') {
    width = photoWidth * 2;
    height = photoHeight * 2;
  } else if (selectedLayout === 'horizontal') {
    width = photoWidth * photos.length;
    height = photoHeight;
  } else {
    width = photoWidth;
    height = photoHeight * photos.length;
  }

  stripCanvas.width = width;
  stripCanvas.height = height;
  const ctx = stripCanvas.getContext('2d');

  photos.forEach((photo, i) => {
    const img = new Image();
    img.src = photo;
    img.onload = () => {
      let x = 0, y = 0;
      if (selectedLayout === 'grid') {
        x = (i % 2) * photoWidth;
        y = Math.floor(i / 2) * photoHeight;
      } else if (selectedLayout === 'horizontal') {
        x = i * photoWidth;
      } else {
        y = i * photoHeight;
      }

      ctx.drawImage(img, x, y, photoWidth, photoHeight);

      if (i === photos.length - 1) {
        // Save combined photo strip to localStorage for customization page
        localStorage.setItem('photoStripData', stripCanvas.toDataURL());

        const link = document.createElement('a');
        link.download = 'photo-strip.png';
        link.href = stripCanvas.toDataURL();
        link.click();

        previewStrip.innerHTML = '';
        photos = [];
        selectedLayout = 'vertical';
        document.querySelector('.layout-options button[data-layout="vertical"]').click();
      }
    };
  });
});

// Intro screen start button fades out intro and reveals photobooth
startButton.addEventListener('click', () => {
  introScreen.style.opacity = '0';
  setTimeout(() => {
    introScreen.style.display = 'none';
  }, 500);
});
