import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

export default function RecipeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [userId, setUserId] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserId(decoded.userId || decoded.id);
      } catch (err) {
        console.error("Invalid token:", err);
      }
    }
  }, [token]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recipeRes, savedRes] = await Promise.all([
          fetch(`http://localhost:5000/recipes/${id}`),
          token
            ? fetch("http://localhost:5000/users/me/saved", {
                headers: { Authorization: `Bearer ${token}` },
              })
            : Promise.resolve({ ok: false }),
        ]);

        if (!recipeRes.ok) throw new Error("Recipe not found");
        const recipeData = await recipeRes.json();
        setRecipe(recipeData);

        if (savedRes.ok) {
          const savedData = await savedRes.json();
          setIsSaved(savedData.some((r) => r._id === id));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token]);

  const toggleSave = async () => {
    if (!token) {
      alert("Please log in to save recipes");
      return;
    }

    const endpoint = isSaved ? "unsave" : "save";
    try {
      await fetch(`http://localhost:5000/recipes/${id}/${endpoint}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsSaved(!isSaved);
    } catch (err) {
      console.error("Failed to toggle save", err);
    }
  };

  if (loading) return <p className="text-center p-6">Loading...</p>;
  if (error)
    return <p className="text-center text-red-500 p-6">Error: {error}</p>;
  if (!recipe) return <p className="text-center p-6">Recipe not found.</p>;

  const isOwner = userId && recipe.createdBy === userId;

  return (
    <div
      key={id}
      className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 p-6"
    >
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <img
          src={
            recipe.imageUrl ||
            "https://via.placeholder.com/800x400?text=No+Image"
          }
          alt={recipe.title || "Recipe Image"}
          className="w-full h-64 md:h-96 object-cover"
        />

        <div className="p-6 md:p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-orange-600">
                {recipe.title || "Untitled Recipe"}
              </h1>
              <p className="text-sm text-gray-500 italic mt-1">
                {recipe.category || "Uncategorized"}
              </p>
            </div>
            <div className="flex space-x-4 text-sm text-gray-600">
              <span>Prep: {recipe.prepTime || "N/A"} mins</span>
              <span>Cook: {recipe.cookTime || "N/A"} mins</span>
              <span>Serves: {recipe.servings || "N/A"}</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Ingredients
              </h2>
              <ul className="space-y-2">
                {(recipe.ingredients || []).map((ingredient, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-orange-500 rounded-full mt-2 mr-2"></span>
                    {ingredient}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Instructions
              </h2>
              <ol className="space-y-4">
                {(recipe.instructions || []).map((step, index) => (
                  <li key={index} className="flex">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-orange-500 text-white rounded-full text-sm font-bold mr-3 flex-shrink-0">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="mt-8 flex justify-between">
            {token && (
              <button
                onClick={toggleSave}
                className="px-4 py-2 border border-orange-500 text-orange-600 rounded-lg hover:bg-orange-100 transition"
              >
                {isSaved ? "Unsave Recipe" : "Save Recipe"}
              </button>
            )}
            {isOwner && (
              <button
                onClick={() => navigate(`/recipes/${id}/edit`)}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
              >
                Edit Recipe
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
