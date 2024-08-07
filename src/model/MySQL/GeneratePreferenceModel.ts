import { BlobLike } from "openai/uploads";
import MySQLTableControllerBase from "./MySQLTableServiceBase";
import { User, Generate_Preference, Complexity, Recipe } from "./SQLModel";
import { ResultSetHeader, RowDataPacket } from "mysql2";

class GeneratePreferenceModel extends MySQLTableControllerBase {
  selectPreferenceByID = async (preference_id: string) => {
    try {
      let query = `SELECT * from generate_preference WHERE id = ?`;
      let params = [preference_id];
      let [result, fields] = await this.pool.query(query, params);
      let preferences = result as RowDataPacket[];
      return preferences[0];
    } catch (error) {
      throw error;
    }
  };

  selectPreferenceByUser_idOrderByTime = async (user_id: string, date: Date) => {
    try {
      let query = `SELECT * from generate_preference WHERE user_id = ? AND created_time < ? ORDER BY created_time DESC LIMIT 8`;
      let params = [user_id, date];
      let [result, fields] = await this.pool.query(query, params);
      let preferences = result as RowDataPacket[];
      return preferences;
    } catch (error) {
      throw error;
    }
  };

  insertDishPreference = async (
    id: string,
    user_id: string,
    ingredients: string,
    equipments: string,
    // excluded_ingredients: string,
    cuisine: string,
    complexity: string,
    timelimit: number,
    temperature: number,
    addictionalText: string
  ): Promise<ResultSetHeader> => {
    try {
      let query = `INSERT INTO generate_preference (id, user_id, ingredients, cuisine, complexity, timelimit, equipments, temperature, additional_text)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`;
      let params = [id, user_id, ingredients, cuisine, complexity, timelimit, equipments, temperature, addictionalText];
      let [header, fields] = await this.pool.query(query, params);
      return header as ResultSetHeader;
    } catch (error) {
      throw error;
    }
  };
}

export default GeneratePreferenceModel;
