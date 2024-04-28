import OpenAI from "openai";
import { OpenAiDishJsonResponse, StepResponse } from "../model/APIModel";
import BaseController from "./BaseController";
import { Dish } from "../model/MySQL/SQLModel";

class GenerateImageController extends BaseController {
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
}

export default GenerateImageController;
