var http = require('toto-request');

exports.do = (correlationId, sessionId, body) => {

  return new Promise((success, failure) => {

    // Request
    let request = {
      correlationId: correlationId,
      microservice: 'toto-nodems-training-session',
      method: 'PUT',
      resource: 'sessions/' + sessionId,
      body: body
    };

    // Call
    http(request).then(success, failure);

  })
}
