const API_URL = "http://localhost:5001/api/auth";

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
