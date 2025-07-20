const video = document.getElementById('camera');
const snapBtn = document.getElementById('snap');
const previewStrip = document.getElementById('preview-strip');
const downloadBtn = document.getElementById('download');
let photos = [];
let selectedLayout = 'vertical';

// Start webcam
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => video.srcObject = stream);

// Take photo
snapBtn.addEventListener('click', () => {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);
  const imgURL = canvas.toDataURL();
  
  const img = new Image();
  img.src = imgURL;
  img.classList.add('photo-preview');
  previewStrip.appendChild(img);
  
  photos.push(imgURL);
});

// Change layout
document.querySelectorAll('.layout-options button').forEach(btn => {
  btn.addEventListener('click', () => {
    selectedLayout = btn.dataset.layout;
  });
});

// Download photo strip
downloadBtn.addEventListener('click', () => {
  const stripCanvas = document.createElement('canvas');
  let width = 300;
  let height = 900;
  const photoWidth = 300;
  const photoHeight = 225;

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
        const link = document.createElement('a');
        link.download = 'photo-strip.png';
        link.href = stripCanvas.toDataURL();
        link.click();
      }
    };
  });
});
