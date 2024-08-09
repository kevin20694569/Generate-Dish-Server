import { Request, Response, NextFunction, json } from "express";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { nanoid } from "nanoid";
import BaseController from "./BaseController";
import { User } from "../model/MySQL/SQLModel";
import multer from "multer";
import MediaController from "./MediaController";

class UserController extends BaseController {
  private key = process.env.jwtKey as string;
  protected mediaController = new MediaController();
  private multer = multer();

  getUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let { user_id } = req.query;
      user_id = user_id as string;
      let result = await this.userModel.getUserByID(user_id);
      res.send(result);
    } catch (err) {
      res.status(400);
      console.log(err);
      res.send(err);
    } finally {
      res.end();
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      let user = await this.userModel.getUserByEmail(email);

      if (await bcrypt.compare(password, user.password)) {
        const payload = {
          email: user["email"],
          user_id: user["id"],
        };
        const expiresIn = "1h";
        const token = jwt.sign(payload, this.key, { expiresIn });
        res.setHeader("jwt-token", token);
        res.status(200);
        let user_result = {
          email: user["email"],
          name: user["name"],
          image_id: user["image_id"],
          created_time: user["created_time"],
          user_id: user["id"],
        };
        res.send({
          message: "登入成功",
          user: user_result,
        });
      } else {
        res.status(404);
        res.send({ error: "帳號或密碼錯誤" });
      }
    } catch (err: any) {
      res.status(404);
      res.send({ error: err.message });
    } finally {
      res.end();
    }
  };

  register = async (req: Request, res: Response, next: NextFunction) => {
    this.multer.single("userimage")(req, res, async (next) => {
      try {
        const { name, email, password } = req.body;

        let userimageid: string | null = null;
        let result = await this.userModel.getUserByEmail(email);

        if (result) {
          throw new Error("此email已被註冊過");
        }
        const file = req.file;
        if (file) {
          userimageid = nanoid();
          await this.mediaController.uploadUserImage(file.buffer, userimageid);
        }
        const hashPassword = await this.hashPassword(password);
        let user_id = nanoid();

        let user: User = {
          id: user_id,
          name: name,
          email: email,
          password: hashPassword,
          image_id: userimageid,
        };
        let header = await this.userModel.insertUser(user);
        if (header.serverStatus != 2) {
          throw new Error("mysql新建userError");
        }
        req.body["email"] = email;
        req.body["password"] = password;
        await this.login(req, res, next);
      } catch (error: any) {
        console.log(error.message);
        res.status(400);
        res.send(error.message);
      } finally {
        res.end();
      }
    });
  };

  updateUserPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let { user_id, password } = req.body;
      const hashPassword = await this.hashPassword(password);

      let header = await this.userModel.updateUserProfile(user_id, undefined, undefined, hashPassword);
      if (header.serverStatus != 2) {
        throw new Error("update user profile error");
      }
      res.send({ message: "update user password success" });
    } catch (error) {
      res.status(400);
      res.send(error);
      console.log(error);
    } finally {
      res.end();
    }
  };

  updateUserProfile = (req: Request, res: Response, next: NextFunction) => {
    multer().single("userimage")(req, res, async (next) => {
      try {
        let image_id = null;
        if (req.file) {
          image_id = nanoid();
          await this.mediaController.uploadUserImageToS3(req.file.buffer, image_id);
        }
        let { user_id, name, email } = req.body;
        let header = await this.userModel.updateUserProfile(user_id, name, email, image_id);
        if (header.serverStatus != 2) {
          throw new Error("update user profile error");
        }
        res.send({ message: "update user profile success" });
      } catch (error) {
        res.status(400);
        res.send(error);
        console.log(error);
      } finally {
        res.end();
      }
    });
  };

  verifyJwtToken = (req: Request, res: Response, next: NextFunction) => {
    let token = req.headers.authorization;
    try {
      if (token == undefined || token == null) {
        throw new Error("token is null");
      }
      token = token.split(" ")[1];

      jwt.verify(token, this.key, (err, data: any) => {
        if (err) {
          throw err;
        }
        req.user = { email: data.email, user_id: data.user_id };
        next();
      });
    } catch (err) {
      res.status(401);
      res.send({ message: `jwt-token fail : ${err}` });
      res.end();
    }
  };

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: { email: string; user_id: string };
    }
  }
}

export default UserController;
