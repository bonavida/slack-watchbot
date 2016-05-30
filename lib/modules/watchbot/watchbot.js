var Ping           = require('./ping');
var WebsiteService = require('../../services/website-service');

/** Array para guardar las urls */
var urls = [];
/** Mapa para guardar un objeto Ping (value) por cada url (key) */
var pingMap = {};


/** Método para iniciar la vigilancia a partir de la lista de todos los sitios web
 * que están registrados en la base de datos */
var init = function(callback) {
    pingMap = {};
    urls = [];
    WebsiteService.getAllWebsites(function(err, websites) {
        if (err) {
            callback(err);
        } else {
            for (var i = 0; i < websites.length; i++) {
                urls.push(websites[i].url);
                pingMap[websites[i].url] = new Ping ({
                    url: websites[i].url,
                    timeout: websites[i].timeout,
                    isDown: ((websites[i].status==="down")? true : false)
                });
            }
            callback(null);
        }
    });
};



var add = function(ws, callback) {
    WebsiteService.getWebsite(ws.url, function(err, website) {
        if (err) {
            callback(err);
        }
        if (website) {
            urls.push(ws.url);
            pingMap[ws.url] = new Ping ({
                url: ws.url,
                timeout: 15,
                isDown: false
            });
        }
        callback(null);
    });
};


var setTimeout = function(name, callback) {
    WebsiteService.getWebsiteByName(name, function(err, website) {
        if (err) {
            callback(err);
        }
        if (website) {
            pingMap[website.url] = new Ping ({
                url: website.url,
                timeout: website.timeout,
                isDown: ((website.status==="down")? true : false)
            });
        }
        callback(null);
    });
};


var remove = function(name, callback) {
    WebsiteService.getWebsiteByName(name, function(err, website) {
        if (err) {
            callback(err);
        }
        if (website) {
            var i = urls.indexOf(website.url);
            if (i !== -1) {
                urls.splice(i, 1);
            }
            pingMap[website.url].stop();
            delete pingMap[website.url];
        }
        callback(null);
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
    add: add,
    setTimeout: setTimeout,
    remove: remove,
    stop: stop,
    restart: restart
};
