import OpenAI from "openai";
import { OpenAiDishJsonResponse, StepResponse } from "../model/APIModel";
import BaseController from "./BaseController";
import axios, { responseEncoding } from "axios";
import { Dish } from "../model/MySQL/SQLModel";
import { resolve } from "path";
import { Request, Response, NextFunction } from "express";
import { error } from "console";
import MediaController from "./MediaController";
import { nanoid } from "nanoid";

class GenerateImageController extends BaseController {
  mediaController: MediaController = new MediaController();
  openAIAPIKey = process.env.openAIAPIKey as string;
  protected openaiClient = new OpenAI({ apiKey: this.openAIAPIKey });
  generateDishImage = async (name: string, cuisine: string, summary: string): Promise<string> => {
    let prompt = `產生${name}, 此菜色為${cuisine}料理, 做法為${summary}, 貼切真實世界模樣`;
    const result = await this.openaiClient.images.generate({
      model: "dall-e-2",
      prompt: prompt,
      size: "256x256",
      n: 1,
      response_format: "b64_json",
      style: "natural",
    });
    return result.data[0].b64_json as string;
  };

  generateDishStepImage = async (dishName: string, description: string): Promise<string> => {
    let prompt = `生成${description}的步驟圖片，在廚房製作，貼切真實世界模樣`;
    const result = await this.openaiClient.images.generate({
      model: "dall-e-2",
      prompt: prompt,
      size: "256x256",
      n: 1,
      response_format: "b64_json",
      style: "natural",
    });
    return result.data[0].b64_json as string;
  };

  generateDishImageAPIBySD = async (req: Request, res: Response, next: NextFunction) => {
    let { dishname, description } = req.body;
    let data = await this.generateDishImageBySD(dishname, description);
    let buffer = this.mediaController.convertBase64ToBuffer(data);
    let dish_id = nanoid();
    await this.mediaController.uploadDishImage(buffer, dish_id);
    res.end();
  };

  generateDishImageBySD = async (dishName: string, prompt: string): Promise<string> => {
    let override_settings: any = {};
    override_settings["sd_model_checkpoint"] = "v1-5-pruned";
    let reqBody = {
      prompt: prompt + ", <lora:foodphoto:0.8>",
      negative_prompt: "easynegative",
      steps: 30,
      width: 512,
      height: 512,
      cfg_scale: 7,
      seed: -1,
      sampler_index: "Euler a",
      override_settings: override_settings,
      override_settings_restore_afterwards: false,
    };
    try {
      let url = "http://127.0.0.1:7860/sdapi/v1/txt2img";

      let res = await axios.post(url, reqBody);

      let data = res.data;
      let { images, parameters, info } = data;
      return images[0] as string;
    } catch (error) {
      throw error;
    }
  };
}

export default GenerateImageController;
