require('dotenv').config({ path: './.env' });
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const testUsers = require('./data/test_users.json');
const realUsers = require('./data/real_users.json');

const sgTransport = require('nodemailer-sendgrid-transport');

let options;
let client;
let users = [];

if (process.env.NODE_ENV === 'production') {
  options = {
    auth: {
      api_user: process.env.SENDGRID_USERNAME,
      api_key: process.env.SENDGRID_PASSWORD,
    },
  };
  client = nodemailer.createTransport(sgTransport(options));
  users = realUsers;
} else {
  options = {
    host: process.env.MAILTRAP_HOST,
    port: parseInt(process.env.MAILTRAP_PORT),
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASS,
    },
  };
  client = nodemailer.createTransport(options);
  users = testUsers;
}

const email = {
  from: process.env.EMAIL_BY,
  subject: 'Hello',
  text: 'Hello world',
  html: '<b>Hello world</b>',
};

async function sendMail() {
  try {
    for (let i = 0; i < users.length; i++) {
      console.log(i);
      if (users[i].mail_sent) {
        continue;
      }
      const res = await client.sendMail({ ...email, to: users[i].email });
      users[i].mail_sent = true;
      users[i].messageId = res.messageId;
      fs.writeFileSync(
        path.join(
          __dirname,
          'data',
          process.env.NODE_ENV !== 'production'
            ? 'test_users.json'
            : 'real_users.json'
        ),
        JSON.stringify(users)
      );
      console.log('Mail sent');
    }
  } catch (error) {
    console.log(error);
  }
}

sendMail();
