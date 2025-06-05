import path from "path";
import fs from "fs";
import { Client, Storage, ID } from "node-appwrite";
import dotenv from "dotenv";
import { InputFile } from "node-appwrite"
dotenv.config();

const client = new Client()
    .setEndpoint(process.env.APP_WRITE_API_ENDPOINT!)
    .setProject(process.env.APP_WRITE_PROJECT_ID!)
    .setKey(process.env.APP_WRITE_API_KEY!);

const storage = new Storage(client);

export async function uploadVideoToAppwrite(videoFilePath: string) {
    try {
        const absolutePath = path.isAbsolute(videoFilePath)
            ? videoFilePath
            : path.join(process.cwd(), videoFilePath);

        const fileBuffer = fs.readFileSync(absolutePath);
        const fileName = path.basename(absolutePath);
        const nodeFile = InputFile.fromBuffer(fileBuffer, fileName);

        const uploadedFile = await storage.createFile(
            process.env.BUCKET_ID!,
            ID.unique(),
            nodeFile
        );
        
        console.log("File uploaded successfully:", uploadedFile);
        return uploadedFile;
    } catch (error) {
        console.error("Upload failed:", error);
        throw error;
    }
}
