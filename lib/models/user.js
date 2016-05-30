var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/** Modela el concepto de usuario.
 *  Se van a guardar todos los datos que nos interesa mantener sobre un usuario:
 *      username: Nombre del usuario
 *      logTime: Hora del día en la que se envía un log de las páginas web registradas por el usuario
 */
var userSchema = new Schema({
    username : { type: String, unique: true },
    logTime : { type: String, default: '00:00' }
});

module.exports = mongoose.model('User', userSchema);
