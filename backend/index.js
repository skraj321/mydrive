import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { supabase } from "./src/config/supabase.js";
dotenv.config();
import authRoutes from "./routes/auth.js";
import fileRoutes from "./routes/fileRoutes.js";
import folderRoutes from "./routes/folder.js";
const app = express();
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://mydrive-c5pw.vercel.app", // Your client application
    "https://mydrive-git-main-saheb-kumars-projects.vercel.app", // Your API domain
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true // Set this to true if you are using cookies/sessions
}));

// This line is already correct, but it's good practice to have it here
app.options("*", cors());

app.use(express.json());
// app.use(cors({
//   origin: [
//     "http://localhost:5173",
//     "https://mydrive-git-main-saheb-kumars-projects.vercel.app",
//     "https://mydrive-7i4y.vercel.app", 
//   ],
//   credentials: true
// }));


app.get("/",(req,res)=>{
    res.send({
        activeStatus : true,
        error: false ,
       })
})
app.get("/test-db", async (req, res) => {
  try {
    const { data, error } = await supabase.from("users").select("*").limit(1);
    
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/folders", folderRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
