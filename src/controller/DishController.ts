import { Next } from "mysql2/typings/mysql/lib/parsers/typeCast";
import BaseController from "./BaseController";
import { Request, Response, NextFunction, query } from "express";
import axios, { AxiosRequestConfig } from "axios";
import { error } from "console";
import { Recipe, Ingredient } from "../model/MySQL/SQLModel";
class DishController extends BaseController {
  /*selectDishDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let dish_id = req.params.id;
      const dishPromise = this.dishModel.selectRecipeByRecipeID(dish_id);
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
  };*/
  /* selectDishesByUserID = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let user_id = req.params.id;
      let { date } = req.query;
      date = date as string;

      let dateObject = new Date();
      if (date) {
        dateObject = new Date(date);
      }
      user_id = user_id as string;
      const dishes = await this.dishModel.selectDishesByUserID(user_id, dateObject);

      const dish_ids = dishes.map((dish) => {
        return dish.id;
      });
      const ingredientsPromise = this.ingredientsModel.selectIngredientsByRecipeIDs(dish_ids);
      const stepsPromise = this.stepModel.selectStepsByRecipeID(dish_ids);
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
        //dish["isgenerateddetail"] = dish["isgenerateddetail"] == 0 ? false : true;
        return {
          ...dish,
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
  };*/
  /* getRecommendRecipes = async (req: Request, res: Response, next: NextFunction) => {
    let { query } = req.body;
    let url = this.recommend_recipe_url_prefix + "/recipe";
    let params = {
      query: query,
    };
    let response = await axios.get(url, { params: params });
    let { results } = response.data;

    let recipe_ids = results.map((recipe: any) => {
      return recipe.id;
    });
    let recipesPromise = this.dishModel.selectRecipesByRecipeIDs(recipe_ids);
    let stepsPromise = this.stepModel.selectStepsByRecipeIDs(recipe_ids);
    let ingredientsPromise = this.ingredientsModel.selectIngredientsByRecipeIDs(recipe_ids);
    let [recipes, steps, ingredients] = await Promise.all([recipesPromise, stepsPromise, ingredientsPromise]);
    let json = await this.mergeRecipeDetail(recipes, steps, ingredients);
    res.json(json);
  };

  mergeRecipeDetail = async (recipes: any[], steps: any[], ingredients: any[]) => {
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
    let results = recipes.map((recipe) => {
      return {
        ...recipe,
        ingredients: ingredientMap[recipe.id],
        steps: stepMap[recipe.id],
      };
    });
    return results;
  };*/
}

export default DishController;
