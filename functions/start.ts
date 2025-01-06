import {Handler} from '@netlify/functions';
import {clientFromToken} from 'scalingo';

export const handler: Handler = async () => {
  const {SCALINGO_API_TOKEN, SCALINGO_APP_ID, APPLICATION_URL} = process.env;

  const client = await clientFromToken(SCALINGO_API_TOKEN, {});
  const {status} = await client.Apps.find(SCALINGO_APP_ID);

  console.log(`Application status: ${status}`);

  if (status === 'running') {
    return {
      statusCode: 302,
      headers: {
        Location: APPLICATION_URL,
      },
    };
  }

  if (status === 'stopped') {
    console.log('Scaling application to 1…');
    await client.Apps._client.apiClient().post(`/apps/${SCALINGO_APP_ID}/scale`, {
      containers: [{
        name: 'web',
        amount: 1,
      }]
    });
    console.log('Application was scaled to 1');
  }

  return {
    statusCode: 302,
    headers: {
      Location: '/',
    },
  };
}
