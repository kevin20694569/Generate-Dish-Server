import { BlobLike } from "openai/uploads";
import MySQLTableControllerBase from "./MySQLTableServiceBase";
import { User, DishPreference, Complexity, Dish } from "./SQLModel";
import { ResultSetHeader } from "mysql2";

class DishPreferenceModel extends MySQLTableControllerBase {
  commonSelectString = `CONCAT( "${this.serverIP}/userimage/"), image_id) as user_imageurl, NULL AS password`;

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
