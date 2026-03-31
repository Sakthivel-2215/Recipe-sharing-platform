import express from "express";
import Recipe from "../models/Recipe.js";
import authMiddleware from "../middleware/auth.js"; // JWT auth middleware

const router = express.Router();

// ✅ Get all recipes created by the logged-in user
router.get("/mine", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const recipes = await Recipe.find({ createdBy: userId });
    res.json(recipes);
  } catch (error) {
    console.error("Error fetching user's recipes:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Get a single recipe by ID
router.get("/:id", async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    res.json(recipe);
  } catch (error) {
    console.error("Error fetching recipe:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Update a recipe by ID
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    console.log("Received PUT request for:", req.params.id);
    const recipeId = req.params.id;
    const userId = req.user.id;
    const updatedData = req.body;

    const recipe = await Recipe.findOneAndUpdate(
      { _id: recipeId, createdBy: userId },
      updatedData,
      { new: true }
    );

    if (!recipe) {
      return res
        .status(404)
        .json({ message: "Recipe not found or unauthorized" });
    }

    res.json(recipe);
  } catch (error) {
    console.error("Error updating recipe:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;
