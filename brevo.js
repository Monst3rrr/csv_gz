require("dotenv").config();
const SibApiV3Sdk = require("sib-api-v3-sdk");

// Import Contacts
async function importContacts(jsonBody) {
  console.log(process.env.BREVO_API_KEY);
  let defaultClient = SibApiV3Sdk.ApiClient.instance;

  let apiKey = defaultClient.authentications["api-key"];
  apiKey.apiKey = process.env.BREVO_API_KEY;
  let apiInstance = new SibApiV3Sdk.ContactsApi();

  let requestContactImport = new SibApiV3Sdk.RequestContactImport();

  requestContactImport.jsonBody = jsonBody;
  requestContactImport.listIds = [parseInt(process.env.LIST_ID)];
  requestContactImport.emailBlacklist = false;
  requestContactImport.smsBlacklist = false;
  requestContactImport.updateExistingContacts = true;
  requestContactImport.emptyContactsAttributes = false;

  apiInstance.importContacts(requestContactImport).then(
    function (data) {
      console.log(
        "API called successfully. Returned data: " + JSON.stringify(data)
      );
    },
    function (error) {
      console.error(error.message);
    }
  );
}

module.exports = importContacts;
