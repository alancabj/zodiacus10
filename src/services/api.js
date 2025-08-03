const API_URL = "https://zodiacus10-production.up.railway.app";

export const registerUser = async (userData) => {
  try {
    const formData = new FormData();
    formData.append("fullName", userData.fullName);
    formData.append("dob", userData.dob);
    formData.append("sign", userData.sign);
      formData.append("dni", userData.dniFile);
      formData.append("password", userData.password);

    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Error al registrar usuario");
    }

    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};