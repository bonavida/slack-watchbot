var express        = require('express');
var bodyParser     = require("body-parser");
var methodOverride = require("method-override");
var mongoose       = require('mongoose');
var config         = require('./config/database');
var watchbot       = require('./lib/modules/ping/watchbot');
var port           = process.env.PORT;

var app = express();


/** Para poder parsear JSON */
app.use(bodyParser.urlencoded({ extended : false }));
app.use(bodyParser.json());


/** Para implementar y personalizar metodos HTTP */
app.use(methodOverride());


/** Para crear una API Rest */
var router = express.Router();

router.get('/', function(req, res) {
    res.send('Watchbot is working and doing its magic.');
});

/**
 * Carga el enrutado configurado en un fichero externo y se establece /api como la raíz
 */
require('./lib/routes/routes')(router);
app.use('/api', router);

/** Manda un statusCode de 404 cuando se pide un recurso que no existe */
app.use(function(req, res, next) {
    res.sendStatus(404);
});

/** Manda un statusCode de 500 si ocurre algún error en el servidor */
app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.sendStatus(500);
});

/** Inicia la vigilancia */
watchbot.init();

/** Conecta con la base de datos y arranca el servidor */
mongoose.connect(config.database, function(err, res) {
    if (err) {
        console.log('ERROR: connecting to Database. ' + err);
    }
    app.listen(port, function() {
        console.log("Watchbot Node server running on http://localhost:" + port);
    });
});
