var User = require('../models/user');


/**
 * Método para crear un usuario en la base de datos o actualizar el nº de sitios web registrados por dicho usuario
 */
var createOrUpdate = function(username, callback) {
    User.findOne({username : username}, function(err, user) {
        if (err) {
            return callback(err);
        }
        if (!user) {  // Si no existe, se crea
            var newUser = new User({
                username : username
            });
            newUser.save(function(err) {
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        } else {   // Si existe, se actualiza
            user.numWebsites += 1;
            user.save(function(err) {
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        }
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
             return callback(false, "No has registrado ningún sitio web.");
         }
         // Si lo ha encontrado, se ha actualizado
         callback(true, "Se ha modificado la hora de envío del informe diario con éxito.");
     });
 };


 module.exports = {
     createOrUpdate: createOrUpdate,
     setLogTime: setLogTime
 };
