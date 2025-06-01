import fs from 'fs/promises';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import { convertToSeconds } from '../helper/convertToSeconds';
import ffmpegPath from 'ffmpeg-static';

if (ffmpegPath) ffmpeg.setFfmpegPath(ffmpegPath);

export async function trimVideo({ startTime, endTime }: { startTime: string; endTime: string }): Promise<string> {
  const currentPath = path.resolve();
  const inputPath = path.join(currentPath, 'videos', 'combined.mp4');
  const outputPath = path.join(currentPath, 'videos', 'trimmedVideo.mp4');

  // Check if output file exists
  try {
    await fs.access(outputPath);
    // If no error, file exists
    console.log('⚠️ Output file already exists:', outputPath);
    // You can choose to either:
    // - return the path directly
    // - delete the old file before processing
    // - or reject with an error
    // Here, let's just return the path to avoid re-processing
    return outputPath;
  } catch {
    // File doesn't exist, proceed with trimming
  }

  const duration = convertToSeconds(endTime) - convertToSeconds(startTime);

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .setStartTime(startTime)
      .setDuration(duration)
      .output(outputPath)
      .on('end', () => {
        console.log('✅ Trimming completed!');
        resolve(outputPath);
      })
      .on('error', (err) => {
        console.error('❌ FFmpeg error:', err.message);
        reject(err);
      })
      .run();
  });
}
