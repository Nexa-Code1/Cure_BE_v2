export const errorHandlerMiddleware = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
export const globalErrorHandler = (err, req, res, next) => {
    if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired" });
    } else if (err.name === "JsonWebTokenError") {
        return res.status(401).json({ message: "Token is invalid" });
    } else {
        return res
            .status(500)
            .json({ message: `Some thing went error`, err: err.message });
    }
};
