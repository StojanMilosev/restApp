var OAuth = require('oauth').OAuth;
var config = require('./config');

//kreiranje oauth objekta radi pristupanja Twitteru
var oauth = new OAuth(
    config.request_token_url,
    config.access_token_url,
    config.consumer_key,
    config.consumer_secret,
    config.oauth_version,
    config.oauth_callback,
    config.oauth_signature
);

module.exports = {
    get:function (url,access_token,access_token_secret,cb) {
        oauth.get.call(oauth,url,access_token,access_token_secret,cb);
    },
    post:function (url,access_token,access_token_secret,body,cb) {
        oauth.get.call(oauth,url,access_token,access_token_secret,body,cb);
    },
    redirectToTwitterLoginPage: function (req,res) {
        oauth.getOAuthRequestToken(function (error,oauth_token,oauth_token_secret) {
            if(error){
                console.log(error);
                res.send("Autentikacija neuspesna");
            }else{
                res.cookie('oauth_token',oauth_token,{httpOnly:true});
                res.cookie('oauth_token_secret',oauth_token_secret,{httpOnly:true});
                res.redirect(config.authorize_url + '?oauth_token='+oauth_token);
            }
        });
    },
    authenticate: function (req,res,cb) {
        //proveravanje prisutnosti token-a i privmremennih akreditiva
        if(!(req.cookies.oauth_token && req.cookies.oauth_token_secret && req.query.oauth_verifier)){
            return cb("Zahtev ne poseduje sve potrebne podatke");
        }

        //uklanjanje request-token-cokkie-ja
        res.clearCookie('oauth_token');
        res.clearCookie('oauth_token_secret');
        
        //zamena oauth_verifier za access token
        oauth.getOAuthAccessToken(
            req.cookies.oauth_token,
            req.cookies.oauth_token_secret,
            req.query.oauth_verifier,
            function (error,oauth_access_token,oauth_access_token_secret,results) {
                if (error) {
                    return cb(error);
                }

                //povlacenje korisnikovog twiter ID-a
                oauth.get('https://api.twitter.com/1.1/account/verify_credentials.json',
                    oauth_access_token,oauth_access_token_secret,
                    function (error,data) {
                        if (error) {
                            console.log(error);
                            return cb(error);
                        }

                        //parsovanje JSON odziva
                        data = JSON.parse(data);

                        //cuvanje access_token, access_token_secret i korisnikovog Twitter id-a
                        res.cookie('access_token',oauth_access_token,{httpOnly:true});
                        res.cookie('access_token_secret,oauth',oauth_access_token_secret,{httpOnly:true});
                        res.cookie('twitter_id',data.id_str,{httpOnly:true});

                        //obavestavanje router-a da je autentikacija uspesna
                        cb();
                    }
                );
            }
        );

        
    }
};