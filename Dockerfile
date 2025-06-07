FROM node:18-bullseye

# Install ffmpeg, python3 and pip, then clean up apt cache
RUN apt-get update && apt-get install -y ffmpeg python3 python3-pip && rm -rf /var/lib/apt/lists/*

# Install yt-dlp python package
RUN python3 -m pip install -U --no-cache-dir "yt-dlp[default]"

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install node dependencies
RUN npm install


COPY . .

# Build TypeScript code
RUN npm install typescript
RUN npm run build

# Expose your app port (adjust as needed)
EXPOSE 3001

# Start app with PM2 runtime and your ecosystem config
CMD ["npx", "pm2-runtime", "ecosystem.config.js"]
