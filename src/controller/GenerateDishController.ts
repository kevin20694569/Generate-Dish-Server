import { Request, Response, ErrorRequestHandler, NextFunction } from "express";
import OpenAI from "openai";
import GenerateImageController from "./GenerateImageController";
import { Recipe, Complexity, Generate_Preference, Step, Ingredient } from "../model/MySQL/SQLModel";
import { OpenAiDishJsonResponse as OpenAIDishJson } from "../model/APIModel";
import BaseController from "./BaseController";
import { nanoid } from "nanoid";
import MediaController from "./MediaController";

enum GPTModel {
  gpt4turbo = "gpt-4-turbo-2024-04-09",
  gpt35 = "gpt-3.5-turbo-1106",
  gpt4o = "gpt-4o",
}

class GenerateDishController extends BaseController {
  openAIAPIKey = process.env.openAIAPIKey as string;
  modelName = GPTModel.gpt35;
  protected openaiClient = new OpenAI({ apiKey: this.openAIAPIKey });
  protected generateImageController = new GenerateImageController();
  protected mediaController = new MediaController();
  /*generateDishes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let {
        ingredients,
        quantity,
        equipments,

        excluded_foods,
        cuisine,
        complexity,
        limit,
        temperature,
        timelimit,
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
        excluded_foods,
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
      let excludedFoodsPrompt: String = "";
      let excludedPrompt: String = "";
      let cuisinePrompt: String = "";
      let complexityPrompt: String = "";
      if (quantity != "") {
        quantityPrompt = `, 用餐人數為${quantity}`;
      }
      if (equipments != "") {
        equipmentsPrompt = `, 設備有${equipments}`;
      }

      if (excluded_foods != "") {
        excludedFoodsPrompt = `, 不得與${excluded_foods}等菜色相似`;
      }
      if (cuisine != "") {
        cuisinePrompt = `, 菜式為${cuisine}`;
      }
      if (complexity != "") {
        complexityPrompt = `, 烹飪難度為${complexity}`;
      }
      let userContent = `利用剩下的食材做菜, 請推薦${limit}道菜餚, 擁有${ingredients}${equipmentsPrompt}${excluded_foods}${cuisinePrompt}${excludedPrompt}${complexityPrompt}${addictionalText}`;
      let messages: Array<OpenAI.ChatCompletionMessageParam> = [
        {
          role: "system",
          content: `你是一名廚師`,
        },
        { role: "user", content: userContent },
      ];

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
                    description: "菜色製作流程，大約100字內",
                  },
                  costtime: {
                    type: "string",
                    description: "大約花費時間",
                  },
                  imageprompt: {
                    type: "string",
                    description:
                      "A generating image prompt which on the basis of self summary and propably food ingredient by english. Example : `RAW photo, stir-fried beef with cabbage, foodphoto, dslr, vibrant colors, high quality, sizzling dish, wok cooking, Asian cuisine, fresh vegetables, juicy beef slices, soft natural lighting, detailed close-up, Fujifilm XT, realistic textures, steam rising, savory and delicious`",
                  },
                  complexity: {
                    type: "string",
                    enum: ["簡單", "普通", "困難"],
                    description: "菜色複雜度",
                  },
                },
                required: ["name", "cuisine", "summary", "costtime", "imageprompt", "complexity"],
              },
            },
          },
          required: ["dishes"],
        },
      };
      let functions = [jsonReq];
      const response = await this.openaiClient.chat.completions.create({
        model: this.modelName,
        messages: messages,
        max_tokens: 1024,
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
        let dataString = await this.generateImageController.generateImageBySD(result.imageprompt, result.name);
        //let dataString = await this.generateImageController.generateImageBySD(result.name, result.imageprompt);
        //let b64_json = await this.generateImageController.generateDishImage(result.name, result.cuisine, result.imageprompt);
        let buffer = this.mediaController.convertBase64ToBuffer(dataString);

        let dish_id = nanoid();

        await this.mediaController.uploadDishImageToS3(buffer, dish_id);
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
          isgenerateddetail: false,
          image_id: dish_id,
          imageprompt: result.imageprompt,
        };
        return dish;
      });
      let dishes = await Promise.all(promises);
      await this.dishModel.insertDishes(dishes);

      dishes.forEach((dish) => {
        dish.image_url = `${this.dishImageServerPrefix}/${dish.image_id}`;
      });
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
        let dish = await this.dishModel.selectRecipeByRecipeID(dish_id);
        let steps = await this.stepModel.selectStepsByDishID(dish_id);
        let ingredients = await this.ingredientsModel.selectIngredientsByDishID(dish_id);
        dish["steps"] = steps;
        dish["ingredients"] = ingredients;
        res.json({
          dishes: [dish],
        });
        throw new Error("此Dish已經生成過Detail");
      }
      let dishResult = await this.dishModel.selectRecipeByRecipeID(dish_id);
      let { name, cuisine, preference_id, user_id, created_time, summary, costtime, complexity, image_id } = dishResult;

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
                  imageprompt: {
                    type: "string",
                    description:
                      "A generating image of step prompt which on the basis of self description by english. Example : `RAW photo, cutting beef, food preparation, chef's knife, wooden cutting board, kitchen setting, professional chef, detailed close-up, high quality, soft natural lighting, shallow depth of field, Fujifilm XT, rich colors, realistic textures, cinematic feel",
                  },
                },
                required: ["description", "imageprompt"],
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
                required: ["name", "quantity"],
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
        model: this.modelName,
        messages: messages,
        max_tokens: 2048,
        functions: functions,
        function_call: "auto",
      });

      let choice = response.choices[0];

      let choiceMessage = choice.message.function_call?.arguments;

      interface OpenAIGenerateDishDetailJson {
        steps: { description: string; imageprompt: string }[];
        needingredients: { name: string; quantity: string }[];
      }
      let jsonResults = JSON.parse(choiceMessage as string) as OpenAIGenerateDishDetailJson;
      let promises = jsonResults.steps.map(async (result, index) => {
        let dataString = await this.generateImageController.generateImageBySD(result.imageprompt);
        // let b64_json = await this.generateImageController.generateDishStepImage(name, result.imageprompt);
        let buffer = this.mediaController.convertBase64ToBuffer(dataString);
        let step_id = nanoid();
        await this.mediaController.uploadStepImageToS3(buffer, step_id);
        //await this.mediaController.uploadDishStepImage(buffer, step_id);
        let step: DishStep = {
          id: step_id,
          step_order: index,
          description: result.description,
          imageprompt: result.imageprompt,
          image_id: step_id,
          dish_id: dish_id,
        };

        return step;
      });

      let steps = await Promise.all(promises);
      let stepHeader = await this.stepModel.insertSteps(steps);
      if (stepHeader.serverStatus != 2) {
        throw new Error("Insert step fail");
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
      steps.forEach((step) => {
        step.image_url = `${this.stepImageServerPrefix}/${step.id}`;
      });
      await this.dishModel.updateDishDetailStatus(dish_id, true);
      dishResult["steps"] = steps;
      dishResult["ingredients"] = ingredients;
      let jsonObject = {
        created: response["created"],
        usage: response["usage"],
        dishes: [dishResult],
      };

      res.json(jsonObject);
    } catch (error: any) {
      res.status(400);
      console.log(error);
    } finally {
      res.end();
    }
  };*/
}

export default GenerateDishController;
