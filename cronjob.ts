// import cron from 'node-cron';
// import fs from 'fs';
// import path from 'path';

// const videosDir = path.resolve(__dirname, '..', 'videos');

// // Runs at 12:00 AM every day
// cron.schedule('0 0 * * *', () => {
//     try {
//         if (fs.existsSync(videosDir)) {
//             fs.rmSync(videosDir, { recursive: true, force: true });
//             console.log(`✅ Deleted videos directory at: ${videosDir}`);
//         } else {
//             console.log(`ℹ️ Videos directory not found at: ${videosDir}`);
//         }
//     } catch (err) {
//         console.error('❌ Error deleting videos directory:', err);
//     }
// });
