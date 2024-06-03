'use strict';

require('dotenv').config();

const {
  BASE_URL,
  ACCOUNT_ID,
  ACCESS_TOKEN,
  TEMPLATE_ID,
} = process.env;

const instance = require('axios').create({
  baseURL: `${BASE_URL}/accounts/${ACCOUNT_ID}`,
  headers: {
    Authorization: `Bearer ${ACCESS_TOKEN}`,
  },
});

(async () => {
  if (!BASE_URL || !ACCOUNT_ID || !ACCESS_TOKEN || !TEMPLATE_ID) {
    console.error('Missing env vars!');

    return;
  }

  const clientUserId = Date.now();
  const initialName = 'Yulian Ovdey';
  const email = 'yulian.ovdey+1717430585029@orchard.com';

  async function createEnvelopeFromTemplate() {
    const result = await instance.post('/envelopes', {
      status: 'created',
      emailSubject: 'Please sign',
      templateId: TEMPLATE_ID,
    });

    return result.data.envelopeId;
  }

  async function getEnvelope(envelopeId) {
    const envelope = await instance.get(`/envelopes/${envelopeId}?include=recipients`);

    return envelope.data;
  }

  async function updateEnvelope(envelopeId) {
    const result = await getEnvelope(envelopeId);

    await instance.put(`/envelopes/${envelopeId}`, {
      status: 'sent',
      recipients: {
        signers: [
          Object.assign(result.recipients.signers[0], {
            name: initialName,
            email,
            clientUserId,
          }),
        ],
      },
    });
  }

  async function createRecipientView(envelopeId) {
    const envelope = await getEnvelope(envelopeId);
    const signer = envelope.recipients.signers[0];

    const result = await instance.post(`/envelopes/${envelopeId}/views/recipient`, {
      clientUserId: signer.clientUserId,
      recipientId: signer.recipientId,
      userName: signer.name,
      email: signer.email,
      authenticationMethod: 'None',
      returnUrl: 'http://localhost:3000',
    });

    console.log(result.data);
  }

  const envelopeId = await createEnvelopeFromTemplate();
  await updateEnvelope(envelopeId);
  console.log(envelopeId);
  await createRecipientView(envelopeId);

  setTimeout(async () => {
    await createRecipientView(envelopeId);
  }, 20000);
})();
