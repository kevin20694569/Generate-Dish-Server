import { BlobLike } from "openai/uploads";
import MySQLTableControllerBase from "./MySQLTableServiceBase";
import { User, Generate_Preference, Complexity, Recipe, HistoryRecipe } from "./SQLModel";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { ids } from "webpack";

class HistoryRecipeModel extends MySQLTableControllerBase {
  selectHistoryRecipeByUserID = async (user_id: string, date: Date) => {
    try {
      let query = `SELECT * from history_recipe WHERE user_id = ? AND created_time < ? ORDER BY created_time DESC LIMIT 8`;
      let params = [user_id, date];
      let [result, fields] = await this.pool.query(query, params);
      let preferences = result as RowDataPacket[];
      return preferences[0];
    } catch (error) {
      throw error;
    }
  };

  insertHistoryRecipes = async (user_id: string, generate_preference_id: string, recipes: Recipe[]): Promise<ResultSetHeader> => {
    try {
      let query = `INSERT INTO history_recipe (user_id, recipe_id, generate_preference_id, history_order)
      VALUES ?;`;
      let inputs = recipes.map((recipe, index) => {
        return [user_id, recipe.id, generate_preference_id, index];
      });
      let params = [inputs];
      let [header, fields] = await this.pool.query(query, params);
      return header as ResultSetHeader;
    } catch (error) {
      throw error;
    }
  };

  deleteHistoryRecipesByPreferenceID = async (preference_id: string) => {
    try {
      let query = `DELETE FROM history_recipe WHERE generate_preference_id = ?;`;
      let params = [preference_id];
      let [result, fields] = await this.pool.query(query, params);
      let preferences = result as RowDataPacket[];
      return preferences[0];
    } catch (error) {
      throw error;
    }
  };
}

export default HistoryRecipeModel;
