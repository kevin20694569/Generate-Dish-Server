import BaseController from "./BaseController";

import { NextFunction, Request, Response } from "express";
class DishPreferenceController extends BaseController {
  getUserDishPreferences = async (req: Request, res: Response, next: NextFunction) => {
    let user_id = req.params.id;
    let { date } = req.query;

    date = date as string;
    let dateObject = new Date();
    if (date) {
      dateObject = new Date(date);
    }
    let preferences = await this.dishPreferenceModel.selectPreferenceByUser_idOrderByTime(user_id, dateObject);
    res.json(preferences);
    res.end();
  };
}

export default DishPreferenceController;
