;(function(){
  function start(){
    if(!window.GAME_CONFIG) throw new Error("Missing GAME_CONFIG");
    if(typeof GAME_CONFIG.WORLD_SIZE !== 'number') throw new Error("Missing GAME_CONFIG.WORLD_SIZE");
    if(!GAME_CONFIG.PLAYER || typeof GAME_CONFIG.PLAYER.RADIUS !== 'number' || typeof GAME_CONFIG.PLAYER.BASE_SPEED !== 'number'){
      throw new Error("Missing GAME_CONFIG.PLAYER or its fields");
    }

    var container = document.getElementById('game-container');
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    container.appendChild(canvas);

    // Set canvas size once (no dynamic resizing)
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    var player = new Player();
    var worldSize = GAME_CONFIG.WORLD_SIZE;
    var spawnMin = player.radius;
    var spawnMax = worldSize - player.radius;
    var spawnX = spawnMin + Math.random() * (spawnMax - spawnMin);
    var spawnY = spawnMin + Math.random() * (spawnMax - spawnMin);
    player.setPosition(spawnX, spawnY);
    Logger.log("Game initialized with world_size=" + worldSize);

    // Persist player to Realtime Database
    (function(){
      if(window.firebaseDb && window.firebaseRef && window.firebaseSet){
        var playerId = 'p_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
        window.currentPlayerId = playerId;
        var data = {
          name: player.name,
          x: player.x,
          y: player.y,
          color: player.color,
          radius: player.radius,
          foodEaten: player.foodEaten,
          createdAt: Date.now()
        };
        var playerRef = window.firebaseRef(window.firebaseDb, 'players/' + playerId);
        window.firebaseSet(playerRef, data).catch(function(){});
        try{
          // Remove this player when the connection is lost
          window.firebaseOnDisconnect(playerRef).remove();
        }catch(e){}
        // Best-effort immediate cleanup on page unload
        window.addEventListener('beforeunload', function(){
          try{ window.firebaseRemove(playerRef); }catch(e){}
        });
      }
    })();

    var mouse = { x: spawnX, y: spawnY };
    var mouseScreenX = canvas.width/2;
    var mouseScreenY = canvas.height/2;
    canvas.addEventListener('mousemove', function(e){
      var rect = canvas.getBoundingClientRect();
      mouseScreenX = (e.clientX - rect.left);
      mouseScreenY = (e.clientY - rect.top);
    });

    var last = performance.now();
    var syncAccum = 0;
    function loop(now){
      var dt = (now - last) / 1000;
      last = now;
      syncAccum += dt;

      // Update mouse world position every frame so movement persists
      mouse.x = mouseScreenX + (player.x - canvas.width/2);
      mouse.y = mouseScreenY + (player.y - canvas.height/2);
      player.update(dt, mouse);
      var half = player.radius * 0.5;
      if(player.x < half) player.x = half;
      else if(player.x > GAME_CONFIG.WORLD_SIZE - half) player.x = GAME_CONFIG.WORLD_SIZE - half;
      if(player.y < half) player.y = half;
      else if(player.y > GAME_CONFIG.WORLD_SIZE - half) player.y = GAME_CONFIG.WORLD_SIZE - half;

      ctx.setTransform(1,0,0,1,0,0);
      ctx.clearRect(0,0,canvas.width,canvas.height);

      var camX = Math.round(player.x - canvas.width/2);
      var camY = Math.round(player.y - canvas.height/2);

      // Periodically sync to Realtime Database (minimal fields)
      if(syncAccum >= 0.2 && window.currentPlayerId && window.firebaseDb){
        syncAccum = 0;
        try{
          var path = 'players/' + window.currentPlayerId;
          window.firebaseUpdate(window.firebaseRef(window.firebaseDb, path), {
            name: player.name,
            x: player.x,
            y: player.y,
            foodEaten: player.foodEaten
          });
        }catch(e){}
      }

      // Draw infinite grid in screen space using camera offset
      if(GAME_CONFIG.GRID){
        var cell = GAME_CONFIG.GRID.CELL_SIZE;
        var color = GAME_CONFIG.GRID.LINE_COLOR;
        var alpha = GAME_CONFIG.GRID.LINE_ALPHA;
        var offsetX = - (camX % cell);
        var offsetY = - (camY % cell);
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = 1;
        // vertical lines
        for(var x = offsetX; x <= canvas.width; x += cell){
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
        }
        // horizontal lines
        for(var y = offsetY; y <= canvas.height; y += cell){
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
        }
        ctx.stroke();
        ctx.restore();
      }

      // Move the world relative to player (player stays centered)
      ctx.translate(-camX, -camY);

      // TODO: draw world entities here (food, viruses, etc.) at world positions

      // Draw player stationary at screen center in screen space
      ctx.setTransform(1,0,0,1,0,0);
      ctx.fillStyle = player.color;
      ctx.beginPath();
      ctx.arc(canvas.width/2, canvas.height/2, player.radius, 0, Math.PI*2);
      ctx.fill();

      // Draw player name and food eaten count centered
      var cx = canvas.width/2;
      var cy = canvas.height/2;
      ctx.font = 'bold 14px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = 'rgba(0,0,0,0.6)';
      ctx.lineWidth = 3;
      // name line
      var nameY = cy - 6;
      ctx.strokeText(player.name, cx, nameY);
      ctx.fillText(player.name, cx, nameY);
      // food eaten line
      var countText = String(player.foodEaten || 0);
      var countY = cy + 12;
      ctx.strokeText(countText, cx, countY);
      ctx.fillText(countText, cx, countY);

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
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ start(); });
  } else {
    start();
  }
})();
