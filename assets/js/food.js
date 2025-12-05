(function(){
  function randomColor(){
    var palette = (window.GAME_CONFIG && GAME_CONFIG.FOOD && Array.isArray(GAME_CONFIG.FOOD.COLORS))
      ? GAME_CONFIG.FOOD.COLORS
      : ['#ff0000','#00ff00','#0000ff'];
    return palette[Math.floor(Math.random()*palette.length)];
  }
  function Food(){
    if(!window.GAME_CONFIG || !GAME_CONFIG.FOOD) throw new Error("Missing GAME_CONFIG.FOOD");
    if(typeof GAME_CONFIG.FOOD.RADIUS !== 'number') throw new Error("Missing GAME_CONFIG.FOOD.RADIUS");
    this.radius = GAME_CONFIG.FOOD.RADIUS;
    this.x = 0;
    this.y = 0;
    this.color = randomColor();
  }
  Food.prototype.setPosition = function(x,y){
    this.x = x;
    this.y = y;
    Logger.log("New food cell spawned in at " + this.x + ", " + this.y);
  };
  Food.prototype.draw = function(ctx){
    var z = (window.currentZoom && typeof window.currentZoom === 'number') ? window.currentZoom : 1;
    ctx.fillStyle = this.color;
    if(z !== 1){
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.scale(1/z, 1/z);
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
      ctx.fill();
    }
  };
  window.Food = Food;
})();
