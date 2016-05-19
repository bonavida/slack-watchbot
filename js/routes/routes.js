var sc = require('../modules/slack/slash-commands');

module.exports = function(router) {

    /** HTTP POST
     * Slack funciona con llamadas POST
     */
    router.post('/webpages', sc.data);

};
