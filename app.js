/**
 * Module dependencies.
 */
var express = require('express'), 
  routes = require('./routes'),
  http = require('http'),
  path = require('path'),
  io = require('socket.io');

var app = express();

app.configure(function() {
  app.set('port', process.env.PORT || 8888);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname,'public')));
});

app.configure('development', function() {
  app.use(express.errorHandler());
});

app.get('/', routes.index);

var server = http.createServer(app);

var socket = io.listen( server );
var users = [];

/**
 *  cross-browser forEach Shim.
 *  
 *  @param {Array} array - An array object
 *  @param {Function} callback - A callback to work on the array
 */
function forEach (array, callback) {
  for (var i = 0; i < array.length; i++) {
    callback(array[i], i)
  }
}

socket.sockets.on("connection", function( client ) {
  // on the client, am emitting the coordinate of where the user started
  // drawing take that broadcast it to other clients.
  client.on('begin', function(obj) {
    client.broadcast.emit('beginDrawingAt', { x: obj.x, y: obj.y });
  });
  
  // on the client, am emitting the coordinate of where the user has moved to
  // take that and broadcast it to other clients.
  client.on('drawing', function(obj) {
    client.broadcast.emit('drawTo', { x: obj.x, y: obj.y });
  });
})

server.listen(app.get('port'), function() {
  console.log("Express server listening on port " + app.get('port'));
});