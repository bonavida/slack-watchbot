var Ping           = require('./ping');
var WebsiteService = require('../../services/website-service');

/** Mapa para guardar un objeto Ping (value) por cada url (key) */
var pingMap = {};

var urlMap = {};

/** Método para iniciar la vigilancia a partir de la lista de todos los sitios web
 * que están registrados en la base de datos */
var init = function(callback) {
    pingMap = {};
    urlMap = {};
    WebsiteService.getAllWebsites(function(err, websites) {
        if (err) {
            return callback(err);
        } else {
             websites.forEach(function(website) {
                urlMap[website.name] = website.url;
                pingMap[website.url] = new Ping ({
                    url: website.url,
                    timeout: website.timeout,
                    isDown: ((website.status==="down")? true : false)
                });
            });
            console.log(pingMap);
            console.log(" ");
            callback(null);
        }
    });
};


/** Método para iniciar la vigilancia de un sitio web */
var add = function(website) {
    urlMap[website.name] = website.url;
    pingMap[website.url] = new Ping ({
        url: website.url,
        timeout: 15,
        isDown: false
    });
    console.log(pingMap);
    console.log(" ");
};


/** Método para modificar el intervalo de vigilancia de un sitio web */
var setTimeout = function(name, callback) {
    WebsiteService.getWebsiteByName(name, function(err, website) {
        if (err) {
            return callback(err);
        }
        if (website) {
            pingMap[website.url] = new Ping ({
                url: website.url,
                timeout: website.timeout,
                isDown: ((website.status==="down")? true : false)
            });
            console.log(pingMap);
            console.log(" ");
        }
        callback(null);
    });
};


/** Método para quitar la vigilancia de un sitio web */
var remove = function(name) {
    console.log(name);
    delete pingMap[urlMap[name]];
    delete urlMap[name];
    console.log(pingMap);
    console.log(" ");
};



module.exports = {
    init: init,
    add: add,
    setTimeout: setTimeout,
    remove: remove,
};
