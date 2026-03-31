// src/pages/ProfilePage.jsx
import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [myRecipes, setMyRecipes] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortBy, setSortBy] = useState("title");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [editing, setEditing] = useState(false);
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const fileInputRef = useRef();

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      navigate("/login");
    } else {
      setUser(storedUser);
    }
  }, [navigate]);

  useEffect(() => {
    const fetchRecipes = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const [createdRes, savedRes] = await Promise.all([
          fetch("http://localhost:5000/recipes/mine", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:5000/users/me/saved", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!createdRes.ok || !savedRes.ok) throw new Error("Failed to fetch");

        const createdData = await createdRes.json();
        const savedData = await savedRes.json();

        setMyRecipes(createdData);
        setSavedRecipes(savedData);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch recipes:", err);
        setError(true);
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleUnsave = async (recipeId) => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`http://localhost:5000/recipes/${recipeId}/unsave`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      setSavedRecipes((prev) => prev.filter((r) => r._id !== recipeId));
    } catch (err) {
      console.error("Failed to unsave recipe:", err);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(URL.createObjectURL(file));
    }
  };

  const handleProfileUpdate = () => {
    console.log("Profile Updated:", { dob, phone, profilePic });
    setEditing(false);
  };

  const filteredSaved =
    categoryFilter === "All"
      ? savedRecipes
      : savedRecipes.filter((r) => r.category === categoryFilter);

  const sortedSavedRecipes = [...filteredSaved].sort((a, b) => {
    if (sortBy === "title") return a.title.localeCompare(b.title);
    if (sortBy === "prepTime") return a.prepTime.localeCompare(b.prepTime);
    return 0;
  });

  if (!user) return <p className="p-6">Loading...</p>;
  if (loading) return <p className="p-6">Loading saved recipes...</p>;
  if (error) return <p className="p-6 text-red-500">Error loading profile.</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 md:p-8">
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
              <div className="w-24 h-24 rounded-full bg-orange-200 overflow-hidden flex items-center justify-center text-3xl font-bold text-orange-600">
                {profilePic ? (
                  <img
                    src={profilePic}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user.name.charAt(0)
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {user.name}
                </h1>
                <p className="text-gray-600">{user.email}</p>
                {dob && <p className="text-sm text-gray-500">DOB: {dob}</p>}
                {phone && (
                  <p className="text-sm text-gray-500">Phone: {phone}</p>
                )}
              </div>
              <button
                onClick={() => setEditing(!editing)}
                className="ml-auto px-3 py-1 text-sm bg-orange-500 text-white rounded hover:bg-orange-600 transition"
              >
                {editing ? "Cancel" : "Edit Profile"}
              </button>
            </div>

            {editing && (
              <div className="bg-amber-50 p-4 rounded-lg mb-8 space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-1">
                    Profile Picture
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    ref={fileInputRef}
                    className="block w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="p-2 border border-gray-300 rounded w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="p-2 border border-gray-300 rounded w-full"
                    placeholder="e.g. +1 234 567 8900"
                  />
                </div>

                <button
                  onClick={handleProfileUpdate}
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
                >
                  Save Changes
                </button>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-amber-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {myRecipes.length}
                </p>
                <p className="text-gray-600">Recipes</p>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {savedRecipes.length}
                </p>
                <p className="text-gray-600">Saved</p>
              </div>
            </div>

            {/* Created Recipes */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">
                My Recipes
              </h2>
              <div className="space-y-2">
                {myRecipes.length === 0 && (
                  <p className="text-sm text-gray-500">
                    No recipes created yet.
                  </p>
                )}
                {myRecipes.map((recipe) => (
                  <div
                    key={recipe._id}
                    className="flex justify-between items-center p-3 border border-gray-200 rounded-lg hover:bg-amber-50"
                  >
                    <span className="text-gray-700">{recipe.title}</span>
                    <div className="flex space-x-2">
                      <Link
                        to={`/edit-recipe/${recipe._id}`}
                        className="px-3 py-1 text-sm bg-orange-500 text-white rounded hover:bg-orange-600 transition"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Saved Recipes */}
            <div className="space-y-4 mt-10">
              <h2 className="text-xl font-semibold text-gray-800">
                Saved Recipes
              </h2>

              {savedRecipes.length === 0 ? (
                <p className="text-sm text-gray-500">
                  You haven’t saved any recipes yet.
                </p>
              ) : (
                <>
                  <div className="flex flex-wrap gap-4 mb-4">
                    <select
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="p-2 border border-gray-300 rounded"
                    >
                      <option value="All">All Categories</option>
                      {[...new Set(savedRecipes.map((r) => r.category))].map(
                        (cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        )
                      )}
                    </select>

                    <select
                      onChange={(e) => setSortBy(e.target.value)}
                      className="p-2 border border-gray-300 rounded"
                    >
                      <option value="title">Sort by Title</option>
                      <option value="prepTime">Sort by Prep Time</option>
                    </select>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sortedSavedRecipes.map((recipe) => (
                      <div
                        key={recipe._id}
                        className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow hover:shadow-md transition"
                      >
                        <Link to={`/recipes/${recipe._id}`}>
                          <img
                            src={recipe.imageUrl}
                            alt={recipe.title}
                            className="w-full h-40 object-cover"
                          />
                        </Link>
                        <div className="p-4">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {recipe.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {recipe.category}
                          </p>
                          <p className="text-sm text-gray-500">
                            Prep Time: {recipe.prepTime}
                          </p>
                          <button
                            onClick={() => handleUnsave(recipe._id)}
                            className="mt-2 text-sm text-red-500 hover:text-red-700"
                          >
                            Unsave
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-red-500 hover:text-red-700 transition"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
