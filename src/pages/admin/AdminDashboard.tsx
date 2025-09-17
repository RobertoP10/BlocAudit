export default function AdminDashboard() {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Company Admin Dashboard</h1>
        <p className="text-gray-500 mb-6">Administrare companie și asociații</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-white shadow rounded">Total Cereri</div>
          <div className="p-4 bg-white shadow rounded">Asociații</div>
          <div className="p-4 bg-white shadow rounded">Utilizatori</div>
          <div className="p-4 bg-white shadow rounded">Consum Plan</div>
        </div>
      </div>
    );
  }
  