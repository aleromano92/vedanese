var https = require('https'),
    concat = require('concat-stream');

function FacebookPage(pageId) {
    if (!(this instanceof FacebookPage))
        return new FacebookPage(pageId);

    this.pageId = pageId;
    this.favUrl = "";
    this.publicPhotos = [];
}

FacebookPage.prototype.getPublicPosts = function (callback) {

    var pageId = this.pageId;

    var params = {
        hostname: 'graph.facebook.com',
        port: 443,
        path: '/v2.0/'+ pageId + '/posts?access_token=676001925817506|41b08f470f656e1d9b8e269c19c44964&locale=it_IT',
        method: 'GET'
    };

    https.get(params, function (response) {
        //response is a stream so it is an EventEmitter
        response.setEncoding("utf8");

        //More compact
        response.pipe(concat(function (data) {
            var json = JSON.parse(data);
            json.data.forEach(function(post){
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
        path: '/v2.0/'+ pageId + '/photos/uploaded?access_token=676001925817506|41b08f470f656e1d9b8e269c19c44964',
        method: 'GET'
    };

    https.get(params, function (response) {
        //response is a stream so it is an EventEmitter
        response.setEncoding("utf8");

        //More compact
        response.pipe(concat(function (data) {
            callback(null, JSON.parse(data));
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
        //response is a stream so it is an EventEmitter
        response.setEncoding("utf8");

        //More compact
        response.pipe(concat(function (data) {
            callback(null, JSON.parse(data));
        }));

        response.on("error", callback);
    });

};

module.exports = FacebookPage;


function formatDate(dataString){
    
    dataString = new Date(dataString);
    
    var monthNames = [ "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
    "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre" ];

    return dataString.getDate() + ' ' + monthNames[dataString.getMonth()] + ' ' + dataString.getFullYear();
}

