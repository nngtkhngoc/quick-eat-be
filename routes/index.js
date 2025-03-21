import foodRouter from "./foodRouter.js";
import reviewRouter from "./reviewRouter.js";

export const routes = (app) => {
  app.use("/api/food", foodRouter);
  app.use("/api/reviews", reviewRouter);
};
