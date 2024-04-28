import { Request, Response, ErrorRequestHandler, NextFunction } from "express";
import OpenAI from "openai";
import GenerateImageController from "./GenerateImageController";
import { Dish, Complexity, DishPreference, DishStep, Ingredient } from "../model/MySQL/SQLModel";
import { OpenAiDishJsonResponse as OpenAIDishJson } from "../model/APIModel";
import BaseController from "./BaseController";
import { nanoid } from "nanoid";
import MediaController from "./MediaController";

class GenerateDishController extends BaseController {
  openAIAPIKey = process.env.openAIAPIKey as string;
  protected openaiClient = new OpenAI({ apiKey: this.openAIAPIKey });
  protected generateImageController = new GenerateImageController();
  protected mediaController = new MediaController();
  generateDishes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let {
        ingredients,
        quantity,
        equipments,
        excludedIngredients,
        cuisine,
        complexity,
        limit,
        temperature,
        timelimit,
        excludedFoods,
        addictionalText,
        user_id,
        reference_in_history,
      } = req.body;
      if (!ingredients) {
        throw new Error("沒有指定食材");
      }
      let preference_id = nanoid();

      let header = await this.dishPreferenceModel.insertDishPreference(
        preference_id,
        user_id,
        quantity,
        excludedFoods,
        reference_in_history,
        complexity,
        addictionalText,
        timelimit,
        equipments,
        temperature,
        cuisine
      );
      if (header.serverStatus != 2) {
        throw new Error("insertDishPreference Fail");
      }
      let quantityPrompt: String = "";
      let equipmentsPrompt: String = "";
      let excludedIngredientsPrompt: String = "";
      let excludedPrompt: String = "";
      let cuisinePrompt: String = "";
      let complexityPrompt: String = "";
      if (quantity != "") {
        quantityPrompt = `, 用餐人數為${quantity}`;
      }
      if (equipments != "") {
        equipmentsPrompt = `, 設備有${equipments}`;
      }
      if (excludedIngredients != "") {
        excludedIngredientsPrompt = `, 不得使用${excludedIngredients}做為食材`;
      }
      if (cuisine != "") {
        cuisinePrompt = `, 菜式為${cuisine}`;
      }
      if (complexity != "") {
        complexityPrompt = `, 烹飪難度為${complexity}`;
      }
      if (excludedFoods != "") {
        excludedPrompt = `, 不得與${excludedFoods}等菜色類似`;
      }
      let userContent = `利用剩下的食材做菜, 請推薦${limit}道菜餚, 擁有${ingredients}${equipmentsPrompt}${cuisinePrompt}${excludedPrompt}${complexityPrompt}${addictionalText}`;
      let messages: Array<OpenAI.ChatCompletionMessageParam> = [
        {
          role: "system",
          content: `你是一名廚師`,
        },
        { role: "user", content: userContent },
      ];
      let model = "gpt-3.5-turbo-1106";
      let jsonReq = {
        name: "dishResult",
        description: "對菜色分類",
        parameters: {
          type: "object",
          properties: {
            dishes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                    description: "菜色名字",
                  },
                  cuisine: {
                    type: "string",
                    description: "菜式",
                  },
                  summary: {
                    type: "string",
                    description: "菜色簡易製作流程",
                  },
                  costtime: {
                    type: "string",
                    description: "大約花費時間",
                  },
                  complexity: {
                    type: "string",
                    enum: ["簡單", "普通", "困難"],
                    description: "菜色複雜度",
                  },
                },
                required: ["title", "summary", "costtime", "cuisine", "complexity"],
              },
            },
          },
          required: ["dishes"],
        },
      };
      let functions = [jsonReq];
      const response = await this.openaiClient.chat.completions.create({
        model: model,
        messages: messages,
        max_tokens: 512,
        temperature: temperature,
        functions: functions,
        function_call: "auto",
      });
      let resMessage = response.choices[0].message.function_call?.arguments;

      let jsonData = {
        created: response["created"],
        usage: response["usage"],
        dishes: {},
      };
      let jsonResults: OpenAIDishJson[] = JSON.parse(resMessage as string).dishes as OpenAIDishJson[];
      let promises = jsonResults.map(async (result) => {
        let b64_json = await this.generateImageController.generateDishImage(result.name, result.cuisine, result.summary);
        let buffer = this.mediaController.convertBase64ToBuffer(b64_json);
        let dish_id = nanoid();
        await this.mediaController.uploadDishImage(buffer, dish_id);
        let dish: Dish = {
          id: dish_id,
          name: result.name,
          cuisine: result.cuisine,
          preference_id: preference_id,
          user_id: user_id,
          summary: result.summary,
          costtime: result.costtime,
          complexity: result.complexity,
          image_id: dish_id,
        };
        return dish;
      });
      let dishes = await Promise.all(promises);
      await this.dishModel.insertDishes(dishes);
      jsonData.dishes = dishes;
      res.json(jsonData);
    } catch (error) {
      console.log(error);
      res.status(404);
      res.send({ error: error });
    } finally {
      res.end();
    }
  };

  generateDishDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let { dish_id, maxsteps, quantity } = req.body;

      let stepArray = await this.stepModel.selectStepsByDishID(dish_id);
      if (stepArray.length > 0) {
        throw new Error("此Dish已經生成過Detail");
      }
      let dishResults = await this.dishModel.selectDishByDishID(dish_id);
      let { name, cuisine, preference_id, user_id, created_time, summary, costtime, complexity, image_id } = dishResults[0];
      let model = "gpt-3.5-turbo-1106";
      let userContent = `我想要做${name}，時間要在${costtime}內，難易度為${complexity}，製作概要為${summary}，生成${maxsteps}步以內的烹飪步驟，製作${quantity}人份`;
      let jsonReq = {
        name: "dishresult",
        description: "菜色細節與步驟",
        parameters: {
          type: "object",
          properties: {
            steps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  description: {
                    type: "string",
                    description: "此步驟解釋",
                  },
                },
              },
            },
            needingredients: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                    description: "原料食材名字",
                  },
                  quantity: {
                    type: "string",
                    description: "原料食材份量(單位為公克，調味料以湯匙計算)",
                  },
                },
              },
            },
          },
          required: ["steps", "needingredients"],
        },
      };
      let messages: Array<OpenAI.ChatCompletionMessageParam> = [
        {
          role: "system",
          content: `你現在是一名${cuisine}廚師、要教一名學生做${complexity}的菜`,
        },
        { role: "user", content: userContent },
      ];

      let functions = [jsonReq];
      const response = await this.openaiClient.chat.completions.create({
        model: model,
        messages: messages,
        max_tokens: 500,
        functions: functions,
        function_call: "auto",
      });
      let choice = response.choices[0];

      let choiceMessage = choice.message.function_call?.arguments;

      interface OpenAIGenerateDishDetailJson {
        steps: { description: string }[];
        needingredients: { name: string; quantity: string }[];
      }
      let jsonResults = JSON.parse(choiceMessage as string) as OpenAIGenerateDishDetailJson;

      let promises = jsonResults.steps.map(async (result, index) => {
        let b64_json = await this.generateImageController.generateDishStepImage(name, result.description);
        let buffer = this.mediaController.convertBase64ToBuffer(b64_json);
        let step_id = nanoid();

        let fileName = await this.mediaController.uploadDishStepImage(buffer, step_id);
        let step: DishStep = {
          id: step_id,
          step_order: index,
          description: result.description,
          image_id: step_id,
          dish_id: dish_id,
        };

        return step;
      });

      let steps = await Promise.all(promises);
      let stepHeader = await this.stepModel.insertSteps(steps);
      if (stepHeader.serverStatus != 2) {
        throw new Error("insert step Fail");
      }
      let ingredients = jsonResults.needingredients.map((needingredient, order_index) => {
        let ingredient_id = nanoid();
        let ingredient: Ingredient = {
          id: ingredient_id,
          name: needingredient.name,
          quantity: needingredient.quantity,
          dish_id: dish_id,
          order_index: order_index,
        };
        return ingredient;
      });
      let ingredientHeader = await this.ingredientsModel.insertIngredients(ingredients);
      if (ingredientHeader.serverStatus != 2) {
        throw new Error("insert ingredients Fail");
      }

      let jsonObject = {
        created: response["created"],
        usage: response["usage"],
        steps: steps,
        needingredients: jsonResults.needingredients,
      };
      res.json(jsonObject);
    } catch (error: any) {
      res.status(400);
      res.json({ err: error.message });
      res.end();
    }
  };
}

export default GenerateDishController;