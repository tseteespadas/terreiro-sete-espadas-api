const jwt = require("jsonwebtoken");
const Users = require("../models/Users");

async function authMiddleware(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(401).json({ message: "O cabeçalho de autenticação está faltando." });
  }
  const [type, key] = token.split(" ");
  if (type.toLowerCase() === "bearer" && !!key) {
    try {
      const decoded = jwt.verify(key, process.env.API_SECRET);
      req.user = decoded.user;
      const userSessionToken = await Users.findOne({ user_id: decoded.user.user_id }).select({ token: 1, _id: 0 });
      if (key === userSessionToken.token) {
        return next();
      } else {
        return res.status(419).json({ message: "Sua sessão expirou. Faça login novamente para acessar o recurso solicitado." })
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "Credenciais inválidas." });
    }
  } else {
    return res.status(401).json({ message: "Credenciais inválidas." })
  }
}

module.exports = authMiddleware;
