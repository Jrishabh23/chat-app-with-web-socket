const {
    addUser,
    removeUser,
    getUserInRoom,
    getUser,
} = require("./utils/users");
const express = require("express");
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");
const app = express();
const port = 3000;
const server = http.createServer(app);
const io = socketIo(server);

const publicDirPath = path.join(__dirname, "../public");
app.use(express.static(publicDirPath));
/**
 * * Emit event server to client
 * socket.emit : It emit the message to specific client
 * io.emit : It emit message to everyone
 * socket.broadcast.emit: It emit to message to everyone except own client
 *
 * io.to.emit : It emit message to everyone in room
 * socket.broadcast.to.emit: It emit message to everyone in to group except own client
 */
io.on("connection", (socket) => {
    console.log("new Connection establish");
    //Get data username and room
    socket.on("join", ({ username, room }, callback) => {
        const { error, user } = addUser(socket.id, username, room);
        if (error) {
            return callback(error);
        }
        //Create room
        socket.join(user.room);
        socket.emit("message", messageGenerate("System", "Welcome!"));
        socket.broadcast
            .to(user.room)
            .emit("message", messageGenerate(`A ${user.username} joined`));
    });

    //Send all message in join room
    //Send welcome message to client
    // socket.emit("message", messageGenerate("Welcome!"));
    //It broadcast the message to all client except own
    // socket.broadcast.emit("message", "A new user joined");
    //Get msg from all client side
    socket.on("sendMessage", (msg) => {
        let userRoom = getUser(socket.id);
        //Return msg to all client
        io.to(userRoom.room).emit(
            "message",
            messageGenerate(userRoom.username, msg)
        );
    });
    // Get user location
    socket.on("sendLocation", (cords, callback) => {
        let user = getUser(socket.id);
        let msg = `https://google.com/maps?q=${cords.lat},${cords.long}`;
        // socket.broadcast
        //     .to(user.room)
        //     .emit("message", messageGenerate(user.username, msg));
        io.to(user.room).emit(
            "locationMessage",
            messageGenerate(user.username, msg)
        );
        callback("Location Shared");
    });

    socket.emit("allUserList", () => {
        let user = getUser(socket.id);
        const users = getUserInRoom(user.room);
        console.log(users);
    });
    /**
     * Disconnect the user
     * It uses io.emit bcz msg send to all user, owner client has left
     */
    socket.on("disconnect", () => {
        let user = removeUser(socket.id);
        console.log(user);
        io.to(user.room).emit(
            "message",
            messageGenerate("System", `${user.username} has left!`)
        );
    });
});
//Start server
server.listen(port, () => {
    console.log(`Server is on port ${port}`);
});

/**
 *
 * @desc It return text message with time
 * @returns
 */
const messageGenerate = (username, message) => {
    return {
        username: username,
        message: message,
        created_at: new Date(),
    };
};
