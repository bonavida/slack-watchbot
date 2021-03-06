var request        = require('request');
var slack          = require('../slack/slack-sender');
var PingService    = require('../../services/ping-service');
var WebsiteService = require('../../services/website-service');
var utils          = require('../../utils/formatting');


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
 * Métodos del objeto, los cuales serán accesibles desde el exterior:
 *   init: Carga los datos del sitio web
 *   start: Inicia la vigilancia del sitio web haciendo un ping y estableciando un intervalo
 *   stop: Detiene la vigilancia del sitio web
 *   ping: Realiza un ping al sitio web
 *   isOk: Si el ping ha funcionado correctamente, se registra en la base de datos
 *   isNotOk: Si el ping no responde, se registra la incidencia en la base de datos
 *   log: Manda un mensaje personalizado a Slack cuando un sitio web deja de responder, o por el contrario, responde de nuevo
 */

Ping.prototype = {

    init: function(opts) {
        var self = this;

        self.url = opts.url;

        self.timeout = (opts.timeout * (60 * 1000));  // Antes de guardarlo, pasa los minutos a milisegundos

        self.isDown = opts.isDown;

        // Empieza la vigilancia
        self.ping();
        self.start();
    },



    start: function() {
        var self = this;

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
                    self.isOk((end - start), res.statusCode);
                }

                // No hay error pero el sitio web no responde
                else if (!error) {
                    self.isNotOk(res.statusCode);
                }

                // El sitio web no responde
                else {
                    self.isNotOk(500);
                }
            });
        }
        catch (err) {
            self.isNotOk();
        }
    },



    isOk: function(responseTime, statusCode) {
        var self = this;

        PingService.setPing(self.url, responseTime, function(err) {
            if (err) {
                console.log("Error: " + err);
            } else if (self.isDown) {
                self.isDown = false;
                self.log(statusCode);
            }
        });
    },



    isNotOk: function(statusCode) {
        var self = this;

        PingService.setIncidency(self.url, function(err) {
            if (err) {
                console.log("Error: " + err);
            } else if (!self.isDown) {
                self.isDown = true;
                self.log(statusCode);
            }
        });
    },



    log: function(statusCode) {
        var self = this;

        WebsiteService.getWebsite(self.url, function(err, website) {
            if (err) {
                console.log("Error: " + err);
            }
            if (website) {
                var message = {};
                if (self.isDown) {
                    message = {
                        text: "Bad news...",
                        attachments: [{
                            text: "The website *" + website.name + "* (" + website.url + ") is down.\n" +
                            "_Status code: " + statusCode + "_\n" +
                            "_Has been down since " + utils.getFormatedDate(new Date(website.lastCheckedDown)) + "_\n",
                            color: "danger",
                            thumb_url: "https://eforce.elkno.com/images/danger.png",
                            mrkdwn_in: ["text"]
                        }],
                        channel: website.channel
                    };
                } else {
                    message = {
                        text: "Good news!",
                        attachments: [{
                            text: "The website *" + website.name + "* (" + website.url + ") is up.\n" +
                            "_Status code: " + statusCode + "_\n" +
                            "_Has been up since " + utils.getFormatedDate(new Date()) + "_\n",
                            color: "good",
                            mrkdwn_in: ["text"]
                        }],
                        channel: website.channel
                    };
                }
                slack.send(message);
            }
        });
    }

};

module.exports = Ping;
