(function(){
  function randomColor(){
    var palette = (window.GAME_CONFIG && GAME_CONFIG.PLAYER && Array.isArray(GAME_CONFIG.PLAYER.COLORS))
      ? GAME_CONFIG.PLAYER.COLORS
      : ['#ff0000','#00ff00','#0000ff'];
    return palette[Math.floor(Math.random()*palette.length)];
  }
  function darkenHex(hex, factor){
    try{
      if(typeof hex !== 'string') return hex;
      var h = hex.trim();
      if(h[0] === '#') h = h.slice(1);
      if(h.length === 3){
        h = h.split('').map(function(c){ return c + c; }).join('');
      }
      if(h.length !== 6) return '#' + h;
      var r = parseInt(h.slice(0,2),16);
      var g = parseInt(h.slice(2,4),16);
      var b = parseInt(h.slice(4,6),16);
      var f = (typeof factor === 'number') ? factor : 0.8;
      r = Math.max(0, Math.min(255, Math.round(r * f)));
      g = Math.max(0, Math.min(255, Math.round(g * f)));
      b = Math.max(0, Math.min(255, Math.round(b * f)));
      var toHex = function(v){ var s = v.toString(16); return s.length===1 ? '0'+s : s; };
      return '#' + toHex(r) + toHex(g) + toHex(b);
    }catch(e){ return hex; }
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
  Player.prototype.drawLabelsWorld = function(ctx){
    var name = this.name || 'Unnamed Cell';
    var countText = String(this.foodEaten || 0);
    var base = (this.baseRadius || 32);
    var scale = Math.max(0.6, Math.min(2.2, this.radius / base));
    var fontSize = Math.round(14 * scale);
    var outline = Math.max(2, Math.min(6, 3 * scale));
    var gap = Math.round(12 * scale * 0.85);
    ctx.font = 'bold ' + fontSize + 'px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.lineWidth = outline;
    var nameY = this.y - this.radius - Math.round(gap * 0.4);
    ctx.strokeText(name, this.x, nameY);
    ctx.fillText(name, this.x, nameY);
    var countY = nameY + Math.round(gap * 1.2);
    ctx.strokeText(countText, this.x, countY);
    ctx.fillText(countText, this.x, countY);
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
    // Fill body
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
    ctx.fill();

    // Inner border: darker shade of body color, scales with radius and stays inside
    var lw = Math.max(2, Math.min(10, this.radius * 0.12));
    var strokeRadius = Math.max(1, this.radius - lw/2);
    ctx.lineWidth = lw;
    ctx.strokeStyle = darkenHex(this.color, 0.78);
    ctx.beginPath();
    ctx.arc(this.x, this.y, strokeRadius, 0, Math.PI*2);
    ctx.stroke();
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
  Player.prototype.drawLabelsCentered = function(ctx, cx, cy){
    var name = this.name || 'Unnamed Cell';
    var countText = String(this.foodEaten || 0);
    var base = (this.baseRadius || 32);
    var scale = Math.max(0.6, Math.min(2.2, this.radius / base));
    var fontSize = Math.round(14 * scale);
    var outline = Math.max(2, Math.min(6, 3 * scale));
    var gap = Math.round(12 * scale * 0.85);
    ctx.font = 'bold ' + fontSize + 'px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.lineWidth = outline;
    var nameY = cy - Math.round(gap * 0.5);
    ctx.strokeText(name, cx, nameY);
    ctx.fillText(name, cx, nameY);
    var countY = cy + Math.round(gap * 0.9);
    ctx.strokeText(countText, cx, countY);
    ctx.fillText(countText, cx, countY);
  };
  window.Player = Player;
})();
