var Website = require('../models/website');
var User    = require('../models/user');


/**
 * Método para guardar un sitios web en la base de datos
 */
var add = function(wp, callback) {
    /** Crea una instancia de Website con los datos pasados como parámetros */
    var website = new Website({
        name : wp.name,
        url  : wp.url,
        user : wp.user,
        channel: wp.channel
    });
    /** Guarda la instancia en la base de datos */
    website.save(function(err) {
        if (err) {
            return callback(err, "El nombre o la URL del sitio web ya está registrado.");
        }
        callback(null, "El sitio web ha sido añadido con éxito.");
    });
};


/**
 * Método para actualizar el intervalo de un sitio web a través del
 * campo 'name' (nombre del sitio web)
 */
var setTimeout = function(name, timeout, callback) {
    /** Busca un objeto en la base de datos con ese nombre (campo único) y lo actualiza */
    Website.findOneAndUpdate({name : name}, {$set:{timeout : timeout}}, {new : true}, function(err, website) {
        if (err) {
            return callback(false, "Ha habido un error. Inténtelo de nuevo.");
        }
        if (!website) {  // Si no lo ha encontrado
            return callback(false, "El sitio web con nombre \"" + name + "\" no está registrado.");
        }
        // Si lo ha encontrado, se ha actualizado
        callback(true, "Intervalo modificado con éxito.");
    });
};


/**
 * Método para eliminar un sitio web de la base de datos
 * a través del campo 'name' (nombre del sitio web)
 */
var remove = function(removeName, callback) {
    /** Busca un objeto en la base de datos con ese nombre (campo único) */
    Website.findOneAndRemove({name : removeName}, function(err, website) {
        if (err) {
            return callback(false, "Ha habido un error. Inténtelo de nuevo.");
        }
        if (!website) {  // Si no lo ha encontrado
            return callback(false, "El sitio web con nombre \"" + removeName + "\" no está registrado.");
        }
        // Si lo ha borrado, se busca si hay más sitios web registrados por el mismo usuario. Si no los hay, se elimina dicho usuario.
        Website.find({user : website.user}, function(err, websites) {
            if (err) {
                console.log("Error: " + err);
            }
            if (websites.length === 0) {
                User.findOneAndRemove({username : website.user}, function(err) {
                    if (err) {
                        console.log("Error: " + err);
                    }
                });
            }
        });
        callback(true, "El sitio web *" + removeName + "* ha sido eliminado con éxito.");
    });
};


/**
 * Método que devuelve todos los sitios web registrados en la base de datos
 */
var getAllWebsites = function(callback) {
    Website.find({}).sort('dateAdded').exec(function(err, websites) {
        if (err) {
            return callback(err, websites);
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
            return callback(err, websites);
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



module.exports = {
  add: add,
  setTimeout: setTimeout,
  remove: remove,
  getAllWebsites: getAllWebsites,
  getWebsites: getWebsites,
  getWebsite: getWebsite
};
