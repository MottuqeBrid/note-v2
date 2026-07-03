import { createBrowserRouter } from "react-router";
import HomeLayout from "../layouts/HomeLayout/HomeLayout";
import NotFound from "../components/404/404";
import HomePage from "../pages/home/HomePage";
import NotesPage from "../pages/Notes/NotesPage";
import SignUp from "../pages/SignUp/SignUp";
import Login from "../pages/login/Login";
import AdminLayout from "../layouts/AdminLayout/AdminLayout";
import Users from "../pages/AdminPage/Users/Users";
import AdminPage from "../pages/AdminPage/AdminPage";
import AdminNotes from "../pages/AdminPage/AdminNotes/AdminNotes";
import Profile from "../pages/Profile/Profile";
import UpdateProfile from "../pages/UpdateProfile/UpdateProfile";
import Settings from "../pages/Settings/Settings";
import Files from "../pages/Files/Files";

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
        path: "files",
        Component: Files,
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
        path: "profile",
        Component: Profile,
      },
      {
        path: "update-profile",
        Component: UpdateProfile,
      },
      {
        path: "settings",
        Component: Settings,
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
        Component: AdminPage,
      },
      {
        path: "users",
        Component: Users,
      },
      {
        path: "notes",
        Component: AdminNotes,
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
