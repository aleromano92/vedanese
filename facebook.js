var https = require('https'),
    concat = require('concat-stream'),
    async = require('async');

function FacebookPage(pageId, appId, appSecret, locale) {
    if (!(this instanceof FacebookPage))
        return new FacebookPage(pageId);

    this.pageId = pageId;
    this.appId = appId;
    this.appSecret = appSecret;
    this.locale = locale;

    this.favUrl = "";
}

FacebookPage.prototype.getPublicPosts = function (callback) {

    var pageId = this.pageId;

    var params = {
        hostname: 'graph.facebook.com',
        port: 443,
        path: '/v2.0/' + pageId + '/posts?access_token=' + this.appId + '|' + this.appSecret + '&locale=' + this.locale,
        method: 'GET'
    };

    https.get(params, function (response) {
        //response is a stream so it is an EventEmitter
        response.setEncoding("utf8");

        //More compact
        response.pipe(concat(function (data) {
            var json = JSON.parse(data);
            json.data.forEach(function (post) {
                post.updated_time = formatDate(post.updated_time);
            });

            callback(null, json);
        }));

        response.on("error", callback);
    });

};

FacebookPage.prototype.getPublicPhotos = function (callback) {

    var pageId = this.pageId;

    var params = {
        hostname: 'graph.facebook.com',
        port: 443,
        path: '/v2.0/' + pageId + '/photos/uploaded?access_token=' + this.appId + '|' + this.appSecret,
        method: 'GET'
    };

    https.get(params, function (response) {
        response.setEncoding("utf8");

        //More compact
        response.pipe(concat(function (photos) {
            callback(null, JSON.parse(photos));
        }));

        response.on("error", callback);
    });

};

FacebookPage.prototype.getCoverPhotos = function (callback) {

    var pageId = this.pageId;
    var that = this;

    async.waterfall([

        function (done) {
            that.getAlbums(function (err, albums) {
                if (!err) {
                    albums.data.forEach(function (album) {
                        if (album.name === 'Cover Photos')
                            done(null, album.id);
                    });
                }
            });
        },
        function (albumId, done) {
            var params = {
                hostname: 'graph.facebook.com',
                port: 443,
                path: '/v2.0/' + albumId + '/photos?access_token=' + that.appId + '|' + that.appSecret,
                method: 'GET'
            };

            https.get(params, function (response) {
                response.setEncoding("utf8");

                response.pipe(concat(function (data) {
                    done(null, JSON.parse(data));
                }));

                response.on("error", done);
            });
        }
    ],
        function (err, photos) {
            if (err) return callback(err);
            callback(null, photos);
        });

};

FacebookPage.prototype.getAlbums = function (callback) {

    var pageId = this.pageId;

    var params = {
        hostname: 'graph.facebook.com',
        port: 443,
        path: '/v2.0/' + pageId + '/albums?access_token=' + this.appId + '|' + this.appSecret,
        method: 'GET'
    };

    https.get(params, function (response) {
        response.setEncoding("utf8");

        //More compact
        response.pipe(concat(function (albums) {
            callback(null, JSON.parse(albums));
        }));

        response.on("error", callback);
    });

};

FacebookPage.prototype.getProfilePicutre = function (callback) {

    var pageId = this.pageId;

    var params = {
        hostname: 'graph.facebook.com',
        port: 443,
        path: '/v2.0/' + pageId + '/picture?redirect=false&type=square&width=16&height=16',
        method: 'GET'
    };

    https.get(params, function (response) {
        response.setEncoding("utf8");

        //More compact
        response.pipe(concat(function (posts) {
            callback(null, JSON.parse(posts));
        }));

        response.on("error", callback);
    });

};

module.exports = FacebookPage;


function formatDate(dataString) {

    dataString = new Date(dataString);

    var monthNames = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
    "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];

    return dataString.getDate() + ' ' + monthNames[dataString.getMonth()] + ' ' + dataString.getFullYear();
}