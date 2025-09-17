export default function ClientDashboard() {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Client Dashboard</h1>
        <p className="text-gray-500 mb-6">Acces pentru clienți finali</p>
        <ul className="space-y-2">
          <li className="p-4 bg-white shadow rounded">Cereri Trimise</li>
          <li className="p-4 bg-white shadow rounded">Status Cereri</li>
          <li className="p-4 bg-white shadow rounded">Rapoarte PDF</li>
        </ul>
      </div>
    );
  }
  