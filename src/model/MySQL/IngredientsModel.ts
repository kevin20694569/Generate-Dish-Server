import MySQLTableControllerBase from "./MySQLTableServiceBase";
import { Ingredient } from "./SQLModel";
import { ResultSetHeader, RowDataPacket } from "mysql2";

class IngredientsModel extends MySQLTableControllerBase {
  /*insertIngredients = async (ingredients: Ingredient[]): Promise<ResultSetHeader> => {
    try {
      let arrayOfValues = ingredients.map((ingredient) => {
        return Object.values(ingredient);
      });

      let query = `INSERT INTO ingredient (id, name, quantity, dish_id,  order_index)
      VALUES ?`;
      let params = [arrayOfValues];
      let [header, fields] = await this.pool.query(query, params);
      return header as ResultSetHeader;
    } catch (error) {
      throw error;
    }
  };*/

  selectIngredientsByDishID = async (recipe_id: string) => {
    try {
      let query = `SELECT * from ingredient WHERE recipe_id = ?`;
      let params = [recipe_id];
      let [result, fields] = await this.pool.query(query, params);
      return result as RowDataPacket;
    } catch (error) {
      throw error;
    }
  };

  selectIngredientsByRecipeIDs = async (recipe_ids: string[]) => {
    try {
      let query = `SELECT * from ingredient WHERE recipe_id in (?)`;
      let params = [recipe_ids];
      let [result, fields] = await this.pool.query(query, params);
      return result as RowDataPacket[];
    } catch (error) {
      throw error;
    }
  };
}

export default IngredientsModel;
