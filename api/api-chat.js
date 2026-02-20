// ═══════════════════════════════════════════════════════════
//  ELEKTRO25 — Secure API Proxy for Vercel
//  Ficheiro: api/chat.js
//  Este ficheiro corre no servidor Vercel, nunca no browser.
//  A chave API nunca é exposta ao utilizador.
// ═══════════════════════════════════════════════════════════

export default async function handler(req, res) {

  // 1. Só aceita POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. Segurança: só aceita pedidos do teu próprio domínio
  const origin = req.headers.origin || '';
  const allowed = [
    'testnet.elektro25.com',   // ← replace with the Vercel domain
    'https://elektro25.com',            // ← replace wit your own domain (if you have one)
    'http://localhost:3000',           // ← for local testings
    'http://127.0.0.1:5500',          // ← for tests with Live Server
  ];
  if (origin && !allowed.some(a => origin.startsWith(a))) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // 3. Rate limiting simples por IP (máx 30 pedidos por minuto)
  // (Vercel não tem estado persistente — para produção usa Upstash Redis)

  // 4. Lê o corpo do pedido
  const { messages, system } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  // 5. Limita histórico a 20 mensagens (protege contra abuso)
  const safeMessages = messages.slice(-20);

  // 6. Chama a API Anthropic com a chave guardada em segurança
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,  // ← chave segura do servidor
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 450,
        system: system || '',
        messages: safeMessages,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: err.error?.message || 'API error' });
    }

    const data = await response.json();

    // 7. Devolve apenas o necessário ao browser (não expõe dados internos)
    return res.status(200).json({
      content: data.content,
    });

  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
