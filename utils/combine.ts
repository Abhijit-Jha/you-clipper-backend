import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import path from 'path';

// Safety check for ffmpeg binary
if (!ffmpegPath) {
  throw new Error('❌ ffmpeg binary not found!');
}
ffmpeg.setFfmpegPath(ffmpegPath);
interface combineOutputType{
  outputPath : string
}
export async function combineVideo({videoPath,audioPath,videoId}:{videoPath :string,audioPath:string,videoId : string}): Promise<combineOutputType> {
  const currentPath = path.resolve();
  const outputPath = path.join(currentPath, 'videos',`${videoId}`, `combined-${videoId}.mp4`);

  // ✅ Check if input files exist
  if (!fs.existsSync(audioPath)) throw new Error('❌ Audio file not found');
  if (!fs.existsSync(videoPath)) throw new Error('❌ Video file not found');

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(videoPath)
      .input(audioPath)
      .outputOptions(['-c:v copy', '-c:a aac']) 
      .on('start', commandLine => {
        console.log('🎬 FFmpeg started:', commandLine);
      })
      .on('end', () => {
        console.log('✅ Combined video + audio into:', outputPath);
        resolve({
          outputPath : `videos/${videoId}/combined-${videoId}.mp4`
        });
      })
      .on('error', (err) => {
        console.error('❌ FFmpeg error:', err.message);
        reject(err);
      })
      .save(outputPath);
  });
}
