var logger = require('toto-logger');
var getSession = require('./integration/GetSession');
var updateSession = require('./integration/UpdateSession');
var moment = require('moment-timezone');

/**
 * Reacts to a completed session.
 * Sets the execution time based on the finishedAt - startedAt time
 */
exports.do = (event) => {

  let correlationId = event.correlationId;
  let sessionId = event.sessionId;

  // 1. Get the session data
  getSession.do(correlationId, sessionId).then((data) => {

    // 2. Calculate the time difference in minutes
    let start = data.startedAt;
    let end = data.finishedAt;

    let timeInMin = moment(end, 'HH:mm').tz('Europe/Rome').diff(moment(start, 'HH:mm').tz('Europe/Rome'), 'minutes');

    // 3. Update the session
    updateSession.do(correlationId, sessionId, {timeInMinutes: timeInMin}).then(() => {

      logger.compute(correlationId, 'Successfully updated execution time of session ' + sessionId + ' to ' + timeInMin + 'min.', 'info');

    }, (err) => {

      logger.compute(correlationId, 'Error when trying to PUT /sessions/' + sessionId + '. Err: ' + err, 'error');

    });

  }, (err) => {

    logger.compute(correlationId, 'Error when trying to GET /sessions/' + sessionId + '. Err: ' + err, 'error');

  });

}
