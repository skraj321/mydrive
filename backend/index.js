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
    "https://mydrive-beta.vercel.app",
    "https://mydrive-642k.vercel.app/", 
  ],
  credentials: false
}));
app.use(express.json());



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
