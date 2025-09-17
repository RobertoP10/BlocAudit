export default function ServiceDashboard() {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Service Dashboard</h1>
        <p className="text-gray-500 mb-6">Activitate echipe Service</p>
        <ul className="space-y-2">
          <li className="p-4 bg-white shadow rounded">Solicitări Deschise</li>
          <li className="p-4 bg-white shadow rounded">Solicitări Rezolvate</li>
          <li className="p-4 bg-white shadow rounded">Intervenții Programate</li>
        </ul>
      </div>
    );
  }
  