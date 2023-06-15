var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var canvas = document.getElementById("C1");
var ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var fullSceneButton = document.getElementById("fullscenebutton");
var Vector2 = /** @class */ (function () {
    function Vector2(x, y) {
        this.x = x;
        this.y = y;
    }
    Vector2.add = function (a, b) {
        return new Vector2(a.x + b.x, a.y + b.y);
    };
    Vector2.multiply = function (a, b) {
        return new Vector2(a.x * b, a.y * b);
    };
    Vector2.copy = function (a) {
        return new Vector2(a.x, a.y);
    };
    return Vector2;
}());
var InputHandle = /** @class */ (function () {
    function InputHandle() {
        var _this = this;
        if (InputHandle.instance == null) {
            InputHandle.instance = this;
            this.keys = [];
            window.addEventListener('keydown', function (keyboard) { return _this.addKey(keyboard); });
            window.addEventListener('keyup', function (keyboard) { return _this.removeKey(keyboard); });
            window.addEventListener('touchstart', function (e) { return _this.touch(e); });
        }
        else {
            return;
        }
    }
    InputHandle.prototype.addKey = function (keyboard) {
        var keyPressed = keyboard.key;
        //console.log(keyPressed);
        if (keyPressed == 'ArrowUp' || keyPressed == 'ArrowDown' || keyPressed == 'ArrowLeft' || keyPressed == 'ArrowRight' ||
            keyPressed == 'w' || keyPressed == 's' || keyPressed == 'a' || keyPressed == 'd') {
            if (this.keys.indexOf(keyPressed) == -1) {
                this.keys.push(keyPressed);
            }
        }
        else if (keyPressed == 'Enter' && isGameover) {
            restartGame();
        }
        //console.log(this.keys);
    };
    InputHandle.prototype.removeKey = function (keyboard) {
        var keyPressed = keyboard.key;
        if (keyPressed == 'ArrowUp' || keyPressed == 'ArrowDown' || keyPressed == 'ArrowLeft' || keyPressed == 'ArrowRight' ||
            keyPressed == 'w' || keyPressed == 's' || keyPressed == 'a' || keyPressed == 'd') {
            this.keys.splice(this.keys.indexOf(keyPressed), 1);
        }
        //console.log(this.keys);
    };
    InputHandle.prototype.touch = function (e) {
        console.log(e);
    };
    InputHandle.prototype.Reset = function () {
        this.keys.length = 0;
    };
    InputHandle.instance = null;
    return InputHandle;
}());
var Movable = /** @class */ (function () {
    function Movable(startPosition, startVelocity, size) {
        this.position = Vector2.copy(startPosition);
        this.velocity = Vector2.copy(startVelocity);
        this.size = Vector2.copy(size);
    }
    Movable.prototype.update = function (dt) {
        this.position = Vector2.add(this.position, Vector2.multiply(this.velocity, dt));
    };
    Movable.prototype.drawCollider = function (ctx, color) {
        if (color === void 0) { color = 'black'; }
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.arc(this.position.x + this.size.x / 2, this.position.y + this.size.y / 2, this.size.x / 2, 0, Math.PI * 2);
        ctx.stroke();
    };
    return Movable;
}());
var Background = /** @class */ (function (_super) {
    __extends(Background, _super);
    function Background(sceneSize) {
        var _this = _super.call(this, new Vector2(0, 0), new Vector2(-300, 0), new Vector2(2400, 700)) || this;
        _this.sceneSize = Vector2.copy(sceneSize);
        return _this;
    }
    Background.assignImageSource = function () {
        this.BackgroundImage.src = "background_single.png";
    };
    Background.prototype.draw = function (ctx) {
        ctx.drawImage(Background.BackgroundImage, this.position.x, this.position.y, this.size.x, this.size.y);
        ctx.drawImage(Background.BackgroundImage, this.position.x + this.size.x, this.position.y, this.size.x, this.size.y);
    };
    Background.prototype.update = function (dt) {
        _super.prototype.update.call(this, dt);
        if (this.position.x < 0 - this.size.x) {
            this.position.x = 0;
        }
    };
    Background.prototype.restart = function () {
        this.position.x = 0;
    };
    Background.BackgroundImage = new Image();
    return Background;
}(Movable));
var SpriteFrameStatus;
(function (SpriteFrameStatus) {
    SpriteFrameStatus[SpriteFrameStatus["haveChanged"] = 0] = "haveChanged";
    SpriteFrameStatus[SpriteFrameStatus["noChange"] = 1] = "noChange";
    SpriteFrameStatus[SpriteFrameStatus["end"] = 2] = "end";
})(SpriteFrameStatus || (SpriteFrameStatus = {}));
;
var Sprite = /** @class */ (function () {
    function Sprite(totalFrame, frameSize, frameHasInRC, image, changeInterval, isRepeat) {
        if (changeInterval === void 0) { changeInterval = 0; }
        if (isRepeat === void 0) { isRepeat = true; }
        this.lastTime = 0;
        this.totalFrame = totalFrame;
        this.counter = new Vector2(0, 0);
        this.image = image;
        this.frameHas = Vector2.copy(frameHasInRC);
        this.frameSize = Vector2.copy(frameSize);
        this.changeInterval = changeInterval;
        this.isRepeat = isRepeat;
    }
    Sprite.prototype.getXYWH = function () {
        return [this.counter.x * this.frameSize.x, this.counter.y * this.frameSize.y, this.frameSize.x, this.frameSize.y];
    };
    Sprite.prototype.tryMoveNextFrame = function (dt) {
        var ret = SpriteFrameStatus.noChange;
        this.lastTime += dt;
        if (this.lastTime >= this.changeInterval) {
            ret = SpriteFrameStatus.haveChanged;
            this.lastTime -= this.changeInterval;
            ++this.counter.x;
            if (this.counter.x >= this.frameHas.x) {
                ret = SpriteFrameStatus.end;
                this.counter.x = 0;
            }
        }
        return ret;
    };
    Sprite.prototype.forceMoveNextFrame = function () {
        var ret = SpriteFrameStatus.haveChanged;
        this.counter.x++;
        if (this.counter.x + this.counter.y * this.frameHas.x >= this.totalFrame) {
            if (this.isRepeat) {
                this.counter.x = 0;
                this.counter.y = 0;
            }
            ret = SpriteFrameStatus.end;
        }
        else if (this.counter.x >= this.frameHas.x) {
            this.counter.x = 0;
            this.counter.y++;
            if (this.counter.y >= this.frameHas.y) {
                if (this.isRepeat) {
                    this.counter.y = 0;
                }
            }
        }
        return ret;
    };
    return Sprite;
}());
var Player = /** @class */ (function (_super) {
    __extends(Player, _super);
    function Player(sceneSize) {
        var _this = _super.call(this, new Vector2(20, sceneSize.y - 200), new Vector2(0, 0), new Vector2(200, 200)) || this;
        _this.sceneSize = Vector2.copy(sceneSize);
        _this.sprite = new Sprite(16, new Vector2(200, 200), new Vector2(9, 2), Player.PlayerImage, 0.05, true);
        return _this;
    }
    Player.assignImageSource = function () {
        this.PlayerImage.src = "player.png";
    };
    Player.prototype.draw = function (ctx) {
        this.drawCollider(ctx, 'green');
        var a = this.sprite.getXYWH();
        ctx.drawImage(this.sprite.image, a[0], a[1], a[2], a[3], this.position.x, this.position.y, this.size.x, this.size.y);
    };
    Player.prototype.update = function (dt) {
        _super.prototype.update.call(this, dt);
        if (this.position.x < 0) {
            this.position.x = 0;
        }
        else if (this.position.x > this.sceneSize.x - this.size.x) {
            this.position.x = this.sceneSize.x - this.size.x;
        }
        if (this.position.y < 0) {
            this.position.y = 0;
        }
        else if (this.position.y > this.sceneSize.y - this.size.y) {
            this.position.y = this.sceneSize.y - this.size.y;
        }
        this.sprite.tryMoveNextFrame(dt);
        if (InputHandle.instance != null) {
            this.changeSpeed(InputHandle.instance.keys, dt);
        }
    };
    Player.prototype.changeSpeed = function (keys, dt) {
        if (keys.indexOf('ArrowRight') != -1 || keys.indexOf('d') != -1) {
            this.velocity.x = 200;
        }
        else if (keys.indexOf('ArrowLeft') != -1 || keys.indexOf('a') != -1) {
            this.velocity.x = -200;
        }
        else {
            this.velocity.x = 0;
        }
        if (this.onGround()) {
            if (keys.indexOf('ArrowUp') != -1 || keys.indexOf('w') != -1) {
                this.velocity.y = -700;
                this.sprite.counter.y = 1;
                this.sprite.frameHas.x = 7;
            }
            else {
                this.velocity.y = 0;
                this.sprite.frameHas.x = 9;
                this.sprite.counter.y = 0;
            }
        }
        else {
            this.velocity.y += (700 * dt);
        }
    };
    Player.prototype.onGround = function () {
        return this.position.y >= this.sceneSize.y - this.size.y;
    };
    Player.prototype.restart = function () {
        this.sprite.counter.y = 0;
        this.sprite.counter.x = 0;
        this.sprite.frameHas.x = 9;
        this.position.x = 20;
        this.position.y = sceneSize.y - 200;
        this.velocity.x = 0;
        this.velocity.y = 0;
    };
    Player.PlayerImage = new Image();
    Player.instance = null;
    return Player;
}(Movable));
var Enemy = /** @class */ (function (_super) {
    __extends(Enemy, _super);
    function Enemy(sceneSize) {
        var _this = _super.call(this, new Vector2(sceneSize.x, 0), new Vector2(-(Math.random() * 100 + 100), 0), new Vector2(0, 0)) || this;
        _this.isDirty = false;
        var factor = (Math.random() * 0.5 + 0.3);
        var height = 171 * factor;
        var width = 1374 / 6 * factor;
        _this.position.y = sceneSize.y - height;
        _this.size.x = width;
        _this.size.y = height;
        _this.sprite = new Sprite(6, new Vector2((1374 / 6), 171), new Vector2(6, 1), Enemy.EnemyImage, 0.05, true);
        _this.sceneSize = Vector2.copy(sceneSize);
        return _this;
    }
    Enemy.assignImageSource = function () {
        this.EnemyImage.src = "enemy_worm.png";
    };
    Enemy.prototype.update = function (dt) {
        _super.prototype.update.call(this, dt);
        if (this.position.x + this.size.x < 0) {
            this.isDirty = true;
            score++;
        }
        this.sprite.tryMoveNextFrame(dt);
    };
    Enemy.prototype.draw = function (ctx) {
        this.drawCollider(ctx, 'red');
        var a = this.sprite.getXYWH();
        ctx.drawImage(this.sprite.image, a[0], a[1], a[2], a[3], this.position.x, this.position.y, this.size.x, this.size.y);
    };
    Enemy.EnemyImage = new Image();
    return Enemy;
}(Movable));
var EnemyManager = /** @class */ (function () {
    function EnemyManager(spawnInterval) {
        if (EnemyManager.instance == null) {
            EnemyManager.instance = this;
            this.enemies = [];
            this.spawnInterval = spawnInterval;
            this.lastTime = this.spawnInterval;
        }
        else {
            return;
        }
    }
    EnemyManager.prototype.update = function (dt) {
        this.enemies.forEach(function (enemy) { enemy.update(dt); enemy.draw(ctx); });
        this.lastTime += dt;
        if (this.lastTime >= this.spawnInterval) {
            this.lastTime -= this.spawnInterval;
            this.enemies.push(new Enemy(sceneSize));
        }
        this.enemies = this.enemies.filter(function (enemy) { return !enemy.isDirty; });
    };
    EnemyManager.prototype.detectCollision = function (centerX, centerY, radius) {
        for (var i = 0; i < this.enemies.length; i++) {
            var enemy = this.enemies[i];
            var dx = centerX - (enemy.position.x + enemy.size.x / 2);
            var dy = centerY - (enemy.position.y + enemy.size.y / 2);
            var dist = radius + enemy.size.x / 2;
            if (dx * dx + dy * dy < dist * dist) {
                return true;
            }
        }
        return false;
    };
    EnemyManager.prototype.restart = function () {
        this.enemies.length = 0;
        this.lastTime = this.spawnInterval;
    };
    return EnemyManager;
}());
Player.assignImageSource();
Enemy.assignImageSource();
Background.assignImageSource();
var sceneSize = new Vector2(canvas.width, canvas.height);
var inputHandler = new InputHandle();
var player = new Player(sceneSize);
var enemyManager = new EnemyManager(4);
player.draw(ctx);
var background = new Background(sceneSize);
var score = 0;
function drawScore(ctx) {
    ctx.textAlign = "left";
    ctx.fillStyle = 'black';
    ctx.font = '40px Helvetica';
    ctx.fillText('Score: ' + score, 20, 50);
    ctx.fillStyle = 'white';
    ctx.fillText('Score: ' + score, 23, 53);
}
function restartGame() {
    isGameover = false;
    score = 0;
    enemyManager.restart();
    player.restart();
    background.restart();
    animate(0);
}
function toggleFullScece() {
    if (document.fullscreenElement == null) {
        try {
            document.body.requestFullscreen();
        }
        catch (_a) {
            alert("cannot enter full scene mode");
        }
        //canvas.requestFullscreen().catch(err=>{alert('cant enter full scene ${err.message}')});
    }
    else {
        document.exitFullscreen();
    }
}
fullSceneButton.addEventListener('click', function (e) {
    toggleFullScece();
});
var isGameover = false;
var lastTime = 0;
function animate(timestamp) {
    if (isGameover) {
        ctx.textAlign = 'center';
        ctx.fillStyle = 'black';
        ctx.fillText("Game Over!\nPress Enter To Restart", canvas.width / 2 - 3, canvas.height / 2 - 3);
        ctx.fillStyle = 'red';
        ctx.fillText("Game Over!\nPress Enter To Restart", canvas.width / 2, canvas.height / 2);
    }
    else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        var dt = timestamp - lastTime;
        dt /= 1000;
        lastTime = timestamp;
        background.update(dt);
        background.draw(ctx);
        enemyManager.update(dt);
        player.update(dt);
        player.draw(ctx);
        drawScore(ctx);
        isGameover = enemyManager.detectCollision(player.position.x + player.size.x / 2, player.position.y + player.size.y / 2, player.size.x / 2);
        requestAnimationFrame(animate);
    }
}
window.addEventListener('DOMContentLoaded', function () {
    animate(0);
});
