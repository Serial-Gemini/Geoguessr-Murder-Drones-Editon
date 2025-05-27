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
const imageIndexRef = db.ref('imageIndex');

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

// Show the image from Firebase index
function showImageByIndex(index) {
  const geoguessrDiv = document.getElementById("geoguessr");
  const infoDiv = document.getElementById("information");
  const messageDiv = document.getElementById("message");
  const imageEl = document.getElementById("image");

  currentImageIndex = index;

  geoguessrDiv.style.display = "flex";
  infoDiv.style.display = "none";
  messageDiv.style.display = "none";

  imageEl.src = images[currentImageIndex];
  document.getElementById("number").textContent = currentImageIndex + 1;
}

// Listen to image index changes
imageIndexRef.on('value', (snapshot) => {
  const index = snapshot.val();
  if (typeof index === "number" && index >= 0 && index < images.length) {
    if (startGeoguessr) {
      showImageByIndex(index);
    }
  }
});

// Start Geoguessr view
function geoguessr() {
  if (startGeoguessr) {
    showImageByIndex(currentImageIndex); // fallback
  } else {
    document.getElementById("information").style.display = "flex";
  }
}

// Manual override (e.g. from a button)
function setImage(index) {
  if (index >= 0 && index < images.length) {
    imageIndexRef.set(index); // this updates for all users
  }
}

// Listen to Firebase start flag
startFlagRef.on('value', (snapshot) => {
  const start = snapshot.val();
  if (start === true) {
    startGeoguessr = true;
  } else {
    startGeoguessr = false;
    document.getElementById("information").style.display = "flex";
    document.getElementById("geoguessr").style.display = "none";
    document.getElementById("message").style.display = "none";
  }
});

// Countdown from Firebase time
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

// Home page view
function home() {
  document.getElementById("geoguessr").style.display = "none";
  document.getElementById("message").style.display = "flex";
  document.getElementById("information").style.display = "none";
}

// Make setImage callable from buttons
window.setImage = setImage;
