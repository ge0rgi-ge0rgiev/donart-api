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

    // donart-heroku project configuration
    database: {
        host: 'wyqk6x041tfxg39e.chr7pe7iynqr.eu-west-1.rds.amazonaws.com',
        user: 'qhdku9ijnr5wh69x',
        password: 'kbq0bmk9fdj6t1db',
        database: 'm0tj889wu2exupdm'
    },

    protectedEndpoints: [
    
    ],

}