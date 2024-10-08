import { Request, Response, NextFunction, json } from "express";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { nanoid } from "nanoid";
import BaseController from "./BaseController";
import { User } from "../model/MySQL/SQLModel";
import multer from "multer";
import { MediaController, S3Folder } from "./MediaController";
import { rootCertificates } from "tls";

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
        let token = this.generateJwtToken(email, user["id"]);
        res.setHeader("jwt-token", token);
        res.status(200);

        let user_result = {
          email: user["email"],
          name: user["name"],
          image_id: user["image_id"],
          created_time: user["created_time"],
          id: user["id"],
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
          await this.mediaController.uploadImageToS3(file.buffer, S3Folder.user_image, userimageid);
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
        let { user_id, name, email } = req.body;
        if (req.file) {
          image_id = nanoid();
          let user = await this.userModel.getUserByID(user_id);
          let old_image_id = user.image_id;
          let uploadPromise = this.mediaController.uploadImageToS3(req.file.buffer, S3Folder.user_image, image_id);
          let deletePromise = this.mediaController.deleteImageFromS3(S3Folder.user_image, old_image_id);
          await Promise.all([uploadPromise, deletePromise]);
        }

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

  jwtTokenMiddleWare = async (req: Request, res: Response, next: NextFunction) => {
    let token = req.headers.authorization;
    try {
      if (token == undefined || token == null || token == "") {
        throw new Error("token is null");
      }

      token = token.split(" ")[1];

      let { newToken, user } = await this.verifyJwtToken(token);
      res.setHeader("jwt-token", newToken);

      req.user = user;
      next();
    } catch (err) {
      res.status(401);
      res.send({ message: `jwt-token fail : ${err}` });
      res.end();
    }
  };

  generateJwtToken = (email: string, user_id: string) => {
    const payload = {
      email: email,
      user_id: user_id,
    };
    //200 days
    const expiresIn = "7 days";
    const token = jwt.sign(payload, this.key, { expiresIn });
    return token;
  };

  verifyJwtToken = async (token: string): Promise<any> => {
    try {
      let { newToken, user } = await new Promise<any>((resolve, reject) => {
        jwt.verify(token, this.key, (err, data: any) => {
          if (err) {
            reject(err);
            return;
          }
          let { email, user_id } = data;
          let token = this.generateJwtToken(email, user_id);
          resolve({ newToken: token, user: data });
        });
      });
      return { newToken: newToken, user: user };
    } catch (error) {
      throw error;
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
