const mysql = require('mysql'),
    mysqlWrapper = require('node-mysql-wrapper'),
    config = require('../../config');

let connection = mysql.createConnection({
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    database: config.database.database
});

module.exports = mysqlWrapper.wrap(connection);