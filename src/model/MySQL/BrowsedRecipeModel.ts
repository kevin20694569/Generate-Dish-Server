import MySQLTableControllerBase from "./MySQLTableServiceBase";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { Recipe } from "./SQLModel";

class BrowsedRecipeModel extends MySQLTableControllerBase {
  selectHistoryBrowsedRecipeByUserID = async (user_id: string, dateThreshold: Date): Promise<Recipe[]> => {
    try {
      let query = `SELECT r.*, br.updated_time
                  FROM recipe r
                  INNER JOIN browsed_recipe br ON r.id = br.recipe_id
                  WHERE br.user_id = ?
                  AND br.updated_time < ?
                  ORDER BY br.updated_time DESC
                  LIMIT 20;`;
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

  insertHistoryRecipe = async (user_id: string, recipe_id: string): Promise<ResultSetHeader> => {
    try {
      let query = `INSERT INTO browsed_recipe (user_id, recipe_id)
                VALUES (?, ?) ON DUPLICATE KEY UPDATE
                updated_time = CURRENT_TIMESTAMP;`;
      let params = [user_id, recipe_id];
      let [header, fields] = await this.pool.query(query, params);
      return header as ResultSetHeader;
    } catch (error) {
      throw error;
    }
  };
}

export default BrowsedRecipeModel;
