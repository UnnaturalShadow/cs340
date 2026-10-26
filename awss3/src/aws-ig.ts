import fs from "fs";
import path from "path";

import {
    S3Client,
    PutObjectCommand,
} from "@aws-sdk/client-s3";

s3upload();

async function s3upload() {
    const filePath = process.argv[2];
    if (process.argv.length !== 3 || !filePath) {
        console.log("Specify the file to upload on the command line");
        process.exit();
    }

    try {
        const client = new S3Client();
        const fileContent = fs.readFileSync(filePath);

        const params = {
            "Body": fileContent,
            "Bucket": "cs340-unnaturalshadow-2026",
            "Key": path.basename(filePath),
        };

        const command = new PutObjectCommand(params);
        const response = await client.send(command);

        console.log("File upload successful with ", response.$metadata.httpStatusCode);
    } catch (error) {
        console.log(error);
    }
}
