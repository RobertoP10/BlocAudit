export default function SuperAdminDashboard() {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
        <p className="text-gray-500 mb-6">Vizualizare globală pentru toate companiile</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-white shadow rounded">Total Companii</div>
          <div className="p-4 bg-white shadow rounded">Total Utilizatori</div>
          <div className="p-4 bg-white shadow rounded">Total Cereri</div>
          <div className="p-4 bg-white shadow rounded">Planuri Active</div>
        </div>
      </div>
    );
  }
  