
/**
 * First we set the node enviornment variable if not set before
 */
process.env.NODE_ENV = process.env.NODE_ENV || 'development';



/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

// Init the express application
var app = require('./config/express')();

// Start the app by listening on <port>
app.listen(3000);
//app.listen(config.port);

// Expose app
exports = module.exports = app;

// Logging initialization
console.log('Express app started on port ' + 3000);
//console.log('Express app started on port ' + config.port);