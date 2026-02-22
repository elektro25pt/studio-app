exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { paymentId, txid, service } = JSON.parse(event.body || '{}');
  const API_KEY = process.env.PI_API_KEY;

  try {
    // Completar o pagamento na Pi Network
    await fetch(
      `https://api.minepi.com/v2/payments/${paymentId}/complete`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Key ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ txid })
      }
    );

    // ── AQUI podes: enviar email de confirmação, registar na DB, etc. ──
    console.log(`✅ Payment complete: ${paymentId} | Service: ${service} | txid: ${txid}`);

    return {
      statusCode: 200,
      body: JSON.stringify({ completed: true, txid })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
