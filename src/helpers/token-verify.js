const validateJWT = (req, res, next) => {
  const token = req.header("x-token");
  if (!token) {
    return res.status(401).json({ message: "No token found." });
  }

  try {
    const payload = jwt.verify(token, process.env.SECRET_JWT);
    req.user = payload; // Cambiado de req.username a req.user para acceder al rol del usuario
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
  next();
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};

export { validateJWT, adminOnly };
