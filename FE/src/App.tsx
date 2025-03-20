import { BrowserRouter as Router } from "react-router-dom"
import Navbar from "./Components/Navbar"
import AppRoutes from "./routers/routes"

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black">
        <div className="flex">
          <Navbar />
          <main className="flex-1 ml-[200px]">
            <AppRoutes />
          </main>
        </div>
      </div>
    </Router>
  )
}

export default App

