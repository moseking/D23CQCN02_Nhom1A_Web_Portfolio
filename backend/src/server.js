require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  },
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("add_user", (userId) => {
    onlineUsers.set(userId, socket.id);

    console.log("Online users:", onlineUsers);
  });

  socket.on("disconnect", () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }

    console.log("User disconnected:", socket.id);
  });
});

app.set("io", io);
app.set("onlineUsers", onlineUsers);

const uploadRoutes = require("./routes/uploadRoutes");
app.use("/api/upload", uploadRoutes);

const notificationRoutes = require("./routes/notificationRoutes");
app.use("/api/notifications", notificationRoutes);

/* const searchRoutes = require("./routes/searchRoutes");
app.use("/api/search", searchRoutes); */

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  });
