var docusign = require('docusign-esign');
var async = require('async');
var path = require('path');
const config = require('../../config/config');

var integratorKey = config.docusignIntegratorKey;                    // Integrator Key associated with your DocuSign Integration
var email = config.docusignEmail;                     // Email for your DocuSign Account
var password = config.docusignPassword;               // Password for your DocuSign Account
var docusignEnv = 'demo';                     // DocuSign Environment generally demo for testing purposes
var fullName = 'Joan Jett';                   // Recipient's Full Name
var recipientEmail = 'joan.jett@example.com'; // Recipient's Email
var templateId = '***';                       // ID of the Template you want to create the Envelope with
var templateRoleName = '***';                 // Role Name of the Template

var baseUrl = 'https://' + docusignEnv + '.docusign.net/restapi';
var userId = 'YOUR_USER_ID';
var oAuthBaseUrl = 'account-d.docusign.com'; // use account.docusign.com for Live/Production
var redirectURI = 'https://www.docusign.com/api';
var privateKeyFilename = 'keys/docusign_private_key.txt';

var apiClient = new docusign.ApiClient();

async.waterfall([
  function initApiClient (next) {
    apiClient.setBasePath(baseUrl);
    // assign the api client to the Configuration object
    docusign.Configuration.default.setDefaultApiClient(apiClient);
    
    // IMPORTANT NOTE:
    // the first time you ask for a JWT access token, you should grant access by making the following call
    // get DocuSign OAuth authorization url:
    var oauthLoginUrl = apiClient.getJWTUri(integratorKey, redirectURI, oAuthBaseUrl);
    // open DocuSign OAuth authorization url in the browser, login and grant access
    console.log(oauthLoginUrl);
    // END OF NOTE
    
    // configure the ApiClient to asynchronously get an access to token and store it
    apiClient.configureJWTAuthorizationFlow(path.resolve(__dirname, privateKeyFilename), oAuthBaseUrl, integratorKey, userId, 3600, next);
  },
  
  function login (next) {
    // login call available off the AuthenticationApi
    var authApi = new docusign.AuthenticationApi();

    // login has some optional parameters we can set
    var loginOps = {};
    loginOps.apiPassword = 'true';
    loginOps.includeAccountIdGuid = 'true';
    authApi.login(loginOps, function (err, loginInfo, response) {
      if (err) {
        return next(err);
      }
      if (loginInfo) {
        // list of user account(s)
        // note that a given user may be a member of multiple accounts
        var loginAccounts = loginInfo.loginAccounts;
        console.log('LoginInformation: ' + JSON.stringify(loginAccounts));
        var loginAccount = loginAccounts[0];
        var accountId = loginAccount.accountId;
        var baseUrl = loginAccount.baseUrl;
        var accountDomain = baseUrl.split("/v2");

        // below code required for production, no effect in demo (same domain)
        apiClient.setBasePath(accountDomain[0]);
        docusign.Configuration.default.setDefaultApiClient(apiClient);
        next(null, loginAccount);
      }
    });
  },

  function sendTemplate (loginAccount, next) {
    // create a new envelope object that we will manage the signature request through
    var envDef = new docusign.EnvelopeDefinition();
    envDef.emailSubject = 'Please sign this document sent from Node SDK';
    envDef.templateId = templateId;

    // create a template role with a valid templateId and roleName and assign signer info
    var tRole = new docusign.TemplateRole();
    tRole.roleName = templateRoleName;
    tRole.name = fullName;
    tRole.email = recipientEmail;

    // create a list of template roles and add our newly created role
    var templateRolesList = [];
    templateRolesList.push(tRole);

    // assign template role(s) to the envelope
    envDef.templateRoles = templateRolesList;

    // send the envelope by setting |status| to 'sent'. To save as a draft set to 'created'
    envDef.status = 'sent';

    // use the |accountId| we retrieved through the Login API to create the Envelope
    var accountId = loginAccount.accountId;

    // instantiate a new EnvelopesApi object
    var envelopesApi = new docusign.EnvelopesApi();

    // call the createEnvelope() API
    envelopesApi.createEnvelope(accountId, {'envelopeDefinition': envDef}, function (err, envelopeSummary, response) {
      if (err) {
        return next(err);
      }
      console.log('EnvelopeSummary: ' + JSON.stringify(envelopeSummary));
      next(null);
    });
  }

], function end (error) {
  if (error) {
    console.log('Error: ', error);
    process.exit(1);
  }
  process.exit();
});