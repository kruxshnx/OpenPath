async function getApiHealth() {
  try {
    const res = await fetch(
      `${process.env.API_URL ?? 'http://localhost:4000'}/api/health`,
      { cache: 'no-store' },
    );
    if (!res.ok) return null;
    return (await res.json()) as { status: string; service: string };
  } catch {
    return null;
  }
}

export default async function Home() {
  const health = await getApiHealth();

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6">
      <h1 className="text-4xl font-bold tracking-tight">OpenPath</h1>
      <p className="text-lg text-gray-600">
        Intelligent open-source contribution discovery &amp; recommendation.
      </p>
      <div className="rounded-lg border border-gray-200 p-4 text-sm">
        <span className="font-medium">API status: </span>
        {health ? (
          <span className="text-green-600">
            {health.status} ({health.service})
          </span>
        ) : (
          <span className="text-red-600">
            unreachable — start the API with <code>npm run dev:api</code>
          </span>
        )}
      </div>
    </main>
  );
}
