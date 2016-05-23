var request        = require('request');
var statusCodes    = require('http').STATUS_CODES;
var dotenv         = require('dotenv');
var slackAPI       = require('node-slack');
var PingService    = require('../../services/ping-service');
var WebsiteService = require('../../services/website-service');
var utils          = require('../../utils/formatting');


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

        self.ping();  // Para que haga ping una vez antes de empezar el intervalo

        self.handle = setInterval(function() {  // Crea un intervalo para el ping
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
            } else if (self.isDown) {
                self.isDown = false;
                slack.send({text: self.url + ": UP"});
            }
        });
    },



    isNotOk: function(statusCode) {
        var self = this,
            msg = statusCodes[statusCode + ''];

        PingService.setIncidency(self.url, function(err) {
            if (err) {
                console.log("Error: " + err);
            } else if(!self.isDown) {
                self.isDown = true;
                self.log();
            }
        });
    },



    log: function() {
        var self = this;

        WebsiteService.getWebsite(self.url, function(err, website) {
            if (err) {
                console.log("Error: " + err);
            }
            if (website) {
                var text = utils.log([website]);
                slack.send({
                    text: "Log completo de sitios web:",
                    attachments: [{
                        text: text,
                        color: "warning",
                        mrkdwn_in: ["text"]
                    }],
                    channel: website.channel
                });
            }
        });
    },

};

module.exports = Ping;
