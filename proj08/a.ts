
import {Player,PlayerState} from "./player.js";
const canvas:HTMLCanvasElement=<HTMLCanvasElement>document.getElementById("C1");
const ctx:CanvasRenderingContext2D=<CanvasRenderingContext2D>canvas.getContext('2d');
canvas.width=window.innerWidth;
canvas.height=window.innerHeight;
const fullSceneButton:HTMLButtonElement=<HTMLButtonElement>document.getElementById("fullscenebutton");

export interface Iupdate{
    update(dt:number):void;
}

interface Irestart{
    restart():void;
}

export class Vector2{
    public x:number;
    public y:number;
    constructor(x:number,y:number){
        this.x=x;
        this.y=y;
    }

    static add(a:Vector2,b:Vector2):Vector2{
        return new Vector2(a.x+b.x,a.y+b.y);
    }
    
    static multiply(a:Vector2,b:number):Vector2{
        return new Vector2(a.x*b,a.y*b);
    }
    
    static copy(a:Vector2):Vector2{
        return new Vector2(a.x,a.y);
    }
}

class InputHandle{
    public keys:string[];
    public static instance:InputHandle|null=null;
    constructor(){
        if(InputHandle.instance==null){
            InputHandle.instance=this;
            this.keys=[];
            window.addEventListener('keydown',
            keyboard=>this.addKey(keyboard));
            window.addEventListener('keyup',
            keyboard=>this.removeKey(keyboard));
        }
        else{
            return;
        }
    }
    
    public addKey(keyboard:KeyboardEvent):void{
        let keyPressed:string=keyboard.key;
        //console.log(keyPressed);
        if( keyPressed=='ArrowUp'||keyPressed=='ArrowDown'||keyPressed=='ArrowLeft'||keyPressed=='ArrowRight'||
        keyPressed=='w'||keyPressed=='s'||keyPressed=='a'||keyPressed=='d'){
            if(this.keys.indexOf(keyPressed)==-1){
                this.keys.push(keyPressed);
            }
        }
        else if(keyPressed=='Enter'&&isGameover){
            restartGame();
        }
        //console.log(this.keys);
    }
    
    public removeKey(keyboard:KeyboardEvent):void{
        let keyPressed:string=keyboard.key;
        if( keyPressed=='ArrowUp'||keyPressed=='ArrowDown'||keyPressed=='ArrowLeft'||keyPressed=='ArrowRight'||
        keyPressed=='w'||keyPressed=='s'||keyPressed=='a'||keyPressed=='d'){
            this.keys.splice(this.keys.indexOf(keyPressed),1);
        }
        //console.log(this.keys);
    }
    
    public Reset():void{
        this.keys.length=0;
    }
}

export const enum SpriteFrameStatus{
    haveChanged=0,
    noChange=1,
    end=2
};
export class Sprite{
    public counter:Vector2;
    private frameSize:Vector2;
    public totalFrame:number;
    public image:HTMLImageElement;
    private changeInterval:number;
    private lastTime:number=0;
    private isRepeat:boolean;
    constructor(totalFrame:number,frameSize:Vector2,image:HTMLImageElement,changeInterval:number=0,isRepeat:boolean=true){
        this.totalFrame=totalFrame;
        this.counter=new Vector2(0,0);
        this.image=image;
        this.frameSize=Vector2.copy(frameSize);
        this.changeInterval=changeInterval;
        this.isRepeat=isRepeat;
    }
    
    public getXYWH():number[]{
        return [this.counter.x*this.frameSize.x,this.counter.y*this.frameSize.y,this.frameSize.x,this.frameSize.y];
    }
    
    public tryMoveNextFrame(dt:number):SpriteFrameStatus{
        let ret:SpriteFrameStatus=SpriteFrameStatus.noChange;
        this.lastTime+=dt;
        
        if(this.lastTime>=this.changeInterval){
            ret=SpriteFrameStatus.haveChanged;
            this.lastTime-=this.changeInterval;
            ++this.counter.x;
            if(this.counter.x>=this.totalFrame){
                ret=SpriteFrameStatus.end;
                this.counter.x=0;
            }
        }
        return ret;
    }
}

const sceneSize:Vector2=new Vector2(canvas.width,canvas.height);
const player:Player=new Player(sceneSize);
const input:InputHandle=new InputHandle();
var isGameover:boolean=false;

function restartGame():void{
    
}

function drawStatusText(context:CanvasRenderingContext2D,input:InputHandle){
    context.font='30px Helvetica';
    let keys:string="";
    for(let i=0;i<input.keys.length;i++){
        keys+=input.keys[i];
    }
    context.fillText('keys pressed: '+keys,20,50);
    context.fillText('player state: '+player.getState(),20,100);
}

var lastTime=0;
function animate(timestamp:number):void{
    let dt:number=(timestamp-lastTime)/1000;
    lastTime=timestamp;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    drawStatusText(ctx,input);
    player.update(dt);
    player.draw(ctx);
    player.handleInput(input.keys);
    requestAnimationFrame(animate);
}

window.addEventListener('DOMContentLoaded',function():void{
    const loading:HTMLHeadingElement=<HTMLHeadingElement>document.getElementById("loading");
    loading.style.display='none';
    animate(0);
});
