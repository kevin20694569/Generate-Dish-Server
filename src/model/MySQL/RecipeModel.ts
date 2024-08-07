import { BlobOptions } from "buffer";
import MySQLTableControllerBase from "./MySQLTableServiceBase";
import { User, Generate_Preference, Complexity, Recipe } from "./SQLModel";
import { ResultSetHeader, RowDataPacket } from "mysql2";

class RecipeModel extends MySQLTableControllerBase {
  //`CONCAT( "${this.dishImageServerPrefix}/", image_id) as image_url`;
  commonSelectString = ``;

  selectRecipesByPreferenceID = async (preference_id: string) => {
    try {
      let query = `SELECT * from recipe WHERE id in (select recipe_id from history_recipe WHERE generate_preference_id = ?)`;
      let params = [preference_id];
      let [results, fields] = await this.pool.query(query, params);
      results = results as RowDataPacket[];
      return results;
    } catch (error) {
      throw error;
    }
  };

  selectRecipeByRecipeID = async (dish_id: string) => {
    try {
      let query = `SELECT * from recipe WHERE id = ?`;
      let params = [dish_id];
      let [results, fields] = await this.pool.query(query, params);

      results = results as RowDataPacket[];
      return results[0] as RowDataPacket;
    } catch (error) {
      throw error;
    }
  };

  selectRecipesByRecipeIDs = async (recipe_ids: string[]) => {
    try {
      let query = `SELECT * from recipe WHERE id in (?)`;
      let params = [recipe_ids];
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

  searchRecipesByQuery = async (queryString: string, excluded_recipe_ids: string[] | null = [""]) => {
    if (!excluded_recipe_ids) {
      excluded_recipe_ids = [""];
    }
    try {
      let query = `SELECT r.* FROM recipe r
                  WHERE r.title LIKE CONCAT('%', ?, '%') AND r.id NOT IN (?)
                  LIMIT 50
                  `;
      let params = [queryString, excluded_recipe_ids];
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

  /* selectDishesByUserID = async (user_id: string, beforeDate: Date) => {
    try {
      let query = `SELECT * from recipe WHERE user_id = ? AND created_time < ?  ORDER BY created_time DESC limit 20;`;
      let params = [user_id, beforeDate];
      let [results, fields] = await this.pool.query(query, params);
      results = results as RowDataPacket[];
      return results;
    } catch (error) {
      throw error;
    }
  };*/

  /*insertDish = async (dish: Dish): Promise<ResultSetHeader> => {
    try {
      let { id, name, cuisine, preference_id, user_id, summary, costtime, complexity, image_id: resource_id } = dish;
      let query = `INSERT INTO user (id, name, cuisine, preference_id, user_id, summary, costtime, complexity, resource_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
      let params = [id, name, cuisine, preference_id, user_id, summary, costtime, complexity, resource_id];
      let [header, fields] = await this.pool.query(query, params);
      return header as ResultSetHeader;
    } catch (error) {
      throw error;
    }
  };
  insertDishes = async (dishes: Dish[]): Promise<ResultSetHeader> => {
    try {
      let arrayOfValues = dishes.map((dish) => {
        return Object.values(dish);
      });
      let query = `INSERT INTO dish (id, name, cuisine, preference_id, user_id, summary, costtime, complexity, isgenerateddetail, image_id, imageprompt)
      VALUES ?`;
      let params = [arrayOfValues];
      let [header, fields] = await this.pool.query(query, params);
      console.log(header);
      return header as ResultSetHeader;
    } catch (error) {
      throw error;
    }
  };*/

  /*updateDishDetailStatus = async (dish_id: string, isGeneratedDetail: boolean) => {
    try {
      let query = `UPDATE recipe SET isgenerateddetail = ? WHERE id = ?`;
      let params = [isGeneratedDetail, dish_id];
      let [header, fields] = await this.pool.query(query, params);
      return header as ResultSetHeader;
    } catch (error) {
      throw error;
    }
  };*/
}

export default RecipeModel;
