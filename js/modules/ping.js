var request = require('request');
var statusCodes = require('http').STATUS_CODES;
var dotenv   = require('dotenv');
var slackAPI = require('node-slack');


/** Carga variables de entorno desde un fichero .env al process.env */
dotenv.load();

/** Carga la API de Slack con la URL asociada al Incoming Webhooks de la cuenta de Slack del equipo */
var slack = new slackAPI(process.env.WEBHOOK);


/*
 * Constructor del objeto Ping
 */
function Ping (opts) {
    // Página web que se va a vigilar
    this.url = '';

    // Intervalo de vigilancia en minutos
    this.timeout = 15;

    // Handler del intervalo
    this.handle = null;

    // Inicializa la vigilancia
    this.init(opts);

    return this;
}

/*
 * Métodos
 */

Ping.prototype = {

    init: function (opts) {
        var self = this;

        self.url = opts.url;

        self.timeout = (opts.timeout * (60 * 1000));  // Antes de guardarlo, pasa los minutos a milisegundos

        // Empieza la vigilancia
        self.start();
    },



    start: function () {
        var self = this;

        // Crea un intervalo para el ping
        self.handle = setInterval(function () {
            self.ping();
        }, self.timeout);
    },



    stop: function () {
        clearInterval(this.handle);
        this.handle = null;
    },



    ping: function () {
        var self = this, currentTime = Date.now();

        try {
            // Realiza una llamada
            request(self.url, function (error, res, body) {
                // La página web responde
                if (!error && res.statusCode === 200) {
                    self.isOk();
                }

                // La página web está caída
                else if (!error) {
                    self.isNotOk(res.statusCode);
                }

                // La página web no responde
                else {
                    self.isNotOk();
                }
            });
        }
        catch (err) {
            self.isNotOk();
        }
    },



    isOk: function () {
        this.log('UP', 'OK');
    },



    isNotOk: function (statusCode) {
        var date =  Date.now(),
            self = this,
            time = self.getFormatedDate(date),
            msg = statusCodes[statusCode + ''];

        this.log('DOWN', msg);

        // TODO Send message to Slack
        // slack.send({text:"Hello"});
    },



    log: function (status, msg) {
        var self = this,
            time = Date.now(),
            output = '';

        output += "\nWebsite: " + self.url;
        output += "\nTime: " + self.getFormatedDate(time);
        output += "\nStatus: " + status;
        output += "\nMessage:" + msg  + "\n";

        console.log(output);
    },



    getFormatedDate: function (time) {
        var currentDate = new Date(time);

        currentDate = currentDate.toISOString();
        currentDate = currentDate.replace(/T/, ' ');
        currentDate = currentDate.replace(/\..+/, '');

        return currentDate;
    }
};

module.exports = Ping;
