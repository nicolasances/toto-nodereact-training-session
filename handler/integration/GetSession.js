var http = require('toto-request');

exports.do = (correlationId, sessionId) => {

  return new Promise((success, failure) => {

    // Request
    let request = {
      correlationId: correlationId,
      microservice: 'toto-nodems-training-session',
      method: 'GET',
      resource: 'sessions/' + sessionId
    };

    // Call
    http(request).then(success, failure);

  })
}
