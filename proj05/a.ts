const canvas:HTMLCanvasElement=<HTMLCanvasElement>document.getElementById("Canvas1");
const collisionCanvas:HTMLCanvasElement=<HTMLCanvasElement>document.getElementById("collision");
var canvasPos:DOMRect=<DOMRect>canvas.getBoundingClientRect();
const ctx:CanvasRenderingContext2D=<CanvasRenderingContext2D>canvas.getContext('2d');
const collisionCtx:CanvasRenderingContext2D=<CanvasRenderingContext2D>collisionCanvas.getContext('2d');

canvas.width=window.innerWidth;
canvas.height=window.innerHeight;

collisionCanvas.width=window.innerWidth;
collisionCanvas.height=window.innerHeight;

ctx.font='30px Impact';
var ravenImage:HTMLImageElement=new Image();
ravenImage.src="raven.png";
var ExplosionImage:HTMLImageElement=new Image();
ExplosionImage.src="boom.png";

var timeToNextRaven:number=0;
var ravenInterval:number=1000;
var lastTime:number=0;

var score:number=0;
var live:number=3;

interface Iupdate{
    update(dt:number):void;
}

class Vector3{
    public x:number;
    public y:number;
    public z:number;
    constructor(_x:number,_y:number,_z:number){
        this.x=_x;
        this.y=_y;
        this.z=_z;
    }
}

class Sprite{
    public width:number;
    public height:number;
    public image:HTMLImageElement;
    private frame:number;
    private frameHas:number;
    private changeFrameInterval:number;
    private isRepeat:boolean;
    private time:number;
    constructor(_width:number,_height:number,_image:HTMLImageElement,_frameHas:number,_interval:number,_isRepeat:boolean){
        this.width=_width;
        this.height=_height;
        this.image=_image;
        this.frame=0;
        this.frameHas=_frameHas;
        this.changeFrameInterval=_interval;
        this.time=0;
        this.isRepeat=_isRepeat;
    }
    public tryMoveNextFrame(dt:number):number{
        let ret:number=0;
        this.time+=dt;
        if(this.time>this.changeFrameInterval){
            this.time-=this.changeFrameInterval;
            ++this.frame;
            if(this.frame==this.frameHas){
                ret=2;
                if(this.isRepeat){
                    this.frame=0;
                }
            }
            else{
                ret=1;
            }
        }
        return ret;
    }
    public getSXY():number[]{
        return [this.frame*this.width,0];
    }
}


class Raven implements Iupdate{
    private directionX:number;
    private directionY:number;
    public isDirty:boolean;
    private sprite:Sprite;
    public position:Vector3;
    public hitboxColor:number[];
    public color:string;
    constructor(){
        this.directionX=Math.random()*5+3;
        this.directionY=Math.random()*5-2.5;
        this.isDirty=false;
        this.sprite=new Sprite(271,194,ravenImage,5,150,true);
        this.position=new Vector3(canvas.width,Math.random()*(canvas.height-this.sprite.height),Math.random()+0.35);
   
        if(this.position.z>0.8){
            this.position.z=0.8
        }
        this.hitboxColor=[Math.floor(Math.random()*255),Math.floor(Math.random()*255),Math.floor(Math.random()*255)];
        this.color='rgb('+String(this.hitboxColor[0])+','+String(this.hitboxColor[1])+','+String(this.hitboxColor[2])+')';
    }
    update(dt:number){
        this.position.x-=this.directionX;
        this.position.y+=this.directionY;
        if(this.position.y<0||this.position.y>canvas.height-this.sprite.height*this.position.z){
            this.directionY=-this.directionY;
        }
        let a=this.sprite.getSXY();
        
        collisionCtx.fillStyle=this.color;
        collisionCtx.fillRect(this.position.x,this.position.y,this.sprite.width*this.position.z,this.sprite.height*this.position.z);
        
        ctx.drawImage(this.sprite.image,a[0],a[1],this.sprite.width,this.sprite.height,this.position.x,this.position.y,this.sprite.width*this.position.z,this.sprite.height*this.position.z);
        if(this.sprite.tryMoveNextFrame(dt)>0){
            particles.push(new Particle(this.position,this.color));
        }
        
        if(this.position.x+this.sprite.width*this.position.z<0){
            this.isDirty=true;
            live--;
        }
        
    }
}


class Explosion implements Iupdate{
    private position:Vector3;
    private sprite:Sprite;
    public isDirty:boolean;

