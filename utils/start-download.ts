import { existsSync, mkdirSync } from "fs";
import path from "path";
import { default as YTDlpWrap } from "yt-dlp-wrap";
import { extractVideoId } from "../helper/videoId";

export interface YtDplResult {
  videoPath: string;
  audioPath: string;
  videoId: string ;
  baseFilename: string;
}

export async function ytDpl({ youtubeURL }: { youtubeURL: string }): Promise<YtDplResult> {
  return new Promise(async (resolve, reject) => {
    try {
      const platform = process.platform;
      const isWindows = platform === "win32";
      const binaryPath = `./bin/yt-dlp${isWindows ? ".exe" : ""}`;

      if (!existsSync("./bin")) mkdirSync("./bin");

      await YTDlpWrap.downloadFromGithub(binaryPath, "2025.05.22", platform);

      const ytDlpWrap = new YTDlpWrap(binaryPath);
      ytDlpWrap.setBinaryPath(binaryPath);

      const videoId = extractVideoId(youtubeURL);
      const uniqueId = Math.floor(Math.random() * 10000);
      const outputDir = `./videos/${videoId}`;
      const baseFilename = `${videoId}-${uniqueId}`;

      if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });

      const videoPath = path.join(outputDir, `${baseFilename}-video.mp4`);
      const audioPath = path.join(outputDir, `${baseFilename}-audio.mp3`);

      // Download video-only
      const videoPromise = ytDlpWrap.execPromise([
        youtubeURL,
        "-f",
        "bv", // best video only
        "-o",
        videoPath,
        "--no-playlist",
      ]);

      // Download audio-only
      const audioPromise = ytDlpWrap.execPromise([
        youtubeURL,
        "-f",
        "ba", // best audio only
        "-o",
        audioPath,
        "--no-playlist",
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
