var Controller = require('toto-api-controller');
var TotoEventConsumer = require('toto-event-consumer');
var logger = require('toto-logger');

var completedSessionHandler = require('./handler/CompletedSessionHandler');
var musclePainChangedHandler = require('./handler/MusclePainChangedHandler');

var eventConsumer = new TotoEventConsumer('react-training-session', 'trainingSessionsCompleted', completedSessionHandler.do);
var eventConsumer = new TotoEventConsumer('react-training-session', 'trainingMusclePainChanged', musclePainChangedHandler.do);

var api = new Controller('react-training-session', null, eventConsumer);

api.listen();
