
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import Session from "../models/Session.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateTokens.js";
import { hashToken } from "../utils/hashToken.js";

const SESSION_DAYS = 7;

const generateCollegeEmail = (rollNumber) => {
  return `${rollNumber.toLowerCase()}@adityauniversity.in`;
};

// Map short codes from roll number → full branch names in schema enum
const branchMap = {
  CS: "CSE",
  IT: "IT",
  EC: "ECE",
  DS:  "CSE(DS)",
  ML:  "ML&AI",
  ME: "ME",
  EE: "EEE",
};

export const register = async (req, res) => {
  try {
    let { rollNumber, name, password } = req.body;

    if (!rollNumber || !name || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    rollNumber = rollNumber.toUpperCase();

    const pattern = /^(2[0-9])B\d{2}(CS|IT|EC|ME|EE|ML|DS)\d{3}$/;
    const match = rollNumber.match(pattern);

    if (!match) {
      return res.status(400).json({ message: "Invalid Roll Number format" });
    }

    const email = generateCollegeEmail(rollNumber);

    const existingUser = await User.findOne({
      $or: [{ email }, { rollNumber }]
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const yearPrefix = match[1];
    const branchCode = match[2];

    // ✅ Map "CS" → "CSE", "EC" → "ECE" etc.
    const branch = branchMap[branchCode];

    if (!branch) {
      return res.status(400).json({ message: "Invalid branch in roll number" });
    }

   const enrollmentYear = 2000 + parseInt(yearPrefix);

const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth() + 1;

// ❗ future year check
    if (enrollmentYear > currentYear) {
      return res.status(400).json({
        message: "Enrollment year cannot be in the future",
        success: false
      });
    }

    // ❗ current year but before August → invalid
    if (enrollmentYear === currentYear && currentMonth < 8) {
      return res.status(400).json({
        message: "Admissions not started yet",
        success: false
      });
    }

    let yearOfStudy;

    // Aug–Dec → new academic year
    if (currentMonth >= 8) {
      yearOfStudy = currentYear - enrollmentYear + 1;
    } else {
      yearOfStudy = currentYear - enrollmentYear;
    }

    // safety bounds
    if (yearOfStudy < 1) yearOfStudy = 1;
    if (yearOfStudy > 4) yearOfStudy = 4;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      rollNumber,
      email,
      password: hashedPassword,
      branch,         // ✅ now "CSE" not "CS"
      year: yearOfStudy
    });

    const sessionId = crypto.randomUUID();
    const refreshToken = generateRefreshToken(user._id, sessionId);
    const accessToken = generateAccessToken(user);
    const refreshTokenHash = hashToken(refreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS);

    await Session.create({
      userId: user._id,
      refreshTokenHash,
      expiresAt,
      deviceInfo: req.headers["user-agent"] || "unknown",
      isValid: true
    });

    res.status(201).json({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        rollNumber: user.rollNumber,
        branch: user.branch,
        year: user.year
      }
    });

  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { rollNumber, password } = req.body;

    if (!rollNumber || !password) {
      return res.status(400).json({
        success: false,
        message: "Roll number and password are required"
      });
    }

    const email = generateCollegeEmail(rollNumber);
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const sessionId = crypto.randomUUID();
    const refreshToken = generateRefreshToken(user._id, sessionId);
    const accessToken = generateAccessToken(user);
    const refreshTokenHash = hashToken(refreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS);

    await Session.create({
      userId: user._id,
      refreshTokenHash,
      expiresAt,
      deviceInfo: req.headers["user-agent"] || "unknown",
      isValid: true
    });

    user.status = "online";
    await user.save();

    res.status(200).json({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        rollNumber: user.rollNumber,
        name: user.name,
        email: user.email,
        branch: user.branch,
        year: user.year
      },
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token required" });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const hashed = hashToken(refreshToken);

    const session = await Session.findOne({
      userId: decoded.userId,
      refreshTokenHash: hashed,
      isValid: true,
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      return res.status(401).json({ message: "Invalid session" });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const newAccessToken = generateAccessToken(user);
    res.status(200).json({ accessToken: newAccessToken });

  } catch (err) {
    console.error("Refresh error:", err);
    res.status(401).json({ message: "Invalid refresh token" });
  }
};

export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token required" });
    }

    const hashed = hashToken(refreshToken);

    await Session.findOneAndUpdate(
      { refreshTokenHash: hashed },
      { isValid: false }
    );

    if (req.user && req.user.userId) {
      await User.findByIdAndUpdate(req.user.userId, {
        status: "offline",
        lastSeen: new Date()
      });
    }

    res.status(200).json({ message: "Logged out successfully" });

  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Server error" });
  }
};