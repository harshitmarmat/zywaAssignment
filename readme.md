# Card Status API

## Overview
This project provides an internal API to return the status of a user's card by combining data from multiple CSV files shared by partner companies. The API is built using Express.js and MongoDB.

## Technologies Used
- **Node.js**: JavaScript runtime for building scalable network applications.
- **Express.js**: Web application framework for Node.js, used to create the API.
- **MongoDB**: NoSQL database for storing card status data.
- **Moment.js**: Library for parsing, validating, manipulating, and displaying dates and times in JavaScript.
- **CSV-parser**: Stream-based CSV parser for Node.js.

## Approach
### Data Processing:
- The API reads data from four CSV files: Pickup, Delivery Exceptions, Delivered, and Returned.
- Each CSV is processed sequentially to ensure that the card status is updated correctly based on the delivery flow.
- Timestamps are normalized to a consistent format for accurate storage in the database.

### Database Integration:
- MongoDB is used to store and manage the card status data.
- Each card's status is updated based on the information parsed from the CSV files.


## How to start project
1. **Clone the repository:**
   ```bash
   git clone [https://github.com/harshitmarmat/zywaAssignment.git]
   cd <repository-directory>

2. **Install dependencies:** : `npm install`

3. **Run the server:** : `npm run start`

**Alternatively, you can use Docker to run the application:** 
    ```bash
    docker build -t card-status-api .  
    docker run -p 5432:5432 card-status-api

4. **Access the API:** `http://localhost:5432/get_card_status?phone=<user-phone>&card=<card-id>`


### API Endpoints:
- The main endpoint `/get_card_status` allows querying the card status using either the user's phone number or the card ID.

## Sample API Request
**Request URL**: `GET /get_card_status?phone=<USER_PHONE>&card=<CARD_ID>`

### Example
**Request URL**:`http://localhost:5432/get_card_status?phone=0585949014&card=ZYW8827`

**Response:**
```json
{
    "_id": "67165f7921b6b9ec95556f08",
    "card_id": "ZYW8827",
    "__v": 1,
    "current_status": "DELIVERED",
    "delivery_attempts": [
        {
            "attempt_number": 1,
            "status": "DELIVERED",
            "timestamp": "2023-11-13T09:34:56.000Z",
            "_id": "67165f81bbae43b42d5e93bf"
        }
    ],
    "phone_number": "585949014",
    "pickup_timestamp": "2023-11-12T18:29:00.000Z",
    "returned": false
}
