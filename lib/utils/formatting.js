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
                "Added on " + getFormatedDate(date);
         if (isAll) {
             msg += " by the user @" + website.user;
         }
         msg += "\nStatus: " + ((website.status==="up") ? "Up" : "Down") + "\n\n";
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
                "Added on " + getFormatedDate(date) + "\n" +
                "Status: " + ((website.status==="up") ? "Up" : "Down") + "\n";
        if (website.numIncidencies !== 0) {
            var lastCheckedDown = new Date(website.lastCheckedDown);
            if ((website.status==="down")) {
                var firstCheckedDown = new Date(website.firstCheckedDown);
                msg += "It has been down since " + getFormatedDate(firstCheckedDown) + "\n" +
                       "Last time checked was on " + getFormatedDate(lastCheckedDown) + "\n" +
                       "Number of times it has been down: " + website.numIncidencies + "\n";
            } else {
                msg += "Number of times it has been down: " + website.numIncidencies + "\n" +
                       "Last time it was down was on " + getFormatedDate(lastCheckedDown) + "\n";
            }
        } else {
            msg += "Number of times it has been down: " + website.numIncidencies + "\n";
        }
        msg +=  "Average response time: " + website.averageResponseTime + " ms\n" +
                "Timeout: every " + website.timeout + " minutes\n\n";
     });
     return msg;
};


/** Método que convierte una fecha en una cadena de texto */
function getFormatedDate(date) {
    var dayAdded = getFormatedNumber(date.getDate()),
        monthAdded = getFormatedNumber(date.getMonth() + 1),
        yearAdded = date.getFullYear(),
        hourAdded = getFormatedNumber(date.getHours()) + ":" + getFormatedNumber(date.getMinutes());

    return(dayAdded + "/" + monthAdded + "/" + yearAdded + " at " + hourAdded);
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
