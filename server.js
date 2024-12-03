const express = require("express");
const { v4: uuidV4 } = require("uuid");
const http = require("http");
const { Server } = require("socket.io");
const { ExpressPeerServer } = require("peer");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Set EJS as the template engine
app.set("view engine", "ejs");

// Serve static files from the "public" directory
app.use(express.static("public"));

// Redirect to a new room with a unique ID
app.get("/", (req, res) => {
  res.redirect(`/${uuidV4()}`);
});

// Render the room page
app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

// Set up PeerJS server
const peerServer = ExpressPeerServer(server, {
  debug: true,
  path: "/peerjs",
});
app.use("/peerjs", peerServer);

// Handle Socket.IO connections
io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.broadcast.to(roomId).emit("user-connected", userId);

    // Handle user disconnect
    socket.on("disconnect", () => {
      socket.broadcast.to(roomId).emit("user-disconnected", userId);
    });
  });
});

// Use the PORT environment variable or default to 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
