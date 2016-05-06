var util = require('util');
var Bot = require('slackbots');

var WatchBot = function Constructor(settings) {
    this.settings = settings;
    this.settings.name = settings.name || 'watchbot';

};

// inherits methods and properties from the Bot constructor
util.inherits(WatchBot, Bot);


/**
 * Run the bot
 */
WatchBot.prototype.run = function () {
    WatchBot.super_.call(this, this.settings);

    this.on('start', this._onStart);

    this.user = null;  // Para guardar los datos del usuario que hace de bot en Slack
};

/**
 * On Start callback, called when the bot connects to the Slack server and access the channel
 */
WatchBot.prototype._onStart = function () {
    this._loadBotUser();
};

/**
 * Loads the user object representing the bot
 */
WatchBot.prototype._loadBotUser = function () {
    var self = this;
    this.user = this.users.filter(function (user) {
        return user.name === self.name;
    })[0];
};

module.exports = WatchBot;
