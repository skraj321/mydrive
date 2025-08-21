import React, { useEffect, useState } from "react";
import {
  getProfile,
  getFilesInFolder,
  createFolder,
  uploadFile,
  renameFile,
  deleteFile,
} from "../api";
import { useNavigate } from "react-router-dom";
import Header from "./Header";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [files, setFiles] = useState([]);
  const [folderName, setFolderName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  //  Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  //  Get user + root files
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getProfile(token);
        setUser(res.user);
        fetchFiles(null);
      } catch (err) {
        console.error("Profile fetch error:", err);
      }
    };
    fetchUser();
  }, []);

  //  Get files
  const fetchFiles = async (folderId) => {
    try {
      setLoading(true);
      setCurrentFolderId(folderId);
      const res = await getFilesInFolder(folderId || "root", token);
      setFiles(res.files || []);
    } catch (err) {
      console.error("Files fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  //  Create folder
  const handleCreateFolder = async () => {
    if (!folderName) return;
    try {
      const res = await createFolder(folderName, currentFolderId, token);
      setFiles([...files, res.folder]);
      setFolderName("");
    } catch (err) {
      console.error("Create folder error:", err);
      alert(err.response?.data?.error || "Failed to create folder");
    }
  };

  //  Upload file
  const handleUpload = async (e) => {
    e.preventDefault();
    try {
      if (!selectedFile) return alert("Please select a file");

      const formData = new FormData();
      formData.append("file", selectedFile);
      if (currentFolderId) formData.append("folderId", currentFolderId);

      const res = await uploadFile(formData, token);
      setFiles((prev) => [...prev, res.file]);
      setSelectedFile(null);
      alert("File uploaded successfully");
    } catch (err) {
      console.error("Upload error:", err);
      alert(err.response?.data?.error || "Failed to upload file");
    }
  };

  //  Rename
  const handleRename = async (fileId) => {
    const newName = prompt("Enter new file name:");
    if (!newName) return;
    try {
      const res = await renameFile(fileId, newName, token);
      setFiles(files.map((f) => (f.id === fileId ? res.file : f)));
    } catch (err) {
      console.error("Rename error:", err);
      alert("Rename failed");
    }
  };

  //  Delete
  const handleDelete = async (fileId) => {
    try {
      await deleteFile(fileId, token);
      setFiles(files.filter((f) => f.id !== fileId));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Delete failed");
    }
  };

  //  Download
  const handleDownload = (file) => {
    const link = document.createElement("a");
    link.href = file.url;
    link.setAttribute("download", file.name);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };
  

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={handleLogout} />
      

      <div className="p-6 max-w-5xl mx-auto">
        {/* Create Folder */}
        <div className="mb-6 flex gap-2">
          <input
            type="text"
            placeholder="Folder name"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            className="border p-2 rounded-lg flex-1"
          />
          <button
            onClick={handleCreateFolder}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
          >
            + Folder
          </button>
        </div>

        {/* Upload File */}
        <div className="mb-6 flex gap-2">
          <input
            type="file"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            className="border p-2 rounded-lg flex-1"
          />
          <button
            onClick={handleUpload}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow"
          >
            ⬆ Upload
          </button>
        </div>

        {/* Files List */}
        <h3 className="text-2xl font-bold mb-4">📂 Files & Folders</h3>
        {loading ? (
          <p>Loading...</p>
        ) : files.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((f) => (
              <div
                key={f.id}
                className="p-4 border rounded-xl shadow hover:shadow-lg bg-white relative"
              >
                <span className="font-semibold">{f.name}</span>
                <span className="text-sm text-gray-500 block">
                  {f.mime_type || "Folder"}
                </span>

                {/* Three-dot menu */}
                <div className="absolute top-3 right-3">
                  <button
                    onClick={() => setMenuOpen(menuOpen === f.id ? null : f.id)}
                    className="text-xl font-bold cursor-pointer"
                  >
                    ⋮
                  </button>
                  {menuOpen === f.id && (
                    <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg z-10">
                      <ul className="py-2">
                        {f.url && (
                          <li
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleDownload(f)}
                          >
                            ⬇ Download
                          </li>
                        )}
                        <li
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleRename(f.id)}
                        >
                          ✏ Rename
                        </li>
                        <li
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-600"
                          onClick={() => handleDelete(f.id)}
                        >
                          🗑 Delete
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No files yet.</p>
        )}
      </div>
      
    </div>
    
  );
};

export default Profile;
