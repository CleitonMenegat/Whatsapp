import axios from 'axios';

async function testWebhook() {
  const url = 'http://localhost:3001/webhook/whatsapp-teste';
  const payload = {
    object: 'whatsapp',
    entry: [
      {
        id: '1234567890',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '15555555555',
                phone_number_id: '122222222222222'
              },
              contacts: [
                {
                  profile: { name: 'Kauan Menegat' },
                  wa_id: '5511999999999'
                }
              ],
              messages: [
                {
                  from: '5511999999999',
                  id: 'wamid.HBgMNTUxMTk5OTk5OTk5OQ==',
                  timestamp: '1686851234',
                  text: { body: 'Ola! Isto é um teste de webhook integrado com Lovable.' },
                  type: 'text'
                }
              ]
            },
            field: 'messages'
          }
        ]
      }
    ]
  };

  console.log('Sending mock WhatsApp webhook request to', url);
  try {
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'esv8absl2u4dnri1minha-super-chave-secreta'
      }
    });

    console.log('--- SUCCESS ---');
    console.log('Response Status from Router:', response.status);
    console.log('Response Data (Target Output from httpbin):', JSON.stringify(response.data, null, 2).substring(0, 500) + '\n...');
  } catch (error) {
    console.error('--- ERROR ---');
    if (error.response) {
      console.error('Status Code:', error.response.status);
      console.error('Error Response Data:', error.response.data);
    } else {
      console.error('Error message:', error.message);
    }
  }
}

testWebhook();
