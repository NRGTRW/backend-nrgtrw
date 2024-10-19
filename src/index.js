import "dotenv/config";
import express from "express";
import { errorHandler } from "./middlewares/errorHandler.js";
import { createProfileSchema } from "./utils/schemas.js";

const app = express();
const port = process.env.PORT;

app.use(express.json());

function verifyRequestBodySchema(schema) {
  function validate(req, res, next) {
    try {
      const { body } = req;

      const { success, error, data } = schema.safeParse(body);

      console.log(success);
      console.log(error);

      next();
    } catch (err) {
      next(err);
    }
  }

  return validate;
}

app.post(
  "/profiles",
  verifyRequestBodySchema(createProfileSchema),
  (req, res) => {
    res.send("Hello");
  }
);

app.get("/profiles", (req, res) => {
  res.send({ isSuccessful: true, response: { profile: "Hello" } });
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running ${port}`);
});