    constructor(_x:number,_y:number,_z:number){
        this.position=new Vector3(_x,_y,_z);
        this.sprite=new Sprite(200,179,ExplosionImage,5,50,false);
        this.isDirty=false;
    }
    
    update(dt:number){
        let a:number[]=this.sprite.getSXY();
        ctx.drawImage(this.sprite.image,a[0],a[1],this.sprite.width,this.sprite.height,this.position.x,this.position.y,this.sprite.width*this.position.z,this.sprite.height*this.position.z);
        this.isDirty=this.sprite.tryMoveNextFrame(dt)==2||this.isDirty;
    }
}

class Particle implements Iupdate{
    public position:Vector3;
    private color:string;
    private radius:number;
    private maxRadius:number;
    public isDirty:boolean;
    private speedX:number;
    constructor(vector3:Vector3,color:string){
        this.position={...vector3};
        this.position.x+=this.position.x/3;
        this.position.y+=this.position.y/2;
        this.color=color;
        this.radius=Math.random()*this.position.z/3;
        this.maxRadius=Math.random()*10+15;
        this.isDirty=false;
        this.speedX=Math.random()*1+0.5;
    }
    update(dt:number){
        //console.log(this.radius);
        if(this.radius>this.maxRadius){
            this.isDirty=true;
        }
        else{
            ctx.save();
            ctx.globalAlpha=1-(this.radius/this.maxRadius);
            ctx.beginPath();
            ctx.fillStyle=this.color;
            ctx.arc(this.position.x,this.position.y,this.radius,0,Math.PI*2);
            ctx.fill();
            this.position.x+=this.speedX;
            this.radius+=0.2;
            ctx.restore();
        }
    }

}

var ravens:Raven[]=[];
var explosions:Explosion[]=[];
var particles:Particle[]=[];


window.addEventListener('click',ClickRaven);

function ClickRaven(e:MouseEvent):void{
    if(live<=0)return;
    const color=collisionCtx.getImageData(e.x,e.y,1,1);
    const pc=color.data;
    for(let i=0;i<ravens.length;i++){
        if(ravens[i].hitboxColor[0]===pc[0]&&ravens[i].hitboxColor[1]===pc[1]&&ravens[i].hitboxColor[2]===pc[2]){
            ravens[i].isDirty=true;
            ++score;
            explosions.push(new Explosion(ravens[i].position.x,ravens[i].position.y,ravens[i].position.z));
            break;
        }
    }
}

function drawScore(){
    const sx:number=20,sy:number=40,offset:number=4;
    ctx.fillStyle='black';
    ctx.fillText('Score: '+score,sx-offset,sy-offset);
    ctx.fillStyle='white';
    ctx.fillText('Score: '+score,sx,sy);
}

function drawLive(){
    const sx:number=20,sy:number=80,offset:number=4;
    ctx.fillStyle='black';
    ctx.fillText('live: '+live,sx-offset,sy-offset);
    ctx.fillStyle='white';
    ctx.fillText('live: '+live,sx,sy);
}

function drawGameOverFrame(){
    ctx.textAlign='center';
    ctx.fillStyle='black';
    ctx.fillText(('Game Over! score '+score.toString()),canvas.width/2,canvas.height/2);
    ctx.fillStyle='white';
    ctx.fillText(('Game Over! score '+score.toString()),canvas.width/2+4,canvas.height/2+4);
}

function Animate(timestamp:number){
    if(live<=0){
        drawGameOverFrame();
    }
    else{
        let dt:number=timestamp-lastTime;
        lastTime=timestamp;
        timeToNextRaven=timeToNextRaven+dt;
    
        if(timeToNextRaven>ravenInterval){
            timeToNextRaven-=ravenInterval;
            ravens.push(new Raven());
            ravens.sort(function(a:Raven,b:Raven):number{
                return a.position.z-b.position.z;
            });
        }
        collisionCtx.clearRect(0,0,collisionCanvas.width,collisionCanvas.height);
        ctx.clearRect(0,0,canvas.width,canvas.height);
        drawScore();
        drawLive();
        [,...particles,...ravens,...explosions].forEach(raven=>raven.update(dt));
        ravens=ravens.filter(raven=>!raven.isDirty);
        explosions=explosions.filter(explode=>!explode.isDirty);
        particles=particles.filter(particle=>!particle.isDirty);
    }
    requestAnimationFrame(Animate);
}
Animate(0);