const express = require("express");
const { connectDb } = require("./config/database");
const app = express();
const {
  processPickupCSV,
  processDeliveryExceptionsCSV,
  processDeliveredCSV,
  processReturnedCSV,
} = require("./utils/importCSVToDb");
const CardStatus = require("./models/cardStatus");

const pickUpUrl = "./src/data/Sample_Card_Status_Info_-_Pickup.csv";
const deliveryURL = "./src/data/Sample_Card_Status_Info_-_Delivered.csv";
const deliveryExceptionURL =
  "./src/data/Sample_Card_Status_Info_-_Delivery_exceptions.csv";
const returnURL = "./src/data/Sample_Card_Status_Info_-_Returned.csv";

const processAllCSVs = async () => {
  try {
    await processPickupCSV(pickUpUrl);
    await processDeliveryExceptionsCSV(deliveryExceptionURL);
    await processDeliveredCSV(deliveryURL);
    await processReturnedCSV(returnURL);
  } catch (error) {
    console.error("Error processing CSVs:", error);
  }
};

app.get("/get_card_status", async (req, res) => {
  const { phone_number, card_id } = req.query;

  const query = {};
  if (phone_number) query.phone_number = phone_number;
  if (card_id) query.card_id = card_id;

  try {
    const card = await CardStatus.findOne(query);
    if (!card) return res.status(404).json({ message: "Card not found" });

    res.json(card);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

connectDb()
  .then(async () => {
    console.log("connection with database successfully established.");
    app.listen("5432", async () => {
      processAllCSVs();
      console.log("Listening server on port 5432...");
    });
  })
  .catch((err) => {
    console.log("Error in connecting with database" + err);
  });
