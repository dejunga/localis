// Podaci LOCALIS-a kako stoje na ponudi. Pravni naziv ostaje pun ("obrt ...") - ovo je poslovni dokument.
export const IZDAVATELJ = {
  naziv: "LOCALIS, obrt za savjetovanje i edukaciju",
  vlasnik: "vl. Marija Jungić",
  adresa: "Ljudevita Gaja 8, 43290 Grubišno Polje",
  mjesto: "Grubišno Polje",
  telefon: "+385 (0) 95 3135 158",
  email: "info@localis.hr",
  web: "www.localis.hr",
  oib: "07277793412",
  iban: "HR2124020061140660868",
  banka: "Erste & Steiermärkische Bank d.d.",
  swift: "ESBCHR22",
  pdvNapomena:
    "Obrt nije u sustavu PDV-a – PDV nije obračunat temeljem čl. 90. st. 1. i 2. Zakona o porezu na dodanu vrijednost.",
  disclaimer1: "Ovaj dokument služi kao informacija o cijenama i ne smije se uporabiti za knjiženje.",
  disclaimer2: "Ovo nije fiskalizirani račun.",
} as const;

export const BOJE = {
  navy: "#062B47",
  navyLight: "#1A395B",
  gold: "#D49838",
  siva: "#BFD5DC",
  tekst: "#111111",
} as const;
