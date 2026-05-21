import { Outlet } from "react-router";
import Navbar from "../../components/Navbar/Navbar";

const HomeLayout = () => {
  return (
    <div>
      <Navbar />
      <main className="max-w-7xl mx-auto max-h-screen overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default HomeLayout;
