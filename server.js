const express = require("express");
const { v4: uuidV4 } = require("uuid");
const http = require("http");
const socketIo = require("socket.io");
const PeerServer = require("peer").PeerServer;

const app = express();
const server = http.Server(app);
const io = socketIo(server);

// Create PeerJS server
const peerServer = PeerServer({
  port: process.env.PORT || 3001, // Use Render's assigned port for production
  path: "/peerjs",
  cors: {
    origin: "*", // Allow all origins or specify your Render domain
    methods: ["GET", "POST"],
  },
});

peerServer.on("listening", () => {
  console.log("PeerJS server is running on port 3001");
});

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.redirect(`/${uuidV4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.broadcast.to(roomId).emit("user-connected", userId);

    socket.on("disconnect", () => {
      socket.broadcast.to(roomId).emit("user-disconnected", userId);
    });
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log("Server running on port " + (process.env.PORT || 3000));
});
