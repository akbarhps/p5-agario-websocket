class Blob {
    id = -1;
    x = 0;
    y = 0;
    radius = 0;
    blobColor;
    food = false;

    constructor(id, x, y, radius, blobColor) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.blobColor = blobColor;
    }

    isOutOfView() {
        return this.x < 0 || this.x > windowWidth || this.y < 0 || this.y > windowHeight;
    }

    isIntersect(blob) {
        let thisR = this.radius / 2;
        let otherR = blob.radius / 2;
        let top = this.y - thisR <= blob.y - otherR;
        let left = this.x - thisR <= blob.x - otherR;
        let bottom = this.y + thisR >= blob.y + otherR;
        let right = this.x + thisR >= blob.x + otherR;
        return top && left && bottom && right;
    }

    grow(killed) {
        this.radius += 2.5;
        socket.emit('updateSize', { id: this.id, size: this.radius, killedId: killed.id });
    }

    move(dirX, dirY) {
        this.x += dirX;
        this.y += dirY;

        if (joined) {
            socket.emit('updatePosition', { id: this.id, x: this.x, y: this.y });
        }
    }

    draw() {
        // if (this.food) {
        // fill(255);
        // } else if (this.blobColor) {
        fill(this.blobColor[0], this.blobColor[1], this.blobColor[2]);
        // } else {
        // fill(255, 0, 0);
        // }
        // fill(255, 0, 0);
        circle(this.x, this.y, this.radius);
    }
}