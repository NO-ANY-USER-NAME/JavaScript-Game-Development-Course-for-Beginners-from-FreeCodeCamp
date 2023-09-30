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
window.addEventListener('load', function () {
    var canvax = document.getElementById("canvas1");
    var ctx = canvax.getContext('2d');
    canvax.width = 500;
    canvax.height = 500;
    var debugMode = false;
    var Vector2 = /** @class */ (function () {
        function Vector2(x, y) {
            this.x = x;
            this.y = y;
        }
        Vector2.prototype.copy = function () {
            return new Vector2(this.x, this.y);
        };
        Vector2.zero = function () {
            return new Vector2(0, 0);
        };
        Vector2.add = function (a, b) {
            return new Vector2(a.x + b.x, a.y + b.y);
        };
        return Vector2;
    }());
    var BackgroundLayer = /** @class */ (function () {
        function BackgroundLayer(g, speed, size, image) {
            this.position = Vector2.zero();
            this.game = g;
            this.size = size;
            this.speed = speed;
            this.image = image;
        }
        BackgroundLayer.prototype.update = function (dt) {
            if (this.position.x < -this.size.x) {
                this.position.x = 0;
            }
            else {
                this.position.x -= dt * this.speed * this.game.speed;
            }
        };
        BackgroundLayer.prototype.draw = function (ctx) {
            ctx.drawImage(this.image, this.position.x + this.size.x, this.position.y, this.size.x, this.size.y);
            ctx.drawImage(this.image, this.position.x, this.position.y, this.size.x, this.size.y);
        };
        return BackgroundLayer;
    }());
    var Background = /** @class */ (function () {
        function Background(g) {
            this.size = new Vector2(1667, 500);
            this.layer = [];
            this.game = g;
            this.layer.push(new BackgroundLayer(g, 200 * 0.25, this.size.copy(), document.getElementById("layer1")));
            this.layer.push(new BackgroundLayer(g, 300 * 0.25, this.size.copy(), document.getElementById("layer2")));
            this.layer.push(new BackgroundLayer(g, 500 * 0.25, this.size.copy(), document.getElementById("layer3")));
            this.layer.push(new BackgroundLayer(g, 700 * 0.25, this.size.copy(), document.getElementById("layer4")));
            this.layer.push(new BackgroundLayer(g, 800 * 0.25, this.size.copy(), document.getElementById("layer5")));
        }
        Background.prototype.update = function (dt) {
            for (var i = 0; i < this.layer.length; i++) {
                this.layer[i].update(dt);
            }
        };
        Background.prototype.draw = function (ctx) {
            for (var i = 0; i < this.layer.length; i++) {
                this.layer[i].draw(ctx);
            }
        };
        return Background;
    }());
    var Game = /** @class */ (function () {
        function Game(w, h) {
            this.groundMargin = 50;
            this.speed = 1;
            this.particles = [];
            this.enemies = [];
            this.lives = 5;
            this.booms = [];
            this.enemyTimer = 0;
            this.enemyInterval = 1;
            this.score = 0;
            this.fontSize = 30;
            this.fontFamily = "Helvetica";
            this.fontColor = "blue";
            this.gameover = false;
            this.timePassed = 0;
            this.maxPlayTime = 60;
            this.width = w;
            this.height = h;
            this.player = new Player(this);
            this.input = new InputHandler();
            this.background = new Background(this);
        }
        Game.prototype.update = function (dt) {
            if (this.gameover) {
                return;
            }
            this.timePassed += dt;
            if (this.timePassed >= this.maxPlayTime) {
                this.gameover = true;
                this.timePassed = this.maxPlayTime;
                return;
            }
            this.enemyTimer += dt;
            if (this.enemyTimer >= this.enemyInterval) {
                this.enemyTimer -= this.enemyInterval + (Math.random() - 0.5);
                this.enemies.push(this.spawnEnemy());
            }
            for (var i = 0; i < this.enemies.length; i++) {
                this.enemies[i].update(dt);
            }
            this.enemies = this.enemies.filter(function (e) { return !e.dirty; });
            for (var i = 0; i < this.particles.length; i++) {
                this.particles[i].update(dt);
            }
            this.particles = this.particles.filter(function (p) { return !p.dirty; });
            for (var i = 0; i < this.booms.length; i++) {
                this.booms[i].update(dt);
            }
            this.booms = this.booms.filter(function (b) { return !b.dirty; });
            this.background.update(dt);
            this.player.update(dt, this.input);
            this.player.detectCollision(this.enemies);
        };
        Game.prototype.draw = function (ctx) {
            ctx.clearRect(0, 0, canvax.width, canvax.height);
            this.background.draw(ctx);
            for (var i = 0; i < this.enemies.length; i++) {
                this.enemies[i].draw(ctx);
            }
            for (var i = 0; i < this.particles.length; i++) {
                this.particles[i].draw(ctx);
            }
            for (var i = 0; i < this.booms.length; i++) {
                this.booms[i].draw(ctx);
            }
            this.player.draw(ctx);
            ctx.font = this.fontSize.toString() + "px " + this.fontFamily;
            ctx.textAlign = "left";
            ctx.fillStyle = this.fontColor;
            ctx.fillText("Score: " + this.score.toString(), 20, 50);
            ctx.font = (this.fontSize * 0.8).toString() + "px " + this.fontFamily;
            ctx.fillText("time left: " + (this.maxPlayTime - this.timePassed).toFixed(3), 20, 80);
            if (this.gameover) {
                ctx.font = (this.fontSize * 2.0).toString() + "px " + this.fontFamily;
                ctx.textAlign = "center";
                ctx.fillText("Game end", this.width / 2, this.height / 2);
            }
            else {
                for (var i = 0; i < this.lives; i++) {
                    ctx.drawImage(Game.liveImage, 0, 0, 50, 50, 20 + 40 * i, 90, 30, 30);
                }
            }
        };
        Game.prototype.changeLives = function (amount) {
            this.lives += amount;
            this.gameover = this.lives <= 0;
        };
        Game.prototype.changeScore = function (amount) {
            this.score += amount;
        };
        Game.prototype.spawnEnemy = function () {
            switch (Math.floor(Math.random() * 3)) {
                case 0: {
                    return new GroundEnemy(this);
                }
                case 1: {
                    return new FlyingEnemy(this);
                }
                case 2: {
                    return new ClimbingEnemy(this);
                }
            }
            return null;
        };
        return Game;
    }());
    Game.liveImage = this.document.getElementById('lives');
    var InputHandler = /** @class */ (function () {
        function InputHandler() {
            var _this = this;
            this.keys = Array();
            window.addEventListener('keydown', function (e) {
                var tryInsert = function (x, key) {
                    if (x) {
                        if (_this.keys.indexOf(key) == -1) {
                            _this.keys.push(key);
                        }
                        return true;
                    }
                    return false;
                };
                tryInsert(e.key == "w" || e.key == "ArrowUp", "w") || tryInsert(e.key == "a" || e.key == "ArrowLeft", "a") ||
                    tryInsert(e.key == "s" || e.key == "ArrowDown", "s") || tryInsert(e.key == "d" || e.key == "ArrowRight", "d") || tryInsert(e.key == "Enter", "enter");
                if (e.key == 'b') {
                    debugMode = !debugMode;
                }
            });
            window.addEventListener('keyup', function (e) {
                var idx;
                var tryRemove = function (x, key) {
                    if (x) {
                        idx = _this.keys.indexOf(key);
                        if (idx != -1) {
                            _this.keys.splice(idx, 1);
                        }
                        return true;
                    }
                    return false;
                };
                tryRemove(e.key == "w" || e.key == "ArrowUp", "w") || tryRemove(e.key == "a" || e.key == "ArrowLeft", "a") ||
                    tryRemove(e.key == "s" || e.key == "ArrowDown", "s") || tryRemove(e.key == "d" || e.key == "ArrowRight", "d") || tryRemove(e.key == "Enter", "enter");
            });
        }
        return InputHandler;
    }());
    var Player = /** @class */ (function () {
        function Player(g) {
            this.weight = 1;
            this.frame = Vector2.zero();
            this.frameInterval = 50 / 1000;
            this.cumulativeTime = 0;
            this.frameLength = [7, 7, 7, 9, 11, 5, 7, 7, 12, 4];
            this.game = g;
            this.size = new Vector2(100, 91.3);
            this.position = new Vector2(0, this.game.height - this.size.y - this.game.groundMargin);
            this.image = document.getElementById("player");
            this.speed = Vector2.zero();
            this.maxSpeed = 10;
            this.enterState(1 /* Running */);
        }
        Player.prototype.update = function (dt, input) {
            this.onState(input);
            this.position.x += this.speed.x;
            this.position.y += this.speed.y;
            if (this.onGround() == false) {
                this.speed.y += this.weight;
            }
            else {
                this.speed.y = 0;
            }
            if (this.currentState != 6 /* Hit */) {
                if (input.keys.indexOf('a') != -1) {
                    this.speed.x = -this.maxSpeed;
                }
                else if (input.keys.indexOf('d') != -1) {
                    this.speed.x = this.maxSpeed;
                }
                else {
                    this.speed.x = 0;
                }
            }
            if (this.position.x < 0) {
                this.position.x = 0;
            }
            else if (this.position.x > this.game.width - this.size.x) {
                this.position.x = this.game.width - this.size.x;
            }
            this.cumulativeTime += dt;
            if (this.cumulativeTime >= this.frameInterval) {
                this.cumulativeTime -= this.frameInterval;
                this.frame.x++;
                if (this.frame.x >= this.frameLength[this.frame.y]) {
                    this.frame.x = 0;
                }
            }
        };
        Player.prototype.draw = function (ctx) {
            ctx.drawImage(this.image, this.frame.x * this.size.x, this.frame.y * this.size.y, this.size.x, this.size.y, this.position.x, this.position.y, this.size.x, this.size.y);
            if (debugMode) {
                ctx.strokeRect(this.position.x, this.position.y, this.size.x, this.size.y);
            }
        };
        Player.prototype.detectCollision = function (enemies) {
            for (var i = 0; i < enemies.length; i++) {
                var e = enemies[i];
                if (e.position.x < this.position.x + this.size.x && e.position.x + e.size.x > this.position.x &&
                    e.position.y < this.position.y + this.size.y && e.position.y + e.size.y > this.position.y) {
                    this.game.booms.push(new Boom(e.position.x, e.position.y));
                    e.dirty = true;
                    if (this.currentState == 5 /* Diving */ || this.currentState == 4 /* Rolling */) {
                        game.changeScore(1);
                    }
                    else if (this.currentState != 6 /* Hit */) {
                        this.enterState(6 /* Hit */);
                        game.changeLives(-1);
                    }
                }
            }
            return false;
        };
        Player.prototype.onGround = function () {
            return this.position.y >= this.game.height - this.size.y - this.game.groundMargin;
        };
        Player.prototype.onState = function (input) {
            switch (this.currentState) {
                case 1 /* Running */: {
                    this.game.particles.push(new Dust(this.game, this.position.x + this.size.x * 0.25, this.position.y + this.size.y));
                    this.game.particles.push(new Dust(this.game, this.position.x + this.size.x * 0.75, this.position.y + this.size.y));
                    if (input.keys.indexOf("s") != -1) {
                        this.enterState(0 /* Sitting */);
                    }
                    else if (input.keys.indexOf("w") != -1) {
                        this.enterState(2 /* Jumping */);
                    }
                    if (input.keys.indexOf("enter") != -1) {
                        this.enterState(4 /* Rolling */);
                    }
                    break;
                }
                case 2 /* Jumping */: {
                    if (this.speed.y > 0) {
                        this.enterState(3 /* Falling */);
                    }
                    if (input.keys.indexOf("enter") != -1) {
                        this.enterState(4 /* Rolling */);
                    }
                    if (input.keys.indexOf("s") != -1) {
                        this.enterState(5 /* Diving */);
                    }
                    break;
                }
                case 0 /* Sitting */: {
                    if (input.keys.indexOf("a") != -1 || input.keys.indexOf("d") != -1) {
                        this.enterState(1 /* Running */);
                    }
                    if (input.keys.indexOf("enter") != -1) {
                        this.enterState(4 /* Rolling */);
                    }
                    break;
                }
                case 3 /* Falling */: {
                    if (this.onGround()) {
                        this.enterState(1 /* Running */);
                    }
                    if (input.keys.indexOf("enter") != -1) {
                        this.enterState(4 /* Rolling */);
                    }
                    if (input.keys.indexOf("s") != -1) {
                        this.enterState(5 /* Diving */);
                    }
                    break;
                }
                case 4 /* Rolling */: {
                    this.game.particles.push(new Fire(game, this.position.x + this.size.x / 2, this.position.y + this.size.y / 2));
                    if (input.keys.indexOf("enter") == -1) {
                        if (this.onGround()) {
                            this.enterState(1 /* Running */);
                        }
                        else {
                            this.speed.y = 0;
                            this.enterState(3 /* Falling */);
                        }
                    }
                    else if (this.onGround() == false && input.keys.indexOf("s") != -1) {
                        this.enterState(5 /* Diving */);
                    }
                    break;
                }
                case 5 /* Diving */: {
                    this.game.particles.push(new Fire(game, this.position.x + this.size.x / 2, this.position.y + this.size.y / 2));
                    if (this.onGround()) {
                        this.position.y = this.game.height - this.size.y - this.game.groundMargin;
                        for (var i = 0; i < 20; i++) {
                            this.game.particles.push(new Splash(game, this.position.x + this.size.x / 2, this.position.y + this.size.y / 2));
                        }
                        this.enterState(1 /* Running */);
                    }
                    break;
                }
                case 6 /* Hit */: {
                    if (this.frame.x == 0) {
                        if (this.onGround()) {
                            this.enterState(1 /* Running */);
                        }
                        else {
                            this.enterState(3 /* Falling */);
                        }
                    }
                    break;
                }
            }
        };
        Player.prototype.enterState = function (nextState) {
            this.frame.x = 0;
            this.currentState = nextState;
            switch (nextState) {
                case 1 /* Running */: {
                    this.frame.y = 3;
                    this.game.speed = 3;
                    break;
                }
                case 2 /* Jumping */: {
                    this.speed.y = -30;
                    this.frame.y = 1;
                    this.game.speed = 1;
                    break;
                }
                case 0 /* Sitting */: {
                    this.frame.y = 5;
                    this.game.speed = 0;
                    break;
                }
                case 3 /* Falling */: {
                    this.game.speed = 1;
                    this.frame.y = 2;
                    break;
                }
                case 4 /* Rolling */: {
                    this.game.speed = 6;
                    this.frame.y = 6;
                    break;
                }
                case 5 /* Diving */: {
                    this.game.speed = 0;
                    this.frame.y = 6;
                    this.speed.y = 50;
                    break;
                }
                case 6 /* Hit */: {
                    this.game.speed = 0;
                    this.speed.x = 0;
                    this.frame.y = 4;
                    this.frame.x = 1;
                    break;
                }
            }
        };
        return Player;
    }());
    var Enemy = /** @class */ (function () {
        function Enemy(g) {
            this.dirty = false;
            this.frame = Vector2.zero();
            this.frameInterval = 50 / 1000;
            this.cumulativeTime = 0;
            this.position = Vector2.zero();
            this.game = g;
        }
        Enemy.prototype.update = function (dt) {
            this.position.x += this.speed.x - this.game.speed * 1.1;
            this.cumulativeTime += dt;
            if (this.cumulativeTime >= this.frameInterval) {
                this.cumulativeTime -= this.frameInterval;
                this.frame.x++;
                if (this.frame.x >= this.frameLength) {
                    this.frame.x = 0;
                }
            }
            this.dirty = this.dirty || (this.position.x + this.size.x < 0);
        };
        Enemy.prototype.draw = function (ctx) {
            ctx.drawImage(this.image, this.frame.x * this.size.x, 0, this.size.x, this.size.y, this.position.x, this.position.y, this.size.x, this.size.y);
            if (debugMode) {
                ctx.strokeRect(this.position.x, this.position.y, this.size.x, this.size.y);
            }
        };
        return Enemy;
    }());
    var FlyingEnemy = /** @class */ (function (_super) {
        __extends(FlyingEnemy, _super);
        function FlyingEnemy(g) {
            var _this = _super.call(this, g) || this;
            _this.angle = 0;
            _this.size = new Vector2(60, 44);
            _this.position = new Vector2(game.width + _this.size.x, Math.random() * game.height * 0.5);
            _this.speed = new Vector2(Math.random() * -2 + -1, Math.random() * 0.1 + 0.1);
            _this.frameLength = 5;
            _this.image = document.getElementById('enemy_fly');
            _this.amplitude = Math.random() * 4.5 + 2;
            return _this;
        }
        FlyingEnemy.prototype.update = function (dt) {
            _super.prototype.update.call(this, dt);
            this.angle += this.speed.y;
            this.position.y += this.amplitude * Math.sin(this.angle);
        };
        FlyingEnemy.prototype.draw = function (ctx) {
            _super.prototype.draw.call(this, ctx);
        };
        return FlyingEnemy;
    }(Enemy));
    var GroundEnemy = /** @class */ (function (_super) {
        __extends(GroundEnemy, _super);
        function GroundEnemy(g) {
            var _this = _super.call(this, g) || this;
            _this.size = new Vector2(60, 87);
            _this.position = new Vector2(game.width + _this.size.x, game.height - _this.size.y - game.groundMargin);
            _this.speed = new Vector2(Math.random() * -1 + -0.5, Math.random() > 0.5 ? 1 : -1);
            _this.frameLength = 2;
            _this.image = document.getElementById('enemy_plant');
            return _this;
        }
        GroundEnemy.prototype.update = function (dt) {
            _super.prototype.update.call(this, dt);
        };
        GroundEnemy.prototype.draw = function (ctx) {
            _super.prototype.draw.call(this, ctx);
        };
        return GroundEnemy;
    }(Enemy));
    var ClimbingEnemy = /** @class */ (function (_super) {
        __extends(ClimbingEnemy, _super);
        function ClimbingEnemy(g) {
            var _this = _super.call(this, g) || this;
            _this.size = new Vector2(120, 144);
            _this.position = new Vector2(game.width + _this.size.x, 0);
            _this.speed = new Vector2(Math.random() * -0.3 + -0.2, Math.random() * 4 + 3);
            _this.frameLength = 2;
            _this.image = document.getElementById('enemy_spider_big');
            return _this;
        }
        ClimbingEnemy.prototype.update = function (dt) {
            _super.prototype.update.call(this, dt);
            this.position.y += this.speed.y;
            if (this.position.y + this.size.y <= 0) {
                this.dirty = true;
            }
            else if (this.position.y >= game.height - this.size.y - game.groundMargin) {
                this.speed.y = -this.speed.y;
                this.position.y = game.height - this.size.y - game.groundMargin;
            }
        };
        ClimbingEnemy.prototype.draw = function (ctx) {
            _super.prototype.draw.call(this, ctx);
            ctx.beginPath();
            ctx.moveTo(this.position.x + this.size.x / 2, 0);
            ctx.lineTo(this.position.x + this.size.x / 2, this.position.y + 50);
            ctx.stroke();
        };
        return ClimbingEnemy;
    }(Enemy));
    var Particle = /** @class */ (function () {
        function Particle(g) {
            this.dirty = false;
            this.game = g;
        }
        Particle.prototype.update = function (dt) {
            this.position.x += dt * this.speed.x - this.game.speed;
            this.position.y += dt * this.speed.y;
            this.size *= 0.95;
            this.dirty = this.dirty || this.size < 0.5;
        };
        return Particle;
    }());
    var Dust = /** @class */ (function (_super) {
        __extends(Dust, _super);
        function Dust(g, x, y) {
            var _this = _super.call(this, g) || this;
            _this.size = 3 + Math.random() * 3;
            _this.position = new Vector2(x, y);
            _this.speed = new Vector2(Math.random() * 100, Math.random() * 100);
            return _this;
        }
        Dust.prototype.update = function (dt) {
            _super.prototype.update.call(this, dt);
        };
        Dust.prototype.draw = function (ctx) {
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.size, 0, 2 * Math.PI);
            ctx.fillStyle = Dust.color;
            ctx.fill();
        };
        return Dust;
    }(Particle));
    Dust.color = "rgb(100,100,100)";
    var Splash = /** @class */ (function (_super) {
        __extends(Splash, _super);
        function Splash(g, x, y) {
            var _this = _super.call(this, g) || this;
            _this.gravity = 10;
            _this.size = 20 * Math.random() * 30;
            _this.position = new Vector2(x, y);
            _this.speed = new Vector2(Math.random() * 400 - 200, Math.random() * 50 + 50);
            return _this;
        }
        Splash.prototype.update = function (dt) {
            _super.prototype.update.call(this, dt);
            this.gravity += dt * 100;
            this.speed.y += this.gravity;
        };
        Splash.prototype.draw = function (ctx) {
            ctx.drawImage(Fire.image, this.position.x - this.size / 2, this.position.y - this.size / 2, this.size, this.size);
        };
        return Splash;
    }(Particle));
    var Fire = /** @class */ (function (_super) {
        __extends(Fire, _super);
        function Fire(g, x, y) {
            var _this = _super.call(this, g) || this;
            _this.size = 10 * Math.random() * 15;
            _this.position = new Vector2(x, y);
            _this.speed = new Vector2(-200, Math.random() * 20 - 10);
            _this.angle = 0;
            _this.angluarSpeed = Math.random() * 100 - 50;
            return _this;
        }
        Fire.prototype.update = function (dt) {
            _super.prototype.update.call(this, dt);
            this.position.x += this.game.speed;
            this.angle += dt * this.angluarSpeed;
        };
        Fire.prototype.draw = function (ctx) {
            ctx.save();
            ctx.translate(this.position.x, this.position.y);
            ctx.rotate(this.angle);
            ctx.drawImage(Fire.image, -this.size / 2, -this.size / 2, this.size, this.size);
            ctx.restore();
        };
        return Fire;
    }(Particle));
    var Boom = /** @class */ (function () {
        function Boom(x, y) {
            this.frame = 0;
            this.cumulativeTime = 0;
            this.frame = 0;
            this.dirty = false;
            var k = Math.random() * 0.5 + 1;
            this.size = new Vector2(Boom.size.x * k, Boom.size.y * k);
            this.position = new Vector2(x, y);
        }
        Boom.init = function () {
            Boom.size = new Vector2(100, 90);
            Boom.image = document.getElementById("boom");
            Boom.frameLength = 5;
            Boom.frameInterval = 60 / 1000;
        };
        Boom.prototype.update = function (dt) {
            this.position.x -= game.speed;
            this.cumulativeTime += dt;
            if (this.cumulativeTime >= Boom.frameInterval) {
                this.frame++;
                this.dirty = this.dirty || this.frame >= Boom.frameLength;
            }
        };
        Boom.prototype.draw = function (ctx) {
            ctx.drawImage(Boom.image, this.frame * Boom.size.x, 0, Boom.size.x, Boom.size.y, this.position.x, this.position.y, this.size.x, this.size.y);
        };
        return Boom;
    }());
    Fire.image = document.getElementById('fire');
    Boom.init();
    var game = new Game(canvax.width, canvax.height);
    console.log(game);
    var lastTime = 0;
    function animate(timeStamp) {
        var dt = (timeStamp - lastTime) / 1000;
        lastTime = timeStamp;
        game.update(dt);
        game.draw(ctx);
        requestAnimationFrame(animate);
    }
    animate(0);
});
