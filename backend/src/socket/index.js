let io;

const onlineUsers = new Map();

const initSocket = (server) => {
  const { Server } = require("socket.io");

  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("add_user", (userId) => {
      if (!userId) return;

      onlineUsers.set(userId.toString(), socket.id);
      console.log("User online:", userId);
    });

    socket.on("disconnect", () => {
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          console.log("User offline:", userId);
          break;
        }
      }
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

const getReceiverSocketId = (receiverId) => {
  return onlineUsers.get(receiverId?.toString());
};

module.exports = {
  initSocket,
  getIO,
  getReceiverSocketId,
};
