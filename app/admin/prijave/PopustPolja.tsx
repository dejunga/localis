import type { Popust } from "@/lib/ponude/popust";

const input =
  "w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20";

// Polja koja čita procitajPopust (lib/ponude/popust.ts).
export default function PopustPolja({ popust }: { popust: Popust | null }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[12rem_10rem_1fr] gap-4">
      <label className="text-sm">
        Popust
        <select name="popust_tip" defaultValue={popust?.tip ?? ""} className={`${input} bg-white`}>
          <option value="">bez popusta</option>
          <option value="postotak">postotak (%)</option>
          <option value="iznos">iznos (EUR)</option>
        </select>
      </label>
      <label className="text-sm">
        Vrijednost
        <input
          name="popust_vrijednost"
          defaultValue={popust ? String(popust.vrijednost).replace(".", ",") : ""}
          placeholder="npr. 15 ili 100"
          inputMode="decimal"
          className={input}
        />
      </label>
      <label className="text-sm">
        Tekst na ponudi (neobavezno)
        <input
          name="popust_opis"
          defaultValue={popust?.opis ?? ""}
          placeholder='default: "Popust (15 %)" / "Popust"'
          maxLength={100}
          className={input}
        />
      </label>
    </div>
  );
}
