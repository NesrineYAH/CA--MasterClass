const sendEmail = require("../utils/mailer");

(async () => {
  await sendEmail({
    to: "contact@nesrinebekkar.com",
    subject: "Test Hostinger SMTP",
    text: "Test envoi depuis Hostinger",
    html: "<h2>Test réussi ✔️</h2>",
  });
})();
