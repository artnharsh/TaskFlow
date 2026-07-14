import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { query } from "../config/db";
import ApiError from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";
import { signToken } from "../utils/jwt";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const name = (req.body.name || "").trim();
  const email = (req.body.email || "").trim().toLowerCase();
  const password = req.body.password;

  if (!name || !email || !password) {
    throw ApiError.badRequest("Name, email, and password are required");
  }

  if (password.length < 6) {
    throw ApiError.badRequest("Password must be at least 6 characters long");
  }

  const existing = await query("SELECT id FROM users WHERE email = $1", [email]);
  if (existing.rows.length) {
    throw ApiError.conflict("Email already in use");
  }

  const password_hash = await bcrypt.hash(password, 10);

  const { rows } = await query(
    `
    INSERT INTO users (name, email, password_hash)
    VALUES ($1, $2, $3)
    RETURNING id, email, name, avatar_url, created_at
    `,
    [name, email, password_hash],
  );

  const user = rows[0];
  const token = signToken({ id: user.id, email: user.email, name: user.name });

  res.status(201).json({ user, token });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const email = (req.body.email || "").trim().toLowerCase();
  const password = req.body.password;

  if (!email || !password) {
    throw ApiError.badRequest("Email and password are required");
  }

  const { rows } = await query(
    "SELECT id, email, name, password_hash, avatar_url, created_at FROM users WHERE email = $1",
    [email],
  );

  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  delete user.password_hash;
  const token = signToken({ id: user.id, email: user.email, name: user.name });

  res.json({ user, token });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const { rows } = await query(
    "SELECT id, email, name, avatar_url, created_at FROM users WHERE id = $1",
    [req.user.id],
  );

  if (!rows.length) throw ApiError.notFound("User not found");

  res.json(rows[0]);
});
