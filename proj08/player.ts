
import * as a from './a.js';

const playerImg:HTMLImageElement=new Image();
playerImg.src="dog.png";

export const enum PlayerState{
    standing_left=107,standing_right=7,sitting_left=905,sitting_right=805,
    running_left=709,running_right=609,
    jumping_left=307,jumping_right=207,landing_left=507,landing_right=407,
}

const enum Orientation{
    left,right,
}

abstract class Movable implements a.Iupdate{
    public position:a.Vector2;
    public velocity:a.Vector2;
    public size:a.Vector2;
    constructor(startPosition:a.Vector2,startVelocity:a.Vector2,size:a.Vector2){
        this.position=a.Vector2.copy(startPosition);
        this.velocity=a.Vector2.copy(startVelocity);
        this.size=a.Vector2.copy(size);
    }
    public update(dt:number):void{
        this.position=a.Vector2.add(this.position,a.Vector2.multiply(this.velocity,dt));
    }
    protected drawCollider(ctx:CanvasRenderingContext2D,color:string='black'):void{
        ctx.strokeStyle=color;
        ctx.beginPath();
        ctx.arc(this.position.x+this.size.x/2,this.position.y+this.size.y/2,this.size.x/2,0,Math.PI*2);
        ctx.stroke();
    }
}

export class Player extends Movable{
    private static jumpVelocity:number=-400;
    private static gravity:number=10;
    private sceneSize:a.Vector2;
    private sprite:a.Sprite;
    private state:PlayerState;
    private orientation:Orientation;
    constructor(scene:a.Vector2){
        super(new a.Vector2(100,scene.y-100),new a.Vector2(0,0),new a.Vector2(100,100));
        this.sceneSize=a.Vector2.copy(scene);
        this.sprite=new a.Sprite(7,new a.Vector2(200,181.83333),playerImg,0.05,true);
        this.state=PlayerState.standing_right;
        this.orientation=Orientation.right;
    }
    public draw(ctx:CanvasRenderingContext2D):void{
        let a:number[]=this.sprite.getXYWH();
        ctx.drawImage(this.sprite.image,a[0],a[1],a[2],a[3],this.position.x,this.position.y,this.size.x,this.size.y);
    }
    public update(dt:number):void{
        super.update(dt);
        if(this.position.x<0){
            this.position.x=0;
        }
        else if(this.position.x+this.size.x>this.sceneSize.x){
            this.position.x=this.sceneSize.x-this.size.x;
        }
        if(this.position.y<0){
            this.position.y=0;
        }
        else if(this.position.y+this.size.y>this.sceneSize.y){
            this.position.y=this.sceneSize.y-this.size.y;
        }
        this.sprite.tryMoveNextFrame(dt);
    }
    public handleInput(keysPressed:string[]):void{
        if(this.orientation==Orientation.left){
            if(!this.isOnGround()){
                this.velocity.y+=Player.gravity;
                if(this.velocity.y>0){
                    this.setState(PlayerState.landing_left);
                }
                if(keysPressed.indexOf('ArrowLeft')!=-1||keysPressed.indexOf('a')!=-1){
                    this.velocity.x=-100;
                }
                else if(keysPressed.indexOf('ArrowRight')!=-1||keysPressed.indexOf('d')!=-1){
                    this.setState(this.velocity.y>0?PlayerState.landing_right:PlayerState.jumping_right);
                    this.orientation=Orientation.right;
                }
                else{
                    this.velocity.x=0;
                }
            }
            else{
                if(keysPressed.indexOf('ArrowLeft')!=-1||keysPressed.indexOf('a')!=-1){
                    this.setState(PlayerState.running_left);
                    this.velocity.x=-100;
                }
                else if(keysPressed.indexOf('ArrowRight')!=-1||keysPressed.indexOf('d')!=-1){
                    this.orientation=Orientation.right;
                    this.setState(PlayerState.standing_right);
                }
                else if(keysPressed.indexOf('ArrowDown')!=-1||keysPressed.indexOf('s')!=-1){
                    this.setState(PlayerState.sitting_left);
                    this.velocity.x=0;
                }
                else if(keysPressed.indexOf('ArrowUp')!=-1||keysPressed.indexOf('w')!=-1){
                    this.setState(PlayerState.jumping_left);
                    this.velocity.y=Player.jumpVelocity;
                }
                else{
                    this.setState(PlayerState.standing_left);
                    this.velocity.x=0;
                }
            }
        }
        else{
            if(!this.isOnGround()){
                this.velocity.y+=Player.gravity;
                if(this.velocity.y>0){
                    this.setState(PlayerState.landing_right);
                }
                if(keysPressed.indexOf('ArrowRight')!=-1||keysPressed.indexOf('d')!=-1){
                    this.velocity.x=100;
                }
                else if(keysPressed.indexOf('ArrowLeft')!=-1||keysPressed.indexOf('a')!=-1){
                    this.setState(this.velocity.y>0?PlayerState.landing_left:PlayerState.jumping_left);
                    this.orientation=Orientation.left;
                }
                else{
                    this.velocity.x=0;
                }
            }
            else{
                if(keysPressed.indexOf('ArrowRight')!=-1||keysPressed.indexOf('d')!=-1){
                    this.setState(PlayerState.running_right);
                    this.velocity.x=100;
                }
                else if(keysPressed.indexOf('ArrowLeft')!=-1||keysPressed.indexOf('a')!=-1){
                    this.orientation=Orientation.left;
                    this.setState(PlayerState.standing_left);
                }
                else if(keysPressed.indexOf('ArrowDown')!=-1||keysPressed.indexOf('s')!=-1){
                    this.setState(PlayerState.sitting_right);
                    this.velocity.x=0;
                }
                else if(keysPressed.indexOf('ArrowUp')!=-1||keysPressed.indexOf('w')!=-1){
                    this.setState(PlayerState.jumping_right);
                    this.velocity.y=Player.jumpVelocity;
                }
                else{
                    this.setState(PlayerState.standing_right);
                    this.velocity.x=0;
                }
            }
        }
    }
    private setState(state:PlayerState):void{
        this.state=state;
        let a:number=<number>state;
        this.sprite.counter.y=Math.floor(a/100);
        this.sprite.totalFrame=a%100;
    }
    public getState():string{
        return this.state.toString();
    }
    private isOnGround():boolean{
        return this.position.y+this.size.y>=this.sceneSize.y;
    }
}

//1800/9=
//2182/12=