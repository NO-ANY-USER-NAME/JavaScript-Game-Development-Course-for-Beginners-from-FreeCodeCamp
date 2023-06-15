const canvas:HTMLCanvasElement=<HTMLCanvasElement>document.getElementById("C1");
const ctx:CanvasRenderingContext2D=<CanvasRenderingContext2D>canvas.getContext('2d');
canvas.width=window.innerWidth;
canvas.height=window.innerHeight;
const fullSceneButton:HTMLButtonElement=<HTMLButtonElement>document.getElementById("fullscenebutton");

interface Iupdate{
    update(dt:number):void;
}

interface Irestart{
    restart():void;
}

class Vector2{
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
            window.addEventListener('touchstart',e=>this.touch(e));
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

    public touch(e:TouchEvent):void{
        console.log(e);
    }


    public Reset():void{
        this.keys.length=0;
    }
}

abstract class Movable implements Iupdate{
    public position:Vector2;
    public velocity:Vector2;
    public size:Vector2;
    constructor(startPosition:Vector2,startVelocity:Vector2,size:Vector2){
        this.position=Vector2.copy(startPosition);
        this.velocity=Vector2.copy(startVelocity);
        this.size=Vector2.copy(size);
    }
    public update(dt:number):void{
        this.position=Vector2.add(this.position,Vector2.multiply(this.velocity,dt));
    }
    protected drawCollider(ctx:CanvasRenderingContext2D,color:string='black'):void{
        ctx.strokeStyle=color;
        ctx.beginPath();
        ctx.arc(this.position.x+this.size.x/2,this.position.y+this.size.y/2,this.size.x/2,0,Math.PI*2);
        ctx.stroke();
    }
}

class Background extends Movable implements Irestart{
    public static BackgroundImage:HTMLImageElement=new Image();
    public static assignImageSource(){
        this.BackgroundImage.src="background_single.png"
    }
    private sceneSize:Vector2;
    constructor(sceneSize:Vector2){
        super(new Vector2(0,0),new Vector2(-300,0),new Vector2(2400,700));
        this.sceneSize=Vector2.copy(sceneSize);
    }

    public draw(ctx:CanvasRenderingContext2D):void{
        ctx.drawImage(Background.BackgroundImage,this.position.x,this.position.y,this.size.x,this.size.y);
        ctx.drawImage(Background.BackgroundImage,this.position.x+this.size.x,this.position.y,this.size.x,this.size.y);

    }
    public update(dt:number):void{
        super.update(dt);
        if(this.position.x<0-this.size.x){
            this.position.x=0;
        }
    }
    public restart():void{
        this.position.x=0;
    }

}
enum SpriteFrameStatus{
    haveChanged=0,
    noChange=1,
    end=2
};
class Sprite{
    public counter:Vector2;
    private frameSize:Vector2;
    public frameHas:Vector2;
    private totalFrame:number;
    public image:HTMLImageElement;
    private changeInterval:number;
    private lastTime:number=0;
    private isRepeat:boolean;
    constructor(totalFrame:number,frameSize:Vector2,frameHasInRC:Vector2,image:HTMLImageElement,changeInterval:number=0,isRepeat:boolean=true){
        this.totalFrame=totalFrame;
        this.counter=new Vector2(0,0);
        this.image=image;
        this.frameHas=Vector2.copy(frameHasInRC);
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
            if(this.counter.x>=this.frameHas.x){
                ret=SpriteFrameStatus.end;
                this.counter.x=0;
            }
        }
        return ret;
    }

    public forceMoveNextFrame():SpriteFrameStatus{
        let ret:SpriteFrameStatus=SpriteFrameStatus.haveChanged;
        this.counter.x++;
        if(this.counter.x+this.counter.y*this.frameHas.x>=this.totalFrame){
            if(this.isRepeat){
                this.counter.x=0;
                this.counter.y=0;
            }
            ret=SpriteFrameStatus.end;
        }
        else if(this.counter.x>=this.frameHas.x){
            this.counter.x=0;
            this.counter.y++;
            if(this.counter.y>=this.frameHas.y){
                if(this.isRepeat){
                    this.counter.y=0;
                }
            }
        }
        return ret;
    }
}

