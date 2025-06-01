import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import path from 'path';

// Safety check for ffmpeg binary
if (!ffmpegPath) {
  throw new Error('❌ ffmpeg binary not found!');
}
ffmpeg.setFfmpegPath(ffmpegPath);

export async function combineVideo(): Promise<boolean> {
  const currentPath = path.resolve();
  const audioPath = path.join(currentPath, 'videos', 'output.f258.m4a');
  const videoPath = path.join(currentPath, 'videos', 'output.f401.mp4');
  const outputPath = path.join(currentPath, 'videos', 'combined.mp4');

  // ✅ Check if input files exist
  if (!fs.existsSync(audioPath)) throw new Error('❌ Audio file not found');
  if (!fs.existsSync(videoPath)) throw new Error('❌ Video file not found');

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(videoPath)
      .input(audioPath)
      .outputOptions(['-c:v copy', '-c:a aac']) // video copied, audio safely encoded
      .on('start', commandLine => {
        console.log('🎬 FFmpeg started:', commandLine);
      })
      .on('end', () => {
        console.log('✅ Combined video + audio into:', outputPath);
        resolve(true);
      })
      .on('error', (err) => {
        console.error('❌ FFmpeg error:', err.message);
        reject(err);
      })
      .save(outputPath);
  });
}
