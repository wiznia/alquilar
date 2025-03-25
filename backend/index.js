import HTML_TEMPLATE from './mail-template.js';
const message = 'Hi there, you were emailed me through nodemailer';
const options = {
  from: 'TESTING <sender@gmail.com>', // sender address
  to: 'wiznia@gmail.com', // receiver email
  subject: 'Send email in Node.JS with Nodemailer using Gmail account', // Subject line
  text: message,
  html: HTML_TEMPLATE(message),
};

import SENDMAIL from './mail.js';
// send mail with defined transport object and mail options
SENDMAIL(options, (info) => {
  console.log('Email sent successfully');
  console.log('MESSAGE ID: ', info.messageId);
});
