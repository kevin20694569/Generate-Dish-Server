import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import BaseController from "./BaseController";
import { User } from "../model/MySQL/SQLModel";
import multer from "multer";
import MediaController from "./MediaController";

class UserController extends BaseController {
  private key = process.env.jwtKey as string;
  protected mediaController = new MediaController();
  private multer = multer();
  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      let user = await this.userModel.getUserByEmail(email);
      if (await bcrypt.compare(password, user.password)) {
        const payload = {
          email: email,
          name: user,
        };

        const expiresIn = "1h";
        const token = jwt.sign(payload, this.key, { expiresIn });
        res.setHeader("JwtToken", token);
        res.status(200);
        res.send({
          message: "成功",
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
          res.status(400);
          res.send({ error: "此email已被註冊過" });
          return;
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
        res.status(200);
        res.send("註冊成功");
      } catch (error: any) {
        console.log(error.message);
        res.send(error.message);
      } finally {
        res.end();
      }
    });
  };

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }
}

export default UserController;
