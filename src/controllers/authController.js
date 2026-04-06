const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = 'sua_chave_secreta_aqui'; // Em produção, use .env

const register = async (req, res) => {
  const { email, password, companyName } = req.body;

  try {
    // 1. Criptografar a senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. Criar a Empresa e o Usuário (Tudo junto!)
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        tenant: {
          create: { name: companyName } // Cria o Tenant automaticamente
        }
      }
    });

    res.status(201).json({ message: "Usuário e Empresa criados!", userId: newUser.id });
  } catch (error) {
    res.status(400).json({ error: "Erro ao cadastrar. O email já existe?" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (user && await bcrypt.compare(password, user.password)) {
    // O SEGREDO DO MULTI-TENANT: Colocar o tenantId no Token!
    const token = jwt.sign(
      { userId: user.id, tenantId: user.tenantId }, 
      JWT_SECRET, 
      { expiresIn: '1d' }
    );

    res.json({ token });
  } else {
    res.status(401).json({ error: "Credenciais inválidas" });
  }
};

module.exports = { register, login };