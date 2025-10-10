# Wavetrace Backend

Backend for handling Wavetrace orders. Stores orders in MongoDB and sends email notifications via Brevo (Sendinblue).

## Setup

1. Clone the repo:
   ```bash
   git clone <repo-url>
   cd wavetrace-v2-backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure .env:
   ```bash
   PORT=5000
   MONGO_URI=<Your MongoDB URI>
   BREVO_API_KEY=<Your Brevo API Key>
   BREVO_SENDER_EMAIL=<Your verified sender email>
   ```
4. Run
   ```bash
   npm start
   ```
