'use strict';

const fs = require('fs');

require('dotenv').config();

const {
  BASE_URL,
  ACCOUNT_ID,
  ACCESS_TOKEN,
} = process.env;

const instance = require('axios').create({
  baseURL: `${BASE_URL}/accounts/${ACCOUNT_ID}`,
  headers: {
    Authorization: `Bearer ${ACCESS_TOKEN}`,
  },
});

(async () => {
  if (!BASE_URL || !ACCOUNT_ID || !ACCESS_TOKEN) {
    console.error('Missing env vars!');

    return;
  }

  const clientUserId = Date.now();
  const name = 'Yulian Ovdey';
  const email = 'yulian.ovdey+1717430585029@orchard.com';

  async function createEnvelope() {
    const result = await instance.post('/envelopes', {
      status: 'sent',
      emailSubject: 'Please sign',
      documents: [
        {
          documentId: 1,
          name: 'Test Document',
          documentBase64: fs.readFileSync('Empty Test PDF.pdf').toString('base64'),
          fileExtension: 'pdf',
        },
      ],
      recipients: {
        signers: [
          {
            name,
            recipientId: 1,
            clientUserId,
            email,
            tabs: {
              signHereTabs: [
                {
                  documentId: 1,
                  pageNumber: 1,
                  anchorXOffset: 0,
                  anchorYOffset: 0,
                  name: 'Please sign here',
                },
              ],
            },
          },
        ],
      },
    });

    return result.data.envelopeId;
  }

  async function createRecipientView(envelopeId) {
    const result = await instance.post(`/envelopes/${envelopeId}/views/recipient`, {
      clientUserId,
      recipientId: 1,
      userName: name,
      email,
      authenticationMethod: 'None',
      returnUrl: 'http://localhost:3000',
    });

    console.log(result.data);
  }

  const envelopeId = await createEnvelope();
  await createRecipientView(envelopeId);

  // Wait 30 seconds
  //
  // During this timeout - visit the recipient URL from the call above and
  // update the recipient's name in the "Adopt Your Signature" modal
  await new Promise((resolve) => {
    setTimeout(resolve, 30000);
  });

  try {
    await createRecipientView(envelopeId);

    console.log('Success!');
  } catch (e) {
    console.log(`Creating another recipient view failed:`, e.response.data.message);
  }
})();
