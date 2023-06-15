"use strict";
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
export const __esModule = true;
import { Vector2, Sprite } from "./a.js";
var playerImg = new Image();
playerImg.src = "dog.png";
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
var Player = /** @class */ (function (_super) {
    __extends(Player, _super);
    function Player(scene) {
        var _this = _super.call(this, new Vector2(100, scene.y - 100), new Vector2(0, 0), new Vector2(100, 100)) || this;
        _this.sceneSize = Vector2.copy(scene);
        _this.sprite = new Sprite(7, new Vector2(200, 181.83333), playerImg, 0.05, true);
        _this.state = 7 /* standing_right */;
        _this.orientation = 1 /* right */;
        return _this;
    }
    Player.prototype.draw = function (ctx) {
        var a = this.sprite.getXYWH();
        ctx.drawImage(this.sprite.image, a[0], a[1], a[2], a[3], this.position.x, this.position.y, this.size.x, this.size.y);
    };
    Player.prototype.update = function (dt) {
        _super.prototype.update.call(this, dt);
        if (this.position.x < 0) {
            this.position.x = 0;
        }
        else if (this.position.x + this.size.x > this.sceneSize.x) {
            this.position.x = this.sceneSize.x - this.size.x;
        }
        if (this.position.y < 0) {
            this.position.y = 0;
        }
        else if (this.position.y + this.size.y > this.sceneSize.y) {
            this.position.y = this.sceneSize.y - this.size.y;
        }
        this.sprite.tryMoveNextFrame(dt);
    };
    Player.prototype.handleInput = function (keysPressed) {
        if (this.orientation == 0 /* left */) {
            if (!this.isOnGround()) {
                this.velocity.y += Player.gravity;
                if (this.velocity.y > 0) {
                    this.setState(507 /* landing_left */);
                }
                if (keysPressed.indexOf('ArrowLeft') != -1 || keysPressed.indexOf('a') != -1) {
                    this.velocity.x = -100;
                }
                else if (keysPressed.indexOf('ArrowRight') != -1 || keysPressed.indexOf('d') != -1) {
                    this.setState(this.velocity.y > 0 ? 407 /* landing_right */ : 207 /* jumping_right */);
                    this.orientation = 1 /* right */;
                }
                else {
                    this.velocity.x = 0;
                }
            }
            else {
                if (keysPressed.indexOf('ArrowLeft') != -1 || keysPressed.indexOf('a') != -1) {
                    this.setState(709 /* running_left */);
                    this.velocity.x = -100;
                }
                else if (keysPressed.indexOf('ArrowRight') != -1 || keysPressed.indexOf('d') != -1) {
                    this.orientation = 1 /* right */;
                    this.setState(7 /* standing_right */);
                }
                else if (keysPressed.indexOf('ArrowDown') != -1 || keysPressed.indexOf('s') != -1) {
                    this.setState(905 /* sitting_left */);
                    this.velocity.x = 0;
                }
                else if (keysPressed.indexOf('ArrowUp') != -1 || keysPressed.indexOf('w') != -1) {
                    this.setState(307 /* jumping_left */);
                    this.velocity.y = Player.jumpVelocity;
                }
                else {
                    this.setState(107 /* standing_left */);
                    this.velocity.x = 0;
                }
            }
        }
        else {
            if (!this.isOnGround()) {
                this.velocity.y += Player.gravity;
                if (this.velocity.y > 0) {
                    this.setState(407 /* landing_right */);
                }
                if (keysPressed.indexOf('ArrowRight') != -1 || keysPressed.indexOf('d') != -1) {
                    this.velocity.x = 100;
                }
                else if (keysPressed.indexOf('ArrowLeft') != -1 || keysPressed.indexOf('a') != -1) {
                    this.setState(this.velocity.y > 0 ? 507 /* landing_left */ : 307 /* jumping_left */);
                    this.orientation = 0 /* left */;
                }
                else {
                    this.velocity.x = 0;
                }
            }
            else {
                if (keysPressed.indexOf('ArrowRight') != -1 || keysPressed.indexOf('d') != -1) {
                    this.setState(609 /* running_right */);
                    this.velocity.x = 100;
                }
                else if (keysPressed.indexOf('ArrowLeft') != -1 || keysPressed.indexOf('a') != -1) {
                    this.orientation = 0 /* left */;
                    this.setState(107 /* standing_left */);
                }
                else if (keysPressed.indexOf('ArrowDown') != -1 || keysPressed.indexOf('s') != -1) {
                    this.setState(805 /* sitting_right */);
                    this.velocity.x = 0;
                }
                else if (keysPressed.indexOf('ArrowUp') != -1 || keysPressed.indexOf('w') != -1) {
                    this.setState(207 /* jumping_right */);
                    this.velocity.y = Player.jumpVelocity;
                }
                else {
                    this.setState(7 /* standing_right */);
                    this.velocity.x = 0;
                }
            }
        }
    };
    Player.prototype.setState = function (state) {
        this.state = state;
        var a = state;
        this.sprite.counter.y = Math.floor(a / 100);
        this.sprite.totalFrame = a % 100;
    };
    Player.prototype.getState = function () {
        return this.state.toString();
    };
    Player.prototype.isOnGround = function () {
        return this.position.y + this.size.y >= this.sceneSize.y;
    };
    Player.jumpVelocity = -400;
    Player.gravity = 10;
    return Player;
}(Movable));
const _Player = Player;
export { _Player as Player };
//1800/9=
//2182/12=
