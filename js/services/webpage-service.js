var Webpage = require('../models/webpage');

/**
 * Método para guardar una página web en la base de datos
 */
var add = function(wp, callback) {
    /** Crea una instancia de Webpage con los datos pasados como parámetros */
    var webpage = new Webpage({
        name : wp.name,
        url  : wp.url,
        user : wp.user,
        channel: wp.channel
    });
    /** Guarda la instancia en la base de datos */
    webpage.save(function(err) {
        if (err) {
            return callback(err, "El nombre o la URL ya están registrados.");
        }
        callback(null, "Página web añadida con éxito.");
    });
};


/**
 * Método para eliminar una página web de la base de datos
 * a través del campo 'name' (nombre de la página web)
 */
var remove = function(removeName, callback) {
    /** Busca un objeto en la base de datos con ese nombre (campo único) */
    Webpage.findOne({name : removeName}, function(err, webpage) {
        if (!webpage) {  // Si no lo ha encontrado
            return callback(false, "La página web con nombre \"" + removeName + "\" no está registrada.");
        }
        webpage.remove(function(err) {  // Si lo ha encontrado, elimina el objeto
            if (err) {
                return callback(false, "Ha habido un error. Inténtelo de nuevo.");
            }
            callback(true, "Página web eliminada con éxito.");
        });
    });
};


/**
 * Método que, dado un nombre de usuario, busca todas las páginas web que ha añadido dicho usuario
 */
var getWebpages = function(userName, callback) {
    Webpage.find({user: userName}, function(err, webpages) {
        if (err) {
            return callback(err, webpages);
        }
        callback(null, webpages);
    });
};


module.exports = {
  add: add,
  remove: remove,
  getWebpages: getWebpages
};
