var Webpage  = require('../models/webpage');

module.exports = function(router) {

    router.get('/webpages', function(req, res, next) {
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
    }).post('/webpages', function(req, res, next) {
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
                res.json(webpage);
                //res.json({success: true, msg: 'Successful created new user.'});
            } else {
                res.send(500, err.message);
                //return res.json({success: false, msg: 'Username or e-mail already exists.'});
            }
        });
    });

};
