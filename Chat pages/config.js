var config = {
    database: {
        host: '127.0.0.1', // database host
        user: 'root', // your database username
        password: 'password1', // your database password
        port: 3306, // default MySQL port
        db: 'messaging' // your database name
    }
}
module.exports = config; //Expose the current config as a module
