var request        = require('request');
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
 * Métodos del objeto, los cuales serán accesibles desde el exterior:
 *   init: Carga los datos del sitio web
 *   start: Inicia la vigilancia del sitio web haciendo un ping y estableciando un intervalo
 *   stop: Detiene la vigilancia del sitio web
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
                    self.isOk((end - start), res.statusCode);
                }

                // No hay error pero el sitio web no responde
                else if (!error) {
                    self.isNotOk(res.statusCode);
                }

                // El sitio web no responde
                else {
                    self.isNotOk(res.statusCode);
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
                        text: "Malas noticias...",
                        attachments: [{
                            text: "El sitio web *" + website.name + "* (" + website.url + ") ha caído o no contesta.\n" +
                            "_Código de estado: " + statusCode + "_\n" +
                            "_Caído desde el " + utils.getFormatedDate(website.lastCheckedDown) + "_\n",
                            color: "danger",
                            thumb_url: "https://eforce.elkno.com/images/danger.png",
                            mrkdwn_in: ["text"]
                        }],
                        channel: website.channel
                    };
                } else {
                    message = {
                        text: "¡Buenas noticias!",
                        attachments: [{
                            text: "El sitio web *" + website.name + "* (" + website.url + ") está funcionando correctamente.\n" +
                            "_Código de estado: " + statusCode + "_\n" +
                            "_Funcionando de nuevo desde el " + utils.getFormatedDate(new Date()) + "_\n",
                            color: "good",
                            mrkdwn_in: ["text"]
                        }],
                        channel: website.channel
                    };
                }
                slack.send(message);
            }
        });

        /**
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
        */
    },

};

module.exports = Ping;
