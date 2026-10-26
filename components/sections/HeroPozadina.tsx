// Dvije mutne mrlje koje polako lebde iza hero sekcije; glavni efekt je karta (KartaHrvatske).
export default function HeroPozadina() {
  return (
    <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
      <div className="absolute -top-40 -right-32 w-[40rem] h-[40rem] rounded-full bg-[var(--gold)]/10 blur-3xl animate-[lebdenje_18s_ease-in-out_infinite] motion-reduce:animate-none" />
      <div className="absolute -bottom-48 left-[10%] w-[36rem] h-[36rem] rounded-full bg-sky-400/10 blur-3xl animate-[lebdenje_24s_ease-in-out_infinite_reverse] motion-reduce:animate-none" />
    </div>
  );
}
