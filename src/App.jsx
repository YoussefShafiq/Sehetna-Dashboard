import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './components/Home';
import Notfound from './components/Notfound';
import Providers from './components/Providers';
import Users from './components/Users';
import Services from './components/Services';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';
import GoHome from './components/GoHome';
import SidebarContextProvider from './contexts/SidebarContext';
import { QueryClient, QueryClientProvider } from 'react-query';
import Categories from './components/Categories';
import Admins from './components/Admins';
import Documents from './components/Documents';
import Complaints from './components/Complaints';
import Requests from './components/Requests';

function App() {

  const routers = createBrowserRouter([
    { path: 'login', element: <GoHome> <Login /> </GoHome> },
    {
      path: '', element: <Layout />, children: [
        { index: true, element: <ProtectedRoute> <Home /> </ProtectedRoute> },
        { path: 'home', element: <ProtectedRoute> <Home /> </ProtectedRoute> },
        { path: 'users', element: <ProtectedRoute> <Users /> </ProtectedRoute> },
        { path: 'services', element: <ProtectedRoute> <Services /> </ProtectedRoute> },
        { path: 'categories', element: <ProtectedRoute> <Categories /> </ProtectedRoute> },
        { path: 'providers', element: <ProtectedRoute> <Providers /> </ProtectedRoute> },
        { path: 'documents', element: <ProtectedRoute> <Documents /> </ProtectedRoute> },
        { path: 'complaints', element: <ProtectedRoute> <Complaints /> </ProtectedRoute> },
        { path: 'requests', element: <ProtectedRoute> <Requests /> </ProtectedRoute> },
        { path: 'admins', element: <ProtectedRoute> <Admins /> </ProtectedRoute> },
        { path: '*', element: <Notfound /> },
      ]
    },
  ]);

  let query = new QueryClient();

  return (
    <>
      <QueryClientProvider client={query}>
        <SidebarContextProvider>
          <RouterProvider router={routers} />
          <Toaster position='bottom-right' />
        </SidebarContextProvider>
      </QueryClientProvider>
    </>
  )
}

export default App
