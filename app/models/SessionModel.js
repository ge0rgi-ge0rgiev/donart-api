let db = require('../libs/database'),
    Promise = require('promise');

let Private = {

    getCriteriaObject: (params) => {
        let whereFields = {
            authToken: "auth_token",
            refreshToken: "refresh_token",
            userId: "user_id"
        }
        let paramKey = Object.keys(params)[0];
        return db.table('session').criteria
            .where(whereFields[paramKey]).eq(params[paramKey]);
    }

};



module.exports = {

    /**
     * Get session data by authentication token
     * 
     */
    getSessionData: (params) => {
        return new Promise((resolve, reject) => {
            db.ready(function () {
                let criteria = Private.getCriteriaObject(params);
                db.table('session').findSingle(criteria)
                    .then(session => resolve(session))
                    .catch(err => reject(err));
            });
        });
    },

    /**
     * Save session. Used for both create and update session.
     * 
     */
    saveSession: (session) => {
        return new Promise((resolve, reject) => {
            db.ready(function () {
                db.table('session').save(session)
                    .then(result => resolve(result))
                    .catch(err => reject(err));
            });
        });
    }

}