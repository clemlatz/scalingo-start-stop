import {schedule} from '@netlify/functions'
import {clientFromToken} from 'scalingo';

export const handler = schedule('@daily', async () => {
  const {SCALINGO_API_TOKEN, SCALINGO_APP_ID} = process.env;

  const client = await clientFromToken(SCALINGO_API_TOKEN, {});
  const {status} = await client.Apps.find(SCALINGO_APP_ID);

  console.log(`Application status: ${status}`);

  if (status === 'stopped' || status === 'scaling') {
    console.log(`Doing nothing`);
    return {
      statusCode: 204,
    };
  }

  console.log('Scaling application to 0…');
  await client.Apps._client.apiClient().post(`/apps/${SCALINGO_APP_ID}/scale`, {
    containers: [{
      name: 'web',
      amount: 0,
    }]
  });
  console.log('Application was scaled to 0');

  return {
    statusCode: 201,
  }
})
