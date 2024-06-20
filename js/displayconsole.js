window.addEventListener('load', (event) => {
    (function() {
        var oldLog = console.log;
        var textarea = document.getElementById('consoleOutput');
    
        console.log = function(message) {
            oldLog.apply(console, arguments);
            textarea.value += 'snubos@snubby: ' + message + '\n';
            textarea.scrollTop = textarea.scrollHeight;
        };
    
        console.error = console.debug = console.info = console.warn = console.log;
    })();
    console.log('Console loaded'); 
});