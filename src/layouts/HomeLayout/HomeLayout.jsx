import { Outlet } from "react-router";
import Navbar from "../../components/Navbar/Navbar";

const HomeLayout = () => {
  return (
    <div>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default HomeLayout;