class Player extends Movable implements Irestart{
    public static PlayerImage:HTMLImageElement=new Image();
    public static assignImageSource(){
        this.PlayerImage.src="player.png";
    }
    public static instance:Player|null=null;
    
    public sceneSize:Vector2;
    private sprite:Sprite;
    
    constructor(sceneSize:Vector2){
        super(new Vector2(20,sceneSize.y-200),new Vector2(0,0),new Vector2(200,200));
        this.sceneSize=Vector2.copy(sceneSize);
        this.sprite=new Sprite(16,new Vector2(200,200),new Vector2(9,2),Player.PlayerImage,0.05,true);
    }
    public draw(ctx:CanvasRenderingContext2D):void{
        this.drawCollider(ctx,'green');
        let a:number[]=this.sprite.getXYWH();
        ctx.drawImage(this.sprite.image,a[0],a[1],a[2],a[3],this.position.x,this.position.y,this.size.x,this.size.y);
    }
    public update(dt:number):void{
        super.update(dt);
        if(this.position.x<0){this.position.x=0;}
        else if(this.position.x>this.sceneSize.x-this.size.x){this.position.x=this.sceneSize.x-this.size.x;}
        if(this.position.y<0){this.position.y=0;}
        else if(this.position.y>this.sceneSize.y-this.size.y){this.position.y=this.sceneSize.y-this.size.y;}

        this.sprite.tryMoveNextFrame(dt);
        if(InputHandle.instance!=null){
            this.changeSpeed(InputHandle.instance.keys,dt);
        }
    }
    public changeSpeed(keys:string[],dt:number):void{
        if(keys.indexOf('ArrowRight')!=-1||keys.indexOf('d')!=-1){
            this.velocity.x=200;
        }
        else if(keys.indexOf('ArrowLeft')!=-1||keys.indexOf('a')!=-1){
            this.velocity.x=-200;
        }
        else{
            this.velocity.x=0;
        }
        if(this.onGround()){
            if(keys.indexOf('ArrowUp')!=-1||keys.indexOf('w')!=-1){
                this.velocity.y=-700;
                this.sprite.counter.y=1;
                this.sprite.frameHas.x=7;
            }
            else{
                this.velocity.y=0;
                this.sprite.frameHas.x=9;
                this.sprite.counter.y=0;
            }
        }
        else{
            this.velocity.y+=(700*dt);
        }
    }

    private onGround():boolean{
        return this.position.y>=this.sceneSize.y-this.size.y;
    }

    public restart():void{
        this.sprite.counter.y=0;
        this.sprite.counter.x=0;
        this.sprite.frameHas.x=9;

        this.position.x=20;
        this.position.y=sceneSize.y-200;

        this.velocity.x=0;
        this.velocity.y=0;
    }
}


class Enemy extends Movable{
    public static EnemyImage:HTMLImageElement=new Image();
    public static assignImageSource(){
        this.EnemyImage.src="enemy_worm.png";
    }
    private sprite:Sprite;
    private sceneSize:Vector2;
    public isDirty:boolean=false;
    constructor(sceneSize:Vector2){
        super(new Vector2(sceneSize.x,0),new Vector2(-(Math.random()*100+100),0),new Vector2(0,0));
        let factor:number=(Math.random()*0.5+0.3)
        let height:number=171*factor;
        let width:number=1374/6*factor;
        this.position.y=sceneSize.y-height;
        this.size.x=width;
        this.size.y=height;
        this.sprite=new Sprite(6,new Vector2((1374/6),171),new Vector2(6,1),Enemy.EnemyImage,0.05,true);
        this.sceneSize=Vector2.copy(sceneSize);
    }
    update(dt:number):void{
        super.update(dt);
        if(this.position.x+this.size.x<0){
            this.isDirty=true;
            score++;
        }
        this.sprite.tryMoveNextFrame(dt);
    }
    draw(ctx:CanvasRenderingContext2D):void{
        this.drawCollider(ctx,'red');
        let a:number[]=this.sprite.getXYWH();
        ctx.drawImage(this.sprite.image,a[0],a[1],a[2],a[3],this.position.x,this.position.y,this.size.x,this.size.y);
    }

}

