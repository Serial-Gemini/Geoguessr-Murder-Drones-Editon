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

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const startFlagRef = db.ref('startSlideshow');
const startTimeRef = db.ref('startTime');

const images = [
  "Geoguessr1.jpg",
  "Geoguessr2.jpg",
  "Geoguessr3.jpg",
  "Geoguessr4.jpg",
  "Geoguessr5.jpg"
];

let currentImageIndex = 0;
let timerInterval = null;
let startGeoguessr = false;
let manualOverrideAllowed = false;

const imageEl = document.getElementById("image");
const countdownEl = document.getElementById("countdown");
const numberEl = document.getElementById("number");

// Set a base time to align image changes every 24 hours
const baseTime = new Date("2025-05-28T14:00:00+08:00").getTime(); // 3rd image baseline

function getImageIndexByTime(serverTime) {
  const diff = serverTime - baseTime;
  return Math.floor(diff / 86400000) % images.length; // 24-hour intervals
}

function setImage(index) {
  if (index >= 0 && index < images.length) {
    currentImageIndex = index;
    imageEl.src = images[currentImageIndex];
    numberEl.textContent = currentImageIndex + 1;
  }
}

function startImageLoop(serverTime) {
  const geoguessrDiv = document.getElementById("geoguessr");
  const infoDiv = document.getElementById("information");
  const messageDiv = document.getElementById("message");

  geoguessrDiv.style.display = "flex";
  infoDiv.style.display = "none";
  messageDiv.style.display = "none";

  const index = getImageIndexByTime(serverTime);
  setImage(index);
}

function geoguessr(serverTime) {
  if (startGeoguessr) {
    startImageLoop(serverTime);
  } else {
    document.getElementById("information").style.display = "flex";
  }
}

function nextImage() {
  if (manualOverrideAllowed) {
    setImage((currentImageIndex + 1) % images.length);
  }
}

window.nextImage = nextImage;

// Get accurate server time offset
firebase.database().ref("/.info/serverTimeOffset").on("value", function (snapshot) {
  const offset = snapshot.val();
  const estimatedServerTimeMs = Date.now() + offset;

  // Check slideshow state
  startFlagRef.on('value', (snapshot) => {
    const start = snapshot.val();
    if (start === true) {
      startGeoguessr = true;
      startImageLoop(estimatedServerTimeMs);
    } else {
      startGeoguessr = false;
      document.getElementById("information").style.display = "flex";
      document.getElementById("geoguessr").style.display = "none";
      document.getElementById("message").style.display = "none";
    }
  });

  // Countdown to next day
  startTimeRef.on('value', (snapshot) => {
    const scheduledTime = snapshot.val();
    if (!scheduledTime) return;

    if (timerInterval) clearInterval(timerInterval);

    const updateCountdown = () => {
      const now = estimatedServerTimeMs;
      const diff = scheduledTime - now;

      if (diff <= 0) {
        startFlagRef.set(true);
        startGeoguessr = true;
        manualOverrideAllowed = true;
        geoguessr(now);
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
});

function home() {
  document.getElementById("geoguessr").style.display = "none";
  document.getElementById("message").style.display = "flex";
  document.getElementById("information").style.display = "none";
}
