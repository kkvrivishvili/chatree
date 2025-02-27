export default function DashboardOverview() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Aquí puedes agregar las tarjetas o widgets del dashboard */}
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-col space-y-2">
            <p className="text-sm text-muted-foreground">Bienvenido a tu Dashboard</p>
            <h3 className="text-2xl font-semibold">Overview</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
