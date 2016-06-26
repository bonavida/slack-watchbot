var User = require('../models/user');

/**
 * Método para crear un usuario en la base de datos o actualizar el nº de sitios web registrados por dicho usuario
 */
var createOrUpdate = function(username, callback) {
    User.findOne({username : username}, function(err, user) {
        if (err) {
            return callback(err, null);
        }
        if (!user) {  // Si no existe, se crea
            var newUser = new User({
                username : username
            });
            newUser.save(function(err) {
                if (err) {
                    return callback(err, null);
                }
                callback(null, newUser);
            });
        } else {   // Si existe, se actualiza
            user.numWebsites += 1;
            user.save(function(err) {
                if (err) {
                    return callback(err, null);
                }
                callback(null, user);
            });
        }
    });
};


/**
 * Método que actualiza la hora del día en la que se envía el log diario de los sitios web al usuario de Slack
 */
 var setLogTime = function(username, logTime, callback) {
     User.findOne({username : username}, function(err, user) {
         if (err) {
             return callback(false, "An error occurred. Try again.");
         }
         if (!user) {
             return callback(false, "You haven't registered any website yet.");
         }
         if (user.numWebsites === 0) {
             return callback(false, "You haven't registered any website yet.");
         }
         user.logTime = logTime;
         user.save(function(err) {
             if (err) {
                 return callback(false, "An error occurred. Try again.");
             }
             callback(true, "The time of the daily log has been successfully modified.");
         });
     });
 };


 var removeWebsite = function(username, callback) {
     User.findOne({username : username}, function(err, user) {
         if (err) {
             return callback(err, false);
         }
         if (user) {
             var removeCron = false;
             user.numWebsites -= 1;
             if (user.numWebsites === 0) {
                 removeCron = true;
             }
             user.save(function(err) {
                 if (err) {
                     return callback(err, false);
                 }
                 callback(null, removeCron);
             });
         }
         callback(null, false);
     });
 };


 /**
  * Método que devuelve todos los usuarios registrados en la base de datos
  */
 var getUsers = function(callback) {
     User.find({}, function(err, users) {
         if (err) {
             return callback(err, null);
         }
         callback(null, users);
     });
 };


 /**
  * Método que, dado el nombre de un usuario, busca y devuelve dicho usuario
  */
 var getUser = function(username, callback) {
     User.findOne({username : username}, function(err, user) {
         if (err) {
             return callback(err, null);
         }
         callback(null, user);
     });
 };


 module.exports = {
     createOrUpdate: createOrUpdate,
     setLogTime: setLogTime,
     removeWebsite: removeWebsite,
     getUsers: getUsers,
     getUser: getUser
 };
