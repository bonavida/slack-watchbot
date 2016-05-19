var Ping           = require('./ping');
var WebpageService = require('../../services/webpage-service');

/** Array para guardar las urls */
var urls = [];
/** Mapa para guardar un objeto Ping (value) por cada url (key) */
var pingMap = {};


/** Método para iniciar la vigilancia a partir de la lista de todas páginas web
 * que están registradas en la base de datos */
var init = function() {
    pingMap = {};
    urls = [];
    WebpageService.getAllWebpages(function (err, webpages) {
        if (err) {
            console.log("Ha habido un error.");
        } else {
            for (var i = 0; i < webpages.length; i++) {
                urls.push(webpages[i].url);
                pingMap[webpages[i].url] = new Ping ({
                    url: webpages[i].url,
                    timeout: webpages[i].timeout
                });
            }
        }
    });
};


/** Método para detener la vigilancia de todas las páginas web */
var stop = function() {
    for (var i = 0; i < urls.length; i++) {
        pingMap[urls[i]].stop();
    }
};


/** Método para reiniciar la vigilancia */
var restart = function() {
    stop();
    init();
};



// /** Configura la tarea para que, de forma periódica, realice llamadas a una
//   * lista de páginas web para saber si están caídas. Si alguna lo está,
//   * envía un mensaje a Slack */
// var cronJob = cron.job("*/10 * * * * *", function() {
//     // perform operation e.g. GET request http.get() etc.
//     //TODO
//     //slack.send({text:"Hello"});
// });
//
// /** MÉTODOS */
//
// /** Método para iniciar la tarea */
// var cronStart = function() {
//   cronJob.start();
// };
//
// /** Método para parar la tarea */
// var cronStop = function() {
//   cronJob.stop();
// };
//
// /** Método para reiniciar la tarea **/
// var cronRestart = function() {
//   //TODO
// };

module.exports = {
    init: init,
    stop: stop,
    restart: restart
};
