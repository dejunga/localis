import { zahtijevajAdmina } from "@/lib/admin/session";
import { getPostavke } from "@/lib/postavke";
import PostavkeForm from "./PostavkeForm";

export const dynamic = "force-dynamic";

export default async function PostavkePage() {
  await zahtijevajAdmina();
  const postavke = await getPostavke();
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Postavke ponuda</h1>
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <PostavkeForm postavke={postavke} />
      </div>
    </div>
  );
}
