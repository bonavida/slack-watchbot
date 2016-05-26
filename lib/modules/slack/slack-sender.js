var dotenv   = require('dotenv');
var slackAPI = require('node-slack');

/** Carga variables de entorno desde un fichero .env al process.env */
dotenv.load();

/** Carga la API de Slack con la URL asociada al Incoming Webhooks de la cuenta de Slack del equipo */
var slack = new slackAPI(process.env.WEBHOOK);



/** Envía un mensaje a Slack a través de la herramienta Incoming Webhooks */
var send = function(message) {
    slack.send(message);
};



module.exports = {
    send: send
};
