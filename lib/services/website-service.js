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
        channel: ws.channel
    });
    /** Guarda la instancia en la base de datos */
    website.save(function(err) {
        if (err) {
            return callback(err, "El nombre o la URL del sitio web ya está registrado.");
        }
        callback(null, "El usuario @" + ws.user + " ha registrado el siguiente sitio web.");
    });
};


/**
 * Método para actualizar el intervalo de un sitio web a través del
 * campo 'name' (nombre del sitio web)
 */
var setTimeout = function(ws, callback) {
    /** Busca un objeto en la base de datos con ese nombre (campo único) y lo actualiza */
    Website.findOne({name : ws.name}, function(err, website) {
        if (err) {  // Si ha habido un error
            return callback(false, "Ha habido un error. Inténtelo de nuevo.");
        }
        if (!website) {  // Si no lo ha encontrado
            return callback(false, "El sitio web con nombre \"" + ws.name + "\" no está registrado.");
        }
        if (website.user !== ws.user) {  // Si el usuario no es el mismo que registró el sitio web
            return callback(false, "No tienes permiso para modificar este sitio web.");
        }
        website.timeout = ws.timeout;
        website.save(function(err) {  // Actualiza el objeto
            if (err) {
                return callback(false, "Ha habido un error. Inténtelo de nuevo.");
            }
            callback(true, "Intervalo modificado con éxito.");
        });

    });
};


/**
 * Método para eliminar un sitio web de la base de datos a través del campo 'name' (nombre del sitio web)
 */
var remove = function(ws, callback) {
    /** Busca un objeto en la base de datos con ese nombre (campo único) */
    Website.findOne({name : ws.name}, function(err, website) {
        if (err) {
            return callback({removed: false, msg: "Ha habido un error. Inténtelo de nuevo."});
        }
        if (!website) {  // Si no lo ha encontrado
            return callback({removed: false, msg: "El sitio web con nombre \"" + ws.name + "\" no está registrado."});
        }
        if (website.user !== ws.user) {  // Si el usuario no es el mismo que registró el sitio web
            return callback({removed: false, msg: "No tienes permiso para eliminar este sitio web."});
        }
        website.remove(function(err) {
            if (err) {
                return callback({removed: false, msg: "Ha habido un error. Inténtelo de nuevo."});
            }
            // Si lo ha borrado
            callback({removed: true, msg: "El usuario @" + ws.user + " ha eliminado el sitio web *" + ws.name + "*."});
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
