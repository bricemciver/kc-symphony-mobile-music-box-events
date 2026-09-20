# Kansas City Symphony Mobile Music Box Events API

This project provides a serverless API endpoint that scrapes the Kansas City Symphony website for upcoming "Mobile Music Box" concert events. It extracts event details, including date, time, location, and other notes, and returns them as a JSON array.

The primary goal of this project is to provide a structured, machine-readable format for the event schedule, which is otherwise only available as human-readable text on the KC Symphony's website.

## Features

- Fetches the latest event data directly from the KC Symphony's "Neighborhood Concerts" page.
- Parses the HTML to extract individual event details.
- Converts event dates and times to ISO 8601 format, adjusted for the Kansas City (America/Chicago) timezone.
- Handles various text formats and notes associated with each event.
- Deploys as a single, lightweight Cloudflare Worker.

## Usage

### Deployment

This project is deployed as a Cloudflare Worker. To deploy it, you will need a Cloudflare account and the Wrangler CLI installed. Then, run the following command from the project root:

```bash
wrangler deploy
```

After deployment, Wrangler will output the public worker URL.

### Invocation

You can invoke the deployed worker by making an HTTP GET request to the endpoint URL provided after deployment.

Example using `curl`:

```bash
curl https://kc-symphony-music-box-events.<your-subdomain>.workers.dev/
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

You can run the worker locally using the Wrangler CLI's `dev` command, which emulates the Cloudflare Workers environment.

```bash
wrangler dev
```

This command will allow you to test your function without deploying it to Cloudflare.
