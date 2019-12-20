const LocalStrategy = require('passport-local').Strategy,
 ManagerModel = require('../models/manager-model'),
 JWTstrategy = require('passport-jwt').Strategy,
 ExtractJWT = require('passport-jwt').ExtractJwt,
 dotenv = require('dotenv');
 dotenv.config();


module.exports = function (passport) {
    passport.use('local-login', new LocalStrategy({ usernameField: 'username', passwordField: 'password'},
        async (username, password, done) => {
            try {
                const manager = await ManagerModel.list.findOne({ 'username': username });
                if (!manager) {
                    return done(null, false, {message: 'Tài khoản hoặc mật khẩu không đúng'});
                }
                const isValidPass = await ManagerModel.validPassword(username, password);
                if (!isValidPass) {
                    return done(null, false, {message: 'Tài khoản hoặc mật khẩu không đúng'});
                }
                return done(null, manager, {message: `Chào mừng ${username}`});
            } catch (e) {
                return done(e);
            }
        }
    ));

    const options = {
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.TOKEN_SECRET
    };
    
    passport.use('jwt', new JWTstrategy(options, async(jwt_payload, done)=>{
        try{
            const manager = await ManagerModel.list.findOne({'username': jwt_payload.username});
            
            if(!manager){
                return done(null, false, {message: `Không tìm thấy tài khoản ${jwt_payload.username}`});
            }
            return done(null, manager)
        }
        catch(err){
            return done(err, false);
        }
    }));
}

