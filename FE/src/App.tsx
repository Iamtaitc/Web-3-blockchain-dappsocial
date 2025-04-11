import { Provider } from "react-redux"
import { BrowserRouter, useLocation } from "react-router-dom"
import Navbar from "./Components/Navbar"
import AppRoutes from "./routers/routes"
import AdminRoutes from "./routers/admin-routes"
import { ThemeProvider } from "./context/theme-context"
import { store } from "./store"
import { useAuthCheck } from "./hooks/useAuthCheck"

// Layout wrapper component to conditionally render the navbar
const MainLayout = ({ children }) => {
  return (
    <div className="flex w-screen min-h-screen bg-white">
      <div className="w-[200px] h-screen fixed">
        <Navbar />
      </div>
      <div className="flex-1 p-4 bg-white ml-[200px]">{children}</div>
    </div>
  )
}

// Router component to handle conditional rendering
const AppRouter = () => {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith("/admin")

  return isAdminRoute ? <AdminRoutes /> : <MainLayout><AppRoutes /></MainLayout>
}

// Component con để sử dụng hooks
const AppContent = () => {
  const { isChecking } = useAuthCheck()

  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Đang kiểm tra xác thực...</h2>
        </div>
      </div>
    )
  }

  return (
    <ThemeProvider>
      <AppRouter />
    </ThemeProvider>
  )
}

const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </Provider>
  )
}

export default App
