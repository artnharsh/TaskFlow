const bcrypt = require("bcryptjs");
const {query} = require("../config/db");
const {signToken} = require("../utils/jwt");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const publicUser = (user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatar_url: user.avatar_url,
    created_at: user.created_at,
});

const register = asyncHandler(async (req, res) => {
    const {name, email, password} = req.body;
    
    if(!name) throw ApiError.badRequest("Name is required");
    if(!EMAIL_REGEX.test(email)) throw ApiError.badRequest("Invalid email format");
    if(!password || password.length < 6) throw ApiError.badRequest("Password must be at least 6 characters long");

    const existingUser = await query("SELECT id FROM users WHERE email = $1", [email]);
    if(existingUser.rows.length) throw ApiError.conflict("Email already in use");

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await query(
        `INSERT INTO users (name, email, password_hash)
        VALUES ($1, $2, $3) 
        RETURNING id, name, email, avatar_url, created_at`,
        [name, email, passwordHash]
    );

    const user = newUser.rows[0];
    const token = signToken({ id: user.id, email: user.email });

    res.status(201).json({
        success: true,
        user: publicUser(user),
        token
    });
});

const login = asyncHandler(async (req, res) => {
  const email = (req.body.email || "").trim().toLowerCase();
  const { password } = req.body;

  if (!email || !password)
    throw ApiError.badRequest("Email and password are required");

  const { rows } = await query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );
  const user = rows[0];
  if (!user)
    throw ApiError.unauthorized("Invalid email or password");

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid)
    throw ApiError.unauthorized("Invalid email or password");

  const token = signToken({
    id: user.id,
    email: user.email,
    name: user.name,
  });

  res.json({ user: publicUser(user), token });
});

const me = asyncHandler(async (req, res) => {
    const user = await query(
        "SELECT id, email, name, avatar_url, created_at FROM users WHERE id = $1", 
        [req.user.id],
    );

    if(!user.rows.length) throw ApiError.notFound("User not found");

    res.json({ user: publicUser(user.rows[0]) });
});

module.exports = {
    register,
    login,
    me,
};