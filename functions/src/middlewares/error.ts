import { Request, Response } from "express";
import { ValidationError } from "yup";
import * as logger from "firebase-functions/logger";

export const onError = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  err: any,
  req: Request,
  res: Response,
) => {
  logger.error(err);

  if (err instanceof ValidationError) {
    return res.status(422).send({ message: err.message });
  }

  return res.status(500).send({ error: err });
};
