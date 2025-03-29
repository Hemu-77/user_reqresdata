const API_URL = "https://reqres.in/api/users";

export const fetchUsers = async (page: number, token: string | null) => {
    const response = await fetch(`${API_URL}?page=${page}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  };



export const updateUser = async (id: number, userData: object) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  if (!response.ok) throw new Error("Failed to update user");
  return response.json();
};

export const deleteUser = async (id: number) => {
  const response = await fetch(`${API_URL}/${id}`, {
     method: "DELETE" 
    });

  if (!response.ok) throw new Error("Failed to delete user");
  return response.ok;
};
