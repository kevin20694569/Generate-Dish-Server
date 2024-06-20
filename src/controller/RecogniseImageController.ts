import { Request, Response, ErrorRequestHandler, NextFunction } from "express";
import OpenAI from "openai";
import { ImageObject } from "../model/APIModel";

import BaseController from "./BaseController";
const { InterceptorConfigurationError, Responder, ClarifaiStub, grpc } = require("clarifai-nodejs-grpc");
type InterceptorConfigurationError = typeof InterceptorConfigurationError;
type Responder = typeof Responder;
type ClarifaiStub = typeof ClarifaiStub;
let openAIAPIKey = process.env.openAIAPIKey as string;
class RecogniseImageController extends BaseController {
  openAIAPIKey = process.env.openAIAPIKey as string;
  clarifaiStub_PAT = process.env.ClarifaiStub_PAT as string;
  protected openaiClient = new OpenAI({ apiKey: openAIAPIKey });

  recogniseImages = async (req: Request, res: Response, next: NextFunction) => {
    const apikey = req.headers.apikey as string;
    const { image_URLs, user_id } = req.body;
    const fetchResults = image_URLs.map(async (object: ImageObject) => {
      let results = await this.recognise(object.index, object.url, apikey);
      let model = {
        index: object.index,
        results: results,
      };
      return model;
    });
    const responses = await Promise.all(fetchResults);
    res.send(responses);
    res.end();

    return;
  };

  async recognise(index: number, image_URL: string, apikey: string) {
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
          (err: typeof InterceptorConfigurationError, response: typeof Responder) => {
            if (err) {
              throw new Error(err.message);
            }
            if (response.status.code !== 10000) {
              throw new Error("Post model outputs faåiled, status:");
            }
            const output = response.outputs[0];
            let resultArray = [];
            for (let i = 0; i < 5; i++) {
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
