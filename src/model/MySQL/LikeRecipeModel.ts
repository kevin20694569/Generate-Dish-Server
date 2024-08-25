import MySQLTableControllerBase from "./MySQLTableServiceBase";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { Recipe, LikeRecipe } from "./SQLModel";

class LikeRecipeModel extends MySQLTableControllerBase {
  //`CONCAT( "${this.dishImageServerPrefix}/", image_id) as image_url`;
  commonSelectString = ``;

  markAsLike = async (user_id: string, recipe_id: string) => {
    try {
      let query = `INSERT INTO like_recipe (user_id, recipe_id) VALUES (?, ?)`;
      let params = [user_id, recipe_id];
      let [result, fields] = await this.pool.query(query, params);
      result = result as ResultSetHeader;
      return result;
    } catch (error) {
      throw error;
    }
  };
  deleteRow = async (user_id: string, recipe_id: string) => {
    try {
      let query = `DELETE FROM like_recipe WHERE user_id = ? AND recipe_id = ?`;
      let params = [user_id, recipe_id];
      let [result, fields] = await this.pool.query(query, params);
      result = result as ResultSetHeader;
      return result;
    } catch (error) {
      throw error;
    }
  };

  selectLikedRecipesByUserID = async (user_id: string, dateThreshold: Date) => {
    try {
      let query = `SELECT r.*, li.created_time
                  FROM recipe r
                  INNER JOIN like_recipe li ON r.id = li.recipe_id
                  WHERE li.user_id = ?
                  AND li.created_time < ?
                  ORDER BY li.created_time DESC
                  LIMIT 12`;
      let params = [user_id, dateThreshold];
      let [results, fields] = await this.pool.query(query, params);

      results = results as RowDataPacket[];
      let recipes = results.map((result) => {
        return result as Recipe;
      });
      return recipes;
    } catch (error) {
      throw error;
    }
  };

  selectLikedRecipesByRecipeIDs = async (recipes_ids: string[]) => {
    try {
      let query = `SELECT recipe_id FROM like_recipe WHERE recipe_id in (?)`;
      let params = [recipes_ids];
      let [results, fields] = await this.pool.query(query, params);

      results = results as RowDataPacket[];
      let likeRecipes = results.map((result) => {
        return result as LikeRecipe;
      });
      return likeRecipes;
    } catch (error) {
      throw error;
    }
  };

  searchRecipesFromLikedByQuery = async (queryString: string, user_id: string, excluded_recipe_ids: string[] | null = [""]) => {
    if (!excluded_recipe_ids) {
      excluded_recipe_ids = [""];
    }
    try {
      let query = `SELECT r.*, li.created_time
                  FROM recipe r
                  INNER JOIN like_recipe li ON r.id = li.recipe_id
                  WHERE r.title LIKE CONCAT('%', ?, '%') AND li.user_id = ? AND li.recipe_id NOT IN (?)
                  ORDER BY li.created_time DESC
                  LIMIT 20`;
      let params = [queryString, user_id, excluded_recipe_ids];
      let [results, fields] = await this.pool.query(query, params);

      results = results as RowDataPacket[];
      let recipes = results.map((result) => {
        return result as Recipe;
      });
      return recipes;
    } catch (error) {
      throw error;
    }
  };
}

export default LikeRecipeModel;
