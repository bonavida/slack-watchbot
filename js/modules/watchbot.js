var ping           = require('./ping');
var WebpageService = require('../services/webpage-service');

/** Configura la tarea para que, de forma periódica, realice llamadas a una
  * lista de páginas web para saber si están caídas. Si alguna lo está,
  * envía un mensaje a Slack */
// var cronJob = cron.job("*/10 * * * * *", function() {
//     // perform operation e.g. GET request http.get() etc.
//     //TODO
//     //slack.send({text:"Hello"});
// });


/** MÉTODOS */

/** Método para iniciar la tarea */
var cronStart = function() {
  cronJob.start();
};

/** Método para parar la tarea */
var cronStop = function() {
  cronJob.stop();
};

/** Método para reiniciar la tarea **/
var cronRestart = function() {
  //TODO
};

module.exports = {
  start: cronStart,
  stop: cronStop,
  restart: cronRestart
};
