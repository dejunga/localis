import LoginForm from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <div className="max-w-sm mx-auto mt-16 bg-white border border-gray-200 rounded-xl p-8">
      <h1 className="text-xl font-semibold mb-6">Prijava u admin</h1>
      <LoginForm next={next ?? "/admin/prijave"} />
    </div>
  );
}
