const canvas:HTMLCanvasElement=<HTMLCanvasElement>document.getElementById("Canvas1");
var canvasPos:DOMRect=<DOMRect>canvas.getBoundingClientRect();
const ctx:CanvasRenderingContext2D=<CanvasRenderingContext2D>canvas.getContext('2d');

canvas.width=window.innerWidth;
canvas.height=window.innerHeight;

ctx.font='30px Impact';

const wormImage:HTMLImageElement=new Image(),spiderImage:HTMLImageElement=new Image(),ghostImage:HTMLImageElement=new Image();
wormImage.src="enemy_worm.png";
spiderImage.src="enemy_spider.png";
ghostImage.src="enemy_ghost.png";



class Vector2{
    public x:number;
    public y:number;
    constructor(_x:number,_y:number){
        this.x=_x;
        this.y=_y;
    }
    
    static add(a:Vector2,b:Vector2):Vector2{
        return new Vector2(a.x+b.x,a.y+b.y);
    }
    
    static substract(a:Vector2,b:Vector2):Vector2{
        return new Vector2(a.x-b.x,a.y-b.y);
    }
    
    static multiple(a:Vector2,b:number):Vector2{
        return new Vector2(a.x*b,a.y*b);
    }
}

interface Iupdate{
    update(dt:number):void;
}
interface Idraw{
    draw(ctx:CanvasRenderingContext2D):void;
}

interface hasSprite{
    sprite:Sprite;
}

enum SpriteFrameStatus{
    haveChanged=0,
    noChange=1,
    end=2
};
class Sprite{
    private currentFrame:number=0;
    private frameHas:number;
    public image:HTMLImageElement;
    private size:Vector2;
    private changeInterval:number;
    private lastTime:number=0;
    private isRepeat:boolean;
    constructor(width:number,height:number,image:HTMLImageElement,changeInterval:number=0,isRepeat:boolean,frameHas:number){
        this.image=image;
        this.size=new Vector2(width,height);
        this.changeInterval=changeInterval;
        this.isRepeat=isRepeat;
        this.frameHas=frameHas;
    }
    
    public getXYWH():number[]{
        return [this.currentFrame*this.size.x,0,this.size.x,this.size.y];
    }
    
    public tryMoveNextFrame(dt:number):SpriteFrameStatus{
        let ret:SpriteFrameStatus=SpriteFrameStatus.noChange;
        this.lastTime+=dt;
        
        if(this.lastTime>=this.changeInterval){
            this.lastTime-=this.changeInterval;
            ++this.currentFrame;
            ret=SpriteFrameStatus.haveChanged;
            if(this.currentFrame>=this.frameHas){
                if(this.isRepeat){
                    this.currentFrame=0;
                }
                ret=SpriteFrameStatus.end;
            }
        }
        return ret;
    }
}

const ghostSprite:Sprite=new Sprite(1566/6,209,ghostImage,0.05,true,6);
const spiderSprite:Sprite=new Sprite(1860/6,175,spiderImage,0.05,true,6);
const wormSprite:Sprite=new Sprite(1374/6,171,wormImage,0.05,true,6);

abstract class Movable{
    public position:Vector2;
    public velocity:Vector2;
    public size:Vector2;
    constructor(x:number,y:number,width:number,height:number,xSpeed:number,ySpeed:number){
        this.position=new Vector2(x,y);
        this.velocity=new Vector2(xSpeed,ySpeed);
        this.size=new Vector2(width,height);
    }
    update(dt:number){
        this.position=Vector2.add(this.position,Vector2.multiple(this.velocity,dt));
    }
}

abstract class Enemy extends Movable implements hasSprite,Idraw,Iupdate{
    public sprite:Sprite;
    public color:string='red';
    public isDirty:boolean=false;
    constructor(sx:number,sy:number,width:number,height:number,speedX:number=0,speedY:number=0,sprite:Sprite|null=null){
        super(sx,sy,width,height,speedX,speedY);
        if(sprite!=null){
            this.sprite=<Sprite>sprite;
        }
    }
    public update(dt:number):void{
        super.update(dt);
        //ctx.fillStyle=this.color;
        //ctx.fillRect(this.position.x,this.position.y,this.size.x,this.size.y);
        if(this.position.x+this.size.x<=0){
            this.isDirty=true;
        }
    }
    public draw(_ctx:CanvasRenderingContext2D):void{
        let a:number[]=this.sprite.getXYWH();
        _ctx.drawImage(this.sprite.image,a[0],a[1],a[2],a[3],this.position.x,this.position.y,this.size.x,this.size.y);
    };
}

