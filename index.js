var FacebookPage = require('./facebook'),
    instance = new FacebookPage('528326870602167'),
    express = require('express'),
    app = express(),
    fs = require('fs');

app.set('view engine', 'jade');

app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users

instance.getProfilePicutre(function (err, favUrl) {
    if (!err)
        instance.favUrl = favUrl.data.url;
    
    app.listen(3000);
});

instance.getPublicPhotos(function (err, photos) {
    instance.publicPhotos = photos.data;
    
//    console.log(photos.data);
    
    app.get('/', function (req, res, next) {
        instance.getPublicPosts(function (err, jsonData) {
            if (!err)
                res.render('index', {
                    faviconUrl: instance.favUrl,
                    photos: instance.publicPhotos,
                    posts: jsonData.data
                });
            next();
        });
    });
});


//app.get('/', function (req, res, next) {
//    instance.getPublicPosts(function (err, jsonData) {
//        if (!err)
//            res.render('index', {
//                faviconUrl: instance.favUrl,
//                photos: instance.publicPhotos,
//                posts: jsonData.data
//            });
//        next();
//    });
//});

