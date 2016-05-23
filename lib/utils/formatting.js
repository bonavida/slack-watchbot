/**
 * Método que convierte una lista de sitios web en una cadena de texto.
 * Si isAll es true, es que se han de mostrar todos los sitios web
 */
var list = function(websites, isAll) {
    var msg = "";
    for (var i = 0; i < websites.length; i++) {
        var date = new Date(websites[i].dateAdded);
        msg += "*" + websites[i].name + "*" +
               "  " + websites[i].url + "\n" +
               "Añadido el " + getFormatedDate(date);
        if (isAll) {
            msg += " por el usuario @" + websites[i].user;
        }
        msg += "\nEstado: " + ((websites[i].status==="up") ? "Funcionando" : "Caído") + "\n\n";
    }
    return msg;
};


/**
 * Método que genera un log completo con todos los detalles de todos los sitios web
 * registrados por un usuario
 */
var log = function(websites) {
    var msg = "";
    for (var i = 0; i < websites.length; i++) {
        var date = new Date(websites[i].dateAdded);
        msg += "*" + websites[i].name + "*" +
               "  " + websites[i].url + "\n" +
               "Añadido el " + getFormatedDate(date) + "\n" +
               "Estado: " + ((websites[i].status==="up") ? "Funcionando" : "Caído") + "\n" +
               "Tiempo de respuesta medio: " + websites[i].averageResponseTime + " ms\n" +
               "Intervalo de vigilancia: cada " + websites[i].timeout + " minutos\n" +
               "Nº de veces caído: " + websites[i].numIncidencies + "\n";
        if (websites[i].numIncidencies !== 0) {
            var lastCheckedDown = new Date(websites[i].lastCheckedDown);
            msg += "Última vez caído el " + getFormatedDate(lastCheckedDown) + "\n";
        }
        msg += "\n";
    }
    return msg;
};


/** Método privado que convierte una fecha en una cadena de texto */
function getFormatedDate(date) {
    var dayAdded = getFormatedNumber(date.getDate()),
        monthAdded = getFormatedNumber(date.getMonth() + 1),  // El mes va del 0 al 11
        yearAdded = date.getFullYear(),
        hourAdded = getFormatedNumber(date.getHours()) + ":" + getFormatedNumber(date.getMinutes());

    return(dayAdded + "/" + monthAdded + "/" + yearAdded + " a las " + hourAdded);
}


/** Método privado que rellena un número con ceros para que tenga dos dígitos */
function getFormatedNumber(number) {
    return ("0" + number).slice(-2);
}


module.exports = {
    list: list,
    log: log
};
