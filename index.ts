// import { mkdirSync, existsSync } from 'fs';
import { existsSync, mkdir, mkdirSync } from "fs";
import { default as YTDlpWrap } from "yt-dlp-wrap"
import { combineVideo } from "./utils/combine";
import { trimVideo } from "./utils/trim";
import { qualityVideo } from "./utils/getVideoQuality";
// { youtubeURL}: { youtubeURL: string }
async function ytDpl() {
    const githubRelease = await YTDlpWrap.getGithubReleases(1, 5);
    const platform = process.platform;
    const isWindows = process.platform === 'win32';
    const binaryPath = `./bin/yt-dlp${isWindows ? '.exe' : ''}`;

    console.log(platform)
    if (!existsSync("./bin")) mkdirSync("./bin")
    await YTDlpWrap.downloadFromGithub(
        binaryPath,
        '2025.05.22',
        platform
    );
    const ytDlpWrap = new YTDlpWrap(binaryPath);
    
    ytDlpWrap.setBinaryPath(binaryPath);

    //ytdlp 
    let ytDlpEventEmitter = ytDlpWrap
        .exec([
            'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
            "--no-playlist",
            '-f',
            'bv+ba/b',
            '-o',
            './videos/output.mp4', //change name
        ])
        .on('progress', (progress) =>
            console.log(
                progress.percent,
                progress.totalSize,
                progress.currentSpeed,
                progress.eta
            )
        )
        .on('ytDlpEvent', (eventType, eventData) =>
            console.log(eventType, eventData)
        )
        .on('error', (error) => console.error(error))
        .on('close', async() => {
            console.log('all done');
            //Now ffmeg will start his work to trim
            //Frontend pe kuch flag daldenge ki done bro ytdlp ka kaam hochuka hai now you can go and combine video
            await combineVideo();
            await trimVideo({
                startTime : "00:00:00",
                endTime : "00:00:20"
            })

            qualityVideo("360p",'reels');
        });
}

ytDpl()

