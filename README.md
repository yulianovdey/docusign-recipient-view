### Instructions

Install dependencies:

`npm i`

Create base configuration file:

`cp .env.sample .env`

Inside `.env` fill in `ACCOUNT_ID` and `ACCESS_TOKEN`.
  
In the DocuSign UI, create a template with:

- one document
- one recipient
- one text tab assigned to the recipient

Inside `.env`, set `TEMPLATE_ID` to the id of the template.

Run the code:

`node .`
