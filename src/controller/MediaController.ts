import BaseController from "./BaseController";
import fs from "fs";
import path from "path";
//import AWS from "aws-sdk";
import {
  S3Client,
  PutObjectCommand,
  ObjectCannedACL,
  PutObjectCommandOutput,
  DeleteObjectCommand,
  DeleteBucketCommandOutput,
} from "@aws-sdk/client-s3";
import { buffer } from "stream/consumers";

interface UploadedFile {
  fileName: string;
}

class MediaController extends BaseController {
  AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
  AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
  S3_BUCKET_REGION = process.env.S3_BUCKET_REGION;
  BUCKET_NAME = process.env.BUCKET_NAME;

  s3Client = new S3Client({ region: this.S3_BUCKET_REGION });
  /* s3 = new AWS.S3({
    accessKeyId: this.AWS_ACCESS_KEY_ID,
    secretAccessKey: this.AWS_SECRET_ACCESS_KEY,
  });*/

  uploadImageToS3 = async (buffer: Buffer, fileFolder: S3Folder, fileName: string): Promise<string> => {
    let key = `${fileFolder}/${fileName}`;
    const input = {
      ACL: ObjectCannedACL.public_read,
      Bucket: `${this.BUCKET_NAME}`,
      Key: key,
      Body: buffer,
      ContentType: "image/jpeg",
    };
    const command: PutObjectCommand = new PutObjectCommand(input);
    try {
      const response: PutObjectCommandOutput = await this.s3Client.send(command);
      return `${this.imageServerPrefix}/${key}`;
    } catch (error) {
      throw error;
    }
  };

  deleteImageFromS3 = async (fileFolder: S3Folder, fileName: string): Promise<string> => {
    let key = `${fileFolder}/${fileName}`;
    const input = {
      ACL: ObjectCannedACL.public_read,
      Bucket: `${this.BUCKET_NAME}`,
      Key: key,
      Body: buffer,
      ContentType: "image/jpeg",
    };
    const command: DeleteObjectCommand = new DeleteObjectCommand(input);
    try {
      const response: DeleteBucketCommandOutput = await this.s3Client.send(command);
      return `${this.imageServerPrefix}/${key}`;
    } catch (error) {
      throw error;
    }
  };

  convertBase64ToBuffer = (dataString: string): Buffer => {
    const buffer = Buffer.from(dataString, "base64");
    return buffer;
  };
}
enum S3Folder {
  user_image = "user-image",
  dish_image = "dish-image",
  step_image = "step-image",
  recognized_image = "recognized-image",
}

export { MediaController, S3Folder };
