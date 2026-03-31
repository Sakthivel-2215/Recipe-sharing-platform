import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import "./index.css";
import Loading from "./pages/loading";
import Login from "./pages/Login";
import RegisterPage from "./pages/registerPage";
import Recipes from "./pages/allRecipesPage"; // AllRecipesPage component
import RecipeDetail from "./pages/recipeDetailPage";
import AddEditRecipe from "./pages/addEditRecipePage"; // ✅ Used for both add/edit
import Profile from "./pages/profilePage";

const GOOGLE_CLIENT_ID =
  "140754231005-f8nvcfukttabn66mlgusibg4h99ec4md.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Loading />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/allRecipesPage" element={<Recipes />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/recipes/:id" element={<RecipeDetail />} />
          <Route path="/recipes/:id/edit" element={<AddEditRecipe />} />
          <Route path="/add-recipe" element={<AddEditRecipe />} />
          <Route path="/edit-recipe/:id" element={<AddEditRecipe />} />{" "}
          {/* ✅ Updated */}
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
