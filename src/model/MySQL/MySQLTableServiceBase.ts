import mysql from "mysql2/promise";
abstract class MySQLTableControllerBase {
  private dbPassword: string = process.env.mysql_dbpassword as string;
  protected serverIP: string = process.env.serverIP as string;
  protected host: string = process.env.mysql_host as string;
  protected user: string = process.env.mysql_user as string;
  protected mysql_DBName: string = process.env.mysql_dbname as string;
  protected pool: mysql.Pool;
  constructor(password?: string) {
    this.dbPassword = process.env.mysql_dbpassword as string;
    if (password) {
      this.dbPassword = password;
    }
    this.pool = mysql.createPool({
      host: this.host,
      user: this.user,
      password: this.dbPassword,
      database: this.mysql_DBName,
    });
  }
}

export default MySQLTableControllerBase;
