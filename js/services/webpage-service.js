var Webpage = require('../models/webpage');

/**
 * Método para guardar una página web en la base de datos
 */
var add = function(wp) {
    /** Crea una instancia de Webpage con los datos pasados como parámetros */
    var webpage = new Webpage({
        name : wp.name,
        url  : wp.url,
        user : wp.user
    });
    /** Guarda la instancia en la base de datos */
    webpage.save(function(err, webpage) {
        if (err) {
            return { success: false }; //
        } else {
            return { success: true };
        }
    });
};

module.exports = {
  add: add
};
