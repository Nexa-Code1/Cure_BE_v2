import UserModel from "../DB/models/user.model.js";
import jwt from "jsonwebtoken";
import { isTokenBlacklisted } from "../Utils/token-blacklist.js";

export const authenticationMiddleware = async (req, res, next) => {
    const token = req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(400).json({ message: "Unauthorized, please login!" });
  }

  if (isTokenBlacklisted(token)) {
    return res.status(401).json({ message: "Unauthorized, please login!" });
  }

  try {
    const data = jwt.verify(token, process.env.JWT_SECRET_LOGIN);

    const user = await UserModel.findById(data.id);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized, please login!" });
    }
    
    // Ensure both id and _id are available for compatibility
    if (user._id && !user.id) {
      user.id = user._id.toString();
    }
    // Also ensure _id is available as ObjectId for Mongoose operations
    if (!user._id && user.id) {
      user._id = user.id;
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token!" });
  }
};
