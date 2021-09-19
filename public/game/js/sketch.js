let socket = io.connect(window.location.origin);

let planeOffsetX = 0;
let planeOffsetY = 0;

let players = {};
let blobs = [];
let myBlob;
let myId = Math.floor(Math.random() * 100000);

let joined = false;

function setup() {
    createCanvas(windowWidth, windowHeight).parent('container');

    let radius = 50;
    let xPos = windowWidth / 2 - radius;
    let yPos = windowHeight / 2 - radius;
    myBlob = new Blob(myId, xPos, yPos, radius);
}

function draw() {
    background(0);
    countCursorDistance();
    if (!joined) {
        socket.emit('joinGame', { id: myId, x: myBlob.x, y: myBlob.y });
    } else if (players) {
        Object.keys(players).forEach(key => {
            let c = players[key];
            if (myBlob && myBlob.id != c.id && myBlob.isIntersect(c)) {
                delete players[key];
                myBlob.grow(c);
            } else {
                c.draw();
            }
        });
    }
}

function countCursorDistance() {
    if (!joined || !myBlob) return
    const xPos = mouseX - myBlob.x;
    const yPos = mouseY - myBlob.y;
    const distVector = createVector(xPos, yPos);
    distVector.normalize();
    distVector.mult(3);
    // planeOffsetX = distVector.x * -1;
    // planeOffsetY = distVector.y * -1;
    myBlob.move(distVector.x, distVector.y);
}

function moveBlobBasedOnOffset(blob) {
    if (planeOffsetY > 0 && planeOffsetX > 0) {
        // generate random to left top
        if (random(0, 100) > 50) {
            blob.x = 0;
            blob.y = random(0, windowHeight / 2);
        } else {
            blob.x = random(0, windowWidth / 2);
            blob.y = 0;
        }
    } else if (planeOffsetY < 0 && planeOffsetX > 0) {
        // generate random to left side
        blob.x = random(0, windowWidth - blob.radius);
        blob.y = windowHeight;
    } else if (planeOffsetY > 0 && planeOffsetX < 0) {
        // generate random to right side
        blob.x = windowWidth;
        blob.y = random(0, windowHeight - blob.radius);
    } else {
        // generate random to bottom right
        if (random(0, 100) > 50) {
            blob.x = windowWidth;
            blob.y = random(windowHeight / 2, windowHeight);
        } else {
            blob.x = random(windowWidth / 2, windowWidth);
            blob.y = windowHeight;
        }
    }
}

socket.on('getPlayers', data => {
    console.log(data);
    Object.keys(data).forEach(key => {
        let c = data[key];
        let p = new Blob(c.id, c.x, c.y, c.size, c.blobColor);
        if (p.id == myId) myBlob = p;
        players[p.id] = p;
    });
    joined = true
})

socket.on('newPlayer', c => {
    let p = new Blob(c.id, c.x, c.y, c.size, c.blobColor);
    players[p.id] = p;
})

socket.on('updatePosition', data => {
    if (!joined) return;
    let player = players[data.id];
    player.x = data.x;
    player.y = data.y;
})

socket.on('deletePlayer', id => {
    delete players[id];
    if (id == myId) myBlob = undefined;
})