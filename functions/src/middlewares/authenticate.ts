import { NextFunction, Request, RequestHandler, Response } from "express";
import * as admin from "firebase-admin";

export interface User {
  id: string;
  displayName: string;
  email: string;
  photoUrl: string;
}

export const authenticate = (): RequestHandler =>
  async (req: Request, res: Response, next: NextFunction) => {
    if (
      !req.headers.authorization ||
      !req.headers.authorization.startsWith("Bearer ")
    ) {
      console.log("Request to protected route without authorization header");
      res.status(403).send({
        message: "Unauthorized",
      });
      return;
    }

    const idToken = req.headers.authorization.split("Bearer ")[1];

    try {
      const decodedIdToken = await admin.auth().verifyIdToken(idToken);
      
      req.user = {
        id: decodedIdToken.uid,
        displayName: decodedIdToken.name || "",
        email: decodedIdToken.email || "",
        photoUrl: decodedIdToken.picture || "",
      };

      next();
      return;
    } catch (e) {
      console.log(
        "Error on authenticate while verifying Firebase ID token:",
        e,
      );
      res.status(403).send("Unauthorized");
      return;
    }
  };
