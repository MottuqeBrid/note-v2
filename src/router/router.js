import { createBrowserRouter } from "react-router";
import HomeLayout from "../layouts/HomeLayout/HomeLayout";
import NotFound from "../components/404/404";
import HomePage from "../pages/home/HomePage";
import NotesPage from "../pages/Notes/NotesPage";
import SignUp from "../pages/SignUp/SignUp";
import Login from "../pages/login/Login";
import AdminLayout from "../layouts/AdminLayout/AdminLayout";
import Users from "../components/Admin/Users/Users";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: HomeLayout,
    children: [
      {
        index: true,
        Component: HomePage,
      },
      {
        path: "notes",
        Component: NotesPage,
      },
      {
        path: "register",
        Component: SignUp,
      },
      {
        path: "login",
        Component: Login,
      },
      {
        path: "*",
        Component: NotFound,
      },
    ],
  },
  {
    path: "admin",
    Component: AdminLayout,
    children: [
      {
        index: true,
        Component: HomePage,
      },
      {
        path: "users",
        Component: Users,
      },
      {
        path: "*",
        Component: NotFound,
      },
    ],
  },
  {
    path: "*",
    Component: NotFound,
  },
]);
