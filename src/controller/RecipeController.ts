import BaseController from "./BaseController";
import e, { Request, Response, NextFunction, query } from "express";
import axios, { AxiosRequestConfig, formToJSON } from "axios";
import { Recipe, Ingredient } from "../model/MySQL/SQLModel";
import { nanoid } from "nanoid";
class RecipeController extends BaseController {
  selectRecipesByPreferenceID = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let { preference_id } = req.query;
      preference_id = preference_id as string;
      console.log(preference_id);
      let recipes = await this.recipeModel.selectRecipesByPreferenceID(preference_id);

      await this.mergeRecipeLikeStatus(recipes);
      let mergedResults = await this.mergeRecipeDetail(recipes);

      res.json(mergedResults);
    } catch (error) {
      res.status(404);
      console.log(error);
    } finally {
      res.end();
    }
  };

  getRecommendRecipes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let { user_id, ingredients, equipments, cuisine, complexity, timelimit, temperature, addictionalText } = req.body;
      if (!ingredients) {
        throw new Error("沒有指定食材");
      }
      let preference_id = nanoid();

      let url = this.recommend_recipe_url_prefix + "/recipe";
      let params = {
        user_id: user_id,
        ingredients: ingredients,
        equipments: equipments,
        cuisine: cuisine,
        complexity: complexity,
        timelimit: timelimit,
        temperature: temperature,
        addictionalText: addictionalText,
      };

      let response = await axios.post(url, params);

      let { results } = response.data;

      let recipesPromise = this.recipeModel.selectRecipesByRecipeIDs(results);
      let insertPreferencePromise = this.generatePreferenceModel.insertDishPreference(
        preference_id,
        user_id,
        ingredients,
        equipments,
        cuisine,
        complexity,
        timelimit,
        temperature,
        addictionalText
      );

      let [recipes, header] = await Promise.all([recipesPromise, insertPreferencePromise]);
      if (header.serverStatus != 2) {
        throw new Error("insertDishPreference Fail");
      }
      let preferencePromise = this.generatePreferenceModel.selectPreferenceByID(preference_id);
      let insertHistoryRecipesPromise = this.historyRecipeModel.insertHistoryRecipes(user_id, preference_id, recipes);

      let [preference, insertHistoryPreferenceHeader] = await Promise.all([preferencePromise, insertHistoryRecipesPromise]);
      if (insertHistoryPreferenceHeader.serverStatus != 2) {
        throw new Error("insertHistoryPreferenceHeader Fail");
      }

      await this.mergeRecipeLikeStatus(recipes);
      let mergedResults = await this.mergeRecipeDetail(recipes);

      let json = {
        preference: preference,
        recipes: mergedResults,
      };

      res.json(json);
    } catch (error) {
      res.status(400);
      console.log(error);
    } finally {
      res.end();
    }
  };

  getLikedRecipes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let { user_id, dateThreshold } = req.query;
      user_id = user_id as string;
      dateThreshold = dateThreshold as string;
      let date = new Date();
      if (dateThreshold) {
        date = new Date(dateThreshold);
      }
      let recipes = await this.likeReicpeModel.selectLikedRecipesByUserID(user_id, date);
      recipes.map((recipe) => {
        recipe.liked = true;
      });
      let mergedResults = await this.mergeRecipeDetail(recipes);

      let json = {
        recipes: mergedResults,
      };
      res.json(json);
    } catch (error) {
      res.status(400);
      console.log(error);
    } finally {
      res.end();
    }
  };

  markAsLiked = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let { recipe_id, user_id, like } = req.body;
      like = like as boolean;
      if (like) {
        let result = await this.likeReicpeModel.markAsLike(user_id, recipe_id);
        if (result.serverStatus != 2) {
          throw new Error(`user_id : ${user_id} mark recipe_id : ${recipe_id} as liked fail`);
        }
      } else {
        let result = await this.likeReicpeModel.deleteRow(user_id, recipe_id);
        if (result.serverStatus != 2) {
          throw new Error(`user_id : ${user_id} delete recipe_id : ${recipe_id} like fail`);
        }
      }
      res.status(200);
    } catch (error) {
      res.status(404);
      console.log(error);
    } finally {
      res.end();
    }
  };

  addRecipeToBrowsed = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let { recipe_id, user_id } = req.body;
      let result = await this.browsedRecipeModel.insertHistoryRecipe(user_id, recipe_id);
      if (result.serverStatus != 2) {
        throw new Error("addRecipeToBrowsed Error");
      }
      res.status(200);
    } catch (error) {
      res.status(404);
      console.log(error);
    } finally {
      res.end();
    }
  };

  getBrowsedRecipe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let { user_id, dateThreshold } = req.query;
      user_id = user_id as string;
      dateThreshold = dateThreshold as string;
      let date = new Date();
      if (dateThreshold) {
        date = new Date(dateThreshold);
      }

      let recipes = await this.browsedRecipeModel.selectHistoryBrowsedRecipeByUserID(user_id, date);

      await this.mergeRecipeLikeStatus(recipes);
      let mergedResults = await this.mergeRecipeDetail(recipes);
      let json = {
        recipes: mergedResults,
      };
      res.json(json);
    } catch (error) {
      res.status(404);
      console.log(error);
    } finally {
      res.end();
    }
  };

  searchRecipeFromLikedRecipes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let { query, user_id, excluded_recipe_ids } = req.body;
      query = query as string;
      user_id = user_id as string;
      let recipes = await this.likeReicpeModel.searchRecipesFromLikedByQuery(query, user_id, excluded_recipe_ids);
      await this.mergeRecipeLikeStatus(recipes);
      let mergedResults = await this.mergeRecipeDetail(recipes);
      let json = {
        recipes: mergedResults,
      };
      res.json(json);
    } catch (error) {
      res.status(404);
      console.log(error);
    } finally {
      res.end();
    }
  };
  searchRecipes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let { query, user_id, excluded_recipe_ids }: { query: string; user_id: string; excluded_recipe_ids: string[] | null } = req.body;
      if (!excluded_recipe_ids) {
        excluded_recipe_ids = [""];
      }

      let searchedLikedRecipes = await this.likeReicpeModel.searchRecipesFromLikedByQuery(query, user_id, excluded_recipe_ids);
      let liked_ids = searchedLikedRecipes.map((recipe) => {
        return recipe.id;
      });
      excluded_recipe_ids.push(...liked_ids);
      let recipes = await this.recipeModel.searchRecipesByQuery(query, excluded_recipe_ids);
      recipes.unshift(...searchedLikedRecipes);
      await this.mergeRecipeLikeStatus(recipes);
      let mergedResults = await this.mergeRecipeDetail(recipes);
      let json = {
        recipes: mergedResults,
      };
      res.json(json);
    } catch (error) {
      res.status(404);
      console.log(error);
    } finally {
      res.end();
    }
  };

  mergeRecipeLikeStatus = async (recipes: any[]) => {
    if (recipes.length == 0) {
      return;
    }
    let ids = recipes.map((recipe) => {
      return recipe.id;
    });
    let likedRows = await this.likeReicpeModel.selectLikedRecipesByRecipeIDs(ids);
    let likeHash: any = {};
    likedRows.forEach((row) => {
      likeHash[row.recipe_id] = true;
    });
    recipes.forEach((recipe) => {
      let id = recipe.id;
      if (likeHash[id]) {
        recipe["liked"] = true;
      }
    });
  };

  mergeRecipeDetail = async (recipes: any[]) => {
    if (recipes.length == 0) {
      return [];
    }
    let recipe_ids = recipes.map((recipe) => {
      return recipe.id;
    });
    let stepsPromise = this.stepModel.selectStepsByRecipeIDs(recipe_ids);
    let ingredientsPromise = this.ingredientsModel.selectIngredientsByRecipeIDs(recipe_ids);
    let tagsPromise = this.tagModel.selectTagsByRecipeIDs(recipe_ids);
    let [steps, ingredients, tags] = await Promise.all([stepsPromise, ingredientsPromise, tagsPromise]);

    let ingredientMap: any = {};
    ingredients.forEach((ingredient: any) => {
      if (ingredientMap[ingredient.recipe_id]) {
        ingredientMap[ingredient.recipe_id].push(ingredient);
      } else {
        ingredientMap[ingredient.recipe_id] = [ingredient];
      }
    });
    let stepMap: any = {};
    steps.forEach((step: any) => {
      if (stepMap[step.recipe_id]) {
        stepMap[step.recipe_id].push(step);
      } else {
        stepMap[step.recipe_id] = [step];
      }
    });
    let tagMap: any = {};
    tags.forEach((tag: any) => {
      if (tagMap[tag.recipe_id]) {
        tagMap[tag.recipe_id].push(tag);
      } else {
        tagMap[tag.recipe_id] = [tag];
      }
    });
    let results = recipes.map((recipe) => {
      return {
        ...recipe,
        ingredients: ingredientMap[recipe.id],
        steps: stepMap[recipe.id],
        tags: tagMap[recipe.id],
      };
    });
    return results;
  };
}

export default RecipeController;
