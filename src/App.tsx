import CompanyAdminDashboard from "./components/CompanyAdminDashboard";

function App() {
  const testCompanyId = "3ea4379e-4f15-41a0-9c5e-29ce1f807210"; // pune aici un UUID real
  return (
    <div className="min-h-screen bg-gray-50">
      <CompanyAdminDashboard companyId={testCompanyId} />
    </div>
  );
}

export default App;
