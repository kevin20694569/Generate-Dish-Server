import BaseController from "./BaseController";
import fs from "fs";
import path from "path";
//import AWS from "aws-sdk";
import { S3Client, PutObjectCommand, ObjectCannedACL, PutObjectCommandOutput } from "@aws-sdk/client-s3";
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
  uploadUserImage = async (buffer: Buffer, fileName: string): Promise<string> => {
    let filePath = path.resolve(__dirname, `../../public/userimage/${fileName}.jpg`);
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, buffer, (err) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          resolve(fileName);
        }
      });
    });
  };
  uploadDishImage = async (buffer: Buffer, fileName: string): Promise<string> => {
    let filePath = path.resolve(__dirname, `../../public/dishimage/${fileName}.jpg`);
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, buffer, (err) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          resolve(fileName);
        }
      });
    });
  };

  uploadDishStepImage = async (buffer: Buffer, fileName: string): Promise<string> => {
    let filePath = path.resolve(__dirname, `../../public/stepimage/${fileName}.jpg`);
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, buffer, (err) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          resolve(fileName);
        }
      });
    });
  };

  uploadDishImageToS3 = async (buffer: Buffer, fileName: string): Promise<void> => {
    const input = {
      ACL: ObjectCannedACL.public_read, // 檔案權限
      Bucket: `${this.BUCKET_NAME}`, // 相簿位子
      Key: `dish-image/${fileName}`, // 你希望儲存在 S3 上的檔案名稱
      Body: buffer, // 檔案
      ContentType: "image/jpeg", // 副檔名
    };
    const command: PutObjectCommand = new PutObjectCommand(input);
    try {
      const response = await this.s3Client.send(command);
    } catch (error) {
      throw error;
    }
  };

  uploadRecognizedImageToS3 = async (buffer: Buffer, fileName: string): Promise<string> => {
    let key = `recognized-image/${fileName}`;
    const input = {
      ACL: ObjectCannedACL.public_read, // 檔案權限
      Bucket: `${this.BUCKET_NAME}`, // 相簿位子
      Key: key, // 你希望儲存在 S3 上的檔案名稱
      Body: buffer, // 檔案
      ContentType: "image/jpeg", // 副檔名
    };
    const command: PutObjectCommand = new PutObjectCommand(input);
    try {
      const response: PutObjectCommandOutput = await this.s3Client.send(command);
      return `${this.imageServerPrefix}/${key}`;
    } catch (error) {
      throw error;
    }
  };
  uploadStepImageToS3 = async (buffer: Buffer, fileName: string): Promise<void> => {
    const input = {
      ACL: ObjectCannedACL.public_read, // 檔案權限
      Bucket: `${this.BUCKET_NAME}`, // 相簿位子
      Key: `step-image/${fileName}`, // 你希望儲存在 S3 上的檔案名稱
      Body: buffer, // 檔案
      ContentType: "image/jpeg", // 副檔名
    };
    const command: PutObjectCommand = new PutObjectCommand(input);
    try {
      const response = await this.s3Client.send(command);
    } catch (error) {
      throw error;
    }
  };

  uploadUserImageToS3 = async (buffer: Buffer, fileName: string): Promise<void> => {
    const input = {
      ACL: ObjectCannedACL.public_read, // 檔案權限
      Bucket: `${this.BUCKET_NAME}`, // 相簿位子
      Key: `user-image/${fileName}`, // 你希望儲存在 S3 上的檔案名稱
      Body: buffer, // 檔案
      ContentType: "image/jpeg", // 副檔名
    };
    const command: PutObjectCommand = new PutObjectCommand(input);
    try {
      const response = await this.s3Client.send(command);
    } catch (error) {
      throw error;
    }
  };

  convertBase64ToBuffer = (dataString: string): Buffer => {
    const buffer = Buffer.from(dataString, "base64");
    return buffer;
  };
}

export default MediaController;
