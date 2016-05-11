var cron     = require('cron');
var dotenv   = require('dotenv');
var slackAPI = require('node-slack');

/** Carga variables de entorno desde un fichero .env al process.env */
dotenv.load();

/** Carga la API de Slack con la URL asociada al Incoming Webhooks de la cuenta de Slack del equipo */
var slack = new slackAPI(process.env.WEBHOOK);


var cronJob = cron.job("*/10 * * * * *", function(){
    // perform operation e.g. GET request http.get() etc.
    slack.send({text:"Hello"});
});

/** Métodos */
var cronStart = function() {
  cronJob.start();
};

var cronStop = function() {
  cronJob.stop();
};

module.exports = {
  start: cronStart,
  stop: cronStop
};
