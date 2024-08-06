# Arithmetic Calculator Backend

This is the backend service for the Arithmetic Calculator application. It provides APIs for performing arithmetic operations, managing user balances, and handling user records.


## Project Structure
```bash
arithmetic-calculator-backend/
├── .serverless/
├── coverage/
├── node_modules/
├── src/
│   ├── tests/
│   ├── db/
│   ├── handlers/
│   ├── models/
│   ├── services/
│   └── utils/
├── .env
├── .gitignore
├── .serverlessignore
├── jest.config.js
├── package-lock.json
├── package.json
├── README.md
├── serverless.yml
├── serverlessBKP.yml
└── tsconfig.json
```bash

## Technologies Used

- Node.js
- TypeScript
- AWS Lambda
- Amazon RDS (PostgreSQL)
- Amazon Cognito
- Serverless Framework

## API Endpoints

 - POST - https://kxh5okxff7.execute-api.us-east-1.amazonaws.com/dev/initialize-db - Deployment use only. Check if the tables are creates and initialize them.
 - POST - https://f8lzov2sb3.execute-api.us-east-1.amazonaws.com/operation - Performs an operation.
 - POST - https://f8lzov2sb3.execute-api.us-east-1.amazonaws.com/update-balance - Update a balance for a given user.
 - GET - https://f8lzov2sb3.execute-api.us-east-1.amazonaws.com/user-records - Gets all records for the given user.
 - PATCH - https://f8lzov2sb3.execute-api.us-east-1.amazonaws.com/record-delete - Soft deletes a record.

## Setup and Deployment

1. Clone the repository:

To clone this repository and set it up locally, follow these steps:
```bash
git clone https://github.com/maxculen86/arithmetic-calculator-backend.git
```
2. Navigate to the project directory:
```bash
cd arithmetic-calculator-backend
```
3. Install dependencies:
```bash
npm install
```
2. Configure your AWS credentials. Go to Environment Variables

3. Deploy the application:
```bash
serverless deploy
```

## Environment Variables

Ensure the following environment variables are set:

- `DB_HOST`: Database host 
- `DB_PORT`: Database port
- `DB_NAME`: Database name
- `DB_USER`: Database username
- `DB_SECRET_ARN`: ARN of the secret containing database credentials
- `USER_POOL_ID`: Cognito User Pool ID

Create an .env file on your root folder with the following data:
```bash
DB_HOST=tnchallenge.c9guk4iumyrk.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=TNchallenge
DB_SECRET_ARN=arn:aws:secretsmanager:us-east-1:010438485555:secret:rds-db-credentials/tnchallengedb/postgres/1722626208161-8DfyZd
USER_POOL_ID=us-east-1_py2mgDFpf
```

## Development

To run the application locally:
```bash
serverless offline
```

## Testing

Run tests using:
```bash
npm test
```
## API Usage Examples

Here are some examples of how to use the API endpoints:

### Perform an Operation

To perform a multiplication operation:

```bash
curl --location 'https://f8lzov2sb3.execute-api.us-east-1.amazonaws.com/operation' \
--header 'Content-Type: application/json' \
--data '{
    "userId": "5478c428-4021-701e-1868-aad2da17725e",
    "operationType": "multiplication",
    "operationParams": {
        "num1": 5,
        "num2": 3
    }
}'
```
This will multiply 5 and 3 for the user with ID "5478c428-4021-701e-1868-aad2da17725e".

### Update User Balance
To update a user's balance:

```bash
curl --location 'https://f8lzov2sb3.execute-api.us-east-1.amazonaws.com/update-balance' \
--header 'Content-Type: application/json' \
--data '{
  "userId": "5478c428-4021-701e-1868-aad2da17725e",
  "amount": 15
}'
```
This will add 15 to the balance of the user with ID "5478c428-4021-701e-1868-aad2da17725e".
Note: Replace “5478c428-4021-701e-1868-aad2da17725e” with an actual user ID from your system, and “amount” with an actual amount when testing.

### Get User Records
To retrieve a user's records:
```bash
curl --location 'https://f8lzov2sb3.execute-api.us-east-1.amazonaws.com/user-records?userId=5478c428-4021-701e-1868-aad2da17725e'
```

This will return the records for the user with ID "5478c428-4021-701e-1868-aad2da17725e".
Note: Replace “5478c428-4021-701e-1868-aad2da17725e” with an actual user ID from your system.
### Delete a Record
To delete a specific record:
```bash
curl --location --request PATCH 'https://f8lzov2sb3.execute-api.us-east-1.amazonaws.com/record-delete' \
--header 'Content-Type: application/json' \
--data '{
  "userId": "5478c428-4021-701e-1868-aad2da17725e",
  "recordId": "some-record-id"
}'
```
This will delete the record with ID "some-record-id" for the user with ID "5478c428-4021-701e-1868-aad2da17725e".
Note: Replace "5478c428-4021-701e-1868-aad2da17725e" with an actual user ID from your system, and "some-record-id" with an actual record ID when testing.

## License

This project is licensed under the MIT License - see the LICENSE.md file for details.