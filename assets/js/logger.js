(function(){
  function send(message){
    try{
      fetch('logger.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: String(message) })
      });
    }catch(e){
      // intentionally ignore: logging must not break the game
    }
  }
  window.Logger = { log: send };
})();
