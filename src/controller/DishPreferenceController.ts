import BaseController from "./BaseController";

import { NextFunction, Request, Response } from "express";
class DishPreferenceController extends BaseController {
  getUserDishPreferences = async (req: Request, res: Response, next: NextFunction) => {
    let user_id = req.params.id;
    let { dateThreshold } = req.query;

    dateThreshold = dateThreshold as string;
    let dateObject = new Date();
    if (dateThreshold) {
      dateObject = new Date(dateThreshold);
    }
    let preferences = await this.generatePreferenceModel.selectPreferenceByUser_idOrderByTime(user_id, dateObject);
    res.json(preferences);
    res.end();
  };
}

export default DishPreferenceController;
