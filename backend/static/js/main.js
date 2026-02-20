// main.js
document.addEventListener('DOMContentLoaded', () => {
  // Simple button → API example
  const btn = document.getElementById('fetch-btn');
  const result = document.getElementById('result');

  if (btn && result) {
    btn.addEventListener('click', async () => {
      try {
        const res = await fetch('/api/hello');
        const data = await res.json();
        result.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
      } catch (err) {
        result.textContent = 'Error: ' + err.message;
      }
    });
  }

  // You can add more page-specific logic here
  console.log('App initialized –', new Date().toLocaleString());
});