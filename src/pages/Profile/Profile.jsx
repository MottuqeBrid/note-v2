import Loading from "../../components/Loading/Loading";
import { useAuth } from "../../hooks/useAuth";

const Profile = () => {
  const { user, loading } = useAuth();
  console.log(user);
  if (loading) {
    return <Loading />;
  }
  return (
    <div>
      <h1>Profile</h1>
      <p>Welcome, {user?.name}!</p>
    </div>
  );
};

export default Profile;
