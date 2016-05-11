var Webpage  = require('../models/webpage');
var dotenv   = require('dotenv');
var slackAPI = require('node-slack');
var cron     = require('./cron-watch');

/** Carga variables de entorno desde un fichero .env al process.env */
dotenv.load();

/** Carga la API de Slack con la URL asociada al Incoming Webhooks de la cuenta de Slack del equipo */
var slack = new slackAPI(process.env.WEBHOOK);

/**
 * Método para informar en el canal de Slack, ya sea para ofrecer ayuda
 * o listar todas las páginas web registradas en la aplicación
 */
var info = function(req, res, next) {
    Webpage.find(function(err, webpages) {
        if (!err) {
            if (!webpages) {
                next();
            } else {
                res.json(webpages);
            }
        } else {
            res.send(500, err.message);
        }
    });
};

// var cronJob = cron.job("*/10 * * * * *", function(){
//     // perform operation e.g. GET request http.get() etc.
//     slack.send({text:"Hello"});
// });

//cronJob.start();

/**
 * Método para crear o eliminar una página web en la aplicación desde Slack
 */
var data = function(req, res) {
    //slack.send({
    //    text: "Hello from the other side!"
    //});
    //res.end();
    if (req.body.text === "start") {
        cron.start();
    }

    if (req.body.text === "stop") {
        cron.stop();
    }

    res.json({
        response_type: "in_channel",
        text:"Hola de nuevo."
    });
    /**
    var webpage = new Webpage({
        name : req.body.name,
        url : req.body.url,
        user : req.body.user
    });
    webpage.save(function(err, webpage) {
        if (!err) {
            if (!webpage) {
                next();
            }
            res.json({token: process.env.WATCHBOT_TOKEN});
            //res.json({success: true, msg: 'Successful created new user.'});
        } else {
            res.send(500, err.message);
            //return res.json({success: false, msg: 'Username or e-mail already exists.'});
        }
    });
    */
};

module.exports = {
    data: data
};
