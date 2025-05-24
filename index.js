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

// Realtime Database ref
const db = firebase.database();
const startFlagRef = db.ref('startSlideshow');

let currentImageIndex = 0;
let imageLoopInterval = null;
let startGeoguessr = false;

const images = [
    "Geoguessr1.jpg",
    "Geoguessr2.jpg",
    "Geoguessr3.jpg",
    "Geoguessr4.jpg",
    "Geoguessr5.jpg",
];

function startImageLoop() {
    const geoguessrDiv = document.getElementById("geoguessr");
    const infoDiv = document.getElementById("information");
    const messageDiv = document.getElementById("message");
    const imageEl = document.getElementById("image");

    geoguessrDiv.style.display = "flex";
    infoDiv.style.display = "none";
    messageDiv.style.display = "none";

    imageEl.src = images[currentImageIndex];

    if (imageLoopInterval === null) {
        imageLoopInterval = setInterval(() => {
            currentImageIndex++;
            if (currentImageIndex >= images.length) {
                currentImageIndex = 0;
            }
            imageEl.src = images[currentImageIndex];
        }, 43200000); // 12 hours
    }
}

function geoguessr() {
    if (startGeoguessr) {
        startImageLoop();
    } else {
        document.getElementById("information").style.display = "flex";
    }
}

// Listen for changes in 'startSlideshow' in Firebase DB
startFlagRef.on('value', (snapshot) => {
  const start = snapshot.val();
  if (start === true) {
    startGeoguessr = true;
    startImageLoop();
  } else {
    startGeoguessr = false;
    document.getElementById("information").style.display = "flex";
    clearInterval(imageLoopInterval);
    imageLoopInterval = null;
  }
});

// 🕒 Real-time start based on Firebase timestamp
const startTimeRef = db.ref('startTime');

startTimeRef.on('value', (snapshot) => {
  const scheduledTime = snapshot.val();

  if (scheduledTime && Date.now() >= scheduledTime) {
    startGeoguessr = true;
    geoguessr();
  } else {
    const checkTimer = setInterval(() => {
      if (Date.now() >= scheduledTime) {
        startGeoguessr = true;
        geoguessr();
        clearInterval(checkTimer);
      }
    }, 1000);
  }
});

function home() {
    document.getElementById("geoguessr").style.display = "none";
    document.getElementById("message").style.display = "flex";
    document.getElementById("information").style.display = "none";
}
