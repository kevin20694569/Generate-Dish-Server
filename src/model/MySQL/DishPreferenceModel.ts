import { BlobLike } from "openai/uploads";
import MySQLTableControllerBase from "./MySQLTableServiceBase";
import { User, DishPreference, Complexity, Dish } from "./SQLModel";
import { ResultSetHeader, RowDataPacket } from "mysql2";

class DishPreferenceModel extends MySQLTableControllerBase {
  selectPreferenceByUser_idOrderByTime = async (user_id: string, date: Date) => {
    try {
      let query = `SELECT * from dish_preference WHERE user_id = ? AND created_time < ? ORDER BY created_time DESC LIMIT 8`;
      let params = [user_id, date];
      let [result, fields] = await this.pool.query(query, params);
      let preferences = result as RowDataPacket[];
      return preferences[0];
    } catch (error) {
      throw error;
    }
  };

  insertDishPreference = async (
    id: string,
    user_id: string,
    quantity: string,
    excluded_food: string,
    referenced_in_history: boolean,
    complexity: string,
    additional_text: string,
    timelimit: string,
    equipments: string,
    temperature: number,
    cuisine: string
  ): Promise<ResultSetHeader> => {
    try {
      let query = `INSERT INTO dish_preference (id, user_id, quantity, excluded_food, referenced_in_history, complexity, additional_text, timelimit, equipments, temperature, cuisine)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
      let params = [
        id,
        user_id,
        quantity,
        excluded_food,
        referenced_in_history,
        complexity,
        additional_text,
        timelimit,
        equipments,
        temperature,
        cuisine,
      ];
      let [header, fields] = await this.pool.query(query, params);
      return header as ResultSetHeader;
    } catch (error) {
      throw error;
    }
  };
}

export default DishPreferenceModel;
