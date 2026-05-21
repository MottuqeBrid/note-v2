import { useAuth } from "../../hooks/useAuth";
import Hero from "./Hero";

const HomePage = () => {
  const { user } = useAuth();
  
  return (
    <div>
      <Hero />
      <div className="py-12 text-center">
        <p className="text-lg text-base-content/70">
          Welcome, {user?.name || "Guest"}!
        </p>
      </div>
    </div>
  );
};

export default HomePage;
