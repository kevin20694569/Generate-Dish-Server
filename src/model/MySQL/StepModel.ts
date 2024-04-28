import MySQLTableControllerBase from "./MySQLTableServiceBase";
import { DishStep } from "./SQLModel";
import { ResultSetHeader, RowDataPacket } from "mysql2";

class StepModel extends MySQLTableControllerBase {
  commonSelectString = `CONCAT( "${this.serverIP}/stepimage/", image_id, ".jpg") as image_url`;
  selectStepsByDishID = async (dish_id: string) => {
    try {
      let query = `SELECT *, ${this.commonSelectString}  from step WHERE dish_id = ? ORDER BY step_order`;
      let params = [dish_id];
      let [RowDataPacket, fields] = await this.pool.query(query, params);
      return RowDataPacket as RowDataPacket;
    } catch (error) {
      throw error;
    }
  };

  insertSteps = async (steps: DishStep[]): Promise<ResultSetHeader> => {
    try {
      let arrayOfValues = steps.map((step) => {
        return Object.values(step);
      });

      let query = `INSERT INTO step (id, step_order, description, image_id, dish_id)
      VALUES ?`;
      let params = [arrayOfValues];
      let [header, fields] = await this.pool.query(query, params);
      return header as ResultSetHeader;
    } catch (error) {
      throw error;
    }
  };
}

export default StepModel;
