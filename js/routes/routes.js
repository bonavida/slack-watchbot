var sc = require('../modules/slash-commands');

module.exports = function(router) {

    /** HTTP POST
     * Slack funciona con llamadas POST
     */
    router.post('/webpages', sc.data);

};
