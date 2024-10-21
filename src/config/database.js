const mongoose = require("mongoose");

const connectDb = async () => {
  const res = await mongoose.connect(
    "mongodb+srv://mharhit323:TcXFsoCsCEA0dbk0@card.dp749.mongodb.net/?retryWrites=true&w=majority&appName=card"
  );
};

module.exports = { connectDb };
