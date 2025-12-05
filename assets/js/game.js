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

    // --- Food management (local + RTDB) ---
    var foods = [];
    function createFoodAt(x, y){
      var f = new Food();
      f.setPosition(x, y);
      return f;
    }
    function randomFoodPosAwayFromPlayer(){
      var minDist = GAME_CONFIG.FOOD.MIN_DISTANCE_FROM_PLAYER;
      var tries = 0;
      var x, y;
      do{
        x = GAME_CONFIG.FOOD.RADIUS + Math.random() * (worldSize - 2*GAME_CONFIG.FOOD.RADIUS);
        y = GAME_CONFIG.FOOD.RADIUS + Math.random() * (worldSize - 2*GAME_CONFIG.FOOD.RADIUS);
        tries++;
      } while (Math.hypot(x - player.x, y - player.y) < minDist && tries < 20);
      return {x:x, y:y};
    }
    function addFoodLocal(id, x, y){
      var f = createFoodAt(x, y);
      foods.push({ id: id, f: f });
    }
    function drawFoods(ctx){
      for(var i=0;i<foods.length;i++){
        foods[i].f.draw(ctx);
      }
    }
    function initFoodsFromDB(){
      if(!(window.firebaseDb && window.firebaseRef && window.firebaseGet)){
        throw new Error('Realtime Database is required for foods; no local fallback');
      }
      var rootRef = window.firebaseRef(window.firebaseDb);
      window.firebaseGet(window.firebaseChild(rootRef, 'foods')).then(function(snap){
        var val = snap.val();
        if(!val){
          // Initialize foods once
          var updates = {};
          for(var i=0;i<GAME_CONFIG.FOOD.INITIAL_COUNT;i++){
            var id = 'f_' + Math.random().toString(36).slice(2) + Date.now().toString(36) + '_' + i;
            var p = randomFoodPosAwayFromPlayer();
            updates[id] = { x: Math.round(p.x), y: Math.round(p.y) };
            addFoodLocal(id, p.x, p.y);
          }
          window.firebaseUpdate(window.firebaseRef(window.firebaseDb, 'foods'), updates);
        } else {
          // Hydrate local from DB
          for(var id in val){ if(Object.prototype.hasOwnProperty.call(val,id)){
            addFoodLocal(id, val[id].x, val[id].y);
          }}
        }
      });
    }
    function replaceFood(index){
      var old = foods[index];
      // Remove from DB if present
      if(window.firebaseDb && window.firebaseRef && window.firebaseRemove){
        try{ window.firebaseRemove(window.firebaseRef(window.firebaseDb, 'foods/' + old.id)); }catch(e){}
      }
      // Spawn a new one away from player
      var nid = 'f_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      var p = randomFoodPosAwayFromPlayer();
      foods[index] = { id: nid, f: createFoodAt(p.x, p.y) };
      if(window.firebaseDb && window.firebaseRef && window.firebaseSet){
        try{ window.firebaseSet(window.firebaseRef(window.firebaseDb, 'foods/' + nid), { x: Math.round(p.x), y: Math.round(p.y) }); }catch(e){}
      }
    }
    initFoodsFromDB();

    // --- Virus management (local + RTDB) ---
    var viruses = [];
    function createVirusAt(x, y){
      var v = new Virus();
      v.setPosition(x, y);
      return v;
    }
    function randomVirusPos(){
      var x = GAME_CONFIG.VIRUS.RADIUS + Math.random() * (worldSize - 2*GAME_CONFIG.VIRUS.RADIUS);
      var y = GAME_CONFIG.VIRUS.RADIUS + Math.random() * (worldSize - 2*GAME_CONFIG.VIRUS.RADIUS);
      return {x:x, y:y};
    }
    function addVirusLocal(id, x, y){
      var v = createVirusAt(x, y);
      viruses.push({ id: id, v: v });
    }
    function removeVirusLocal(id){
      for(var i=0;i<viruses.length;i++){
        if(viruses[i].id === id){ viruses.splice(i,1); break; }
      }
    }
    function initVirusesFromDB(){
      if(!(window.firebaseDb && window.firebaseRef && window.firebaseGet)){
        throw new Error('Realtime Database is required for viruses; no local fallback');
      }
      var virusesRef = window.firebaseRef(window.firebaseDb, 'viruses');
      // Attach listeners first; onChildAdded fires for existing children too
      window.firebaseOnChildAdded(virusesRef, function(snap){
        var data = snap.val();
        if(data && typeof data.x === 'number' && typeof data.y === 'number'){
          addVirusLocal(snap.key, data.x, data.y);
        }
      });
      window.firebaseOnChildRemoved(virusesRef, function(snap){
        removeVirusLocal(snap.key);
      });
      // If empty, initialize once
      window.firebaseGet(virusesRef).then(function(snap){
        var val = snap.val();
        if(!val){
          var updates = {};
          for(var i=0;i<GAME_CONFIG.VIRUS.INITIAL_COUNT;i++){
            var id = 'v_' + Math.random().toString(36).slice(2) + Date.now().toString(36) + '_' + i;
            var p = randomVirusPos();
            updates[id] = { x: Math.round(p.x), y: Math.round(p.y) };
          }
          if(Object.keys(updates).length){
            window.firebaseUpdate(virusesRef, updates);
          }
        }
      });
    }
    initVirusesFromDB();

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
        window.currentPlayerRef = playerRef;
        window.firebaseSet(playerRef, data).catch(function(){});
        try{
          // Remove this player when the connection is lost
          window.firebaseOnDisconnect(playerRef).remove();
        }catch(e){}
        // Best-effort immediate cleanup on page unload
        var doCleanup = function(){
          if(window.__playerRemoved) return;
          window.__playerRemoved = true;
          try{ window.firebaseRemove(playerRef); }catch(e){}
        };
        window.addEventListener('beforeunload', doCleanup);
        window.addEventListener('unload', doCleanup);
        window.addEventListener('pagehide', doCleanup);
        document.addEventListener('visibilitychange', function(){
          if(document.visibilityState === 'hidden') doCleanup();
        });
      }
    })();

    // --- Other players (multiplayer via RTDB) ---
    var otherPlayers = {};
    function upsertOtherPlayer(id, data){
      if(id === window.currentPlayerId) return;
      var op = otherPlayers[id];
      if(!op){
        op = new Player();
        otherPlayers[id] = op;
      }
      if(typeof data.x === 'number') op.x = data.x;
      if(typeof data.y === 'number') op.y = data.y;
      if(typeof data.radius === 'number'){
        op.radius = data.radius;
        op.targetRadius = data.radius;
      }
      if(typeof data.color === 'string') op.color = data.color;
      if(typeof data.name === 'string') op.name = data.name;
      if(typeof data.foodEaten === 'number') op.foodEaten = data.foodEaten;
    }
    function removeOtherPlayer(id){
      if(otherPlayers[id]) delete otherPlayers[id];
    }
    (function(){
      if(window.firebaseDb && window.firebaseRef && window.firebaseOnChildAdded){
        var playersRef = window.firebaseRef(window.firebaseDb, 'players');
        window.firebaseOnChildAdded(playersRef, function(snap){
          var data = snap.val() || {};
          upsertOtherPlayer(snap.key, data);
        });
        if(window.firebaseOnChildChanged){
          window.firebaseOnChildChanged(playersRef, function(snap){
            var data = snap.val() || {};
            upsertOtherPlayer(snap.key, data);
          });
        }
        if(window.firebaseOnChildRemoved){
          window.firebaseOnChildRemoved(playersRef, function(snap){
            removeOtherPlayer(snap.key);
          });
        }
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
    // Camera zoom state
    var zoom = (GAME_CONFIG.CAMERA && GAME_CONFIG.CAMERA.INITIAL_ZOOM) ? GAME_CONFIG.CAMERA.INITIAL_ZOOM : 1;
    var targetZoom = zoom;
    window.currentZoom = zoom;
    function loop(now){
      var dt = (now - last) / 1000;
      last = now;
      syncAccum += dt;

      // Update mouse world position every frame so movement persists (zoom-aware)
      mouse.x = player.x + (mouseScreenX - canvas.width/2) / (zoom || 1);
      mouse.y = player.y + (mouseScreenY - canvas.height/2) / (zoom || 1);
      player.update(dt, mouse);
      var half = player.radius * 0.5;
      if(player.x < half) player.x = half;
      else if(player.x > GAME_CONFIG.WORLD_SIZE - half) player.x = GAME_CONFIG.WORLD_SIZE - half;
      if(player.y < half) player.y = half;
      else if(player.y > GAME_CONFIG.WORLD_SIZE - half) player.y = GAME_CONFIG.WORLD_SIZE - half;

      ctx.setTransform(1,0,0,1,0,0);
      ctx.clearRect(0,0,canvas.width,canvas.height);

      // Zoom tween
      if(GAME_CONFIG.CAMERA){
        var zr = GAME_CONFIG.CAMERA.ZOOM_TWEEN_RATE || 8;
        zoom += (targetZoom - zoom) * zr * dt;
        window.currentZoom = zoom;
      }

      var camX = player.x - (canvas.width/2) / (zoom || 1);
      var camY = player.y - (canvas.height/2) / (zoom || 1);

      // Periodically sync to Realtime Database (minimal fields)
      if(syncAccum >= 0.2 && window.currentPlayerId && window.firebaseDb){
        syncAccum = 0;
        try{
          var path = 'players/' + window.currentPlayerId;
          window.firebaseUpdate(window.firebaseRef(window.firebaseDb, path), {
            name: player.name,
            x: player.x,
            y: player.y,
            foodEaten: player.foodEaten,
            radius: player.radius
          });
        }catch(e){}
      }

      // Apply zoom and translate world so player stays centered
      ctx.setTransform(zoom,0,0,zoom,0,0);
      ctx.translate(-camX, -camY);

      // Draw grid in world space (infinite across the visible area)
      if(GAME_CONFIG.GRID){
        var cell = GAME_CONFIG.GRID.CELL_SIZE;
        var color = GAME_CONFIG.GRID.LINE_COLOR;
        var alpha = GAME_CONFIG.GRID.LINE_ALPHA;
        var viewW = canvas.width / (zoom || 1);
        var viewH = canvas.height / (zoom || 1);
        var startX = Math.floor(camX / cell) * cell;
        var endX = camX + viewW;
        var startY = Math.floor(camY / cell) * cell;
        var endY = camY + viewH;
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = 1 / (zoom || 1);
        for(var gx = startX; gx <= endX; gx += cell){
          ctx.moveTo(gx, startY);
          ctx.lineTo(gx, endY);
        }
        for(var gy = startY; gy <= endY; gy += cell){
          ctx.moveTo(startX, gy);
          ctx.lineTo(endX, gy);
        }
        ctx.stroke();
        ctx.restore();
      }

      // Draw world entities: foods (bottom), viruses (middle)
      drawFoods(ctx);
      // Draw other players (world space)
      for(var oid in otherPlayers){ if(Object.prototype.hasOwnProperty.call(otherPlayers, oid)){
        otherPlayers[oid].draw(ctx);
        otherPlayers[oid].drawLabelsWorld(ctx);
      }}
      for(var vi=0; vi<viruses.length; vi++){
        viruses[vi].v.update(dt);
        viruses[vi].v.draw(ctx);
      }

      // Draw player in world space so its visual radius matches collisions and zoom
      player.draw(ctx);
      // Draw player's own labels above their cell for consistency
      player.drawLabelsWorld(ctx);

      // Handle food collisions (eat and replace)
      for(var i=foods.length-1;i>=0;i--){
        var fx = foods[i].f.x;
        var fy = foods[i].f.y;
        var dx = fx - player.x;
        var dy = fy - player.y;
        var dist = Math.hypot(dx, dy);
        if(dist <= (player.radius + GAME_CONFIG.FOOD.RADIUS)){
          player.foodEaten += 1;
          if(GAME_CONFIG.PLAYER && GAME_CONFIG.PLAYER.FOODS_PER_STEP && GAME_CONFIG.PLAYER.RADIUS_STEP_FRAC){
            if((player.foodEaten % GAME_CONFIG.PLAYER.FOODS_PER_STEP) === 0){
              var viewMin = Math.min(canvas.width, canvas.height);
              var step = viewMin * GAME_CONFIG.PLAYER.RADIUS_STEP_FRAC;
              player.increaseRadiusStep(step);
            }
          }
          if(GAME_CONFIG.CAMERA && GAME_CONFIG.CAMERA.FOODS_PER_ZOOM_STEP && GAME_CONFIG.CAMERA.ZOOM_STEP){
            if((player.foodEaten % GAME_CONFIG.CAMERA.FOODS_PER_ZOOM_STEP) === 0){
              var minZoom = GAME_CONFIG.CAMERA.MIN_ZOOM || 0.5;
              var nextZoom = (targetZoom || zoom) - GAME_CONFIG.CAMERA.ZOOM_STEP;
              targetZoom = nextZoom < minZoom ? minZoom : nextZoom;
            }
          }
          replaceFood(i);
        }
      }

      // Reset transform if you add screen-space UI later
      ctx.setTransform(1,0,0,1,0,0);

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
