var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var canvas = document.getElementById("Canvas1");
var collisionCanvas = document.getElementById("collision");
var canvasPos = canvas.getBoundingClientRect();
var ctx = canvas.getContext('2d');
var collisionCtx = collisionCanvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
collisionCanvas.width = window.innerWidth;
collisionCanvas.height = window.innerHeight;
ctx.font = '30px Impact';
var ravenImage = new Image();
ravenImage.src = "raven.png";
var ExplosionImage = new Image();
ExplosionImage.src = "boom.png";
var timeToNextRaven = 0;
var ravenInterval = 1000;
var lastTime = 0;
var score = 0;
var live = 3;
var Vector3 = /** @class */ (function () {
    function Vector3(_x, _y, _z) {
        this.x = _x;
        this.y = _y;
        this.z = _z;
    }
    return Vector3;
}());
var Sprite = /** @class */ (function () {
    function Sprite(_width, _height, _image, _frameHas, _interval, _isRepeat) {
        this.width = _width;
        this.height = _height;
        this.image = _image;
        this.frame = 0;
        this.frameHas = _frameHas;
        this.changeFrameInterval = _interval;
        this.time = 0;
        this.isRepeat = _isRepeat;
    }
    Sprite.prototype.tryMoveNextFrame = function (dt) {
        var ret = 0;
        this.time += dt;
        if (this.time > this.changeFrameInterval) {
            this.time -= this.changeFrameInterval;
            ++this.frame;
            if (this.frame == this.frameHas) {
                ret = 2;
                if (this.isRepeat) {
                    this.frame = 0;
                }
            }
            else {
                ret = 1;
            }
        }
        return ret;
    };
    Sprite.prototype.getSXY = function () {
        return [this.frame * this.width, 0];
    };
    return Sprite;
}());
var Raven = /** @class */ (function () {
    function Raven() {
        this.directionX = Math.random() * 5 + 3;
        this.directionY = Math.random() * 5 - 2.5;
        this.isDirty = false;
        this.sprite = new Sprite(271, 194, ravenImage, 5, 150, true);
        this.position = new Vector3(canvas.width, Math.random() * (canvas.height - this.sprite.height), Math.random() + 0.35);
        if (this.position.z > 0.8) {
            this.position.z = 0.8;
        }
        this.hitboxColor = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)];
        this.color = 'rgb(' + String(this.hitboxColor[0]) + ',' + String(this.hitboxColor[1]) + ',' + String(this.hitboxColor[2]) + ')';
    }
    Raven.prototype.update = function (dt) {
        this.position.x -= this.directionX;
        this.position.y += this.directionY;
        if (this.position.y < 0 || this.position.y > canvas.height - this.sprite.height * this.position.z) {
            this.directionY = -this.directionY;
        }
        var a = this.sprite.getSXY();
        collisionCtx.fillStyle = this.color;
        collisionCtx.fillRect(this.position.x, this.position.y, this.sprite.width * this.position.z, this.sprite.height * this.position.z);
        ctx.drawImage(this.sprite.image, a[0], a[1], this.sprite.width, this.sprite.height, this.position.x, this.position.y, this.sprite.width * this.position.z, this.sprite.height * this.position.z);
        if (this.sprite.tryMoveNextFrame(dt) > 0) {
            particles.push(new Particle(this.position, this.color));
        }
        if (this.position.x + this.sprite.width * this.position.z < 0) {
            this.isDirty = true;
            live--;
        }
    };
    return Raven;
}());
var Explosion = /** @class */ (function () {
    function Explosion(_x, _y, _z) {
        this.position = new Vector3(_x, _y, _z);
        this.sprite = new Sprite(200, 179, ExplosionImage, 5, 50, false);
        this.isDirty = false;
    }
    Explosion.prototype.update = function (dt) {
        var a = this.sprite.getSXY();
        ctx.drawImage(this.sprite.image, a[0], a[1], this.sprite.width, this.sprite.height, this.position.x, this.position.y, this.sprite.width * this.position.z, this.sprite.height * this.position.z);
        this.isDirty = this.sprite.tryMoveNextFrame(dt) == 2 || this.isDirty;
    };
    return Explosion;
}());
var Particle = /** @class */ (function () {
    function Particle(vector3, color) {
        this.position = __assign({}, vector3);
        this.position.x += this.position.x / 3;
        this.position.y += this.position.y / 2;
        this.color = color;
        this.radius = Math.random() * this.position.z / 3;
        this.maxRadius = Math.random() * 10 + 15;
        this.isDirty = false;
        this.speedX = Math.random() * 1 + 0.5;
    }
    Particle.prototype.update = function (dt) {
        //console.log(this.radius);
        if (this.radius > this.maxRadius) {
            this.isDirty = true;
        }
        else {
            ctx.save();
            ctx.globalAlpha = 1 - (this.radius / this.maxRadius);
            ctx.beginPath();
            ctx.fillStyle = this.color;
            ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            this.position.x += this.speedX;
            this.radius += 0.2;
            ctx.restore();
        }
    };
    return Particle;
}());
var ravens = [];
var explosions = [];
var particles = [];
window.addEventListener('click', ClickRaven);
function ClickRaven(e) {
    if (live <= 0)
        return;
    var color = collisionCtx.getImageData(e.x, e.y, 1, 1);
    var pc = color.data;
    for (var i = 0; i < ravens.length; i++) {
        if (ravens[i].hitboxColor[0] === pc[0] && ravens[i].hitboxColor[1] === pc[1] && ravens[i].hitboxColor[2] === pc[2]) {
            ravens[i].isDirty = true;
            ++score;
            explosions.push(new Explosion(ravens[i].position.x, ravens[i].position.y, ravens[i].position.z));
            break;
        }
    }
}
function drawScore() {
    var sx = 20, sy = 40, offset = 4;
    ctx.fillStyle = 'black';
    ctx.fillText('Score: ' + score, sx - offset, sy - offset);
    ctx.fillStyle = 'white';
    ctx.fillText('Score: ' + score, sx, sy);
}
function drawLive() {
    var sx = 20, sy = 80, offset = 4;
    ctx.fillStyle = 'black';
    ctx.fillText('live: ' + live, sx - offset, sy - offset);
    ctx.fillStyle = 'white';
    ctx.fillText('live: ' + live, sx, sy);
}
function drawGameOverFrame() {
    ctx.textAlign = 'center';
    ctx.fillStyle = 'black';
    ctx.fillText(('Game Over! score ' + score.toString()), canvas.width / 2, canvas.height / 2);
    ctx.fillStyle = 'white';
    ctx.fillText(('Game Over! score ' + score.toString()), canvas.width / 2 + 4, canvas.height / 2 + 4);
}
function Animate(timestamp) {
    if (live <= 0) {
        drawGameOverFrame();
    }
    else {
        var dt_1 = timestamp - lastTime;
        lastTime = timestamp;
        timeToNextRaven = timeToNextRaven + dt_1;
        if (timeToNextRaven > ravenInterval) {
            timeToNextRaven -= ravenInterval;
            ravens.push(new Raven());
            ravens.sort(function (a, b) {
                return a.position.z - b.position.z;
            });
        }
        collisionCtx.clearRect(0, 0, collisionCanvas.width, collisionCanvas.height);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawScore();
        drawLive();
        [].concat(particles, ravens, explosions).forEach(function (raven) { return raven.update(dt_1); });
        ravens = ravens.filter(function (raven) { return !raven.isDirty; });
        explosions = explosions.filter(function (explode) { return !explode.isDirty; });
        particles = particles.filter(function (particle) { return !particle.isDirty; });
    }
    requestAnimationFrame(Animate);
}
Animate(0);
