module.exports = {

    api: {
        sessionDuration: 3600, // in seconds,
        salt: '$2a$10$ZzU7rZOTPSagDgR9ltdeHO', // salt generated by bcrypt,
        appRoot: require('path').resolve(__dirname) + '/'
    },

    server: {
        host: '',
        port: 3000
    },

    database: {
        host: '',
        user: '',
        password: '',
        database: ''
    },

    protectedEndpoints: [
    
    ],

}