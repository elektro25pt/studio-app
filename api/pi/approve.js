exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { paymentId, service, amount } = JSON.parse(event.body || '{}');
  const API_KEY = process.env.PI_API_KEY; // nunca exposta no browser

  try {
    // 1. Verificar o pagamento na Pi Network
    const verifyRes = await fetch(
      `https://api.minepi.com/v2/payments/${paymentId}`,
      { headers: { 'Authorization': `Key ${API_KEY}` } }
    );
    const payment = await verifyRes.json();

    // 2. Validar que o montante é correto
    if (!payment || payment.status.developer_approved) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid' }) };
    }

    // 3. Aprovar junto da Pi Network
    await fetch(
      `https://api.minepi.com/v2/payments/${paymentId}/approve`,
      {
        method: 'POST',
        headers: { 'Authorization': `Key ${API_KEY}` }
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ approved: true })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
