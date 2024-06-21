import BaseController from "./BaseController";
import fs from "fs";
import path from "path";
import AWS from "aws-sdk";
import { error } from "console";

interface UploadedFile {
  fileName: string;
}

class MediaController extends BaseController {
  AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
  AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
  S3_BUCKET_REGION = process.env.S3_BUCKET_REGION;
  BUCKET_NAME = process.env.BUCKET_NAME;

  // new S3Client(S3ClientConfig)
  s3 = new AWS.S3({
    accessKeyId: this.AWS_ACCESS_KEY_ID,
    secretAccessKey: this.AWS_SECRET_ACCESS_KEY,
  });
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

  uploadDishImageToS3 = async (buffer: Buffer, fileName: string): Promise<string> => {
    const params: AWS.S3.PutObjectRequest = {
      Bucket: `${this.BUCKET_NAME}/dish-image`, // 相簿位子
      Key: fileName, // 你希望儲存在 S3 上的檔案名稱
      Body: buffer, // 檔案
      ACL: "public-read", // 檔案權限
      ContentType: "image/jpeg", // 副檔名
    };
    try {
      return await this.uploadImageToS3(params);
    } catch (error) {
      throw error;
    }
  };

  uploadStepImageToS3 = async (buffer: Buffer, fileName: string): Promise<string> => {
    const params: AWS.S3.PutObjectRequest = {
      Bucket: `${this.BUCKET_NAME}/step-image`, // 相簿位子
      Key: fileName, // 你希望儲存在 S3 上的檔案名稱
      Body: buffer, // 檔案
      ACL: "public-read", // 檔案權限
      ContentType: "image/jpeg", // 副檔名
    };
    try {
      return await this.uploadImageToS3(params);
    } catch (error) {
      throw error;
    }
  };

  uploadUserImageToS3 = async (buffer: Buffer, fileName: string): Promise<string> => {
    const params: AWS.S3.PutObjectRequest = {
      Bucket: `${this.BUCKET_NAME}/user-image`, // 相簿位子
      Key: fileName, // 你希望儲存在 S3 上的檔案名稱
      Body: buffer, // 檔案
      ACL: "public-read", // 檔案權限
      ContentType: "image/jpeg", // 副檔名
    };
    try {
      return await this.uploadImageToS3(params);
    } catch (error) {
      throw error;
    }
  };

  private uploadImageToS3 = async (params: AWS.S3.PutObjectRequest): Promise<string> => {
    try {
      return await new Promise<string>((resolve, reject) => {
        this.s3.upload(params, (err: Error, data: AWS.S3.ManagedUpload.SendData) => {
          if (err) {
            console.log(err);
            reject(err);
          }
          resolve(data.Location);
        });
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  convertBase64ToBuffer = (dataString: string): Buffer => {
    const buffer = Buffer.from(dataString, "base64");
    return buffer;
  };
}

export default MediaController;
