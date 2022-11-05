/**
 * REDIS <> websocket broker
 */
const CHANNEL = 'bio-growth'
const ENGINE_CHANNEL = 'bio-growth-engine'

const WebSocket = require('ws');
const redis = require('redis');

// Configuration: adapt to your environment
const REDIS_SERVER = "redis://localhost:6379";
const WEB_SOCKET_PORT = 8765;


// Connect to Redis and subscribe to channel
var redisClient = redis.createClient(REDIS_SERVER);
redisClient.subscribe(CHANNEL);

// Connect to Redis to publish to channel
var redisPublisher = redis.createClient(REDIS_SERVER);

// Create & Start the WebSocket server
const server = new WebSocket.Server({ port: WEB_SOCKET_PORT });

// Register event for client connection
server.on('connection', function connection(ws) {

    ws.on('message', function incoming(data) {
        // console.log('received: %s', data);
        data = JSON.parse(data)
        data.message = JSON.stringify(data.data)
        redisPublisher.publish(data.channel, data.message)
    });

    // broadcast on web socket when receving a Redis PUB/SUB Event
    redisClient.on('message', function (channel, message) {
        console.log(`${channel} :: ${message}`);
        try {
            ws.send(message);
        } catch (error) {
            console.log("websocket wasn't open")
        }

    })

});


console.log("WebSocket server started at ws://locahost:" + WEB_SOCKET_PORT);