import { createBrowserRouter } from "react-router";
import HomeLayout from "../layouts/HomeLayout/HomeLayout";
import NotFound from "../components/404/404";
import HomePage from "../../pages/home/HomePage";
import NotesPage from "../../pages/Notes/NotesPage";
import SignUp from "../../pages/SignUp/SignUp";

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
        path: "*",
        Component: NotFound,
      },
    ],
  },
]);
