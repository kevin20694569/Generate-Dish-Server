import { Next } from "mysql2/typings/mysql/lib/parsers/typeCast";
import BaseController from "./BaseController";
import { Request, Response, NextFunction } from "express";
import { error } from "console";
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
}

export default DishController;
