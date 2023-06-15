"use strict";
export const __esModule = true;
import { Player } from "./player.js";
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
const _Vector2 = Vector2;
export { _Vector2 as Vector2 };
var InputHandle = /** @class */ (function () {
    function InputHandle() {
        var _this = this;
        if (InputHandle.instance == null) {
            InputHandle.instance = this;
            this.keys = [];
            window.addEventListener('keydown', function (keyboard) { return _this.addKey(keyboard); });
            window.addEventListener('keyup', function (keyboard) { return _this.removeKey(keyboard); });
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
    InputHandle.prototype.Reset = function () {
        this.keys.length = 0;
    };
    InputHandle.instance = null;
    return InputHandle;
}());
;
var Sprite = /** @class */ (function () {
    function Sprite(totalFrame, frameSize, image, changeInterval, isRepeat) {
        if (changeInterval === void 0) { changeInterval = 0; }
        if (isRepeat === void 0) { isRepeat = true; }
        this.lastTime = 0;
        this.totalFrame = totalFrame;
        this.counter = new Vector2(0, 0);
        this.image = image;
        this.frameSize = Vector2.copy(frameSize);
        this.changeInterval = changeInterval;
        this.isRepeat = isRepeat;
    }
    Sprite.prototype.getXYWH = function () {
        return [this.counter.x * this.frameSize.x, this.counter.y * this.frameSize.y, this.frameSize.x, this.frameSize.y];
    };
    Sprite.prototype.tryMoveNextFrame = function (dt) {
        var ret = 1 /* noChange */;
        this.lastTime += dt;
        if (this.lastTime >= this.changeInterval) {
            ret = 0 /* haveChanged */;
            this.lastTime -= this.changeInterval;
            ++this.counter.x;
            if (this.counter.x >= this.totalFrame) {
                ret = 2 /* end */;
                this.counter.x = 0;
            }
        }
        return ret;
    };
    return Sprite;
}());
const _Sprite = Sprite;
export { _Sprite as Sprite };
var sceneSize = new Vector2(canvas.width, canvas.height);
var player = new Player(sceneSize);
var input = new InputHandle();
var isGameover = false;
function restartGame() {
}
function drawStatusText(context, input) {
    context.font = '30px Helvetica';
    var keys = "";
    for (var i = 0; i < input.keys.length; i++) {
        keys += input.keys[i];
    }
    context.fillText('keys pressed: ' + keys, 20, 50);
    context.fillText('player state: ' + player.getState(), 20, 100);
}
var lastTime = 0;
function animate(timestamp) {
    var dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawStatusText(ctx, input);
    player.update(dt);
    player.draw(ctx);
    player.handleInput(input.keys);
    requestAnimationFrame(animate);
}
window.addEventListener('DOMContentLoaded', function () {
    var loading = document.getElementById("loading");
    loading.style.display = 'none';
    animate(0);
});
