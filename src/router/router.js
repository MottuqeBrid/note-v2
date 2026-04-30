import { createBrowserRouter } from "react-router";
import HomeLayout from "../layouts/HomeLayout/HomeLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: HomeLayout,
    children: [
      {
        index: true,
      },
    ],
  },
]);
