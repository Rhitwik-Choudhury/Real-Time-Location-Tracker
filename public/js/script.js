const socket = io(); //initializing of socketio, due to this a connection request will be send
//  in the backend, after calling function io a connection requestion is send by socketio which will come in app.js

// if(navigator.geolocation){ // it's already installed in our window object,inbuilt, here we're checking if geolocation is available
//     navigator.geolocation.watchPosition(
//         (position) => { //we're saying whenever there's a movement watch it
//         const{latitude, longitude} = position.coords; //taking the coordinates from the position whenever thers a movement
//         console.log(`Phone location: ${latitude}, ${longitude}`);
//         socket.emit("send-location", {latitude, longitude}); //sending the lat & long from frontend to backend
//     },
//     (error) => {
//         console.error(error);
//     },
//     {
//         enableHighAccuracy: true,
//         timeout: 5000, //ms, to check again after
//         maximumAge: 0, //caching is off
//     });
// }

if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude, accuracy } = position.coords;

            const isLaptop = window.innerWidth > 768;
            if (accuracy <= 100 || isLaptop) {
                socket.emit("send-location", { latitude, longitude });
            } else {
                console.warn("⚠️ Ignored low-accuracy location:", accuracy + "m");
            }
        },
        (error) => {
            console.error("❌ Geolocation error:", error);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        }
    );
}


const map = L.map("map").setView([0, 0], 15);

// L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//     attribution: "Rhitwik's Map"
// }).addTo(map)

// google map
// L.tileLayer("https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}", {
//     attribution: '&copy; <a href="https://maps.google.com">Google Maps</a>'
// }).addTo(map);

L.tileLayer('https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=vOHwAgl6H6tKRwUiPoZb', {
    tileSize: 512,
    zoomOffset: -1,
    attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
}).addTo(map);

const markers = {};
socket.on("receive-location", (data)=>{
    const{id, latitude, longitude} = data;
    map.setView([latitude, longitude]);
    if(markers[id]){
        markers[id].setLatLng([latitude, longitude]);
    } else {
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }
});

socket.on("user-disconnected", (id) => {
    if(markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
})