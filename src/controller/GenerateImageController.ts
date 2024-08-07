import OpenAI from "openai";
import BaseController from "./BaseController";
import axios from "axios";
import { Request, Response, NextFunction } from "express";
import MediaController from "./MediaController";
import { nanoid } from "nanoid";

class GenerateImageController extends BaseController {
  std_url: string = process.env.std_url as string;
  mediaController: MediaController = new MediaController();
  openAIAPIKey = process.env.openAIAPIKey as string;
  protected openaiClient = new OpenAI({ apiKey: this.openAIAPIKey });
  generateDishImage = async (name: string, cuisine: string, imagePrompt: string): Promise<string> => {
    let prompt = `生成${name}菜色圖片, 此菜色為${cuisine}料理, prompt為${imagePrompt}為，合理可食用的菜餚`;
    const result = await this.openaiClient.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      size: "1024x1024",
      n: 1,
      response_format: "b64_json",
      style: "natural",
    });
    return result.data[0].b64_json as string;
  };

  generateDishStepImage = async (dishName: string, description: string): Promise<string> => {
    let prompt = `生成${description}`;
    const result = await this.openaiClient.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      size: "1024x1024",
      n: 1,
      response_format: "b64_json",
      style: "natural",
    });
    return result.data[0].b64_json as string;
  };

  generateDishImageAPIBySD = async (req: Request, res: Response, next: NextFunction) => {
    let { dishname, description } = req.body;
    let data = await this.generateImageBySD(dishname, description);
    let buffer = this.mediaController.convertBase64ToBuffer(data);
    let dish_id = nanoid();
    await this.mediaController.uploadDishImage(buffer, dish_id);
    res.end();
  };

  generateImageBySD = async (prompt: string, title?: string): Promise<string> => {
    let override_settings: any = {};
    if (title) {
      prompt = title + prompt;
    }

    override_settings["sd_model_checkpoint"] = "v1-5-pruned";
    let reqBody = {
      prompt: prompt + ", <lora:foodphoto:0.8>",
      negative_prompt: "easynegative",
      steps: 25,
      width: 256,
      height: 256,
      cfg_scale: 10,
      seed: -1,
      sampler_index: "Euler a",
      override_settings: override_settings,
      override_settings_restore_afterwards: false,
    };
    let body = {
      prompt: prompt,
    };
    try {
      let url = `${this.std_url}/generate`;

      let res = await axios.post(url, body);

      let data = res.data;
      return data;
    } catch (error) {
      throw error;
    }
  };
}

export default GenerateImageController;
