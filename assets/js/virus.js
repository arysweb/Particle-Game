(function(){
  var VIRUS_IMG = new Image();
  var IMG_READY = false;
  VIRUS_IMG.onload = function(){ IMG_READY = true; };
  VIRUS_IMG.src = (window.GAME_CONFIG && GAME_CONFIG.VIRUS && GAME_CONFIG.VIRUS.IMAGE)
    ? GAME_CONFIG.VIRUS.IMAGE
    : 'assets/img/virus.svg';

  function Virus(){
    if(!window.GAME_CONFIG || !GAME_CONFIG.VIRUS) throw new Error("Missing GAME_CONFIG.VIRUS");
    if(typeof GAME_CONFIG.VIRUS.RADIUS !== 'number') throw new Error("Missing GAME_CONFIG.VIRUS.RADIUS");
    this.radius = GAME_CONFIG.VIRUS.RADIUS;
    this.x = 0;
    this.y = 0;
    this.angle = 0; // radians
  }
  Virus.prototype.setPosition = function(x,y){
    this.x = x;
    this.y = y;
    Logger.log("New virus spawned in at " + this.x + ", " + this.y);
  };
  Virus.prototype.update = function(dt){
    var speed = (window.GAME_CONFIG && GAME_CONFIG.VIRUS && typeof GAME_CONFIG.VIRUS.ROTATION_SPEED === 'number')
      ? GAME_CONFIG.VIRUS.ROTATION_SPEED
      : 0.2;
    this.angle += speed * dt;
  };
  Virus.prototype.draw = function(ctx){
    if(!IMG_READY){
      // fallback placeholder until image loads
      ctx.save();
      ctx.fillStyle = (GAME_CONFIG.VIRUS && GAME_CONFIG.VIRUS.COLOR) || '#66cc99';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
      return;
    }
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    var size = this.radius * 2;
    ctx.drawImage(VIRUS_IMG, -this.radius, -this.radius, size, size);
    ctx.restore();
  };
  window.Virus = Virus;
})();
