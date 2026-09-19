const BOJE: Record<string, string> = {
  nova: "bg-yellow-100 text-yellow-800",
  ponuda_poslana: "bg-green-100 text-green-800",
  poslana: "bg-green-100 text-green-800",
  stornirana: "bg-gray-200 text-gray-700",
  greska: "bg-red-100 text-red-800",
};

const LABELE: Record<string, string> = {
  nova: "nova",
  ponuda_poslana: "ponuda poslana",
  poslana: "poslana",
  stornirana: "stornirana",
  greska: "greška",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${BOJE[status] ?? "bg-gray-100"}`}>
      {LABELE[status] ?? status}
    </span>
  );
}
