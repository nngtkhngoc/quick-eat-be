import foodRouter from "./foodRouter.js";
import reviewRouter from "./reviewRouter.js";
import categoryRouter from "./categoryRouter.js";
import brandRouter from "./brandRouter.js";
import tagRouter from "./tagRouter.js";

export const routes = (app) => {
  app.use("/api/food", foodRouter);
  app.use("/api/reviews", reviewRouter);
  app.use("/api/categories", categoryRouter);
  app.use("/api/tags", tagRouter);
  app.use("/api/brands", brandRouter);
};
