const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const saltRounds = 10;
const secretKey = "Sdcfhdhjd@ff%^%^*&*54564656nHJGGyghbg";

const hashPassword = async (password) => {
  let salt = await bcrypt.genSalt(saltRounds);
  // console.log(salt);
  let hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

const hashCompare = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

const createToken = async (payload) => {
  let token = await jwt.sign(payload, secretKey, { expiresIn: "3h" });
  return token;
};


const createForgetToken = async (payload) => {
  let token = await jwt.sign(payload, secretKey, {
    expiresIn: "10m",
  });
  return token;
};

const validateToken = async (req, res, next) => {
  if (req.headers.authorization) {
    let token = req.headers.authorization.split(" ")[1];
    let data = await jwt.decode(token);
    if (Math.floor(+new Date() / 1000) < data.exp) next();
    else res.status(401).send({ message: "Token Expired !" });
  } else {
    res.status(400).send({ message: "Token Not Found" });
  }
};

const AdminGuard = async (req, res, next) => {
  if (req.headers.authorization) {
    let token = req.headers.authorization.split(" ")[1];
    let data = await jwt.decode(token);
    if (data.role === "admin") next();
    else res.status(401).send({ message: "Only allowed Admin!" });
  } else {
    res.status(400).send({ message: "Token Not Found" });
  }
};

module.exports = {
  hashPassword,
  hashCompare,
  createToken,
  validateToken,
  AdminGuard,
  createForgetToken,
  secretKey
};
