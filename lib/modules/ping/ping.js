var request        = require('request');
var statusCodes    = require('http').STATUS_CODES;
var dotenv         = require('dotenv');
var slackAPI       = require('node-slack');
var PingService    = require('../../services/ping-service');
var WebsiteService = require('../../services/website-service');


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

    // Para saber si ya se ha avisado al caerse el sitio web
    this.isDown = false;

    // Inicializa la vigilancia
    this.init(opts);

    return this;
}

/*
 * Métodos
 */

Ping.prototype = {

    init: function(opts) {
        var self = this;

        self.url = opts.url;

        self.timeout = (opts.timeout * (60 * 1000));  // Antes de guardarlo, pasa los minutos a milisegundos

        // Empieza la vigilancia
        self.start();
    },



    start: function() {
        var self = this;

        // Crea un intervalo para el ping
        self.handle = setInterval(function() {
            self.ping();
        }, self.timeout);
    },



    stop: function () {
        clearInterval(this.handle);
        this.handle = null;
    },



    ping: function() {
        var self = this,
            start = new Date();

        try {
            // Realiza una llamada
            request(self.url, function (error, res, body) {
                // El sitio web responde
                if (!error && res.statusCode === 200) {
                    var end = new Date();
                    self.isOk(end - start);
                }

                // No hay error pero el sitio web no responde
                else if (!error) {
                    self.isNotOk(res.statusCode);
                }

                // El sitio web no responde
                else {
                    self.isNotOk();
                }
            });
        }
        catch (err) {
            self.isNotOk();
        }
    },



    isOk: function(responseTime) {
        var self = this;

        PingService.setPing(self.url, responseTime, function(err) {
            if (err) {
                console.log("Error: " + err);
            }
        });

        if (self.isDown) {
            self.isDown = false;
            //TODO: Llamar a log() y avisar a Slack?
        }

    },



    isNotOk: function(statusCode) {
        var self = this,
            msg = statusCodes[statusCode + ''];

        PingService.setIncidency(self.url, function(err) {
            if (err) {
                console.log("Error: " + err);
            } else if(!self.isDown) {
                self.isDown = true;
                slack.send({text:self.url + ": DOWN"});  //TODO: Llamar a log()
            }
        });
    },



    log: function(status, msg) {
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
