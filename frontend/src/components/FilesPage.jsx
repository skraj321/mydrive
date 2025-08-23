import React, { useEffect, useState } from "react";
import {
  getProfile,
  getRootFolder,
  getFilesInFolder,
  deleteFile,
  renameFile,
} from "../api";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const FilesPage = ({ token }) => {
  const [user, setUser] = useState(null);
  const [files, setFiles] = useState([]);
  const [folderId, setFolderId] = useState(null);
  const [editingFileId, setEditingFileId] = useState(null);
  const [newName, setNewName] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null); // track which dropdown is open
  const navigate = useNavigate();

   const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
   // Get user + root files
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
  const fetchFiles = async () => {
    try {
      const rootRes = await getRootFolder(token);
      const actualFolderId = rootRes.folderId || rootRes.id;
      setFolderId(actualFolderId);
      const filesRes = await getFilesInFolder(actualFolderId, token);
      setFiles(filesRes.files || []);
    } catch (err) {
      console.error(
        "Files fetch error:",
        err.response?.data || err.message || err
      );
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleDelete = async (fileId) => {
    if (window.confirm("Are you sure you want to delete this file?")) {
      await deleteFile(fileId, token);
      alert("File deleted successfully.");
      fetchFiles();
    }
  };

  const handleRename = async (fileId) => {
    if (!newName.trim()) return;
    await renameFile(fileId, newName, token);
    setEditingFileId(null);
    setNewName("");
    fetchFiles();
  };

  const handleDownload = async (file) => {
    if (!file.url) return;
    try {
      const response = await fetch(file.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };
  const handleShare = (file) => {
    // Simple sharing: copy URL to clipboard
    if (file.url) {
      navigator.clipboard.writeText(file.url);
      alert("File URL copied to clipboard!");
    } else {
      alert("File URL not available to share.");
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar stays left */}
      <Sidebar />
    <div className="p-6">
       <Header
                user={user}
                onLogout={handleLogout}
              />

      {files.length === 0 ? (
        <p className="text-gray-500">No files available in this folder.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file) => (
            <div
              key={file.id}
              className="p-4 border rounded-md shadow-sm flex flex-col gap-2 relative"
            >
              <span className="font-semibold">{file.name}</span>
              <span className="text-gray-500 text-sm">{file.mime_type}</span>

              {file.url && file.mime_type.startsWith("image/") && (
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-full h-auto mt-2 rounded-md"
                />
              )}

              {/* Three dot menu */}
              <div className="absolute top-2 right-2">
                <button
                  onClick={() =>
                    setOpenMenuId(openMenuId === file.id ? null : file.id)
                  }
                  className="text-gray-600 hover:text-gray-900 font-bold text-xl cursor-pointer"
                >
                  ⋮
                </button>

                {openMenuId === file.id && (
                  <div className="absolute right-0 mt-2 w-36 bg-white border rounded shadow-lg z-10 flex flex-col">
                    
                    <button
                      onClick={() => {
                        handleDownload(file);
                        setOpenMenuId(null);
                      }}
                      className="px-4 py-2 text-left hover:bg-gray-100"
                    >
                     ⬇ Download
                    </button>
                    <button
                      onClick={() => {
                        handleShare(file);
                        setOpenMenuId(null);
                      }}
                      className="px-4 py-2 text-left hover:bg-gray-100"
                    >
                     ✨ Share
                    </button>
                     <button
                      onClick={() => {
                        handleDelete(file.id);
                        setOpenMenuId(null);
                      }}
                      className="px-4 py-2 text-left hover:bg-gray-100"
                    >
                     🗑 Delete
                    </button>
                    <button
                      onClick={() => {
                        setEditingFileId(file.id);
                        setNewName(file.name);
                        setOpenMenuId(null);
                      }}
                      className="px-4 py-2 text-left hover:bg-gray-100"
                    >
                     ✏ Rename
                    </button>
                  </div>
                )}
              </div>

              {/* Rename input */}
              {editingFileId === file.id && (
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="border p-1 rounded-md flex-1"
                  />
                  <button
                    className="bg-green-500 text-white px-3 rounded-md"
                    onClick={() => handleRename(file.id)}
                  >
                    Save
                  </button>
                  <button
                    className="bg-gray-500 text-white px-3 rounded-md"
                    onClick={() => setEditingFileId(null)}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
    </div>
  );
};

export default FilesPage;
