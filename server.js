var express        = require('express');
var bodyParser     = require("body-parser");
var methodOverride = require("method-override");
var mongoose       = require('mongoose');
var config         = require('./config/database');
var request        = require('request');
var port           = process.env.PORT;

var app = express();

/** Para poder parsear JSON */
app.use(bodyParser.urlencoded({ extended : false }));
app.use(bodyParser.json());

/** Para implementar y personalizar metodos HTTP */
app.use(methodOverride());

/** Para crear la API Rest */
var router = express.Router();

router.get('/', function(req, res) {
    res.send('Watchbot is working and doing its magic.');
});

app.use(router);  //TODO: Eliminar esta linea
require('./js/routers/webpages')(router);
app.use('/api', router);

app.use(function(req, res, next) {
    res.sendStatus(404);
});

app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.sendStatus(500);
});

// request('https://eforce.elkno.com/api', function (error, res, body) {
//     // Website is up
//     if (!error && res.statusCode === 200) {
//         console.log("UP");
//     }
//
//     // No error but website not ok
//     else if (!error) {
//         console.log("DOWN: " + res.statusCode);
//     }
//
//     // Loading error
//     else {
//         console.log("DOWN");
//     }
// });

mongoose.connect(config.database, function(err, res) {
    if (err) {
        console.log('ERROR: connecting to Database. ' + err);
    }
    app.listen(port, function() {
        console.log("Watchbot Node server running on http://localhost:" + port);
    });
});
