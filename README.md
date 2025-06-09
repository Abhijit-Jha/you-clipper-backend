# YouClipper Backend 🛠️

<div align="center">

**The Powerful Backend Engine for YouClipper**

_Clip Processing • Queue Management • API Services_

[![GitHub stars](https://img.shields.io/github/stars/Abhijit-Jha/you-clipper-backend)](https://github.com/Abhijit-Jha/you-clipper-backend)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[🎬 Main Project](https://github.com/Abhijit-Jha/youclipper) • [⭐ Star Frontend](https://github.com/Abhijit-Jha/youclipper) • [⭐ Star Backend](https://github.com/Abhijit-Jha/you-clipper-backend)

</div>

## 🌟 What is This?

This is the **backend service** that powers [YouClipper](https://github.com/Abhijit-Jha/youclipper) - handling video processing, queue management, and API services for seamless YouTube video clipping.

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have:

- 🧰 **Node.js (v16+)** and **npm**
- 🧠 **Redis Server** (running)
- 📺 **YouTube API Key**
- 🗄️ **MongoDB Connection**

### Installation

1. **Clone this repository:**

   ```bash
   git clone https://github.com/Abhijit-Jha/you-clipper-backend
   cd you-clipper-backend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   ```bash
   cp .env.example .env
   ```

   You can find the `.env.example` file [here](https://github.com/Abhijit-Jha/you-clipper-backend/blob/master/.env.example).
   Update the values in `.env` with your actual credentials and configuration.

4. **Start the server:**
   ```bash
   npm run start-server
   ```

✅ **Backend running at: http://localhost:3001**

## 🔧 Required Services Setup

### 1. Redis Setup

**Cloud Options:**

- [Railway](https://railway.app) - Quick Redis deployment
- [Upstash](https://upstash.com) - Serverless Redis
- [AWS ElastiCache](https://aws.amazon.com/elasticache/) - Enterprise Redis

**Local Setup:**

```bash
# Using Docker
docker run --name youclipper-redis -d -p 6379:6379 redis

# Or install Redis locally
# macOS: brew install redis
# Ubuntu: sudo apt install redis-server
```

### 2. YouTube API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select a project
3. Enable **YouTube Data API v3**
4. Create API credentials
5. Copy your API key

### 3. MongoDB Setup

**MongoDB Atlas (Recommended):**

1. Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Get connection string

**Local MongoDB:**

```bash
# Using Docker
docker run --name youclipper-mongo -d -p 27017:27017 mongo
```


## 🎯 API Endpoints

Once running, your backend will serve these endpoints:

### 📹 Video Processing Routes (`/api/video`)

#### Start Download
```http
POST /api/video/startDownload
Content-Type: application/json

{
  "youtubeURL": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```
**Response:** `{ "jobId": "unique-job-id" }`

#### Check Download Status
```http
GET /api/video/downloadStatus/:jobId
```
**Response:** `{ "id": "job-id", "state": "waiting|active|completed|failed", "progress": {...} }`

#### Check Combine Status
```http
GET /api/video/combineStatus/:jobId 
- :jobId — The ID of the download job
```
**Response:** `{ "id": "job-id", "state": "waiting|active|completed|failed", "progress": {...} }`

#### Trim Video
```http
POST /api/video/trim?startTime=00:00:10&endTime=00:01:30
Content-Type: application/json

{
  "videoId": "video-identifier",
  "combinedVideoPath": "/path/to/combined/video.mp4"
}
```
**Response:** `{ "jobId": "trim-job-id" }`

#### Check Trim Status
```http
GET /api/video/trimStatus/:jobId
```
**Response:** `{ "id": "job-id", "state": "waiting|active|completed|failed", "progress": {...} }`

#### Process Quality & Aspect Ratio
```http
POST /api/video/quality?resolution=720p&aspectRatio=reels
Content-Type: application/json

{
  "trimmedVideoPath": "/path/to/trimmed/video.mp4",
  "videoId": "video-identifier"
}
```
**Response:** `{ "jobId": "quality-job-id", "status": "queued" }`

#### Check Quality Job Status
```http
GET /api/video/qualityJobStatus/:jobId
```
**Response:** `{ "id": "job-id", "state": "waiting|active|completed|failed", "progress": {...} }`

### 📊 Queue Management Routes (`/api/queue`)

#### Get Overall Job Status
```http
POST /api/queue/status/:jobId
Content-Type: application/json

{
  "qualityJobId": "quality-job-id" // optional
}
```
**Response:** 
```json
{
  "currentWaitingJobs": 3,
  "statusOfYourJob": "active|waiting|completed|failed",
  "qualityJobStatus": "waiting|active|completed|failed" // if qualityJobId provided
}
```

### 🔧 Utility Routes

#### Test Authentication
```http
GET /api/video/test
GET /api/queue/test
```
**Response:** `{ "user": {...} }`

## 🔥 Tech Stack

- **🎥 Video Processing:** yt-dlp, FFmpeg
- **⚡ Queue System:** BullMQ + Redis
- **🔧 Server:** Node.js + Express
- **🗄️ Database:** MongoDB

## 📝 Important Notes

- ✅ **Redis must be running** before starting the server
- 🔒 **Never commit secrets** - use environment variables
- 🌐 **CORS is configured** for frontend communication
- 🔄 **Queue processing** handles video operations asynchronously

## 🏠 Complete Self-Hosting

This backend works with the YouClipper frontend. For **COMPLETE SELF-HOSTING** of the entire YouClipper platform:

📖 **[Follow the Complete Setup Guide](https://github.com/Abhijit-Jha/youclipper#-ready-to-self-host-lets-get-started)**

The main repository contains:

- ✅ Complete setup instructions
- ✅ Frontend setup steps
- ✅ Service configuration guides
- ✅ Production deployment tips


### Environment Variables

Check `.env.example` for all available configuration options.

## 🤝 Contributing

We love contributions!

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

[Read](https://github.com/Abhijit-Jha/youclipper/blob/master/CONTRIBUTING.md) 

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Part of the YouClipper ecosystem**

[🎬 Frontend Repository](https://github.com/Abhijit-Jha/youclipper) • [🌐 Live Demo](https://www.youclipper.xyz/)

**Made with ❤️ by [Abhijit Jha](https://github.com/Abhijit-Jha)**

</div>
