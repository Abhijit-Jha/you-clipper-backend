import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import path from 'path';
import { qualityMap } from '../helper/qualityMap';
import { aspectRatioMap } from '../helper/aspectRatioMap';

// Safety check for ffmpeg binary
if (!ffmpegPath) {
  throw new Error('❌ ffmpeg binary not found!');
}
ffmpeg.setFfmpegPath(ffmpegPath);

enum Resolution {
  P1080 = 1080,
  P720 = 720,
  P480 = 480,
  P360 = 360,
  P144 = 144,
}

export async function qualityVideo(resolution: keyof typeof qualityMap, aspectRatio: keyof typeof aspectRatioMap, trimmedVideoPath: string,videoId:string): Promise<string> {
  const currentPath = path.resolve();
  const inputPath = path.join(currentPath, trimmedVideoPath);  // include extension
  const outputPath = path.join(currentPath, 'videos', videoId,`${videoId}-${resolution}-${aspectRatio}.mp4`);
  const opPath = `${videoId}/${videoId}-${resolution}-${aspectRatio}.mp4`; //To return to frontend

  // Check if resolution is valid
  if (!qualityMap[resolution]) {
    throw new Error(`❌ Resolution "${resolution}" is not supported.`);
  }

  // Check if input file exists
  if (!fs.existsSync(inputPath)) {
    throw new Error(`❌ Input file not found at ${inputPath}`);
  }

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      //does not confirms
      // .size(qualityMap[resolution])
      // .outputOptions('-aspect', aspectRatioMap[aspectRatio])
      //Force fully doing it
      .outputOptions([
        `-vf scale=${qualityMap[resolution]}`,  // Forces frame resize
        `-aspect ${aspectRatioMap[aspectRatio]}` // Sets display aspect
      ])
      .output(outputPath)
      .on('progress', (p) => {
        console.log(`Progress: ${p.percent?.toFixed(2)}%, Size: ${p.targetSize}KB, FPS: ${p.currentFps}`);
      })
      .on('start', (command) => {
        console.log('Started ffmpeg with command:', command);
      })
      .on('end', () => {
        console.log('✅ Video processing done');
        resolve(opPath);
      })
      .on('error', (err) => {
        console.error('❌ ffmpeg error:', err.message);
        reject(err);
      })
      .run();
  });
}
