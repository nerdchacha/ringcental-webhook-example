require('dotenv').config();
const { SDK } = require('@ringcentral/sdk');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const port = process.env.PORT || 6666;

app.use('/webhooks/ringcentral', (req, res) => {
	const validationToken = req.headers['validation-token'];
	if (validationToken) {
		return res.header('validation-token', validationToken).status(200).send();
	}
	const verificationToken = req.headers['verification-token'] || ''; //some-random-token
	console.log(verificationToken);
	// Check if verification is the same as the one provided when creating webhook.
	// This check is optional
	res.status(200).send();
	console.log(req.body);
});

app.listen(port, () => console.log(`Server is listening on port ${port}`));

createSubscription();

async function createSubscription() {
	const serverUrl = process.env.RC_SERVER_URL;
	const clientId = process.env.RC_CLIENT_ID;
	const clientSecret = process.env.RC_CLIENT_SECRET;
	const username = process.env.RC_USERNAME;
	const password = process.env.RC_PASSWORD;

	const sdk = new SDK({ server: serverUrl, clientId, clientSecret });
	const platform = sdk.platform();
	await platform.login({ username, password });
	await platform.post('/restapi/v1.0/subscription', {
		deliveryMode: {
			transportType: 'WebHook',
			address: `https://b094-122-161-87-60.ngrok.io/webhooks/ringcentral`, // using ngrok to map http://localhost:port to a public host
			verificationToken: 'some-random-token',
		},
		expiresIn: 7776000,
		eventFilters: ['/restapi/v1.0/account/~/telephony/sessions?direction=Inbound'],
	});
	console.log('Subscription created');
}
