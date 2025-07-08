const express = require('express');
const app = express();
const path = require("path");

const http = require("http"); //socket io runs on http, so we need to create the server

const socketio = require("socket.io"); //setting up socketio in a variable called socketio
const  server = http.createServer(app);
const io = socketio(server); //socketio is basically a function, server is running on socketio, these 3 lines are for socketio setup

app.set("view engine", "ejs"); //setting up ejs
app.use(express.static(path.join(__dirname, "public"))); //setting up public folder, so that we can use images,css and vanilla Js can be used

io.on("connection", function (socket) { // will get a unique socket key value here for every user
    socket.on("send-location", function (data){ //receiving the location in bakend by socket
        io.emit("receive-location", { id: socket.id, ...data }); //again giving back the location to evryone in frontend through io.emit, io.emit gives the location to everyone connected
    });
    console.log("connected");

    socket.on("disconnect", function() { //creating a disconnect function when the user disconnects
        io.emit("user-disconnected", socket.id); //giving in the frontend user-disconnected with the id of user
    });
});

app.get("/", function(req,res) { //the route
    res.render("index"); //opening of index page
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});