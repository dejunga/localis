"use client";

import { useActionState } from "react";
import { prijaviSe, type LoginState } from "./actions";

export default function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(prijaviSe, {});
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="lozinka" className="block text-sm font-medium mb-1.5">
          Lozinka
        </label>
        <input
          id="lozinka"
          name="lozinka"
          type="password"
          required
          autoFocus
          className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)]"
        />
      </div>
      {state.greska && <p className="text-red-600 text-sm">{state.greska}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full py-3 bg-[var(--navy)] text-white font-medium rounded-lg disabled:opacity-60"
      >
        {pending ? "Provjera..." : "Prijavi se"}
      </button>
    </form>
  );
}
