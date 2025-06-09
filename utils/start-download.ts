import { existsSync, mkdirSync } from "fs";
import path from "path";
import { default as YTDlpWrap } from "yt-dlp-wrap";
import { extractVideoId } from "../helper/videoId";

export interface YtDplResult {
  videoPath: string;
  audioPath: string;
  videoId: string;
  baseFilename: string;
}

export async function ytDpl({ youtubeURL }: { youtubeURL: string }): Promise<YtDplResult> {
  return new Promise(async (resolve, reject) => {
    try {
      const platform = process.platform;
      const isWindows = platform === "win32";
      const binaryPath = `./bin/yt-dlp${isWindows ? ".exe" : ""}`;
      const cookiePath = path.resolve('cookies/youtube-cookies.txt');

      if (!existsSync("./bin")) mkdirSync("./bin");

      if (!existsSync(binaryPath)) {
        await YTDlpWrap.downloadFromGithub(binaryPath, "2025.05.22", platform);
      }


      const ytDlpWrap = new YTDlpWrap(binaryPath);
      ytDlpWrap.setBinaryPath(binaryPath);

      const videoId = extractVideoId(youtubeURL);
      const uniqueId = "abhi";
      const outputDir = `./videos/${videoId}`;
      const baseFilename = `${videoId}-${uniqueId}`;

      if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });

      const videoPath = path.join(outputDir, `${baseFilename}-video.mp4`);
      const audioPath = path.join(outputDir, `${baseFilename}-audio.mp3`);


      console.log("➡️ Starting download for", youtubeURL);
      console.log("Binary path:", binaryPath);
      console.log("Output paths:", videoPath, audioPath);
      // ✅ If both files exist already, skip downloading
      if (existsSync(videoPath) && existsSync(audioPath)) {
        console.log("Video & audio already exist. Skipping download.");
        return resolve({
          videoPath,
          audioPath,
          videoId,
          baseFilename,
        });
      }

      // Download video-only
      const videoPromise = ytDlpWrap.execPromise([
        youtubeURL,
        "-f",
        "bv",
        "-o",
        videoPath,
        "--no-playlist",
        // "--cookies",cookiePath
      ]);
      
      // Download audio-only
      const audioPromise = ytDlpWrap.execPromise([
        youtubeURL,
        "-f",
        "ba",
        "-o",
        audioPath,
        "--no-playlist",
        // "--cookies",cookiePath
      ]);

      await Promise.all([videoPromise, audioPromise]);

      console.log("Download finished");

      resolve({
        videoPath,
        audioPath,
        videoId,
        baseFilename,
      });
    } catch (e) {
      console.error("Error in ytDpl:", e);
      reject(e);
    }
  });
}
