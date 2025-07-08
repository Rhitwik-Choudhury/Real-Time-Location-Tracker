const socket = io(); //initializing of socketio, due to this a connection request will be send
//  in the backend, after calling function io a connection requestion is send by socketio which will come in app.js
let mySocketId;
let isFollowing = true;
let userLatLng = null;
const markers = {};

// Save your socket ID when connected
socket.on("connect", () => {
    mySocketId = socket.id;
});

// Start watching your location
if (navigator.geolocation) { // it's already installed in our window object,inbuilt, here we're checking if geolocation is available
    navigator.geolocation.watchPosition(
        (position) => { //we're saying whenever there's a movement watch it
            const { latitude, longitude, accuracy } = position.coords; //taking the coordinates from the position whenever thers a movement
            const isLaptop = window.innerWidth > 768;
            if (accuracy <= 100 || isLaptop) { //saying if the accuracy is more or the device is a laptop then give location
                socket.emit("send-location", { latitude, longitude }); //sending the lat & long from frontend to backend
            } else {
                console.warn("⚠️ Ignored low-accuracy location:", accuracy + "m");
            }
        },
        (error) => {
            console.error("❌ Geolocation error:", error);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000, //ms, to check again after
            maximumAge: 0 //caching is off
        }
    );
}

const map = L.map("map").setView([0, 0], 15);

// L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//     attribution: "Rhitwik's Map"
// }).addTo(map)

// google map
// L.tileLayer("https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}", { //gives the map image
//     attribution: '&copy; <a href="https://maps.google.com">Google Maps</a>'
// }).addTo(map);

L.tileLayer('https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=vOHwAgl6H6tKRwUiPoZb', {
    tileSize: 512,
    zoomOffset: -1,
    attribution: 'Rhitwik &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
}).addTo(map);

// Stop following when user moves the map manually
map.on("dragstart", () => {
    isFollowing = false;
});

// Update or create marker for each user
socket.on("receive-location", (data) => { //receiving the location from backend
    const { id, latitude, longitude } = data;

    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]); //updating the marker if already present
    } else {
        markers[id] = L.marker([latitude, longitude]).addTo(map); //adding the marker if not present
    }

    if (id === mySocketId) {
        userLatLng = [latitude, longitude];
        if (isFollowing) {
            map.setView(userLatLng, 15);
        }
    }
});

// Remove marker when a user disconnects
socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]); //saying to remove the marker when we get user-disconnected
        delete markers[id];
    }
});

// Add a button to re-center the map to your location
const followButton = document.createElement("button");
followButton.innerHTML = `<img src="/images/location.png" alt="Center" style="width: 32px; height: 32px;" />`;
followButton.style.position = "absolute";
followButton.style.top = "10px";
followButton.style.right = "10px";
followButton.style.zIndex = 1000;
followButton.style.padding = "8px";
followButton.style.background = "#fff";
followButton.style.border = "1px solid #aaa";
followButton.style.borderRadius = "5px";
followButton.style.cursor = "pointer";

followButton.onclick = () => {
    isFollowing = true;
    if (userLatLng) map.setView(userLatLng, 15);
};

document.body.appendChild(followButton);
