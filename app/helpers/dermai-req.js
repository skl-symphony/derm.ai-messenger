const request = require('request');

request({
  url: DERMAI_CLASSIFICATION_SERVER,
  method: 'POST',
  json: true,
  headers: {
    'Content-Type': "application/json",
  },
  body: { image: strippedEncodedImage }
}, function(error, response, body) {
  console.log(body, 'body');
  if (error) {
    console.log('Error sending message: ', error);
  } else if (response.body.error) {
    console.log('Error: ', response.body.error);
  }
  const score = body.score;
  const klass = body.class;
  if (score > HIGH_LIMIT) {
    fbFactory.sendPositiveDiagnosticResults(sender, patient);
  } else {
    fbFactory.sendNegativeDiagnosticResults(sender, patient);
  }
});
