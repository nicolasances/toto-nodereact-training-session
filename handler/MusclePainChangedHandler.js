var logger = require('toto-logger');
var moment = require('moment-timezone');
var getSession = require('./integration/GetSession');
var getSessionMuscles = require('./integration/GetSessionMuscles');
var putSession = require('./integration/UpdateSession');

/**
 * Reacts to a completed session.
 * Sets the execution time based on the finishedAt - startedAt time
 */
exports.do = (event) => {

  let correlationId = event.correlationId;
  let sessionId = event.sessionId;
  let muscle = event.muscle;
  let painLevel = event.painLevel;

  // 1. Get the session data
  getSession.do(correlationId, sessionId).then((sessionData) => {

    var calculateSessionPainLevel = (sessionData) => {

      // 2. Calculate the new pain level
      let muscles = sessionData.muscles;
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

        logger.compute(correlationId, 'Successfully set the pain level for session ' + sessionId + ' to ' + sessionPainLevel, 'info');

      }, (err) => {
        logger.compute(correlationId, 'Error when trying to PUT /sessions/' + sessionId + '. Err: ' + JSON.stringify(err), 'error');
      });

    }

    // If there are no muscles, it's either an OLD SESSION or something went wrong
    // SO CREATE THE MUSCLES, set the pain level and then go on
    if (sessionData.muscles == null || sessionData.muscles.length == 0) {

      // Get the muscles
      getSessionMuscles.do(correlationId, sessionId).then((data) => {

        let muscles = [];
        for (var i = 0; i < data.muscles.length; i++) {
          muscles.push({muscle: data.muscles[i], painLevel: data.muscles[i] == muscle ? painLevel : null});
        }

        // Update the session
        putSession.do(correlationId, sessionId, {muscles: muscles}).then(() => {

          // Retry getting the session data and update the damn thing
          getSession.do(correlationId, sessionId).then((sd) => {
            calculateSessionPainLevel(sd);
          });

        }, (err) => {
          logger.compute(correlationId, 'Error when trying to PUT /sessions/' + sessionId + '. Err: ' + JSON.stringify(err), 'error');
        });

      }, (err) => {
        logger.compute(correlationId, 'Error when trying to GET /sessions/' + sessionId + '/muscles. Err: ' + JSON.stringify(err), 'error');
      });

    }
    else calculateSessionPainLevel(sessionData);

  });

}
