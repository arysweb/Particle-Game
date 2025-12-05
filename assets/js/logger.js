(function(){
  function send(message){
    try{
      // Disable network logging on GitHub Pages (no PHP), fallback to console
      var host = (window.location && window.location.hostname) || '';
      if(host && host.indexOf('github.io') !== -1){
        if(window.console && console.log) console.log('[LOG]', message);
        return;
      }
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
