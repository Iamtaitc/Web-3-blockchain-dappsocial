"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, AlertCircle } from "lucide-react";
import AdminApi from "../../services/AdminApi";

const CheckAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleCheck = async () => {
    setLoading(true);
    setMessage("");
    try {
      const result = await AdminApi.checkAdminAccess();
      if (result.success) {
        localStorage.setItem("adminAuth", "true");
        navigate("/admin");
      } else {
        localStorage.removeItem("adminAuth");
        setMessage(result.error || "Không có quyền admin.");
      }
    } catch (error) {
      localStorage.removeItem("adminAuth");
      setMessage("Lỗi kết nối hoặc không thể kiểm tra quyền.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300 mb-4">
            <Shield size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kiểm tra quyền Admin</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Nhấn nút bên dưới để kiểm tra quyền truy cập admin
          </p>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-start">
            <AlertCircle className="text-red-500 mr-2 flex-shrink-0 mt-0.5" size={16} />
            <p className="text-red-600 dark:text-red-400 text-sm">{message}</p>
          </div>
        )}

        <button
          onClick={handleCheck}
          disabled={loading}
          className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Đang kiểm tra..." : "Kiểm tra quyền Admin"}
        </button>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6">
          Chỉ tài khoản admin được cấp quyền mới có thể truy cập
        </p>
      </div>
    </div>
  );
};

export default CheckAdmin;