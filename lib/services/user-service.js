var User = require('../models/user');


/**
 * Método para guardar un sitios web en la base de datos
 */
var add = function(username, callback) {
    /** Crea una instancia de User con los datos pasados como parámetros */
    var user = new User({
        username : username
    });
    /** Guarda la instancia en la base de datos */
    user.save(function(err) {
        if (err) {
            return callback(err);
        }
        callback(null);
    });
};


/**
 * Método que actualiza la hora del día en la que se envía el log diario de un sitio web al usuario de Slack
 */
 var setLogTime = function(username, logTime, callback) {
     /** Busca un objeto en la base de datos con ese nombre usuario (campo único) y lo actualiza */
     User.findOneAndUpdate({username : username}, {$set:{logTime : logTime}}, {new : true}, function(err, user) {
         if (err) {
             return callback(false, "Ha habido un error. Inténtelo de nuevo.");
         }
         if (!user) {  // Si no lo ha encontrado
             return callback(false, "No has registrado ninguna página web.");
         }
         // Si lo ha encontrado, se ha actualizado
         callback(true, "Se ha modificado la hora de envío del informe diario con éxito.");
     });
 };


 module.exports = {
     add: add,
     setLogTime: setLogTime
 };
