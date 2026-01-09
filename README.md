# Kansas City Symphony Mobile Music Box Events API

This project provides a serverless API endpoint that scrapes the Kansas City Symphony website for upcoming "Mobile Music Box" concert events. It extracts event details, including date, time, location, and other notes, and returns them as a JSON array.

The primary goal of this project is to provide a structured, machine-readable format for the event schedule, which is otherwise only available as human-readable text on the KC Symphony's website.

## Features

-   Fetches the latest event data directly from the KC Symphony's "Neighborhood Concerts" page.
-   Parses the HTML to extract individual event details.
-   Converts event dates and times to ISO 8601 format, adjusted for the Kansas City (America/Chicago) timezone.
-   Handles various text formats and notes associated with each event.
-   Deploys as a single, lightweight AWS Lambda function managed by the Serverless Framework.

## Usage

### Deployment

To deploy this function, you will need the Serverless Framework installed and your AWS credentials configured. Then, run the following command from the project root:

```bash
serverless deploy
```

After deployment, the Serverless Framework will output the public API endpoint URL.

### Invocation

You can invoke the deployed function by making an HTTP GET request to the endpoint URL provided after deployment.

Example using `curl`:

```bash
curl https://<your-api-gateway-id>.execute-api.us-east-1.amazonaws.com/
```

The endpoint will return a JSON array of event objects, for example:

```json
[
  {
    "location": "Event Location",
    "address": "123 Main St, Kansas City, MO",
    "date": "2024-09-15T23:30:00.000Z",
    "notes": "This is a free event."
  }
]
```

## Local Development

You can run the function locally using the Serverless Framework's `dev` command, which emulates the AWS Lambda environment.

```bash
serverless dev
```

This command will allow you to test your function without deploying it to AWS.
