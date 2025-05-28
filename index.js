// Firebase config (your existing config)
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
  "Geoguessr3.jpg", // index 2 = default image
  "Geoguessr4.jpg",
  "Geoguessr5.jpg"
];

// 24-hour interval in milliseconds
const intervalMs = 24 * 60 * 60 * 1000;

// The "base time" for cycling images (example: Jan 1, 2024, 2 PM UTC+8)
const baseTime = new Date("2024-01-01T14:00:00+08:00").getTime();

let currentImageIndex = 2; // Start at 3rd image by default
let timerInterval = null;
let startGeoguessr = false;
let overrideEnabled = false; // Override button disabled initially

// Helper: Show image by index and update UI
function showImage(index) {
  const imageEl = document.getElementById("image");
  imageEl.src = images[index];
  document.getElementById("number").textContent = index + 1;
  currentImageIndex = index;
}

// Helper: Enable or disable the override button based on overrideEnabled flag
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

// Determine which image to show based on time and baseTime
function getImageIndexByTime() {
  const now = Date.now();
  const diff = now - baseTime;

  if (diff < 0) {
    // Before base time, always show the third image (index 2)
    return 2;
  } else {
    // Calculate how many 24h intervals passed since base time
    const intervalsPassed = Math.floor(diff / intervalMs);

    // Start cycling from index 3 onwards after base time + 24h intervals
    // So first interval after baseTime shows index 3, second interval index 4, etc.
    const index = 2 + intervalsPassed; // index >= 2

    // Wrap around if index exceeds images.length - 1
    return index % images.length;
  }
}

// Called when slideshow should start or update image
function startImageLoop() {
  const geoguessrDiv = document.getElementById("geoguessr");
  const infoDiv = document.getElementById("information");
  const messageDiv = document.getElementById("message");

  geoguessrDiv.style.display = "flex";
  infoDiv.style.display = "none";
  messageDiv.style.display = "none";

  const index = getImageIndexByTime();
  showImage(index);

  // Enable override only if image index is 3 or greater (meaning after 24h passed)
  overrideEnabled = index >= 3;
  updateOverrideButtonState();
}

// Override button click handler
function nextImage() {
  if (!overrideEnabled) return; // Do nothing if override disabled

  // Show next image cyclically
  const nextIndex = (currentImageIndex + 1) % images.length;
  showImage(nextIndex);
}

window.nextImage = nextImage;

// Listen to Firebase startSlideshow flag
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

// Countdown timer to scheduled start time from Firebase
const countdownEl = document.getElementById('countdown');

startTimeRef.on('value', (snapshot) => {
  const scheduledTime = snapshot.val();
  if (!scheduledTime) return;

  if (timerInterval) clearInterval(timerInterval);

  const updateCountdown = () => {
    const now = Date.now();
    const diff = scheduledTime - now;

    if (diff <= 0) {
      // Time passed, start slideshow and update override button
      startFlagRef.set(true);
      startGeoguessr = true;
      startImageLoop();

      countdownEl.textContent = "Starting...";
      clearInterval(timerInterval);
      return;
    }

    // Show countdown time remaining
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    countdownEl.textContent = `Starts in ${hours}h ${minutes}m ${seconds}s`;
  };

  updateCountdown();
  timerInterval = setInterval(updateCountdown, 1000);
});

// Home button to show message and hide geoguessr
function home() {
  document.getElementById("geoguessr").style.display = "none";
  document.getElementById("message").style.display = "flex";
  document.getElementById("information").style.display = "none";
}

window.home = home;
