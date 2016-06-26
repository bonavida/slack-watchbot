var WebsiteService = require('../../services/website-service');
var UserService    = require('../../services/user-service');
var slack          = require('../slack/slack-sender');
var CronJob        = require('cron').CronJob;
var utils          = require('../../utils/formatting');

/** Mapa para programar una tarea (value) que envía un log diario a una hora determinada a cada usuario (key) */
var cronMap = {};


var init = function(callback) {
    cronMap = {};
    UserService.getUsers(function(err, users) {
        if (err) {
            return callback(err);
        } else {
             users.forEach(function(user) {
                 if (user.numWebsites > 0) {
                     var job = setJob(user);
                     cronMap[user.username] = job;
                     cronMap[user.username].start();
                 }
             });
             callback(null);
        }
    });
};


/** Método para añadir una tarea */
var add = function(user) {
    var job = setJob(user);
    cronMap[user.username] = job;
    cronMap[user.username].start();
};


/** Método para parar la tarea */
var remove = function(username) {
    cronMap[username].stop();
    delete cronMap[username];
};


var setLogTime = function(username, callback) {
    UserService.getUser(username, function(err, user) {
        if (err) {
            return callback(err);
        }
        if (user) {
            if (user.numWebsites > 0) {
                var job = setJob(user);
                cronMap[user.username].stop();
                cronMap[user.username] = job;
                cronMap[user.username].start();
            }
        }
        callback(null);
    });
};


/** Método privado que configura una tarea para un usuario */
var setJob = function(user) {
    var logTime = user.logTime.split(":");
    var pattern = "00 " + logTime[1] + " " + logTime[0] + " * * *";
    var job = new CronJob({
        cronTime: pattern,
        onTick: function() {
            WebsiteService.getWebsites(user.username, function(err, websites) {
                if (err) {
                    console.log("Error: " + err);
                } else {
                    var log = utils.log(websites);
                    slack.send({
                        text: "Full log of your websites:",
                        attachments: [{
                            text: log,
                            color: "warning",
                            mrkdwn_in: ["text"]
                        }],
                        channel: "@" + user.username
                    });
                }
            });
        },
        start: false,
        runOnInit: false
    });
    return job;
};


module.exports = {
  init: init,
  add: add,
  remove: remove,
  setLogTime: setLogTime
};
