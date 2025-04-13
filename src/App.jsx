import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './components/Home';
import Notfound from './components/Notfound';
import Providers from './components/Providers';
import Users from './components/Users';
import Services from './components/Features';

function App() {

  const routers = createBrowserRouter([
    {
      path: '/', element: <Layout />, children: [
        { index: true, element: <Home /> },
        { path: 'home', element: <Home /> },
        { path: 'providers', element: <Providers /> },
        { path: 'users', element: <Users /> },
        { path: 'services', element: <Services /> },
        { path: '*', element: <Notfound /> },
      ]
    },
  ]);

  return (
    <>
      <RouterProvider router={routers} />
    </>
  )
}

export default App
