import { useState } from "react"
import { useNavigate } from "react-router-dom"
import instance from "../../services/instance"

const CheckAdmin = () => {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const navigate = useNavigate()

  const handleCheck = async () => {
    setLoading(true)
    setMessage("")
    try {
      const res = await instance.get("admin/tasks")

      // 👉 CHỈ CHO QUA nếu success = true
      if (res.status === 200 && res.data.success === true) {
        localStorage.setItem("adminAuth", "true")
        navigate("/admin")
      } else {
        localStorage.removeItem("adminAuth")
        setMessage("Không có quyền admin.")
      }
    } catch (error: any) {
      localStorage.removeItem("adminAuth")
      if (error.response?.status === 403) {
        setMessage("Không có quyền admin.")
      } else {
        setMessage("Lỗi kết nối hoặc không thể kiểm tra quyền.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-2xl font-bold">Kiểm tra quyền Admin</h1>
      <button
        onClick={handleCheck}
        className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 disabled:bg-gray-400"
        disabled={loading}
      >
        {loading ? "Đang kiểm tra..." : "Check Admin"}
      </button>
      {message && <p className="text-red-600">{message}</p>}
    </div>
  )
}

export default CheckAdmin
