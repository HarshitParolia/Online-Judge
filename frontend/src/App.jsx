import {  RouterProvider, createBrowserRouter, Outlet } from "react-router-dom";
import './App.css'
import Signup from './components/Signup'
import Profile from './components/Profile'
import Problems from './components/Problems'
import Contests from './components/Contests'
import Signin from './components/Signin'
import Navbar from './components/navbar'
import ErrorPage from './components/ErrorPage';
import LandingPage from './components/LandingPage';
import ProblemSet from './components/ProblemSet';
import ForgotPassword from './components/ForgotPassword';
import Admin from './components/Admin';
import Contest from './components/Contest';

function Home() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  )
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    children: [
      {
        path: "",
        element: <LandingPage />
      },
      {
        path: 'problemset',
        element: <ProblemSet />
      },
      {
        path: 'problem/:Pname',
        element: <Problems />
      },
      {
        path: 'contests',
        element: <Contests />
      },
      {
        path: 'contest/:ID',
        element: <Contest />
      },
      {
        path: 'contest/:ID/problem/:Pname',
        element: <Problems />
      },
      {
        path: "profile/:name1",
        element: <Profile />
      },
      {
        path: 'signup',
        element: <Signup />
      },
      {
        path: 'signin',
        element: <Signin />
      },
      {
        path: 'admin',
        element: <Admin />
      },
      {
        path: 'forgot-password',
        element: <ForgotPassword />
      },
      {
        path: "*",
        element: <ErrorPage />
      }]
  }
])
function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
