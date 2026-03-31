import mongoose from "mongoose";

const RecipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    ingredients: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    instuction: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    imageUrl: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    prepTime: {
      type: String,
      default: "",
    },
    cookTime: {
      type: String,
      default: "",
    },
    servings: {
      type: String,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ratings: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
      },
    ],
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        text: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
  },
  { timestamps: true } // adds createdAt and updatedAt
);

// Index for faster user-based queries
RecipeSchema.index({ createdBy: 1 });

export default mongoose.model("Recipe", RecipeSchema);
