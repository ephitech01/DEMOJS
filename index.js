const fs = require('fs');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;

async function postToTelegram(text) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHANNEL_ID,
      text: text,
      parse_mode: 'HTML'
    })
  });
  
  const result = await response.json();
  if (!result.ok) {
    throw new Error(`Telegram Error: ${result.description}`);
  }
  console.log('Successfully posted lesson to Telegram!');
}

async function run() {
  try {
    const rawData = fs.readFileSync('lessons.json', 'utf-8');
    const lessons = JSON.parse(rawData);

    if (lessons.length === 0) {
      console.log('No lessons left to post. Please add more to lessons.json.');
      return;
    }

    const currentLesson = lessons.shift();

    console.log(`Posting topic: ${currentLesson.topic}`);
    await postToTelegram(currentLesson.content);

    fs.writeFileSync('lessons.json', JSON.stringify(lessons, null, 2));
    console.log(`Updated lessons.json. ${lessons.length} lessons remaining in the queue.`);

  } catch (error) {
    console.error('Workflow failed:', error);
    process.exit(1);
  }
}

run();
