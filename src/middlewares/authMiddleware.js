const jwt = require('jsonwebtoken');
const JWT_SECRET = 'sua_chave_secreta_aqui';

const authenticate = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Pega o token do Header "Bearer TOKEN"

  if (!token) return res.status(401).json({ error: "Acesso negado. Token não fornecido." });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Aqui salvamos o userId e o tenantId na requisição
    next();
  } catch (error) {
    res.status(401).json({ error: "Token inválido ou expirado." });
  }
};

module.exports = authenticate;