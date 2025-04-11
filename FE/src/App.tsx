import { BrowserRouter, useLocation } from "react-router-dom"
import Navbar from "./Components/Navbar"
import AppRoutes from "./routers/routes"
import AdminRoutes from "./routers/admin-routes"
import { ThemeProvider } from "./context/theme-context"

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

  return (
    <>
    
      {isAdminRoute ? (
        <AdminRoutes />
      ) : (
        <MainLayout>
          <AppRoutes />
        </MainLayout>
      )}
    </>
  )
}

const App = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
