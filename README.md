# Guru API Integration with Express.js

## Introduction

This repository provides an example Express.js application for integrating Guru's API into your server-side code. It demonstrates how to obtain an access token, upload a video, and fetch video analysis using the Guru API.

### Analyze Video API

This API allows you perform AI analysis on a video by uploading it to the Guru API.

#### Prerequisites

- Node.js & npm installed
- A Guru API client ID and client secret. To find yours, go to https://console.getguru.ai/
- A .env file in the root of your project with the following content:

```bash
GURU_CLIENT_ID=YOUR_CLIENT_ID_HERE
GURU_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
GURU_SCHEMA_ID=YOUR_SCHEMA_ID
```

- Or set envronment variables:

```bash
export GURU_CLIENT_ID=your_client_id
export GURU_CLIENT_SECRET=your_client_secret
export GURU_SCHEMA_ID=your_guru_schema_id
```

- Add a test video to `/videos`

#### Setup

```bash
# Install the required pacakges
npm install
# Start the server
node index.js
```

#### Testing from the CLI

To test the `/analyze-video` endpoint from the command line, you can use tools like `curl`.

Here's how you can do it:

- Make sure the video file `test.mp4` is present in `/videos`.
- Run the following command:

```bash
curl -X POST http://localhost:3000/analyze-video
```

This should initiate the process of fetching a token, uploading the video, and getting its analysis. The server will poll for analysis for up to 5 minutes.

If successful, you'll receive a JSON response with the analysis data. If there's an error, it will return an appropriate error message.

For support, reach out to support@getguru.ai or join the Guru Discord server.

### License

This project is licensed under the MIT License. See the LICENSE file for details.

Happy coding!
