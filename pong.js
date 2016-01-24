var Pong = function(vsIA, resize){
  var self = this;

  this.canvas = document.getElementById("pong");
  this.canvas.style.background="black";
  this.canvas.style.cursor= "crosshair";

  this.iaPlayR = vsIA;

  this.p1 = 0;
  this.p2 = 0;

  this.width = this.canvas.width;
  this.height= this.canvas.height;

  this.border = 10;

  this.dimX = 10;

  this.lines = 90;

  this.speedIncreese = 0.4;

  this.pos1bis = 0;
  this.pos2bis = 0;
  this.mv1 = false;
  this.mv2 = false;

  this.randIA=0;
  this.newRandIA=false;

  this.resize = resize;

  this.firstInit=true;

  this.arrival = 0;

  this.init = function(dir){
    this.speed = 6 + Math.min(25, 0.5*(this.p1 + this.p2));
    this.vx = dir * (0.8 + Math.floor((Math.random() * 6) +1)/10);
    this.vy = 0.4 * (Math.random()>0.5?1:-1);
    this.x = this.width/2;
    this.y = this.height/2;
    this.touched = false;

    if(this.p2==0 && this.p1==0){
      this.dimYl = this.height/4;
      this.dimYr = this.height/4;
    }else{
      this.dimYl = this.height/4*(this.resize?Math.min(1,Math.abs(((this.p1+1-this.p2+1)/this.p2+1))):1);
      this.dimYr = this.height/4*(this.resize?Math.min(1,Math.abs(((this.p2+1-this.p1+1)/this.p1+1))):1);
    }
    if(this.firstInit){
      this.pos1 = this.height/2 - this.dimYl/2;
      this.pos2 = this.height/2 - this.dimYr/2;
      this.firstInit=false;
    }
    this.changeArrival();


  }

  this.changeArrival = function(){
    // Ball arrival position
    if(this.vx>0){
      this.arrival = Math.round(this.y + this.vy*(this.width-this.border-2*this.dimX-this.x)/this.vx);
    }else{
      this.arrival = Math.round(this.y - this.vy*(this.x-this.border-this.dimX)/this.vx);
    }
    if(this.arrival<0){
      this.arrival = -this.arrival;
    }
    if(this.arrival>this.height){
      var qHeight = Math.floor(this.arrival/this.height);
      if(qHeight%2==0){
        this.arrival-=qHeight*this.height;
      }else{
        this.arrival =(qHeight+1)*this.height-this.arrival;
      }
    }
  }

  this.start = function(){
    this.init(Math.random()>0.5?1:-1);
    window.requestAnimationFrame(draw);
  }

  this.update = function(){
    // Walls hurt
    if (this.y + this.vy > this.height-this.dimX|| this.y + this.vy < 0) {
      this.y = (this.y + this.vy > this.height-this.dimX)?(this.height-this.dimX):(this.y + this.vy < 0?0:this.y);
      this.vy = -this.vy;
    }

    // IA position computation
    if(this.iaPlayR){
      this.IA();
    }

    // Player postition
    self.pos1 += self.mv1?(self.pos1bis - self.pos1)/6:0;
    self.pos2 += self.mv2?(self.pos2bis - self.pos2)/6:0;
    //self.pos1 = arrival-498*self.dimYl/500;
    //self.pos2 = this.arrival-3*self.dimYr/500;

    // Touched ball test
    var xLeft = (this.x<this.border+this.dimX),
        xRight= (this.x>this.width-this.border-2*this.dimX)
    if(xLeft || xRight){
      if(!this.touched){
        if((xLeft && this.y>this.pos1 && this.y<this.pos1+this.dimYl) || (xRight && this.y>this.pos2 && this.y<this.pos2+this.dimYr)){
          this.vx = -this.vx; // x move invertion
          this.touched = true;
          this.speed += this.speedIncreese; // speed increesing
          // compute the new direction
          var posRef=0;
          if(this.x<this.width/2){
            posRef = (this.y-this.pos1)/this.dimYl-0.5;
          }else{
            posRef = (this.y-this.pos2)/this.dimYr-0.5;
          }
          var xDirection=this.vx>0?1:-1,
              yDirection=posRef>0?1:-1;
          posRef=Math.abs(posRef);
          this.vy = yDirection*Math.abs(posRef);
          this.vx = xDirection*((1-posRef*2)*1.3+0.4);
          this.x = xLeft?(this.border+this.dimX):(xRight?(this.width-this.border-2*this.dimX):this.x);
          this.changeArrival();
        }
      }
    }else if(this.touched){
      this.touched = false;
    }



    // Out fast ball correction
    var correct = 1;
    if(this.x+this.vx*this.speed<this.border+this.dimX){
      correct=(this.x-this.border-this.dimX)/(this.x-(this.x+this.vx*this.speed))+0.00001;
    }else if(this.x+this.vx*this.speed>this.width-this.border-2*this.dimX){
      correct=(this.width-this.border-2*this.dimX-this.x)/((this.x+this.vx*this.speed)-this.x)+0.00001;
    }

    // Ball coordinate computation
    var newPosY = this.y+this.vy*this.speed*correct,
        newPosX = this.x+this.vx*this.speed*correct;
    if((newPosX<this.width/2 && (newPosY<this.pos1 || newPosY>this.pos1 + this.dimYl)) ||
      (newPosX>this.width/2 && (newPosY<this.pos2 || newPosY>this.pos2 + this.dimYr))){
      this.x += this.vx*this.speed;
      this.y += this.vy*this.speed;
    }else{
      this.x = newPosX;
      this.y = newPosY;
    }

    // Winner test
    if(this.x<=0){
      this.p1+=1;
      this.init(-1)
    }else if(this.x+this.dimX>=this.width){
      //return;
      this.p2+=1;
      this.init(1)
    }
  }

  this.IA = function(){
    var oldP = self.pos2bis,
        negPos=0;
    if(this.x<this.width/3 || this.vx<0){
      self.newRandIA = false;
      self.pos2bis = self.randIA+self.height/2-self.dimYr/2;
    }else{
      if(!self.newRandIA){
        self.newRandIA=true;
        self.randIA = (Math.random()*self.dimYr)-(self.dimYr/2);
      }
      self.pos2bis = self.randIA+self.arrival-self.dimYr/2;
    }
    negPos = self.pos2bis-oldP>0?1:-1;
    self.pos2bis=Math.abs(self.pos2bis-oldP)>self.speed*10?oldP+negPos*self.speed:self.pos2bis;
    self.mv2 = true;
  }

  this.setFullScreen =function(){
    if(self.canvas.requestFullScreen)
      self.canvas.requestFullScreen();
    else if(self.canvas.webkitRequestFullScreen)
      self.canvas.webkitRequestFullScreen();
    else if(self.canvas.mozRequestFullScreen)
      self.canvas.mozRequestFullScreen();
    }

  function draw(){
    var ctx = self.canvas.getContext("2d");

    ctx.globalCompositeOperation = 'destination-over';
    ctx.clearRect(0, 0, self.width, self.height);

    ctx.fillStyle = "rgba(255,255,255,0.5)";
    for(i=-1; ++i<self.lines;){
      ctx.fillRect((self.width/2)-(self.dimX/4), i*self.height/(self.lines), self.dimX/2, self.height/(2*self.lines));
    }

    ctx.font = "48px serif";
    ctx.fillText(self.p2, self.width/4, 50);
    ctx.fillText(self.p1, 3*self.width/4, 50);

    self.update();

    ctx.save();
    ctx.fillStyle = "white";
    ctx.fillRect(self.border, self.pos1, self.dimX, self.dimYl);

    ctx.fillStyle = "white";
    ctx.fillRect(self.width-self.border-self.dimX, self.pos2, self.dimX, self.dimYr);

    ctx.fillStyle = "white";
    ctx.fillRect(self.x, self.y, self.dimX, self.dimX);
    ctx.restore();

    window.requestAnimationFrame(draw);
  }

  this.canvas.addEventListener('mousemove', function(e){
    if(!self.iaPlayL){
      self.pos1 = e.clientY-self.dimYl/2;
      self.pos1 = self.pos1>self.height-self.dimYl?self.height-self.dimYl:self.pos1;
    }
  });

  window.addEventListener('keydown', function(event){
    var mv = 12*self.speed;
    if(event.which==90 && !self.iaPlayL){
      self.pos1bis -= mv;
      self.pos1bis = self.pos1 < 0?0:self.pos1bis;
      self.mv1 = true;
    }else if(event.which==83 && !self.iaPlayL){
      self.pos1bis += mv;
      self.pos1bis = self.pos1 > self.height - self.dimYl?self.height - self.dimYl:self.pos1bis;
      self.mv1 = true;
    }else if(event.which==38 && !self.iaPlayR){
      self.pos2bis -= mv;
      self.pos2bis = self.pos2 < 0?0:self.pos2bis;
      self.mv2 = true;
    }else if(event.which==40 && !self.iaPlayR){
      self.pos2bis += mv;
      self.pos2bis = self.pos2 > self.height - self.dimYr?self.height - self.dimYr:self.pos2bis;
      self.mv2 = true;
    }else if(event.which==107){
      self.speed += self.speedIncreese;
    }else if(event.which==109){
      self.speed -= self.speedIncreese;
    }else if(event.which==13){
      self.setFullScreen();
      this.fullScreen = true;
    }
    console.log(event.which);
  });

  window.addEventListener('keyup', function(event){
    if(event.which==90){
      self.pos1bis = self.pos1;
      self.mv1 = false;
    }else if(event.which==83){
        self.pos1bis = self.pos1;
        self.mv1 = false;
    }else if(event.which==38){
      self.pos2bis = self.pos2;
      self.mv2 = false;
    }else if(event.which==40){
      self.pos2bis = self.pos2;
      self.mv2 = false;
    }
  });

  this.canvas.addEventListener('touchmove', function(event){
    if(event.targetTouches.length == 1 && self.iaPlayR) {
      var touch = event.targetTouches[0];
      self.pos1=2*(touch.pageY-self.dimYl/2);
    }else{
      if(event.targetTouches.length == 1) {
        var touch = event.targetTouches[0];
        if(touch.pageX<self.width/4){
          self.pos1=2*(touch.pageY-self.dimYl/2);
        }else{
          self.pos2=2*(touch.pageY-self.dimYr/2);
        }
      }else{
        var touch1 = event.targetTouches[0],
            touch2 = event.targetTouches[1];
        if(touch1.pageX>touch2.pageX){
          touch1=touch2;
          touch2=event.targetTouches[0];
        }
        self.pos1=2*(touch1.pageY-self.dimYl/2);
        self.pos2=2*(touch2.pageY-self.dimYr/2);
      }
    }

  }, false);
}
