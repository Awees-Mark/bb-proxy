import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors()); // Permite llamadas desde cualquier origen
app.use(express.json());

// Configura tus credenciales de Blackboard
const BB_BASE = "https://learn.universidadviu.com/learn/api/public/v1";
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;


// Función para obtener token OAuth2
async function getToken() {
  const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
  const res = await fetch(`${BB_BASE}/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });
  const data = await res.json();
  return data.access_token;
}

// Endpoint: obtiene las aulas de un usuario: ejemplo PK1: _620099_1
app.get("/api/aulas/:userId", async (req, res) => {
  try {
    const token = await getToken();
    const userId = req.params.userId; 
    const url = `${BB_BASE}/users/${userId}/courses?expand=course&limit=100`;

    const response = await fetch(url, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Error al consultar Blackboard:", err);
    res.status(500).json({ error: "Error al consultar Blackboard", detail: err.message });
  }
});

// Arranca el servidor
app.listen(3000, () => {
  console.log("Servidor proxy corriendo en http://localhost:3000");
});
