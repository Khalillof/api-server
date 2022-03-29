//const passport = require('passport');
const FacebookTokenStrategy = require('passport-facebook-token');
const ExtractJwt = require('passport-jwt').ExtractJwt;
const JwtStrategy = require('passport-jwt').Strategy;
const { dbStore , config} = require('../../common');
const LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');
const FacebookStrategy = require('passport-facebook');


class PassportStrategies {

  // local 
  static LocalDefault() {
    return new LocalStrategy(verifyPasswordSafe)
  }

  static Local2(){
    return new LocalStrategy(
      function(username, password, cb) {
        dbStore['account'].model.findOne({ username: username },(err, user) => {
                if (err) { return cb(err); }
                  if (!user) { return cb(null, false, { message: 'Incorrect username or password.' }); }
                  
                  // Function defined at bottom of app.js
                  const isValid = validPassword(password, user.hash, user.salt);
                  
                  if (isValid) {
                      return cb(null, false, { message: 'Incorrect username or password.' });
                  } else {
                      return cb(null, user);
                  }
              })
              .catch((err) => {   
                  cb(err);
              });
  });
  }

  // JWT stratigy
  static JwtAuthHeaderAsBearerTokenStrategy() {
    return new JwtStrategy({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.secretKey(),
      issuer: config.issuer(),
      audience: config.audience(),
    }, (jwt_payload, done)=> {
      
       dbStore['account'].model.findOne({ id: jwt_payload.sub }, function(err, user) {
        
        if (err) {
            return done(err, false);
        }
        if (user) {
            return done(null, user);
        } else {
          
            return done(null, false);
            // or you could create a new account
        }
      });
    });
  }
  // JWT stratigy
  static JwtQueryParameterStrategy() {
    return new JwtStrategy(
      {
        secretOrKey: config.jwtSecret(),
        issuer: config.issuer(),
         audience: config.audience(),
        jwtFromRequest: ExtractJwt.fromUrlQueryParameter('token')
      },
      async (token, done) => {
        try {
          return done(null, token.user);
        } catch (error) {
          done(error);
        }
      }
    );
  }

  //passport facebook Token strategy
  static FacebookToken() {
    return new FacebookTokenStrategy({
      clientID: config.facebook.clientId(),
      clientSecret: config.facebook.clientSecret()
    }, (accessToken, refreshToken, profile, done)=>{
      dbStore['account'].model.findOne({ facebookId: profile.id }, async function(err, user) {
        if (err) {
            return done(err, false);
        }
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
            // or you could create a new account
        }
      });
     } );
    } 

  static facebook(){
    return new FacebookStrategy({
      clientID: config.facebook.clientId(),
      clientSecret: config.facebook.clientSecret(),
      callbackURL: config.facebook.callbackUrl()
    },
    function(accessToken, refreshToken, profile, done) {
      dbStore['account'].model.findOne({ facebookId: profile.id }, function(err, user) {
        if (err) { return done(err, false); }
        if (!user) { return done(null, false); }
        return done(null, user);
        
      });
    });
}

}

module.exports = {PassportStrategies};

function validPassword(password, hash, salt) {
  var hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === hashVerify;
}


function verifyPasswordSafe(username, password, cb) {
  dbStore['account'].model.findOne({ username: username },(err, user)=>{
    if (err) { return cb(err); }
    if (!user) { return cb(null, false, { message: 'Incorrect username or password.' }); }

    crypto.pbkdf2(password, user.salt, 310000, 32, 'sha256', function (err, hashedPassword) {
      if (err) { return cb(err); }
      if (!crypto.timingSafeEqual(user.hash, hashedPassword)) {
        return cb(null, false, { message: 'Incorrect username or password.' });
      }
      return cb(null, user);
    });
  });
}

function genHashedPassword(password) {
  var salt = crypto.randomBytes(32).toString('hex');
  var genHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  
  return {
    salt: salt,
    hash: genHash
  };
}

/**
 * This function is used in conjunction with the `passport.authenticate()` method.  See comments in
 * `passport.use()` above ^^ for explanation

 passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});
 */
/**
* This function is used in conjunction with the `app.use(passport.session())` middleware defined below.
* Scroll down and read the comments in the PASSPORT AUTHENTICATION section to learn how this works.
* 
* In summary, this method is "set" on the passport object and is passed the user ID stored in the `req.session.passport`
* object later on.

passport.deserializeUser(function(id, cb) {
  dbStore['account'].findById(id, function (err, user) {
      if (err) { return cb(err); }
      cb(null, user);
  });
});
*/