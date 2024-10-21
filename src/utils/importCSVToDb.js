const fs = require("fs");
const csv = require("csv-parser");
const CardStatus = require("../models/cardStatus");
const moment = require("moment");

function normalizeTimestamp(timestamp, format) {
    return moment(timestamp, format).toISOString();
}

const processCSVRowsSequentially = async (rows, processRowCallback) => {
    for (const row of rows) {
        await processRowCallback(row);
    }
};

const processPickupCSV = async (url) => {
    return new Promise((resolve, reject) => {
        const rows = [];

        fs.createReadStream(url)
            .pipe(csv())
            .on("data", (row) => {
                rows.push(row);
            })
            .on("end", async () => {
                try {
                    await processCSVRowsSequentially(rows, async (row) => {
                        const normalizedTimestamp = normalizeTimestamp(row["Timestamp"], 'DD-MM-YYYY hh:mm A');
                        const card = await CardStatus.findOne({ card_id: row["Card ID"] });

                        if (!card) {
                            const res = await CardStatus.findOneAndUpdate(
                                { card_id: row["Card ID"] },
                                {
                                    card_id: row["Card ID"],
                                    phone_number: row["User Mobile"],
                                    pickup_timestamp: normalizedTimestamp,
                                    current_status: 'PICKED_UP',
                                },
                                { upsert: true }
                            );
                        }
                    });
                    console.log("Pickup CSV processed");
                    resolve();
                } catch (error) {
                    reject(error);
                }
            })
            .on("error", reject);
    });
};


const processDeliveryExceptionsCSV = async (url) => {
    return new Promise((resolve, reject) => {
        const rows = [];

        fs.createReadStream(url)
            .pipe(csv())
            .on("data", (row) => {
                rows.push(row);
            })
            .on("end", async () => {
                try {
                    await processCSVRowsSequentially(rows, async (row) => {
                        const normalizedTimestamp = normalizeTimestamp(row["Timestamp"], 'DD-MM-YYYY HH:mm');
                        const card = await CardStatus.findOne({ card_id: row["Card ID"] });

                        if (card && card.current_status !== "DELIVERED" && card.current_status !== "RETURNED") {
                            card.delivery_attempts.push({
                                attempt_number: card.delivery_attempts.length + 1,
                                status: 'EXCEPTION',
                                timestamp: normalizedTimestamp,
                                comment: row["Comment"],
                            });

                            await card.save();
                        }
                    });
                    console.log("Delivery Exceptions CSV processed");
                    resolve();
                } catch (error) {
                    reject(error);
                }
            })
            .on("error", reject);
    });
};

const processDeliveredCSV = async (url) => {
    return new Promise((resolve, reject) => {
        const rows = [];

        fs.createReadStream(url)
            .pipe(csv())
            .on("data", (row) => {
                rows.push(row);
            })
            .on("end", async () => {
                try {
                    await processCSVRowsSequentially(rows, async (row) => {
                        const card = await CardStatus.findOne({ card_id: row["Card ID"] });
                        const normalizedTimestamp = new Date(row["Timestamp"]);

                        if (card && card.current_status !== "DELIVERED" && card.current_status !== "RETURNED") {
                            card.delivery_attempts.push({
                                attempt_number: card.delivery_attempts.length + 1,
                                status: 'DELIVERED',
                                timestamp: normalizedTimestamp,
                            });

                            card.current_status = 'DELIVERED';
                            await card.save();
                        }
                    });
                    console.log("Delivered CSV processed");
                    resolve();
                } catch (error) {
                    reject(error);
                }
            })
            .on("error", reject);
    });
};

const processReturnedCSV = async (url) => {
    return new Promise((resolve, reject) => {
        const rows = [];

        fs.createReadStream(url)
            .pipe(csv())
            .on("data", (row) => {
                rows.push(row);
            })
            .on("end", async () => {
                try {
                    await processCSVRowsSequentially(rows, async (row) => {
                        const card = await CardStatus.findOne({ card_id: row["Card ID"] });
                        const normalizedTimestamp = normalizeTimestamp(row["Timestamp"], 'DD-MM-YYYY h:mmA');

                        if (card && card.current_status !== "DELIVERED" && card.current_status !== "RETURNED") {
                            card.returned = true;
                            card.current_status = 'RETURNED';
                            card.delivery_attempts.push({
                                attempt_number: card.delivery_attempts.length + 1,
                                status: 'REJECTED',
                                timestamp: normalizedTimestamp,
                            });

                            await card.save();
                        }
                    });
                    console.log("Returned CSV processed");
                    resolve();
                } catch (error) {
                    reject(error);
                }
            })
            .on("error", reject);
    });
};

module.exports = {
    processPickupCSV,
    processDeliveredCSV,
    processDeliveryExceptionsCSV,
    processReturnedCSV,
};
