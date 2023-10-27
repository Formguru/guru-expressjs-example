require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const app = express();

app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const client_id = process.env.GURU_CLIENT_ID;
const client_secret = process.env.GURU_CLIENT_SECRET;
const schema_id = process.env.GURU_SCHEMA_ID;

// Function to get an access token
const getToken = async () => {
  if (fs.existsSync("token.json")) {
    const tokenData = JSON.parse(fs.readFileSync("token.json", "utf8"));
    if (Date.now() < tokenData.expiry) {
      return tokenData.token; // return existing token if it's still valid
    }
  }

  const options = {
    method: "POST",
    url: "https://customer-console-prod.auth.us-west-2.amazoncognito.com/oauth2/token",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    data: `grant_type=client_credentials&client_id=${client_id}&client_secret=${client_secret}&scope=https://api.getguru.fitness/default`,
  };

  const response = await axios(options);
  const tokenData = {
    token: response.data.access_token,
    expiry: Date.now() + response.data.expires_in * 1000,
  };
  fs.writeFileSync("token.json", JSON.stringify(tokenData));
  return tokenData.token;
};

// Function to upload a video
const uploadVideo = async (authToken) => {
  const videoPath = "./videos/test.mp4";
  const videoStream = fs.createReadStream(videoPath);
  const videoSizeInBytes = fs.statSync(videoPath).size;
  const videoData = {
    filename: "test_squat.mp4",
    size: videoSizeInBytes,
    schemaId: schema_id,
    source: "guru-api-test",
  };

  const createVideoResponse = await axios({
    method: "post",
    url: "https://api.getguru.fitness/videos",
    headers: { Authorization: authToken },
    data: videoData,
  });

  const formData = new FormData();
  Object.keys(createVideoResponse.data.fields).forEach((key) => {
    formData.append(key, createVideoResponse.data.fields[key]);
  });
  formData.append("file", videoStream, "test_squat.mp4");

  await axios.post(createVideoResponse.data.url, formData, {
    headers: { ...formData.getHeaders() },
  });

  return createVideoResponse.data.id;
};

// Function to get video analysis
const getAnalysis = async (videoId, authToken) => {
  const endTime = Date.now() + 5 * 60 * 1000; // 5 minutes from now

  while (Date.now() < endTime) {
    try {
      const response = await axios({
        url: `https://api.getguru.fitness/videos/${videoId}/analysis`,
        headers: { Authorization: authToken },
      });

      if (response.data.status && response.data.status === "Pending") {
        console.log("Polling for video analysis...");
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Poll every 5 seconds
      } else {
        return response.data;
      }
    } catch (error) {
      console.error("Error during polling for video analysis:", error.message);
    }
  }

  throw new Error("Video analysis did not complete in the expected time.");
};

// Endpoint for analyzing a video
app.post("/analyze-video", async (req, res, next) => {
  try {
    console.log("Fetching token...");
    const authToken = await getToken();
    console.log("Fetched token.");

    console.log("Uploading video...");
    const videoId = await uploadVideo(authToken);
    console.log(`Uploaded video ${videoId}.`);

    console.log(`Fetching video analysis for video ${videoId}...`);
    const analysisData = await getAnalysis(videoId, authToken);

    res.json(analysisData);
  } catch (error) {
    console.error("Error in /analyze-video:", error.message);
    next(error);
  }
});

app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
