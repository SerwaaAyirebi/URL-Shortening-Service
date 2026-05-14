const mysql = require('mysql2');

var connection = mysql.createConnection({
    host: 'localhost',
    database: 'url_shortener',
    user: 'root',
    password: '1234'
})

connection.connect(function(error) {
    if (error) {
        throw error;
    } else {
        console.log('Database connected successfully!');
    }
});

module.exports = connection;