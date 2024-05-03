const axios = require("axios");
require("dotenv").config();
const zlib = require("zlib");
const csv = require("csv-parser");
const importContacts = require("./utils/brevo");

const cron = require("node-cron");

// Function to get download link
async function getDownloadLink() {
  const app_url = process.env.APP_URL;

  try {
    const response = await axios({
      url: app_url,
      method: "POST",
      headers: {
        accept: "application/json",
        Authorization: process.env.AUTHORIZARTION_KEY,
        "content-type": "application/json",
      },
    });
    console.log(response.data.csv_file_url);
    return response.data.csv_file_url;
  } catch (error) {
    throw new Error("Failed to fetch download link: " + error.message);
  }
}

// Function to download and extract CSV file
async function downloadCsvFile(url, destination) {
  const response = await axios({
    url: url,
    method: "GET",
    responseType: "stream",
  });

  // Parse CSV data to JSON
  let jsonRows = [];
  response.data
    .pipe(zlib.createGunzip()) // Decompress the gzipped data
    .pipe(csv())
    .on("data", (data) => {
      if (data.tags !== "{}") {
        let tags = JSON.parse(data.tags);
        const { email, ...rest } = tags;
        jsonRows.push({ email, attributes: rest });
      }
    })
    .on("end", () => {
      console.log("CSV parsing completed.");
      // now send it to brevo
      importContacts(jsonRows);
    });
}

// Main function to orchestrate the process
async function main() {
  try {
    const downloadLink = await getDownloadLink();
    const destination = "output_s1.csv";
    setTimeout(async () => {
      await downloadCsvFile(downloadLink, destination);
    }, 2000);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

// Call the main function to start the process
console.log("Running script... Please wait...");
cron.schedule("*/15 * * * *", async () => {
  await main();
});

// main();
