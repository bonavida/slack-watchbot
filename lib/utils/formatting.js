/**
 * Método que convierte una lista de sitios web en una cadena de texto.
 * Si isAll es true, es que se han de mostrar todos los sitios web
 */
var list = function(websites, isAll) {
    var msg = "";
    websites.forEach(function(website) {
        var date = new Date(website.dateAdded);
        msg += "*" + website.name + "*" +
               "  " + website.url + "\n" +
               "Añadido el " + getFormatedDate(date);
        if (isAll) {
            msg += " por el usuario @" + website.user;
        }
        msg += "\nEstado: " + ((website.status==="up") ? "Funcionando" : "Caído") + "\n\n";
    });
    return msg;
};


/**
 * Método que genera un log completo con todos los detalles de todos los sitios web
 * registrados por un usuario
 */
var log = function(websites) {
    var msg = "";
    websites.forEach(function(website) {
        var date = new Date(website.dateAdded);
        msg += "*" + website.name + "*" +
               "  " + website.url + "\n" +
               "Añadido el " + getFormatedDate(date) + "\n" +
               "Estado: " + ((website.status==="up") ? "Funcionando" : "Caído") + "\n";
       if (website.numIncidencies !== 0) {
           var lastCheckedDown = new Date(website.lastCheckedDown);
           if ((website.status==="down")) {
               var firstCheckedDown = new Date(website.firstCheckedDown);
               msg += "Caído desde el " + getFormatedDate(firstCheckedDown) + "\n" +
                      "Última vez comprobado el " + getFormatedDate(lastCheckedDown) + "\n" +
                      "Nº de veces caído: " + website.numIncidencies + "\n";
           } else {
               msg += "Nº de veces caído: " + website.numIncidencies + "\n" +
                      "Última vez caído el " + getFormatedDate(lastCheckedDown) + "\n";
           }
       } else {
           msg += "Nº de veces caído: " + website.numIncidencies + "\n";
       }
       msg +=  "Tiempo de respuesta medio: " + website.averageResponseTime + " ms\n" +
               "Intervalo de vigilancia: cada " + website.timeout + " minutos\n\n";
    });
    return msg;
};


/** Método que convierte una fecha en una cadena de texto */
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
    log: log,
    getFormatedDate: getFormatedDate
};
