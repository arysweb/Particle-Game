(function(){
  if(!window.GAME_CONFIG) throw new Error("Missing GAME_CONFIG");
  if(typeof GAME_CONFIG.WORLD_SIZE !== 'number') throw new Error("Missing GAME_CONFIG.WORLD_SIZE");
  if(!GAME_CONFIG.PLAYER || typeof GAME_CONFIG.PLAYER.RADIUS !== 'number' || typeof GAME_CONFIG.PLAYER.BASE_SPEED !== 'number'){
    throw new Error("Missing GAME_CONFIG.PLAYER or its fields");
  }

  var container = document.getElementById('game-container');
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  container.appendChild(canvas);

  function resize(){
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    Logger.log("Canvas resized to " + canvas.width + "x" + canvas.height);
  }
  window.addEventListener('resize', resize);
  resize();

  var player = new Player();
  var worldSize = GAME_CONFIG.WORLD_SIZE;
  player.setPosition(worldSize/2, worldSize/2);
  Logger.log("Game initialized with world_size=" + worldSize);

  var mouse = { x: worldSize/2, y: worldSize/2 };
  canvas.addEventListener('mousemove', function(e){
    var rect = canvas.getBoundingClientRect();
    mouse.x = (e.clientX - rect.left) + (player.x - canvas.width/2);
    mouse.y = (e.clientY - rect.top) + (player.y - canvas.height/2);
  });

  var last = performance.now();
  function loop(now){
    var dt = (now - last) / 1000;
    last = now;

    player.update(dt, mouse);

    ctx.setTransform(1,0,0,1,0,0);
    ctx.clearRect(0,0,canvas.width,canvas.height);

    var camX = Math.round(player.x - canvas.width/2);
    var camY = Math.round(player.y - canvas.height/2);
    ctx.translate(-camX, -camY);

    player.draw(ctx);

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // Optional entities: only if config provides sections
  if(GAME_CONFIG.FOOD){
    // Placeholder to show readiness; actual spawning must use only config when provided
  }
  if(GAME_CONFIG.VIRUS){
    // Placeholder to show readiness; actual spawning must use only config when provided
  }
})();
