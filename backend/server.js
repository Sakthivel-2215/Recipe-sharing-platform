import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";

dotenv.config();

const app = express();

/* =========================
   ✅ CORS CONFIG (IMPORTANT)
========================= */

// Allow local frontend + ngrok (if needed)
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

app.use(express.json());

/* =========================
   ✅ MongoDB Connection
========================= */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ MongoDB error:", err));

/* =========================
   ✅ Schemas
========================= */

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, lowercase: true },
    password: String,
    savedRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }],
  },
  { timestamps: true }
);

const recipeSchema = new mongoose.Schema(
  {
    title: String,
    ingredients: [String],
    instructions: [String],
    category: String,
    imageUrl: String,
    prepTime: String,
    cookTime: String,
    servings: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
const Recipe = mongoose.model("Recipe", recipeSchema);

/* =========================
   ✅ JWT Helpers
========================= */

const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access Denied" });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    return res.status(400).json({ message: "Invalid Token" });
  }
};

/* =========================
   ✅ AUTH ROUTES
========================= */

// Register
app.post("/auth/register", async (req, res) => {
  try {
    const name = req.body.name?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    const token = generateToken(newUser);

    res.json({
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        savedRecipes: newUser.savedRecipes,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
app.post("/auth/login", async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        savedRecipes: user.savedRecipes,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   ✅ GOOGLE AUTH
========================= */

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

app.post("/auth/google", async (req, res) => {
  try {
    const { token } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload.email.toLowerCase();
    const name = payload.name;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({ name, email, password: "" });
      await user.save();
    }

    const jwtToken = generateToken(user);

    res.json({
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        savedRecipes: user.savedRecipes,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   ✅ RECIPE ROUTES
========================= */

app.post("/recipes", verifyToken, async (req, res) => {
  try {
    const newRecipe = new Recipe({
      ...req.body,
      createdBy: req.user.id,
    });

    await newRecipe.save();
    res.status(201).json(newRecipe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/recipes", async (req, res) => {
  try {
    const recipes = await Recipe.find().populate("createdBy", "name email");
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/recipes/mine", verifyToken, async (req, res) => {
  try {
    const recipes = await Recipe.find({ createdBy: req.user.id });
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/recipes/:id", async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe)
      return res.status(404).json({ message: "Recipe not found" });

    res.json(recipe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/recipes/:id", verifyToken, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe)
      return res.status(404).json({ message: "Recipe not found" });

    if (recipe.createdBy.toString() !== req.user.id)
      return res.status(403).json({ message: "Unauthorized" });

    Object.assign(recipe, req.body);
    await recipe.save();

    res.json(recipe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete("/recipes/:id", verifyToken, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe)
      return res.status(404).json({ message: "Recipe not found" });

    if (recipe.createdBy.toString() !== req.user.id)
      return res.status(403).json({ message: "Unauthorized" });

    await recipe.deleteOne();
    res.json({ message: "Recipe deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   ✅ SERVER START
========================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
