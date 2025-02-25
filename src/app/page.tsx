export default function Home() {
  return (
    <div className="bg-blue-500 text-white p-4">
      <h1 className="text-3xl font-bold">Willkommen bei Portfoliohunt</h1>
      <p>Entdecke und teile Design-Portfolios – starte jetzt!</p>
      <a href="/portfolios" className="mt-4 inline-block bg-white text-blue-500 p-2 rounded">
        Zu den Portfolios
      </a>
    </div>
  );
}