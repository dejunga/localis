// Zeleno = broj narudžbenice upisan, crveno = nedostaje.
export default function NarudzbenicaBadge({ broj }: { broj: string | null }) {
  return broj ? (
    <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
      {broj}
    </span>
  ) : (
    <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
      nema
    </span>
  );
}
