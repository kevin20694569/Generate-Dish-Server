import { Request, Response, ErrorRequestHandler, NextFunction } from "express";
import OpenAI from "openai";
import { ImageObject } from "../model/APIModel";
import axios from "axios";
import { MediaController, S3Folder } from "./MediaController";
import BaseController from "./BaseController";
import multer from "multer";
import { Multer } from "multer";
import { error } from "console";
import { rejects } from "assert";
import { resolve } from "path";
import { nanoid } from "nanoid";
import { url } from "inspector";
import { Url } from "url";
const { InterceptorConfigurationError, Responder, ClarifaiStub, grpc } = require("clarifai-nodejs-grpc");
type InterceptorConfigurationError = typeof InterceptorConfigurationError;
type Responder = typeof Responder;
type ClarifaiStub = typeof ClarifaiStub;
let openAIAPIKey = process.env.openAIAPIKey as string;
class RecogniseImageController extends BaseController {
  multer: Multer = multer({
    limits: {
      fileSize: 100 * 1024 * 1024, // 限制 100 MB
    },
    fileFilter(req: Request, file: Express.Multer.File, callback) {
      if (!file.mimetype.match(/^image|video\//)) {
        console.log("檔案格式錯誤");
        callback(new Error("檔案格式錯誤"));
      } else {
        callback(null, true);
      }
    },
  });
  openAIAPIKey = process.env.openAIAPIKey as string;
  roboflow_api_key = process.env.roboflow_api_key as string;
  clarifaiStub_PAT = process.env.ClarifaiStub_PAT as string;
  mediaController = new MediaController();
  protected openaiClient = new OpenAI({ apiKey: openAIAPIKey });

  recognizeImages = async (req: Request, res: Response, next: NextFunction) => {
    const { user_id } = req.body;
    this.multer.any()(req, res, async (err) => {
      if (err) {
        next(err);
      }
      const { user_id } = req.body;

      const files = req.files as Express.Multer.File[];
      if (files == undefined) {
        rejects(err);
      }
      let uploadPromises = files.map(async (file, index) => {
        const file_id = nanoid();
        return this.mediaController.uploadImageToS3(file.buffer, S3Folder.recognized_image, file_id);
      });
      let uploadResults: string[] = await Promise.all(uploadPromises);

      let promises = uploadResults.map((url, index) => {
        return this.recognise_by_clarifai(index, url);
      });

      let results = await Promise.all(promises);

      res.json({ results: results });
      res.end();
    });
  };

  recognise_by_food_ingredients_dataset = async (index: number, file: Express.Multer.File) => {
    try {
      const fileBase64 = file.buffer.toString("base64");
      let url = "https://detect.roboflow.com/food-ingredients-dataset/3";
      let res = await axios.post(url, fileBase64, {
        params: {
          api_key: this.roboflow_api_key,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      return [index, res.data];
    } catch (error: any) {
      console.log(error);
    }
  };

  async recognise_by_clarifai(index: number, image_URL: string) {
    if (image_URL == "" || image_URL == undefined) {
      throw new Error("URL問題");
    }
    const PAT = this.clarifaiStub_PAT;
    const USER_ID = "clarifai";
    const APP_ID = "main";
    const MODEL_ID = "food-item-recognition";
    const MODEL_VERSION_ID = "1d5fd481e0cf4826aa72ec3ff049e044";

    const stub = ClarifaiStub.grpc();
    const metadata = new grpc.Metadata();
    metadata.set("authorization", "Key " + PAT);

    try {
      return await new Promise((resolve, reject) => {
        stub.PostModelOutputs(
          {
            user_app_id: {
              user_id: USER_ID,
              app_id: APP_ID,
            },
            model_id: MODEL_ID,
            version_id: MODEL_VERSION_ID,
            inputs: [{ data: { image: { url: image_URL, allow_duplicate_url: true } } }],
          },
          metadata,
          (err: InterceptorConfigurationError, response: typeof Responder) => {
            if (err) {
              throw reject(err);
            }
            if (response.status.code !== 10000) {
              throw new Error("Post model outputs failed, status:");
            }
            const output = response.outputs[0];
            let resultArray = [];
            for (let i = 0; i < 2; i++) {
              let concept = output.data.concepts[i];
              let model = {
                name: concept.name,
                value: concept.value,
              };
              resultArray.push(model);
            }
            resolve(resultArray);
          }
        );
      });
    } catch (error) {
      throw error;
    }
  }
}

export default RecogniseImageController;
