import MySQLTableControllerBase from "./MySQLTableServiceBase";
import { Step } from "./SQLModel";
import { ResultSetHeader, RowDataPacket } from "mysql2";

class TagModel extends MySQLTableControllerBase {
  //`CONCAT( "${this.stepImageServerPrefix}/", image_id) as image_url`;
  commonSelectString = ``;
  selectTagsByRecipeID = async (recipe_id: string) => {
    try {
      let query = `SELECT * from tag WHERE recipe_id = ? ORDER BY order`;
      let params = [recipe_id];
      let [RowDataPacket, fields] = await this.pool.query(query, params);
      return RowDataPacket as RowDataPacket;
    } catch (error) {
      throw error;
    }
  };

  /*insertSteps = async (steps: DishStep[]): Promise<ResultSetHeader> => {
    try {
      let arrayOfValues = steps.map((step) => {
        return Object.values(step);
      });

      let query = `INSERT INTO step (id, step_order, description, imageprompt, image_id, dish_id)
      VALUES ?`;
      let params = [arrayOfValues];
      let [header, fields] = await this.pool.query(query, params);
      return header as ResultSetHeader;
    } catch (error) {
      throw error;
    }
  };*/

  selectTagsByRecipeIDs = async (recipe_ids: string[]) => {
    try {
      let query = `SELECT * from tag WHERE recipe_id in (?) ORDER BY recipe_id, "order"`;
      let params = [recipe_ids];
      let [RowDataPacket, fields] = await this.pool.query(query, params);
      return RowDataPacket as RowDataPacket[];
    } catch (error) {
      throw error;
    }
  };
}

export default TagModel;