class Spider extends Enemy{
    private top:number;
    private bottom:number;
    constructor(sx:number,sy:number,width:number,height:number,speedX:number=0,speedY:number=0){
        super(sx,sy,width,height,speedX,speedY,new Sprite(1860/6,175,spiderImage,0.05,true,6));
    }
    public setTopBottom(minHeight:number=0,maxHeight:number){
        this.top=minHeight;
        this.bottom=maxHeight-this.size.y;
    }
    public update(dt:number):void{
        super.update(dt);
        this.sprite.tryMoveNextFrame(dt);
        if(this.position.y+this.velocity.y<this.top){
            this.velocity.y=-this.velocity.y;
            this.velocity.y*=2;
        }
        else if(this.position.y+this.velocity.y>this.bottom){
            this.velocity.y=-this.velocity.y;
            this.velocity.y/=2;
        }
        this.position.y+=this.velocity.y;
    }
    public draw(ctx:CanvasRenderingContext2D):void{
        ctx.beginPath();
        ctx.moveTo(this.position.x,0);
        ctx.lineTo(this.position.x+this.size.x/2,this.position.y+10);
        ctx.stroke();
        super.draw(ctx);
    }
}

class Worm extends Enemy{
    constructor(sx:number,sy:number,width:number,height:number,speedX:number=0,speedY:number=0,sprite:Sprite|null=null){
        super(sx,sy,width,height,speedX,speedY,new Sprite(1374/6,171,wormImage,0.05,true,6));
    }
    public update(dt:number):void{
        super.update(dt);
        this.sprite.tryMoveNextFrame(dt);
    }
    public draw(ctx:CanvasRenderingContext2D):void{
        super.draw(ctx);
    }
}

class Ghost extends Enemy{
    private angle:number=0;
    constructor(sx:number,sy:number,width:number,height:number,speedX:number=0,speedY:number=0){
        super(sx,sy,width,height,speedX,speedY,new Sprite(1566/6,209,ghostImage,0.05,true,6));
    }
    public update(dt:number):void{
        super.update(dt);
        this.position.y+=Math.sin(this.angle)*this.velocity.y;
        this.angle+=dt*2;
        this.sprite.tryMoveNextFrame(dt);
    }
    public draw(ctx:CanvasRenderingContext2D):void{
        ctx.globalAlpha=0.4;
        super.draw(ctx);
        ctx.globalAlpha=1;
    }
}

class EnemyManager implements Iupdate{
    private ctx:CanvasRenderingContext2D;
    public ctxWidth:number;
    public ctxHeight:number;
    public enemies:Enemy[];
    private lastTime:number=0;
    private timeInterval:number;
    constructor(ctx:CanvasRenderingContext2D,w:number,h:number,createInterval:number=0.5/*in sceonds*/ ){
        this.ctx=ctx;
        this.ctxHeight=h;
        this.ctxWidth=w;
        this.enemies=[];
        this.timeInterval=createInterval;
    }
    public update(dt:number):void{
        this.lastTime+=dt;
        if(this.lastTime>=this.timeInterval){
            this.lastTime-=this.timeInterval;
            let chance:number=Math.random();
            if(chance<0.3333){
                let top:number=0;
                let bottom:number=this.ctxHeight;
                let spider:Spider=new Spider(manager.ctxWidth,Math.random()*(manager.ctxHeight-100),100,100,Math.random()*-100-20,Math.random()*2.5+3);
                spider.setTopBottom(top,bottom*(Math.random()*0.5+0.3));
                this.addNewEnemy(spider);
            }
            else if(chance<0.6666){
                this.addNewEnemy(new Worm(manager.ctxWidth,manager.ctxHeight-100,100,100,Math.random()*-100-20,0));
            }
            else{
                this.addNewEnemy(new Ghost(manager.ctxWidth,Math.random()*(manager.ctxHeight-300),100,100,Math.random()*-100-20,Math.random()*4.5));
            }
        }
        ctx.clearRect(0,0,this.ctxWidth,this.ctxHeight);
        this.enemies.forEach(enemy=>{
            enemy.update(dt);
            enemy.draw(ctx);
        });
        this.enemies=this.enemies.filter(enemy=>!enemy.isDirty);
        //console.log(this.enemies.length);
    }
    public addNewEnemy(enemy:Enemy):void{
        this.enemies.push(enemy);
        this.enemies.sort(function(a:Enemy,b:Enemy):number{
            return a.position.y-b.position.y;
        });
    }
    public getRandomY(height:number=0):number{
        return Math.random()*(this.ctxHeight-height);
    }
}

var lastTime:number=0;
var manager:EnemyManager=new EnemyManager(ctx,canvas.width,canvas.height);

function animate(timestamp:number):void{
    let dt:number=timestamp-lastTime;
    lastTime=timestamp;
    manager.update(dt/1000);
    requestAnimationFrame(animate);
}

document.addEventListener('DOMContentLoaded',function():void{
    animate(0);
});