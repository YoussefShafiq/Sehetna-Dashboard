import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './components/Home';
import Notfound from './components/Notfound';
import Providers from './components/Providers';
import Users from './components/Users';
import Services from './components/Features';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';
import GoHome from './components/GoHome';
import SidebarContextProvider from './contexts/SidebarContext';

function App() {

  const routers = createBrowserRouter([
    { path: 'login', element: <GoHome> <Login /> </GoHome> },
    {
      path: '', element: <Layout />, children: [
        { index: true, element: <ProtectedRoute> <Home /> </ProtectedRoute> },
        { path: 'home', element: <ProtectedRoute> <Home /> </ProtectedRoute> },
        { path: 'providers', element: <ProtectedRoute> <Providers /> </ProtectedRoute> },
        { path: 'users', element: <ProtectedRoute> <Users /> </ProtectedRoute> },
        { path: 'services', element: <ProtectedRoute> <Services /> </ProtectedRoute> },
        { path: '*', element: <Notfound /> },
      ]
    },
  ]);

  return (
    <>
      <SidebarContextProvider>
        <RouterProvider router={routers} />
        <Toaster position='bottom-right' />
      </SidebarContextProvider>
    </>
  )
}

export default App
