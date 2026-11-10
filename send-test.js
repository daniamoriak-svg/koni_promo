// Отправка тестового письма с index.html через Gmail.
// Картинки вкладываются прямо в письмо (CID), хостинг не нужен.
// Запуск: node --env-file=.env send-test.js
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const { GMAIL_USER, GMAIL_APP_PASSWORD, MAIL_TO } = process.env;
if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
  console.error('Заполните GMAIL_USER и GMAIL_APP_PASSWORD в файле .env');
  process.exit(1);
}

let html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

// images/xxx.png -> cid:xxx.png + вложение
const attachments = [];
html = html.replace(/src="images\/([^"]+)"/g, (_, file) => {
  if (!attachments.find(a => a.cid === file)) {
    attachments.push({ filename: file, path: path.join(__dirname, 'images', file), cid: file });
  }
  return `src="cid:${file}"`;
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
});

transporter.sendMail({
  from: `КОНИ <${GMAIL_USER}>`,
  to: MAIL_TO || GMAIL_USER,
  subject: 'Черная пятница в рекламе: −50% от КОНИ',
  text: 'Первая в мире черная пятница в рекламе от нового креативного агентства внутри BBDO GROUP. Скидка 50% на любую рекламную кампанию в 2026 и 2027.',
  html,
  attachments,
}).then(info => {
  console.log('Отправлено:', info.accepted.join(', '));
}).catch(err => {
  console.error('Ошибка отправки:', err.message);
  process.exit(1);
});
