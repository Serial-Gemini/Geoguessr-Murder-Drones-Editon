// Firebase config (same)
const firebaseConfig = {
  apiKey: "AIzaSyBa3LAxLXG6RjZ8-QoL0Sgqt38znDPqpso",
  authDomain: "geoguessr---murder-drones.firebaseapp.com",
  databaseURL: "https://geoguessr---murder-drones-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "geoguessr---murder-drones",
  storageBucket: "geoguessr---murder-drones.appspot.com",
  messagingSenderId: "418456738978",
  appId: "1:418456738978:web:11a37307a0156994190bfb",
  measurementId: "G-R0ZPP9LS5V"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.database();
const startFlagRef = db.ref('startSlideshow');
const startTimeRef = db.ref('startTime');

const images = [
  "Geoguessr1.jpg",
  "Geoguessr2.jpg",
  "Geoguessr3.jpg", // index 2, default image
  "Geoguessr4.jpg",
  "Geoguessr5.jpg"
];

const intervalMs = 24 * 60 * 60 * 1000; // 24 hours
const baseTime = new Date("2024-01-01T14:00:00+08:00").getTime();

let currentImageIndex = 2; // start at image 3 by default
let timerInterval = null;
let startGeoguessr = false;
let overrideEnabled = false; // disable override button initially

// Get current image index based on 24h cycle from base time
function getImageIndexByTime() {
  const now = Date.now();
  const diff = now - baseTime;
  if (diff < 0) return 2; // before baseTime, show 3rd image (index 2)
  const indexFromCycle = Math.floor(diff / intervalMs) % images.length;
  return indexFromCycle >= 2 ? indexFromCycle : 2; // never go below index 2 after baseTime
}

// Show image and update UI
function showImage(index) {
  const imageEl = document.getElementById("image");
  imageEl.src = images[index];
  document.getElementById("number").textContent = index + 1;
  currentImageIndex = index;
}

// Start slideshow mode: decide which image to show
function startImageLoop() {
  const geoguessrDiv = document.getElementById("geoguessr");
  const infoDiv = document.getElementById("information");
  const messageDiv = document.getElementById("message");
  geoguessrDiv.style.display = "flex";
  infoDiv.style.display = "none";
  messageDiv.style.display = "none";

  const index = getImageIndexByTime();
  showImage(index);

  // Enable override button only if index is 3 or higher (meaning 24h passed)
  overrideEnabled = index >= 3;
  updateOverrideButtonState();
}

// Disable or enable the override button visually and functionally
function updateOverrideButtonState() {
  const btn = document.querySelector(".manualOverride");
  if (overrideEnabled) {
    btn.style.pointerEvents = "auto";
    btn.style.opacity = "1";
  } else {
    btn.style.pointerEvents = "none";
    btn.style.opacity = "0.5";
  }
}

// Override button handler
function nextImage() {
  if (!overrideEnabled) return; // do nothing if override disabled

  // move to next image cyclically
  let nextIndex = (currentImageIndex + 1) % images.length;
  showImage(nextIndex);
}

window.nextImage = nextImage;

// Firebase startSlideshow flag listener
startFlagRef.on('value', (snapshot) => {
  const start = snapshot.val();
  if (start === true) {
    startGeoguessr = true;
    startImageLoop();
  } else {
    startGeoguessr = false;
    document.getElementById("information").style.display = "flex";
    document.getElementById("geoguessr").style.display = "none";
    document.getElementById("message").style.display = "none";
  }
});

// Countdown timer for scheduled start time
const countdownEl = document.getElementById('countdown');

startTimeRef.on('value', (snapshot) => {
  const scheduledTime = snapshot.val();
  if (!scheduledTime) return;

  if (timerInterval) clearInterval(timerInterval);

  const updateCountdown = () => {
    const now = Date.now();
    const diff = scheduledTime - now;

    if (diff <= 0) {
      startFlagRef.set(true);
      startGeoguessr = true;
      startImageLoop();
      countdownEl.textContent = "Starting...";
      clearInterval(timerInterval);
      return;
    }

    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    countdownEl.textContent = `Starts in ${hours}h ${minutes}m ${seconds}s`;
  };

  updateCountdown();
  timerInterval = setInterval(updateCountdown, 1000);
});

// Show info screen on Home link click
function home() {
  document.getElementById("geoguessr").style.display = "none";
  document.getElementById("message").style.display = "flex";
  document.getElementById("information").style.display = "none";
}

window.home = home;
