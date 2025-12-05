(function(){
  function randomColor(){
    var palette = (window.GAME_CONFIG && GAME_CONFIG.PLAYER && Array.isArray(GAME_CONFIG.PLAYER.COLORS))
      ? GAME_CONFIG.PLAYER.COLORS
      : ['#ff0000','#00ff00','#0000ff'];
    return palette[Math.floor(Math.random()*palette.length)];
  }
  function Player(){
    if(!window.GAME_CONFIG || !GAME_CONFIG.PLAYER) throw new Error("Missing GAME_CONFIG.PLAYER");
    this.radius = GAME_CONFIG.PLAYER.RADIUS;
    this.speed = GAME_CONFIG.PLAYER.BASE_SPEED;
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.color = randomColor();
    this.name = 'Unnamed Cell';
    this.foodEaten = 0;
  }
  Player.prototype.setPosition = function(x,y){
    this.x = x;
    this.y = y;
    Logger.log("New player spawned in at " + this.x + ", " + this.y);
  };
  Player.prototype.update = function(dt, target){
    var dx = target.x - this.x;
    var dy = target.y - this.y;
    var len = Math.hypot(dx, dy);
    if(len > 0){
      var nx = dx / len;
      var ny = dy / len;
      this.vx = nx * this.speed;
      this.vy = ny * this.speed;
      this.x += this.vx * dt;
      this.y += this.vy * dt;
    } else {
      this.vx = 0;
      this.vy = 0;
    }
  };
  Player.prototype.draw = function(ctx){
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
    ctx.fill();
  };
  window.Player = Player;
})();
