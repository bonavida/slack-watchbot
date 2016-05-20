var Ping           = require('./ping');
var WebsiteService = require('../../services/website-service');

/** Array para guardar las urls */
var urls = [];
/** Mapa para guardar un objeto Ping (value) por cada url (key) */
var pingMap = {};


/** Método para iniciar la vigilancia a partir de la lista de todos los sitios web
 * que están registrados en la base de datos */
var init = function() {
    pingMap = {};
    urls = [];
    WebsiteService.getAllWebsites(function (err, websites) {
        if (err) {
            console.log("Ha habido un error.");
        } else {
            for (var i = 0; i < websites.length; i++) {
                urls.push(websites[i].url);
                pingMap[websites[i].url] = new Ping ({
                    url: websites[i].url,
                    timeout: websites[i].timeout
                });
            }
        }
    });
};


/** Método para detener la vigilancia de todos los sitios web */
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
