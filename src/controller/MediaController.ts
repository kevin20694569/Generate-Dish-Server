import BaseController from "./BaseController";
import fs from "fs";
import { nanoid } from "nanoid";
import path from "path";
import { buffer } from "stream/consumers";

interface UploadedFile {
  fileName: string;
}

class MediaController extends BaseController {
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

  convertBase64ToBuffer = (base64String: string): Buffer => {
    const buffer = Buffer.from(base64String, "base64");
    return buffer;
  };
}

export default MediaController;
