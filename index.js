var FacebookPage = require('./facebook'),
    instance = new FacebookPage('528326870602167', '676001925817506', '41b08f470f656e1d9b8e269c19c44964', 'it_IT'),
    express = require('express'),
    app = express(),
    async = require('async');

app.set('view engine', 'jade');

app.use(express.static(__dirname + '/app')); // set the static files location /public/img will be /img for users

instance.getProfilePicutre(function (err, favUrl) {
    if (!err) {
        instance.favUrl = favUrl.data.url;
        app.listen(80);
    }

});

app.get('/', function (req, res, next) {

    async.parallel({
            photos: function (callback) {
                instance.getCoverPhotos(function (err, photos) {
                    if (!err)
                        callback(null, photos);
                });
            },
            posts: function (callback) {
                instance.getPublicPosts(function (err, posts) {
                    if (!err)
                        callback(null, posts);

                });
            }
        },
        function (err, results) {
            if (err) return console.error(err);
            res.render('index', {
                faviconUrl: instance.favUrl,
                photos: results.photos.data,
                posts: results.posts.data
            });
            next();
        });

});