import fs from 'fs/promises';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import { convertToSeconds } from '../helper/convertToSeconds';
import ffmpegPath from 'ffmpeg-static';

if (ffmpegPath) ffmpeg.setFfmpegPath(ffmpegPath);

export async function trimVideo({ startTime, endTime, combinedVideoPath, videoId }: { startTime: string; endTime: string, combinedVideoPath: string, videoId: string }): Promise<string> {
  console.log('🔧 trimVideo function called with:', { startTime, endTime, combinedVideoPath, videoId });

  try {
    const startTimeInSec = convertToSeconds(startTime);
    const endTimeInSec = convertToSeconds(endTime);
    const duration = endTimeInSec - startTimeInSec;

    console.log('⏱️ Time calculations:', { startTimeInSec, endTimeInSec, duration });

    if (duration <= 0) {
      throw new Error(`Invalid duration: ${duration}. End time must be after start time.`);
    }

    const currentPath = path.resolve();
    console.log('📁 Current working directory:', currentPath);
    console.log('📁 Combined video path received:', combinedVideoPath);

    const inputPath = path.isAbsolute(combinedVideoPath)
      ? combinedVideoPath
      : path.join(currentPath, combinedVideoPath);

    console.log('📁 Final input path:', inputPath);

    // Check if input file exists using regular fs (not fs/promises for this check)
    const fsSync = require('fs');
    if (!fsSync.existsSync(inputPath)) {
      throw new Error(`Input file does not exist: ${inputPath}`);
    }
    console.log('✅ Input file exists');

    const outputPath = path.join(currentPath, 'videos', videoId, `${videoId}-s${startTimeInSec}-e${endTimeInSec}-trimmed.mp4`);
    const opPath = `videos/${videoId}/${videoId}-s${startTimeInSec}-e${endTimeInSec}-trimmed.mp4`;

    console.log('📁 Output paths:', { outputPath, opPath });

    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    try {
      await fs.mkdir(outputDir, { recursive: true });
      console.log('✅ Output directory ensured:', outputDir);
    } catch (dirError) {
      console.error('❌ Failed to create output directory:', dirError);
      throw dirError;
    }

    // Check if output file already exists
    try {
      await fs.access(outputPath);
      console.log('⚠️ Output file already exists, returning existing path:', outputPath);
      return opPath;
    } catch {
      console.log('✅ Output file does not exist, proceeding with trim');
    }

    console.log('🔄 Starting FFmpeg process...');
    console.log('🎬 FFmpeg command will be:', {
      input: inputPath,
      startTime,
      duration: `${duration} seconds`,
      output: outputPath
    });

    return new Promise((resolve, reject) => {
      const command = ffmpeg(inputPath)
        .setStartTime(startTime)
        .setDuration(duration)
        .output(outputPath)
        .on('start', (commandLine) => {
          console.log('🚀 FFmpeg started with command:', commandLine);
        })
        .on('progress', (progress) => {
          console.log('📊 FFmpeg progress:', progress.percent ? `${progress.percent.toFixed(2)}%` : 'Processing...');
        })
        .on('end', () => {
          console.log('✅ Trimming completed successfully!');
          console.log('📁 Final output path:', opPath);
          resolve(opPath);
        })
        .on('error', (err) => {
          console.error('❌ FFmpeg error:', {
            message: err.message,
            stack: err.stack,
            inputPath,
            outputPath,
            startTime,
            duration
          });
          reject(err);
        });

      // Start the process
      command.run();
    });

  } catch (error) {
    console.error('❌ Error in trimVideo function before FFmpeg:', error);
    throw error;
  }
}