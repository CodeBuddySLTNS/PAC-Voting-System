// App.tsx
import { RouterProvider, createBrowserRouter } from "react-router-dom"
import { ThemeProvider } from "@/components/theme-provider"
import LoginPage from "@/pages/auth/login"
import SignupPage from "@/pages/auth/signup"

const router = createBrowserRouter([
  {
    path: "/",
    element: <div>Home</div>, // To be replaced later
  },
  {
    path: "/auth/login",
    element: <LoginPage />,
  },
  {
    path: "/auth/signup",
    element: <SignupPage />,
  },
])

export function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}

export default App