class EnemyManager implements Iupdate,Irestart{
    private enemies:Enemy[];
    public static instance:EnemyManager|null;
    private lastTime:number;
    private spawnInterval:number;
    constructor(spawnInterval:number){
        if(EnemyManager.instance==null){
            EnemyManager.instance=this;
            this.enemies=[];
            this.spawnInterval=spawnInterval;
            this.lastTime=this.spawnInterval;
        }
        else{
            return;
        }
    }
    public update(dt:number):void{
        this.enemies.forEach(enemy=>{enemy.update(dt);enemy.draw(ctx)});
        this.lastTime+=dt;
        if(this.lastTime>=this.spawnInterval){
            this.lastTime-=this.spawnInterval;
            this.enemies.push(new Enemy(sceneSize));
        }
        this.enemies=this.enemies.filter(enemy=>!enemy.isDirty);
    }
    public detectCollision(centerX:number,centerY:number,radius:number):boolean{
        for(let i:number=0;i<this.enemies.length;i++){
            const enemy:Enemy=this.enemies[i];
            let dx:number=centerX-(enemy.position.x+enemy.size.x/2);
            let dy:number=centerY-(enemy.position.y+enemy.size.y/2);
            let dist=radius+enemy.size.x/2;
            if(dx*dx+dy*dy<dist*dist){
                return true;
            }
        }
        return false;
    }
    public restart():void{
        this.enemies.length=0;
        this.lastTime=this.spawnInterval;
    }
}

Player.assignImageSource();
Enemy.assignImageSource();
Background.assignImageSource();

const sceneSize:Vector2=new Vector2(canvas.width,canvas.height);
const inputHandler:InputHandle=new InputHandle();
const player:Player=new Player(sceneSize);
const enemyManager:EnemyManager=new EnemyManager(4);

player.draw(ctx);
const background:Background=new Background(sceneSize);

var score:number=0;

function drawScore(ctx:CanvasRenderingContext2D):void{
    ctx.textAlign="left";
    ctx.fillStyle='black';
    ctx.font='40px Helvetica';
    ctx.fillText('Score: '+score,20,50);
    ctx.fillStyle='white';
    ctx.fillText('Score: '+score,23,53);
}

function restartGame():void{
    isGameover=false;
    score=0;
    enemyManager.restart();
    player.restart();
    background.restart();
    animate(0);
}

function toggleFullScece():void{
    if(document.fullscreenElement==null){
        try{
            document.body.requestFullscreen();
        }catch{
            alert("cannot enter full scene mode");
        }
        //canvas.requestFullscreen().catch(err=>{alert('cant enter full scene ${err.message}')});
    }
    else{
        document.exitFullscreen();
    }
}
fullSceneButton.addEventListener('click',function(e:MouseEvent){
    toggleFullScece();
});

var isGameover:boolean=false;
var lastTime:number=0;
function animate(timestamp:number):void{
    if(isGameover){
        ctx.textAlign='center';
        ctx.fillStyle='black';
        ctx.fillText("Game Over!\nPress Enter To Restart",canvas.width/2-3,canvas.height/2-3);
        ctx.fillStyle='red';
        ctx.fillText("Game Over!\nPress Enter To Restart",canvas.width/2,canvas.height/2);
    }
    else{
        ctx.clearRect(0,0,canvas.width,canvas.height);
        var dt:number=timestamp-lastTime;
        dt/=1000;
        lastTime=timestamp;
        background.update(dt);
        background.draw(ctx);
        enemyManager.update(dt);
        player.update(dt);
        player.draw(ctx);
        drawScore(ctx);
        isGameover=enemyManager.detectCollision(player.position.x+player.size.x/2,player.position.y+player.size.y/2,player.size.x/2);
        requestAnimationFrame(animate);
    }
}

window.addEventListener('DOMContentLoaded',function():void{
    animate(0);
});
