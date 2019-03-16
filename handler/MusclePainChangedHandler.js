var logger = require('toto-logger');
var moment = require('moment-timezone');
var getSession = require('./integration/GetSession');
var putSession = require('./integration/UpdateSession');

/**
 * Reacts to a completed session.
 * Sets the execution time based on the finishedAt - startedAt time
 */
exports.do = (event) => {

  let correlationId = event.correlationId;
  let sessionId = event.sessionId;

  // 1. Get the session data
  getSession.do(correlationId, sessionId).then((data) => {

    // 2. Calculate the new pain level
    let muscles = data.muscles;
    let sumOfPains = 0;
    let numOfPains = 0;

    for (var i = 0; i < muscles.length; i++) {
      if (muscles[i].painLevel != null) {
        numOfPains++;
        sumOfPains += muscles[i].painLevel;
      }
    }

    let sessionPainLevel = numOfPains == 0 ? 0 : Math.floor(sumOfPains / numOfPains);

    // 3. Update the session pain level
    putSession.do(correlationId, sessionId, {postWorkoutPain: sessionPainLevel}).then(() => {

      logger.compute(correlationId, 'Successfully set the pain level for session ' + sessionId + ' to ' + sessionPainLevel);

    }, (err) => {
      logger.compute(correlationId, 'Error when trying to PUT /sessions/' + sessionId + '. Err: ' + JSON.stringify(err), 'error');
    });;

  }, (err) => {
    logger.compute(correlationId, 'Error when trying to GET /sessions/' + sessionId + '. Err: ' + JSON.stringify(err), 'error');
  });

}
