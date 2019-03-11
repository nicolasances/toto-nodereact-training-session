var Controller = require('toto-api-controller');
var TotoEventConsumer = require('toto-event-consumer');
var logger = require('toto-logger');
var completedSessionHandler = require('./handler/CompletedSessionHandler');

/**
 * Consumes the session deleted event and deletes the session's exercises
 */
var eventConsumer = new TotoEventConsumer('react-training-session', 'trainingSessionsCompleted', completedSessionHandler.do);

var api = new Controller('react-training-session', null, eventConsumer);

api.listen();
