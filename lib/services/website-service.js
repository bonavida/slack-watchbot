var Website = require('../models/website');
var User    = require('../models/user');


/**
 * Método para guardar un sitios web en la base de datos
 */
var add = function(ws, callback) {
    /** Crea una instancia de Website con los datos pasados como parámetros */
    var website = new Website({
        name : ws.name,
        url  : ws.url,
        user : ws.user,
        channelName: ws.channelName,
        channelID: ws.channelID
    });
    /** Guarda la instancia en la base de datos */
    website.save(function(err) {
        if (err) {
            return callback(err, "The name or the URL of the website is already registered.");
        }
        callback(null, "The user @" + ws.user + " has registered a website.");
    });
};


/**
 * Método para actualizar el intervalo de un sitio web a través del
 * campo 'name' (nombre del sitio web)
 */
 var setTimeout = function(ws, callback) {
     Website.findOne({name : ws.name}, function(err, website) {
         if (err) {
             return callback(false, "An error occurred. Try again.");
         }
         if (!website) {
             return callback(false, "The website with name \"" + ws.name + "\" is not registered.");
         }
         if (website.user !== ws.user) {
             return callback(false, "You don't have permission to modify this website.");
         }
         website.timeout = ws.timeout;
         website.save(function(err) {
             if (err) {
                 return callback(false, "An error occurred. Try again.");
             }
             callback(true, "Timeout succesfully modified.");
         });
     });
 };


/**
 * Método para eliminar un sitio web de la base de datos a través del campo 'name' (nombre del sitio web)
 */
 var remove = function(ws, callback) {
     Website.findOne({name : ws.name}, function(err, website) {
         if (err) {
             return callback({removed: false, msg: "An error occurred. Try again."});
         }
         if (!website) {
             return callback({removed: false, msg: "The website with name \"" + ws.name + "\" is not registered."});
         }
         if (website.user !== ws.user) {
             return callback({removed: false, msg: "You don't have permission to remove this website."});
         }
         website.remove(function(err) {
             if (err) {
                 return callback({removed: false, msg: "An error occurred. Try again."});
             }
             callback({removed: true, msg: "The user @" + ws.user + " has removed the website *" + ws.name + "*."});
         });
     });
 };


/**
 * Método que devuelve todos los sitios web registrados en la base de datos
 */
var getAllWebsites = function(callback) {
    Website.find({}).sort('dateAdded').exec(function(err, websites) {
        if (err) {
            return callback(err, null);
        }
        callback(null, websites);
    });
};


/**
 * Método que, dado un nombre de usuario, busca y devuelve sólo los sitios web
 * registrados en la base de datos que ha añadido dicho usuario
 */
var getWebsites = function(userName, callback) {
    Website.find({user : userName}).sort('dateAdded').exec(function(err, websites) {
        if (err) {
            return callback(err, null);
        }
        callback(null, websites);
    });
};


/**
 * Método que, dada una url de un sitio web, busca y devuelve dicho sitio web
 */
var getWebsite = function(url, callback) {
    Website.findOne({url : url}, function(err, website) {
        if (err) {
            return callback(err, null);
        }
        callback(null, website);
    });
};


/**
 * Método que, dado el nombre de un sitio web, busca y devuelve dicho sitio web
 */
var getWebsiteByName = function(name, callback) {
    Website.findOne({name : name}, function(err, website) {
        if (err) {
            return callback(err, null);
        }
        callback(null, website);
    });
};



module.exports = {
  add: add,
  setTimeout: setTimeout,
  remove: remove,
  getAllWebsites: getAllWebsites,
  getWebsites: getWebsites,
  getWebsite: getWebsite,
  getWebsiteByName: getWebsiteByName
};
