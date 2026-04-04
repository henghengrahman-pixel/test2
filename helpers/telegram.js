
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function sendTelegramMessage(message) {
  const token = process.env.BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return { ok: false, skipped: true };
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });
    return { ok: response.ok };
  } catch (error) {
    console.error('Telegram error:', error.message);
    return { ok: false, error: error.message };
  }
}

module.exports = { sendTelegramMessage };
