import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("auth");
    navigate("/");
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-green-100">
      <h1 className="text-3xl font-bold mb-6">Welcome to Dashboard 🎉</h1>
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
}

export default Dashboard;
