import MySQLTableControllerBase from "./MySQLTableServiceBase";
import { User, DishPreference, Complexity, Dish } from "./SQLModel";
import { ResultSetHeader, RowDataPacket } from "mysql2";

class DishModel extends MySQLTableControllerBase {
  commonSelectString = `CONCAT( "${this.serverIP}/userimage/"), image_id) as user_imageurl, NULL AS password`;

  selectDishByDishID = async (dish_id: string) => {
    try {
      let query = `SELECT * from dish WHERE id = ?`;
      let params = [dish_id];
      let [result, fields] = await this.pool.query(query, params);
      return result as RowDataPacket[];
    } catch (error) {
      throw error;
    }
  };

  insertDish = async (dish: Dish): Promise<ResultSetHeader> => {
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

      let query = `INSERT INTO dish (id, name, cuisine, preference_id, user_id, summary, costtime, complexity, image_id)
      VALUES ?`;
      let params = [arrayOfValues];
      let [header, fields] = await this.pool.query(query, params);
      return header as ResultSetHeader;
    } catch (error) {
      throw error;
    }
  };
}

export default DishModel;
