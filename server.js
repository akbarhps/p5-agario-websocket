const express = require("express")
const socket = require("socket.io")

const app = express()
app.use(express.static("public"))

const port = process.env.PORT || 3000

const server = app.listen(port, () => console.log("Server running on port: " + port))

const io = socket(server);

class Player {
    constructor(id, x, y, size) {
        this.id = id;
        this.size = size;
        this.x = x; this.y = y;
        this.blobColor = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)];
    }

    updatePosition(x, y) {
        this.x = x;
        this.y = y;
    }
}

let players = {};

io.sockets.on("connection", socket => {

    let mPlayer;

    socket.on('joinGame', data => {
        let player = new Player(data.id, data.x, data.y, Math.floor(Math.random() * 100));
        players[player.id] = player;
        mPlayer = player;

        socket.broadcast.emit('newPlayer', player);
        socket.emit('getPlayers', players);
    })

    socket.on('updatePosition', data => {
        if (data.id && players[data.id] && data.x && data.y) {
            players[data.id].x = data.x;
            players[data.id].y = data.y;
            socket.broadcast.emit('updatePosition', data);
        }
    })

    socket.on('updateSize', data => {
        players[data.id].size = data.size;
        delete players[data.killedId];
        socket.broadcast.emit('deletePlayer', data.killedId);
    })

    socket.on("disconnect", () => {
        if (!mPlayer || !players[mPlayer.id]) return;
        delete players[mPlayer.id]
        socket.broadcast.emit('deletePlayer', mPlayer.id);
    })

})