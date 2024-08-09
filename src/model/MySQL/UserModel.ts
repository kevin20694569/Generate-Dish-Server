import exp from "constants";
import MySQLTableControllerBase from "./MySQLTableServiceBase";
import { User, Generate_Preference, Complexity } from "./SQLModel";
import { ResultSetHeader } from "mysql2";

class UserModel extends MySQLTableControllerBase {
  commonSelectString = `CONCAT( "${this.userImageServerPrefix}/", image_id) as image_url, NULL AS password`;
  getUserByEmail = async (email: string) => {
    try {
      let query = `SELECT * FROM user WHERE email = ?`;
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

  getUserByID = async (user_id: string) => {
    let query = `SELECT *, ${this.commonSelectString} FROM user WHERE id = ?`;
    let params = [user_id];
    let results: any[];
    let fields: any;
    [results, fields] = await this.pool.query(query, params);
    return results[0];
  };

  updateUserProfile = async (id: string, name?: string, email?: string, image_id?: string | null): Promise<ResultSetHeader> => {
    let query = `UPDATE user SET`;
    let params = [];

    const updates: string[] = [];
    if (name != undefined) {
      updates.push("name = ?");
      params.push(name);
    }
    if (email != undefined) {
      updates.push("email = ?");
      params.push(email);
    }
    if (image_id != undefined && image_id != null) {
      updates.push("image_id = ?");
      params.push(image_id);
    }

    if (updates.length === 0) {
      throw new Error("No fields to update");
    }

    query += ` ${updates.join(", ")} WHERE id = ?`;

    params.push(id);

    let [result, fields] = await this.pool.query(query, params);
    return result as ResultSetHeader;
  };
}

export default UserModel;
