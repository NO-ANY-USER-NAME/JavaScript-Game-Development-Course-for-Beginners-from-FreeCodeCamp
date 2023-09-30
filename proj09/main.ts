window.addEventListener('load',function(){

const canvax:HTMLCanvasElement=<HTMLCanvasElement>document.getElementById("canvas1");
const ctx:CanvasRenderingContext2D=<CanvasRenderingContext2D>canvax.getContext('2d');
canvax.width=500;
canvax.height=500;

var debugMode:boolean=false;

class Vector2{
    public x:number;
    public y:number;
    constructor(x:number,y:number){
        this.x=x;
        this.y=y;
    }

    public copy():Vector2{
        return new Vector2(this.x,this.y);
    }

    public static zero():Vector2{
        return new Vector2(0,0);
    }

    public static add(a:Vector2,b:Vector2){
        return new Vector2(a.x+b.x,a.y+b.y);
    }
}

class BackgroundLayer{
    private game:Game;
    private size:Vector2;
    private speed:number;
    private image:HTMLImageElement;
    private position:Vector2=Vector2.zero();

    constructor(g:Game,speed:number,size:Vector2,image:HTMLImageElement){
        this.game=g;
        this.size=size;
        this.speed=speed;
        this.image=image;
    }

    update(dt:number):void{
        if(this.position.x<-this.size.x){
            this.position.x=0;
        }
        else{
            this.position.x-=dt*this.speed*this.game.speed;
        }
    }

    draw(ctx:CanvasRenderingContext2D):void{
        ctx.drawImage(this.image,this.position.x+this.size.x,this.position.y,this.size.x,this.size.y);
        ctx.drawImage(this.image,this.position.x,this.position.y,this.size.x,this.size.y);
    }
}

class Background{
    private game:Game;
    private size:Vector2=new Vector2(1667,500);
    private layer:BackgroundLayer[]=[];
    constructor(g:Game){
        this.game=g;
        this.layer.push(new BackgroundLayer(g,200*0.25,this.size.copy(),<HTMLImageElement>document.getElementById("layer1")));
        this.layer.push(new BackgroundLayer(g,300*0.25,this.size.copy(),<HTMLImageElement>document.getElementById("layer2")));
        this.layer.push(new BackgroundLayer(g,500*0.25,this.size.copy(),<HTMLImageElement>document.getElementById("layer3")));
        this.layer.push(new BackgroundLayer(g,700*0.25,this.size.copy(),<HTMLImageElement>document.getElementById("layer4")));
        this.layer.push(new BackgroundLayer(g,800*0.25,this.size.copy(),<HTMLImageElement>document.getElementById("layer5")));
    }

    public update(dt:number):void{
        for(let i=0;i<this.layer.length;i++){
            this.layer[i].update(dt);
        }
    }

    public draw(ctx:CanvasRenderingContext2D):void{
        for(let i=0;i<this.layer.length;i++){
            this.layer[i].draw(ctx);
        }
    }
}

class Game{
    public static liveImage:HTMLImageElement;
    public width:number;
    public height:number;
    public groundMargin:number=50;
    public speed:number=1;
    public particles:Particle[]=[];

    private player:Player;
    private input:InputHandler;
    private background:Background;
    private enemies:Enemy[]=[];
    private lives:number=5;

    public booms:Boom[]=[];

    private enemyTimer:number=0;
    private enemyInterval:number=1;
    private score:number=0;

    private fontSize:number=30;
    private fontFamily:string="Helvetica";
    private fontColor:string="blue";
    private gameover:boolean=false;
    private timePassed:number=0;
    private maxPlayTime:number=60;

    constructor(w:number,h:number){
        this.width=w;
        this.height=h;
        this.player=new Player(this);
        this.input=new InputHandler();
        this.background=new Background(this);
    }

    public update(dt:number):void{
        if(this.gameover){
            return;
        }
        this.timePassed+=dt;
        if(this.timePassed>=this.maxPlayTime){
            this.gameover=true;
            this.timePassed=this.maxPlayTime;
            return;
        }
        this.enemyTimer+=dt;
        if(this.enemyTimer>=this.enemyInterval){
            this.enemyTimer-=this.enemyInterval+(Math.random()-0.5);
            this.enemies.push(this.spawnEnemy());
        }

        for(let i:number =0;i<this.enemies.length;i++){
            this.enemies[i].update(dt);
        }
        this.enemies=this.enemies.filter(e=>!e.dirty);

        for(let i:number =0;i<this.particles.length;i++){
            this.particles[i].update(dt);
        }
        this.particles=this.particles.filter(p=>!p.dirty);

        for(let i:number =0;i<this.booms.length;i++){
            this.booms[i].update(dt);
        }
        this.booms=this.booms.filter(b=>!b.dirty);
        
        this.background.update(dt);
        this.player.update(dt,this.input);
        this.player.detectCollision(this.enemies);
    }

    public draw(ctx:CanvasRenderingContext2D):void{
        ctx.clearRect(0,0,canvax.width,canvax.height);
        this.background.draw(ctx);
        for(let i:number =0;i<this.enemies.length;i++){
            this.enemies[i].draw(ctx);
        }
        for(let i:number =0;i<this.particles.length;i++){
            this.particles[i].draw(ctx);
        }
        for(let i:number =0;i<this.booms.length;i++){
            this.booms[i].draw(ctx);
        }

        this.player.draw(ctx);
        ctx.font=this.fontSize.toString()+"px "+this.fontFamily;
        ctx.textAlign="left";
        ctx.fillStyle=this.fontColor;
        ctx.fillText("Score: "+this.score.toString(),20,50);

        ctx.font=(this.fontSize*0.8).toString()+"px "+this.fontFamily;
        ctx.fillText("time left: "+(this.maxPlayTime-this.timePassed).toFixed(3),20,80);

        if(this.gameover){
            ctx.font=(this.fontSize*2.0).toString()+"px "+this.fontFamily;
            ctx.textAlign="center";
            ctx.fillText("Game end",this.width/2,this.height/2);
        }
        else{
            for(let i:number=0;i<this.lives;i++){
                ctx.drawImage(Game.liveImage,0,0,50,50,20+40*i,90,30,30);
            }
        }
    }

    public changeLives(amount:number):void{
        this.lives+=amount;
        this.gameover=this.lives<=0;
    }

    public changeScore(amount:number):void{
        this.score+=amount;
    }

    private spawnEnemy():Enemy{
        switch(Math.floor(Math.random()*3)){
        case 0:{
            return new GroundEnemy(this);
        }
        case 1:{
            return new FlyingEnemy(this);
        }
        case 2:{
            return new ClimbingEnemy(this);
        }
        }
        return null;
    }
}

Game.liveImage=<HTMLImageElement>this.document.getElementById('lives');

class InputHandler{
    public keys:string[];

    constructor(){
        this.keys=Array<string>();
        window.addEventListener('keydown',e=>{
            let tryInsert:(x:boolean,key:string)=>boolean=(x,key)=>{
                if(x){
                    if(this.keys.indexOf(key)==-1){
                        this.keys.push(key);
                    }
                    return true;
                }
                return false;
            }
            
            tryInsert(e.key=="w"||e.key=="ArrowUp","w")||tryInsert(e.key=="a"||e.key=="ArrowLeft","a")||
            tryInsert(e.key=="s"||e.key=="ArrowDown","s")||tryInsert(e.key=="d"||e.key=="ArrowRight","d")||tryInsert(e.key=="Enter","enter");

            if(e.key=='b'){
                debugMode=!debugMode;
            }
        });

        window.addEventListener('keyup',e=>{
            let idx:number;
            let tryRemove:(x:boolean,key:string)=>boolean=(x,key)=>{
                if(x){
                    idx=this.keys.indexOf(key);
                    if(idx!=-1){
                        this.keys.splice(idx,1);
                    }
                    return true;
                }
                return false;
            }

            tryRemove(e.key=="w"||e.key=="ArrowUp","w")||tryRemove(e.key=="a"||e.key=="ArrowLeft","a")||
            tryRemove(e.key=="s"||e.key=="ArrowDown","s")||tryRemove(e.key=="d"||e.key=="ArrowRight","d")||tryRemove(e.key=="Enter","enter");
        });
    }
}

const enum PlayerState{
    Sitting=0,Running=1,Jumping=2,Falling=3,Rolling=4,Diving=5,Hit=6
}

class Player{
    private game:Game;
    private size:Vector2;
    private position:Vector2;
    private image:HTMLImageElement;
    private speed:Vector2;
    private maxSpeed:number;
    private weight:number=1;
    private frame:Vector2=Vector2.zero();
    private frameInterval:number=50/1000;
    private cumulativeTime:number=0;
    private frameLength:number[]=[7,7,7,9,11,5,7,7,12,4];

    private currentState:PlayerState;

    constructor(g:Game){
        this.game=g;
        this.size=new Vector2(100,91.3);
        this.position=new Vector2(0,this.game.height-this.size.y-this.game.groundMargin);
        this.image=<HTMLImageElement>document.getElementById("player");
        this.speed=Vector2.zero();
        this.maxSpeed=10;
        this.enterState(PlayerState.Running);
    }

    public update(dt:number,input:InputHandler):void{
        this.onState(input);
        this.position.x+=this.speed.x;
        this.position.y+=this.speed.y;

        if(this.onGround()==false){
            this.speed.y+=this.weight;
        }
        else{
            this.speed.y=0;
        }

        if(this.currentState!=PlayerState.Hit){
            if(input.keys.indexOf('a')!=-1){
                this.speed.x=-this.maxSpeed;
            }
            else if(input.keys.indexOf('d')!=-1){
                this.speed.x=this.maxSpeed;
            }
            else{
                this.speed.x=0;
            }
        }

        if(this.position.x<0){
            this.position.x=0;
        }
        else if(this.position.x>this.game.width-this.size.x){
            this.position.x=this.game.width-this.size.x;
        }

        this.cumulativeTime+=dt;
        if(this.cumulativeTime>=this.frameInterval){
            this.cumulativeTime-=this.frameInterval;
            this.frame.x++;
            if(this.frame.x>=this.frameLength[this.frame.y]){
                this.frame.x=0;
            }
        }
    }

    public draw(ctx:CanvasRenderingContext2D):void{
        ctx.drawImage(this.image,this.frame.x*this.size.x,this.frame.y*this.size.y,this.size.x,this.size.y,
            this.position.x,this.position.y,this.size.x,this.size.y);
        if(debugMode){
            ctx.strokeRect(this.position.x,this.position.y,this.size.x,this.size.y);
        }
    }

    public detectCollision(enemies:Enemy[]):boolean{
        for(let i:number=0;i<enemies.length;i++){
            let e:Enemy=enemies[i];
            if(e.position.x<this.position.x+this.size.x&&e.position.x+e.size.x>this.position.x&&
                e.position.y<this.position.y+this.size.y&&e.position.y+e.size.y>this.position.y){
                this.game.booms.push(new Boom(e.position.x,e.position.y));
                e.dirty=true;
                if(this.currentState==PlayerState.Diving||this.currentState==PlayerState.Rolling){
                    game.changeScore(1);
                }
                else if(this.currentState!=PlayerState.Hit){
                    this.enterState(PlayerState.Hit);
                    game.changeLives(-1);
                }
            }
        }
        return false;
    }

    private onGround():boolean{
        return this.position.y>=this.game.height-this.size.y-this.game.groundMargin;
    }

    private onState(input:InputHandler){
        switch(this.currentState){
        case PlayerState.Running:{
            this.game.particles.push(new Dust(this.game,this.position.x+this.size.x*0.25,this.position.y+this.size.y));
            this.game.particles.push(new Dust(this.game,this.position.x+this.size.x*0.75,this.position.y+this.size.y));
            if(input.keys.indexOf("s")!=-1){
                this.enterState(PlayerState.Sitting);
            }
            else if(input.keys.indexOf("w")!=-1){
                this.enterState(PlayerState.Jumping);
            }
            if(input.keys.indexOf("enter")!=-1){
                this.enterState(PlayerState.Rolling);
            }
            break;
        }
        case PlayerState.Jumping:{
            if(this.speed.y>0){
                this.enterState(PlayerState.Falling);
            }
            if(input.keys.indexOf("enter")!=-1){
                this.enterState(PlayerState.Rolling);
            }
            if(input.keys.indexOf("s")!=-1){
                this.enterState(PlayerState.Diving);
            }
            break;
        }
        case PlayerState.Sitting:{
            if(input.keys.indexOf("a")!=-1||input.keys.indexOf("d")!=-1){
                this.enterState(PlayerState.Running);
            }
            if(input.keys.indexOf("enter")!=-1){
                this.enterState(PlayerState.Rolling);
            }
            break;
        }
        case PlayerState.Falling:{
            if(this.onGround()){
                this.enterState(PlayerState.Running);
            }
            if(input.keys.indexOf("enter")!=-1){
                this.enterState(PlayerState.Rolling);
            }
            if(input.keys.indexOf("s")!=-1){
                this.enterState(PlayerState.Diving);
            }
            break;
        }
        case PlayerState.Rolling:{
            this.game.particles.push(new Fire(game,this.position.x+this.size.x/2,this.position.y+this.size.y/2));
            if(input.keys.indexOf("enter")==-1){
                if(this.onGround()){
                    this.enterState(PlayerState.Running);
                }
                else{
                    this.speed.y=0;
                    this.enterState(PlayerState.Falling);
                }
            }
            else if(this.onGround()==false&&input.keys.indexOf("s")!=-1){
                this.enterState(PlayerState.Diving);
            }
            break;
        }
        case PlayerState.Diving:{
            this.game.particles.push(new Fire(game,this.position.x+this.size.x/2,this.position.y+this.size.y/2));
            if(this.onGround()){
                this.position.y=this.game.height-this.size.y-this.game.groundMargin;
                for(let i:number=0;i<20;i++){
                    this.game.particles.push(new Splash(game,this.position.x+this.size.x/2,this.position.y+this.size.y/2));
                }

                this.enterState(PlayerState.Running);
            }
            break;
        }
        case PlayerState.Hit:{
            if(this.frame.x==0){
                if(this.onGround()){
                    this.enterState(PlayerState.Running);
                }
                else{
                    this.enterState(PlayerState.Falling);
                }
            }
            break;
        }
        }
    }

    private enterState(nextState:PlayerState){
        this.frame.x=0;
        this.currentState=nextState;
        switch(nextState){
        case PlayerState.Running:{
            this.frame.y=3;
            this.game.speed=3;
            break;
        }
        case PlayerState.Jumping:{
            this.speed.y=-30;
            this.frame.y=1;
            this.game.speed=1;
            break;
        }
        case PlayerState.Sitting:{
            this.frame.y=5;
            this.game.speed=0;
            break;
        }
        case PlayerState.Falling:{
            this.game.speed=1;
            this.frame.y=2;
            break;
        }
        case PlayerState.Rolling:{
            this.game.speed=6;
            this.frame.y=6;
            break;
        }
        case PlayerState.Diving:{
            this.game.speed=0;
            this.frame.y=6;
            this.speed.y=50;
            break;
        }
        case PlayerState.Hit:{
            this.game.speed=0;
            this.speed.x=0;
            this.frame.y=4;
            this.frame.x=1;
            break;
        }
        }
    }
}

abstract class Enemy{
    public dirty:boolean=false;

    protected image:HTMLImageElement;
    protected frame:Vector2=Vector2.zero();
    protected frameInterval:number=50/1000;
    protected cumulativeTime:number=0;
    protected frameLength:number;

    public position:Vector2=Vector2.zero();
    public size:Vector2;
    protected game:Game;
    protected speed:Vector2;
    constructor(g:Game){
        this.game=g;
    }

    public update(dt:number):void{
        this.position.x+=this.speed.x-this.game.speed*1.1;
        this.cumulativeTime+=dt;
        if(this.cumulativeTime>=this.frameInterval){
            this.cumulativeTime-=this.frameInterval;
            this.frame.x++;
            if(this.frame.x>=this.frameLength){
                this.frame.x=0;
            }
        }
        this.dirty=this.dirty||(this.position.x+this.size.x<0);
    }

    public draw(ctx:CanvasRenderingContext2D):void{
        ctx.drawImage(this.image,this.frame.x*this.size.x,0,this.size.x,this.size.y,this.position.x,this.position.y,this.size.x,this.size.y);
        if(debugMode){
            ctx.strokeRect(this.position.x,this.position.y,this.size.x,this.size.y);
        }
    }
}

class FlyingEnemy extends Enemy{
    private angle:number=0;
    private amplitude:number;
    constructor(g:Game){
        super(g);
        this.size=new Vector2(60,44);
        this.position=new Vector2(game.width+this.size.x,Math.random()*game.height*0.5);
        this.speed=new Vector2(Math.random()*-2+-1,Math.random()*0.1+0.1);
        this.frameLength=5;
        this.image=<HTMLImageElement>document.getElementById('enemy_fly');
        this.amplitude=Math.random()*4.5+2;
    }

    public update(dt:number):void{
        super.update(dt);
        this.angle+=this.speed.y;
        this.position.y+=this.amplitude*Math.sin(this.angle);
    }

    public draw(ctx:CanvasRenderingContext2D):void{
        super.draw(ctx);
    }
}

class GroundEnemy extends Enemy{
    constructor(g:Game){
        super(g);
        this.size=new Vector2(60,87);
        this.position=new Vector2(game.width+this.size.x,game.height-this.size.y-game.groundMargin);
        this.speed=new Vector2(Math.random()*-1+-0.5,Math.random()>0.5?1:-1);
        this.frameLength=2;
        this.image=<HTMLImageElement>document.getElementById('enemy_plant');
    }

    public update(dt:number):void{
        super.update(dt);
    }

    public draw(ctx:CanvasRenderingContext2D):void{
        super.draw(ctx);
    }
}

class ClimbingEnemy extends Enemy{
    constructor(g:Game){
        super(g);
        this.size=new Vector2(120,144);
        this.position=new Vector2(game.width+this.size.x,0);
        this.speed=new Vector2(Math.random()*-0.3+-0.2,Math.random()*4+3);
        this.frameLength=2;
        this.image=<HTMLImageElement>document.getElementById('enemy_spider_big');
    }

    public update(dt:number):void{
        super.update(dt);
        this.position.y+=this.speed.y;
        if(this.position.y+this.size.y<=0){
            this.dirty=true;
        }
        else if(this.position.y>=game.height-this.size.y-game.groundMargin){
            this.speed.y=-this.speed.y;
            this.position.y=game.height-this.size.y-game.groundMargin;
        }
    }

    public draw(ctx:CanvasRenderingContext2D):void{
        super.draw(ctx);
        ctx.beginPath();
        ctx.moveTo(this.position.x+this.size.x/2,0);
        ctx.lineTo(this.position.x+this.size.x/2,this.position.y+50);
        ctx.stroke();
    }
}

abstract class Particle{
    public dirty:boolean=false;
    
    protected game:Game;
    protected position:Vector2;
    protected speed:Vector2;
    protected size:number;
    constructor(g:Game){
        this.game=g;
    }

    public update(dt:number):void{
        this.position.x+=dt*this.speed.x-this.game.speed;
        this.position.y+=dt*this.speed.y;
        this.size*=0.95;
        this.dirty=this.dirty||this.size<0.5;
    }

    public abstract draw(ctx:CanvasRenderingContext2D):void;
}

class Dust extends Particle{
    public static color:string;
    constructor(g:Game,x:number,y:number){
        super(g);
        this.size=3+Math.random()*3;
        this.position=new Vector2(x,y);
        this.speed=new Vector2(Math.random()*100,Math.random()*100);
    }

    public update(dt: number): void {
        super.update(dt);
    }

    public draw(ctx:CanvasRenderingContext2D):void{
        ctx.beginPath();
        ctx.arc(this.position.x,this.position.y,this.size,0,2*Math.PI);
        ctx.fillStyle=Dust.color;
        ctx.fill();
    }
}
Dust.color="rgb(100,100,100)";

class Splash extends Particle{
    private gravity:number=10;
    constructor(g:Game,x:number,y:number){
        super(g);
        this.size=20*Math.random()*30;
        this.position=new Vector2(x,y);
        this.speed=new Vector2(Math.random()*400-200,Math.random()*50+50);
    }

    public update(dt: number): void {
        super.update(dt);
        this.gravity+=dt*100;
        this.speed.y+=this.gravity;

    }

    public draw(ctx:CanvasRenderingContext2D):void{
        ctx.drawImage(Fire.image,this.position.x-this.size/2,this.position.y-this.size/2,this.size,this.size);
    }
}

class Fire extends Particle{
    public static image:HTMLImageElement;

    private angle:number;
    private angluarSpeed:number;
    constructor(g:Game,x:number,y:number){
        super(g);
        this.size=10*Math.random()*15;
        this.position=new Vector2(x,y);
        this.speed=new Vector2(-200,Math.random()*20-10);
        this.angle=0;
        this.angluarSpeed=Math.random()*100-50;
    }

    public update(dt: number): void {
        super.update(dt);
        this.position.x+=this.game.speed;
        this.angle+=dt*this.angluarSpeed;
    }

    public draw(ctx:CanvasRenderingContext2D):void{
        ctx.save();
        ctx.translate(this.position.x,this.position.y);
        ctx.rotate(this.angle);
        ctx.drawImage(Fire.image,-this.size/2,-this.size/2,this.size,this.size);
        ctx.restore();
    }
}

class Boom{
    private static size:Vector2;
    private static image:HTMLImageElement;
    private static frameLength:number;
    private static frameInterval:number;

    public dirty:boolean;
    private frame:number=0;
    private position:Vector2;
    private cumulativeTime:number=0;
    private size:Vector2;
    public static init(){
        Boom.size=new Vector2(100,90);
        Boom.image=<HTMLImageElement>document.getElementById("boom");
        Boom.frameLength=5;
        Boom.frameInterval=60/1000;
    }

    constructor(x:number,y:number){
        this.frame=0;
        this.dirty=false;
        let k:number=Math.random()*0.5+1;
        this.size=new Vector2(Boom.size.x*k,Boom.size.y*k);
        this.position=new Vector2(x,y);
    }
    
    public update(dt:number):void{
        this.position.x-=game.speed;
        this.cumulativeTime+=dt;
        if(this.cumulativeTime>=Boom.frameInterval){
            this.frame++;
            this.dirty=this.dirty||this.frame>=Boom.frameLength;
        }
    }

    public draw(ctx:CanvasRenderingContext2D):void{
        ctx.drawImage(Boom.image,this.frame*Boom.size.x,0,Boom.size.x,Boom.size.y,this.position.x,this.position.y,this.size.x,this.size.y);
    }
}

Fire.image=<HTMLImageElement>document.getElementById('fire');
Boom.init();

const game=new Game(canvax.width,canvax.height);
console.log(game);
var lastTime:number=0;

function animate(timeStamp:number):void{
    const dt=(timeStamp-lastTime)/1000;
    lastTime=timeStamp;
    game.update(dt);
    game.draw(ctx);
    requestAnimationFrame(animate);
}
animate(0);


});