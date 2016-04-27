var express        = require('express');
var bodyParser     = require("body-parser");
var methodOverride = require("method-override");
var mongoose       = require('mongoose');
var config         = require('./config/database');

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
app.use('/api', router);

app.use(function(req, res, next) {
    res.sendStatus(404);
});

app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.sendStatus(500);
});

mongoose.connect('mongodb://localhost/watchbot', function(err, res) {
    if(err) {
        console.log('ERROR: connecting to Database. ' + err);
    }
    app.listen(process.env.PORT, function() {
        console.log("Node server running on http://localhost:80");
    });
});
