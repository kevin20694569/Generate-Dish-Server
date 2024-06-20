import { Next } from "mysql2/typings/mysql/lib/parsers/typeCast";
import BaseController from "./BaseController";
import { Request, Response, NextFunction } from "express";
import { error } from "console";
import { Ingredient } from "../model/MySQL/SQLModel";
class DishController extends BaseController {
  selectDishDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let dish_id = req.params.id;
      const dishPromise = this.dishModel.selectDishByDishID(dish_id);
      const ingredientsPromise = this.ingredientsModel.selectIngredientsByDishID(dish_id);
      const stepsPromise = this.stepModel.selectStepsByDishID(dish_id);
      const [dish, ingredients, steps] = await Promise.all([dishPromise, ingredientsPromise, stepsPromise]);
      let json = {
        dish: dish,
        steps: steps,
        ingredients: ingredients,
      };
      res.json(json);
    } catch (error: any) {
      res.send({ error: error.message });
    } finally {
      res.end();
    }
  };

  selectDishesByUserID = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let user_id = req.params.id;
      user_id = user_id as string;
      const dishes = await this.dishModel.selectDishesByUserID(user_id);

      const dish_ids = dishes.map((dish) => {
        return dish.id;
      });
      const ingredientsPromise = this.ingredientsModel.selectIngredientsByDishIDs(dish_ids);
      const stepsPromise = this.stepModel.selectStepsByDishIDs(dish_ids);
      const [ingredients, steps] = await Promise.all([ingredientsPromise, stepsPromise]);
      let ingredientMap: any = {};
      ingredients.forEach((ingredient: any) => {
        if (ingredientMap[ingredient.dish_id]) {
          ingredientMap[ingredient.dish_id].push(ingredient);
        } else {
          ingredientMap[ingredient.dish_id] = [ingredient];
        }
      });
      let stepMap: any = {};
      steps.forEach((step: any) => {
        if (stepMap[step.dish_id]) {
          stepMap[step.dish_id].push(step);
        } else {
          stepMap[step.dish_id] = [step];
        }
      });
      let results = dishes.map((dish) => {
        return {
          dish: dish,
          ingredients: ingredientMap[dish.id],
          steps: stepMap[dish.id],
        };
      });
      res.json(results);
    } catch (error: any) {
      res.send({ error: error.message });
    } finally {
      res.end();
    }
  };
}

export default DishController;
