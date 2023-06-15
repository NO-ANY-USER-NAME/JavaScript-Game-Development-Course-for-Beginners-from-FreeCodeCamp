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
var canvas = document.getElementById("Canvas1");
var canvasPos = canvas.getBoundingClientRect();
var ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
ctx.font = '30px Impact';
var wormImage = new Image(), spiderImage = new Image(), ghostImage = new Image();
wormImage.src = "enemy_worm.png";
spiderImage.src = "enemy_spider.png";
ghostImage.src = "enemy_ghost.png";
var Vector2 = /** @class */ (function () {
    function Vector2(_x, _y) {
        this.x = _x;
        this.y = _y;
    }
    Vector2.add = function (a, b) {
        return new Vector2(a.x + b.x, a.y + b.y);
    };
    Vector2.substract = function (a, b) {
        return new Vector2(a.x - b.x, a.y - b.y);
    };
    Vector2.multiple = function (a, b) {
        return new Vector2(a.x * b, a.y * b);
    };
    return Vector2;
}());
var SpriteFrameStatus;
(function (SpriteFrameStatus) {
    SpriteFrameStatus[SpriteFrameStatus["haveChanged"] = 0] = "haveChanged";
    SpriteFrameStatus[SpriteFrameStatus["noChange"] = 1] = "noChange";
    SpriteFrameStatus[SpriteFrameStatus["end"] = 2] = "end";
})(SpriteFrameStatus || (SpriteFrameStatus = {}));
;
var Sprite = /** @class */ (function () {
    function Sprite(width, height, image, changeInterval, isRepeat, frameHas) {
        if (changeInterval === void 0) { changeInterval = 0; }
        this.currentFrame = 0;
        this.lastTime = 0;
        this.image = image;
        this.size = new Vector2(width, height);
        this.changeInterval = changeInterval;
        this.isRepeat = isRepeat;
        this.frameHas = frameHas;
    }
    Sprite.prototype.getXYWH = function () {
        return [this.currentFrame * this.size.x, 0, this.size.x, this.size.y];
    };
    Sprite.prototype.tryMoveNextFrame = function (dt) {
        var ret = SpriteFrameStatus.noChange;
        this.lastTime += dt;
        if (this.lastTime >= this.changeInterval) {
            this.lastTime -= this.changeInterval;
            ++this.currentFrame;
            ret = SpriteFrameStatus.haveChanged;
            if (this.currentFrame >= this.frameHas) {
                if (this.isRepeat) {
                    this.currentFrame = 0;
                }
                ret = SpriteFrameStatus.end;
            }
        }
        return ret;
    };
    return Sprite;
}());
var ghostSprite = new Sprite(1566 / 6, 209, ghostImage, 0.05, true, 6);
var spiderSprite = new Sprite(1860 / 6, 175, spiderImage, 0.05, true, 6);
var wormSprite = new Sprite(1374 / 6, 171, wormImage, 0.05, true, 6);
var Movable = /** @class */ (function () {
    function Movable(x, y, width, height, xSpeed, ySpeed) {
        this.position = new Vector2(x, y);
        this.velocity = new Vector2(xSpeed, ySpeed);
        this.size = new Vector2(width, height);
    }
    Movable.prototype.update = function (dt) {
        this.position = Vector2.add(this.position, Vector2.multiple(this.velocity, dt));
    };
    return Movable;
}());
var Enemy = /** @class */ (function (_super) {
    __extends(Enemy, _super);
    function Enemy(sx, sy, width, height, speedX, speedY, sprite) {
        if (speedX === void 0) { speedX = 0; }
        if (speedY === void 0) { speedY = 0; }
        if (sprite === void 0) { sprite = null; }
        var _this = _super.call(this, sx, sy, width, height, speedX, speedY) || this;
        _this.color = 'red';
        _this.isDirty = false;
        if (sprite != null) {
            _this.sprite = sprite;
        }
        return _this;
    }
    Enemy.prototype.update = function (dt) {
        _super.prototype.update.call(this, dt);
        //ctx.fillStyle=this.color;
        //ctx.fillRect(this.position.x,this.position.y,this.size.x,this.size.y);
        if (this.position.x + this.size.x <= 0) {
            this.isDirty = true;
        }
    };
    Enemy.prototype.draw = function (_ctx) {
        var a = this.sprite.getXYWH();
        _ctx.drawImage(this.sprite.image, a[0], a[1], a[2], a[3], this.position.x, this.position.y, this.size.x, this.size.y);
    };
    ;
    return Enemy;
}(Movable));
var Spider = /** @class */ (function (_super) {
    __extends(Spider, _super);
    function Spider(sx, sy, width, height, speedX, speedY) {
        if (speedX === void 0) { speedX = 0; }
        if (speedY === void 0) { speedY = 0; }
        return _super.call(this, sx, sy, width, height, speedX, speedY, new Sprite(1860 / 6, 175, spiderImage, 0.05, true, 6)) || this;
    }
    Spider.prototype.setTopBottom = function (minHeight, maxHeight) {
        if (minHeight === void 0) { minHeight = 0; }
        this.top = minHeight;
        this.bottom = maxHeight - this.size.y;
    };
    Spider.prototype.update = function (dt) {
        _super.prototype.update.call(this, dt);
        this.sprite.tryMoveNextFrame(dt);
        if (this.position.y + this.velocity.y < this.top) {
            this.velocity.y = -this.velocity.y;
            this.velocity.y *= 2;
        }
        else if (this.position.y + this.velocity.y > this.bottom) {
            this.velocity.y = -this.velocity.y;
            this.velocity.y /= 2;
        }
        this.position.y += this.velocity.y;
    };
    Spider.prototype.draw = function (ctx) {
        ctx.beginPath();
        ctx.moveTo(this.position.x, 0);
        ctx.lineTo(this.position.x + this.size.x / 2, this.position.y + 10);
        ctx.stroke();
        _super.prototype.draw.call(this, ctx);
    };
    return Spider;
}(Enemy));
var Worm = /** @class */ (function (_super) {
    __extends(Worm, _super);
    function Worm(sx, sy, width, height, speedX, speedY, sprite) {
        if (speedX === void 0) { speedX = 0; }
        if (speedY === void 0) { speedY = 0; }
        if (sprite === void 0) { sprite = null; }
        return _super.call(this, sx, sy, width, height, speedX, speedY, new Sprite(1374 / 6, 171, wormImage, 0.05, true, 6)) || this;
    }
    Worm.prototype.update = function (dt) {
        _super.prototype.update.call(this, dt);
        this.sprite.tryMoveNextFrame(dt);
    };
    Worm.prototype.draw = function (ctx) {
        _super.prototype.draw.call(this, ctx);
    };
    return Worm;
}(Enemy));
var Ghost = /** @class */ (function (_super) {
    __extends(Ghost, _super);
    function Ghost(sx, sy, width, height, speedX, speedY) {
        if (speedX === void 0) { speedX = 0; }
        if (speedY === void 0) { speedY = 0; }
        var _this = _super.call(this, sx, sy, width, height, speedX, speedY, new Sprite(1566 / 6, 209, ghostImage, 0.05, true, 6)) || this;
        _this.angle = 0;
        return _this;
    }
    Ghost.prototype.update = function (dt) {
        _super.prototype.update.call(this, dt);
        this.position.y += Math.sin(this.angle) * this.velocity.y;
        this.angle += dt * 2;
        this.sprite.tryMoveNextFrame(dt);
    };
    Ghost.prototype.draw = function (ctx) {
        ctx.globalAlpha = 0.4;
        _super.prototype.draw.call(this, ctx);
        ctx.globalAlpha = 1;
    };
    return Ghost;
}(Enemy));
var EnemyManager = /** @class */ (function () {
    function EnemyManager(ctx, w, h, createInterval /*in sceonds*/) {
        if (createInterval === void 0) { createInterval = 0.5; } /*in sceonds*/
        this.lastTime = 0;
        this.ctx = ctx;
        this.ctxHeight = h;
        this.ctxWidth = w;
        this.enemies = [];
        this.timeInterval = createInterval;
    }
    EnemyManager.prototype.update = function (dt) {
        this.lastTime += dt;
        if (this.lastTime >= this.timeInterval) {
            this.lastTime -= this.timeInterval;
            var chance = Math.random();
            if (chance < 0.3333) {
                var top_1 = 0;
                var bottom = this.ctxHeight;
                var spider = new Spider(manager.ctxWidth, Math.random() * (manager.ctxHeight - 100), 100, 100, Math.random() * -100 - 20, Math.random() * 2.5 + 3);
                spider.setTopBottom(top_1, bottom * (Math.random() * 0.5 + 0.3));
                this.addNewEnemy(spider);
            }
            else if (chance < 0.6666) {
                this.addNewEnemy(new Worm(manager.ctxWidth, manager.ctxHeight - 100, 100, 100, Math.random() * -100 - 20, 0));
            }
            else {
                this.addNewEnemy(new Ghost(manager.ctxWidth, Math.random() * (manager.ctxHeight - 300), 100, 100, Math.random() * -100 - 20, Math.random() * 4.5));
            }
        }
        ctx.clearRect(0, 0, this.ctxWidth, this.ctxHeight);
        this.enemies.forEach(function (enemy) {
            enemy.update(dt);
            enemy.draw(ctx);
        });
        this.enemies = this.enemies.filter(function (enemy) { return !enemy.isDirty; });
        //console.log(this.enemies.length);
    };
    EnemyManager.prototype.addNewEnemy = function (enemy) {
        this.enemies.push(enemy);
        this.enemies.sort(function (a, b) {
            return a.position.y - b.position.y;
        });
    };
    EnemyManager.prototype.getRandomY = function (height) {
        if (height === void 0) { height = 0; }
        return Math.random() * (this.ctxHeight - height);
    };
    return EnemyManager;
}());
var lastTime = 0;
var manager = new EnemyManager(ctx, canvas.width, canvas.height);
function animate(timestamp) {
    var dt = timestamp - lastTime;
    lastTime = timestamp;
    manager.update(dt / 1000);
    requestAnimationFrame(animate);
}
document.addEventListener('DOMContentLoaded', function () {
    animate(0);
});
