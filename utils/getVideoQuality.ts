import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import path from 'path';
import { qualityMap } from '../helper/qualityMap';
import { aspectRatioMap } from '../helper/aspectRatioMap';

if (!ffmpegPath) {
  throw new Error('❌ ffmpeg binary not found!');
}
ffmpeg.setFfmpegPath(ffmpegPath);

// Utility: Converts "16:9" -> { w: 16, h: 9 }
function parseAspectRatio(ratio: string) {
  const [w, h] = ratio.split(':').map(Number);
  return { w, h };
}

export async function qualityVideo(
  resolution: keyof typeof qualityMap,
  aspectRatio: keyof typeof aspectRatioMap,
  trimmedVideoPath: string,
  videoId: string
): Promise<string> {
  const currentPath = path.resolve();
  const inputPath = path.join(currentPath, trimmedVideoPath);
  const outputPath = path.join(currentPath, 'videos', videoId, `${videoId}-${resolution}-${aspectRatio}.mp4`);
  const opPath = `${videoId}/${videoId}-${resolution}-${aspectRatio}.mp4`;

  if (!qualityMap[resolution]) {
    throw new Error(`❌ Resolution "${resolution}" is not supported.`);
  }
  if (!aspectRatioMap[aspectRatio]) {
    throw new Error(`❌ Aspect ratio "${aspectRatio}" is not supported.`);
  }
  if (!fs.existsSync(inputPath)) {
    throw new Error(`❌ Input file not found at ${inputPath}`);
  }

  // Extract width and height from resolution
  const [targetWidth, targetHeight] = qualityMap[resolution].split('x').map(Number);
  const { w: arW, h: arH } = parseAspectRatio(aspectRatioMap[aspectRatio]);

  // Compute aspect-correct crop values
  const targetAR = arW / arH;
  const scaledCropWidth = Math.floor(targetHeight * targetAR);
  const cropWidth = Math.min(scaledCropWidth, targetWidth);
  const cropHeight = Math.floor(cropWidth / targetAR);

  const cropX = Math.floor((targetWidth - cropWidth) / 2);
  const cropY = Math.floor((targetHeight - cropHeight) / 2);

  const vfFilter = `scale=${targetWidth}:${targetHeight},crop=${cropWidth}:${cropHeight}:${cropX}:${cropY}`;

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([`-vf ${vfFilter}`])
      .output(outputPath)
      .on('start', (cmd) => {
        console.log('🔧 FFmpeg started with command:', cmd);
      })
      .on('progress', (p) => {
        console.log(`⏳ Progress: ${p.percent?.toFixed(2)}%`);
      })
      .on('end', () => {
        console.log('✅ Video processing done');
        resolve(opPath);
      })
      .on('error', (err) => {
        console.error('❌ FFmpeg error:', err.message);
        reject(err);
      })
      .run();
  });
}
