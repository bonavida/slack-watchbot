var slashCommands = require('../modules/slack/slash-commands');

module.exports = function(router) {

    /** HTTP POST
     * Slack funciona con llamadas POST
     */
    router.post('/websites', slashCommands.post);

};
