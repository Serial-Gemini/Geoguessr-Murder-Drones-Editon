// Firebase config
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

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Firebase DB references
const db = firebase.database();
const startFlagRef = db.ref('startSlideshow');
const startTimeRef = db.ref('startTime');

let currentImageIndex = 0;
let timerInterval = null;
let startGeoguessr = false;

const images = [
  "Geoguessr1.jpg",
  "Geoguessr2.jpg",
  "Geoguessr3.jpg",
  "Geoguessr4.jpg",
  "Geoguessr5.jpg"
];

// Interval for 24 hours in milliseconds
const intervalMs = 24 * 60 * 60 * 1000; // 24 hours

// Base time: Jan 1, 2024, 2 PM Manila time (UTC+8)
const baseTime = new Date("2024-01-01T14:00:00+08:00").getTime();

// Calculate current image index based on 24-hour cycle from base time at 2 PM Manila
function getImageIndexByTime() {
  const now = Date.now();
  const diff = now - baseTime;
  // If diff negative (before base time), show first image (index 0)
  if (diff < 0) return 0;
  return Math.floor(diff / intervalMs) % images.length;
}

// Start Geoguessr mode: show the current image based on time
function startImageLoop() {
  const geoguessrDiv = document.getElementById("geoguessr");
  const infoDiv = document.getElementById("information");
  const messageDiv = document.getElementById("message");
  const imageEl = document.getElementById("image");

  geoguessrDiv.style.display = "flex";
  infoDiv.style.display = "none";
  messageDiv.style.display = "none";

  currentImageIndex = getImageIndexByTime();
  imageEl.src = images[currentImageIndex];
  document.getElementById("number").textContent = currentImageIndex + 1;
}

// Show Geoguessr or info depending on Firebase flag
function geoguessr() {
  if (startGeoguessr) {
    startImageLoop();
  } else {
    document.getElementById("information").style.display = "flex";
  }
}

// Manual override to any image by index
function setImage(index) {
  const imageEl = document.getElementById("image");
  if (index >= 0 && index < images.length) {
    currentImageIndex = index;
    imageEl.src = images[currentImageIndex];
    document.getElementById("number").textContent = index + 1;
  }
}

// Next image cyclically, for override button
function nextImage() {
  setImage((currentImageIndex + 1) % images.length);
}

window.setImage = setImage;
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

// Countdown timer logic for next scheduled start time from Firebase
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
      geoguessr();
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

// Home function to hide Geoguessr and show message
function home() {
  document.getElementById("geoguessr").style.display = "none";
  document.getElementById("message").style.display = "flex";
  document.getElementById("information").style.display = "none";
}
