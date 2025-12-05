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
    this.baseRadius = GAME_CONFIG.PLAYER.RADIUS;
    this.targetRadius = this.baseRadius;
  }
  Player.prototype.setPosition = function(x,y){
    this.x = x;
    this.y = y;
    Logger.log("New player spawned in at " + this.x + ", " + this.y);
  };
  Player.prototype._recomputeSpeed = function(){
    var exp = GAME_CONFIG.PLAYER.SPEED_EXP;
    var scale = Math.pow(this.baseRadius / this.targetRadius, exp);
    this.speed = GAME_CONFIG.PLAYER.BASE_SPEED * scale;
  };
  Player.prototype.setTargetRadius = function(r){
    if(r > 0){
      this.targetRadius = r;
      this._recomputeSpeed();
    }
  };
  Player.prototype.increaseRadiusStep = function(dr){
    if(dr && dr > 0){
      this.targetRadius += dr;
      this._recomputeSpeed();
    }
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
    var rate = GAME_CONFIG.PLAYER.RADIUS_TWEEN_RATE;
    this.radius += (this.targetRadius - this.radius) * rate * dt;
  };
  Player.prototype.draw = function(ctx){
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
    ctx.fill();
  };
  Player.prototype.drawCentered = function(ctx, cx, cy){
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(cx, cy, this.radius, 0, Math.PI*2);
    ctx.fill();

    var name = this.name || 'Unnamed Cell';
    var countText = String(this.foodEaten || 0);
    ctx.font = 'bold 14px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.lineWidth = 3;
    var nameY = cy - 6;
    ctx.strokeText(name, cx, nameY);
    ctx.fillText(name, cx, nameY);
    var countY = cy + 12;
    ctx.strokeText(countText, cx, countY);
    ctx.fillText(countText, cx, countY);
  };
  window.Player = Player;
})();
