import exp from "constants";
import MySQLTableControllerBase from "./MySQLTableServiceBase";
import { User, DishPreference, Complexity } from "./SQLModel";
import { ResultSetHeader } from "mysql2";

class UserModel extends MySQLTableControllerBase {
  commonSelectString = `CONCAT( "${this.serverIP}/userimage/"), image_id) as user_imageurl, NULL AS password`;
  getUserByEmail = async (email: string) => {
    try {
      let query = `SELECT email, password FROM user WHERE email = ?`;
      let params = [email];
      let results: any[];
      let fields: any;
      [results, fields] = await this.pool.query(query, params);
      return results[0];
    } catch (error) {
      throw error;
    }
  };

  insertUser = async (user: User): Promise<ResultSetHeader> => {
    try {
      let { id, name, email, password, image_id } = user;
      let query = `INSERT INTO user (id, name, email, password, image_id)
      VALUES (?, ?, ?, ?, ?);`;
      let params = [id, name, email, password, image_id];
      let [header, fields] = await this.pool.query(query, params);
      return header as ResultSetHeader;
    } catch (error) {
      throw error;
    }
  };

  getUserByID = async (user: User) => {
    let { id, email, password, image_id } = user;
    let query = `SELECT *, ${this.commonSelectString} FROM user WHERE id = ?`;
    let params = [id];
    let results: any[];
    let fields: any;
    [results, fields] = await this.pool.query(query, params);
    return results[0];
  };
}

export default UserModel;
