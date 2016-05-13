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


// function listToString(webpages) {
//     var res = "";
//     if (webpages.length === 0) {
//         res = "Este usuario no ha registrado ninguna página web.";
//     } else {
//         for (var webpage in webpages) {
//             var date = new Date(webpage.dateAdded);
//             var dayAdded = date.getDate();
//             var monthAdded = date.getMonth() + 1;  // El mes va del 0 al 11
//             var yearAdded = date.getFullYear();
//             var hourAdded = date.getHours() + ":" + date.getMinutes();
//             var incidencies = webpage.incidencies===undefined ? 0 : webpage.incidencies.length;
//             res += "*" + webpage.name + "*" +
//                    "  " + webpage.url + "\n" +
//                    "Añadido el " + dayAdded + "/" + monthAdded + "/" + yearAdded + " a las " + hourAdded + "\n" +
//                    "Nº de veces caído: " + incidencies + "\n\n";
//         }
//     }
//     return res;
// }

module.exports = {
  add: add,
  remove: remove,
  getWebpages: getWebpages
};
