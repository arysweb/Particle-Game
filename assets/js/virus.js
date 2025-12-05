(function(){
  function Virus(){
    if(!window.GAME_CONFIG || !GAME_CONFIG.VIRUS) throw new Error("Missing GAME_CONFIG.VIRUS");
    if(typeof GAME_CONFIG.VIRUS.RADIUS !== 'number') throw new Error("Missing GAME_CONFIG.VIRUS.RADIUS");
    this.radius = GAME_CONFIG.VIRUS.RADIUS;
    this.x = 0;
    this.y = 0;
  }
  Virus.prototype.setPosition = function(x,y){
    this.x = x;
    this.y = y;
    Logger.log("New virus spawned in at " + this.x + ", " + this.y);
  };
  Virus.prototype.draw = function(ctx){
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
    ctx.fill();
  };
  window.Virus = Virus;
})();
