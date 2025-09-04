const API_URL = "https://waste-management-system-88cb.onrender.com/api/auth";

export const signup = async (formData) => {
  const response = await fetch(`${API_URL}/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData), // Convert to JSON
  });

  return response.json();
};
