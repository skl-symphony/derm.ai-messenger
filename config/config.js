const path = require('path');
const rootPath = path.normalize(__dirname + '/..');

if (!process.env.IS_HEROKU) {
  var dotenv = require('dotenv').config({path: rootPath + '/.env'});
}

const config = {
  // General
  root: rootPath,
  app: {
    name: 'chatbot'
  },
  env: process.env.ENV || '',
  port: process.env.PORT || 9000,
  
  // Database URLs
  mongo_url: process.env.MONGO_URL || 'mongodb://localhost/dermai',
  
  // admin dashboard
  adminUsername: process.env.ADMIN_USERNAME || 'demi',
  adminPassword: process.env.ADMIN_PASSWORD || 'TresComas',

  // Facebook Keys
  page_access_token: process.env.PAGE_ACCESS_TOKEN,
  verify_token: process.env.VERIFY_TOKEN,
  fb_page_id: process.env.FB_PAGE_ID,
  fb_app_id: process.env.FB_APP_ID,
  
  // Telesign Keys
  telesignCustomerId: process.env.TELESIGN_CUSTOMER_ID || '',
  telesignApiKey: process.env.TELESIGN_API_KEY || '',
  telesignRestEndpoint: process.env.TELESIGN_REST_ENDPOINT || '',

  // Docusign Keys
  docusignEmail: process.env.DOCUSIGN_EMAIL || '',
  docusignPassword: process.env.DOCUSIGN_PASSWORD || '',
  docusignIntegratorKey: process.env.DOCUSIGN_KEY || '',
};

// app ID - 119918588671791
// app secret - 010d51ed6df96df6a3306478754937ae
// page access token - EAABtELjhNy8BAOcbfIgtH1B8TXaU1jOT6NR19uc3x1FZCu2ZCLg0Sjr1H0JtDHsBBVL4ewfQ9flCvgzZANvO9ngf4ZC9Mrr6DPwgU2JnE3FcJiYxOoGoe66rJBSuVxF9ZAXPdXvtHaP2KkojjZCZB2qNgJqj90iZCcjgcjoMyue6fAZDZD
// page id - 893465860805682
// verify token - pandemic-legacy-is-the-verify-token
// callback ngrok url - https://d81a0401.ngrok.io/webhook

module.exports = config;
