export async function loginUser(email: string, password: string) {
    const response = await fetch("https://reqres.in/api/login", { // Dummy API
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Login failed");
    }
  
    return response.json();
  }
  