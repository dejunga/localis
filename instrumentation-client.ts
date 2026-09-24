import { initBotId } from "botid/client/core";

// Vercel BotID: server akcije šalju POST na URL stranice, pa štitimo stranice s javnim formama.
// Server strana provjerava s checkBotId() u samoj akciji.
initBotId({
  protect: [
    { path: "/edukacije/*", method: "POST" },
    { path: "/kontakt", method: "POST" },
    { path: "/admin/login", method: "POST" },
  ],
});
