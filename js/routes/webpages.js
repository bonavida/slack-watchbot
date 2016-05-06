var sc = require('../modules/slash-commands');

module.exports = function(router) {

    router.get('/webpages', sc.info())
          .post('/webpages', sc.data());

};
