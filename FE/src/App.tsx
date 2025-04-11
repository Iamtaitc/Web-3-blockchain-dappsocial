import { Provider } from "react-redux"
import { BrowserRouter } from "react-router-dom"
import Navbar from "./components/Navbar"
import AppRoutes from "./routers/routes"
import { ThemeProvider } from "./context/theme-context"
import { store } from "./store"
import { useAuthCheck } from "./hooks/useAuthCheck"

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
      <div className="flex w-screen min-h-screen bg-white">
        <div className="w-[200px] h-screen fixed">
          <Navbar />
        </div>
        <div className="flex-1 p-4 bg-white ml-[200px]">
          <AppRoutes />
        </div>
      </div>
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
