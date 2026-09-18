import { readFileSync } from "node:fs";
import path from "node:path";
import { Document, Font, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { IZDAVATELJ, BOJE } from "./izdavatelj";
import { formatDatumHr, formatIznos, formatPolaznici } from "./format";
import type { PonudaPdfData } from "./pdf";

const fontsDir = path.join(process.cwd(), "public", "fonts");
// Buffer umjesto putanje: react-pdf na Windowsu "C:\..." tumači kao URL shemu i tiho preskoči sliku.
const logo = { data: readFileSync(path.join(process.cwd(), "public", "ponuda", "logo.png")), format: "png" as const };

Font.register({
  family: "Carlito",
  fonts: [
    { src: path.join(fontsDir, "Carlito-Regular.ttf") },
    { src: path.join(fontsDir, "Carlito-Bold.ttf"), fontWeight: "bold" },
    { src: path.join(fontsDir, "Carlito-Italic.ttf"), fontStyle: "italic" },
  ],
});
// Bez rastavljanja riječi - hrvatski se inače lomi na krivim mjestima.
Font.registerHyphenationCallback((word) => [word]);

const s = StyleSheet.create({
  page: {
    fontFamily: "Carlito",
    fontSize: 10.5,
    color: BOJE.tekst,
    paddingTop: 30,
    paddingBottom: 30,
    paddingHorizontal: 45,
    lineHeight: 1.3,
    // Bez ligatura (fi, ti, fk...) - Carlito ih ima, a ekstrakcija teksta ih onda gubi.
    fontFeatureSettings: { liga: false },
  },
  logoRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  logo: { width: 19, height: 27, marginRight: 8 },
  wordmark: { fontFamily: "Times-Roman", fontSize: 19, letterSpacing: 3, color: BOJE.navy, lineHeight: 1 },
  tagline: { fontSize: 6, letterSpacing: 1.6, color: BOJE.gold, lineHeight: 1, marginTop: 2 },
  izdavateljNaziv: { fontWeight: "bold", color: BOJE.navy, fontSize: 11.5, marginBottom: 1 },
  klijentBlok: { alignItems: "flex-end", marginTop: 8, fontSize: 10 },
  bold: { fontWeight: "bold" },
  naslov: {
    marginTop: 16,
    marginBottom: 4,
    textAlign: "center",
    color: BOJE.navy,
    fontWeight: "bold",
    fontSize: 14,
  },
  zlatnaLinija: { borderBottomWidth: 1.5, borderBottomColor: BOJE.gold, marginBottom: 6 },
  predmetNaslov: { fontStyle: "italic", marginLeft: 12, marginBottom: 4 },
  metaRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#DDDDDD",
    paddingVertical: 2,
  },
  metaLabel: { width: 150, fontWeight: "bold" },
  metaValue: { flex: 1 },
  stavkeNaslov: { fontWeight: "bold", color: BOJE.navy, marginTop: 8, marginBottom: 3 },
  tHead: { flexDirection: "row", backgroundColor: BOJE.navy, color: "#FFFFFF", fontWeight: "bold" },
  tRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#CCCCCC",
    borderLeftWidth: 0.5,
    borderLeftColor: "#CCCCCC",
  },
  cell: { paddingVertical: 3, paddingHorizontal: 4, borderRightWidth: 0.5, borderRightColor: "#CCCCCC" },
  hCell: { borderRightColor: "#FFFFFF" },
  cRb: { width: 28 },
  cNaziv: { flex: 1 },
  cJmj: { width: 32, textAlign: "center" },
  cKol: { width: 50, textAlign: "center" },
  cCijena: { width: 88, textAlign: "right" },
  cIznos: { width: 88, textAlign: "right" },
  zbrojBlok: { alignSelf: "flex-end", width: 220, marginTop: 12 },
  zbrojRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 1.5,
    borderBottomWidth: 0.5,
    borderBottomColor: "#DDDDDD",
  },
  // Dvostruka linija iznad UKUPNO kao na ručnoj ponudi.
  dvostrukaLinija: { borderBottomWidth: 0.75, borderBottomColor: BOJE.navy, marginTop: 1.5, marginBottom: 1.5 },
  zbrojUkupno: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.75,
    borderTopColor: BOJE.navy,
    paddingVertical: 2,
    fontWeight: "bold",
    color: BOJE.navy,
  },
  napomene: { marginTop: 12 },
  potpis: { marginTop: 32, alignItems: "flex-end" },
});

function Meta({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={s.metaRow}>
      <Text style={s.metaLabel}>{label}</Text>
      <Text style={[s.metaValue, bold ? s.bold : {}]}>{value}</Text>
    </View>
  );
}

export function PonudaPdf({ data }: { data: PonudaPdfData }) {
  const { klijent, edukacija } = data;
  return (
    <Document title={`Ponuda ${data.broj}`} author={IZDAVATELJ.naziv}>
      <Page size="A4" style={s.page}>
        <View style={s.logoRow}>
          {/* react-pdf Image nema alt prop - pravilo je za HTML <img>. */}
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={logo} style={s.logo} />
          <View>
            <Text style={s.wordmark}>LOCALIS</Text>
            <Text style={s.tagline}>EDUKACIJA I SAVJETOVANJE</Text>
          </View>
        </View>

        <Text style={s.izdavateljNaziv}>{IZDAVATELJ.naziv}</Text>
        <Text>{IZDAVATELJ.vlasnik}</Text>
        <Text>{IZDAVATELJ.adresa}</Text>
        <Text>T: {IZDAVATELJ.telefon}</Text>
        <Text>E: {IZDAVATELJ.email}</Text>
        <Text>W: {IZDAVATELJ.web}</Text>
        <Text>OIB: {IZDAVATELJ.oib}</Text>
        <Text>
          IBAN: {IZDAVATELJ.iban}, {IZDAVATELJ.banka}
        </Text>
        <Text>SWIFT/BIC: {IZDAVATELJ.swift}</Text>
        <Text style={{ marginTop: 6 }}>
          Mjesto i datum: {IZDAVATELJ.mjesto}, {formatDatumHr(data.datumIzdavanja)}
        </Text>
        <Text>Ponuda vrijedi do: {formatDatumHr(data.vrijediDo)}</Text>

        <View style={s.klijentBlok}>
          <Text style={s.bold}>{klijent.naziv}</Text>
          <Text style={s.bold}>{klijent.adresa}</Text>
          <Text style={s.bold}>OIB: {klijent.oib}</Text>
          <Text style={s.bold}>Kontakt osoba: {klijent.kontakt}</Text>
          <Text style={s.bold}>Tel: {klijent.telefon}</Text>
          <Text style={s.bold}>e-mail: {klijent.email}</Text>
        </View>

        <Text style={s.naslov}>PONUDA BROJ: {data.broj}</Text>
        <View style={s.zlatnaLinija} />

        <Text style={s.bold}>Predmet ponude: {edukacija.kicker}</Text>
        <Text style={s.predmetNaslov}>{`„${edukacija.naslov}"`}</Text>

        <Meta label="Predavač" value={edukacija.predavac} />
        <Meta label="Datum održavanja" value={edukacija.datumLabel} />
        <Meta label="Mjesto održavanja" value={edukacija.mjesto} />
        <Meta label="Ime i prezime polaznika" value={formatPolaznici(data.polaznici)} bold />
        <Meta label="Uključeno" value={edukacija.ukljuceno} />

        <Text style={s.stavkeNaslov}>Stavke ponude</Text>
        <View style={s.tHead}>
          <Text style={[s.cell, s.hCell, s.cRb]}>Rb.</Text>
          <Text style={[s.cell, s.hCell, s.cNaziv]}>Naziv usluge</Text>
          <Text style={[s.cell, s.hCell, s.cJmj]}>Jmj</Text>
          <Text style={[s.cell, s.hCell, s.cKol]}>Količina</Text>
          <Text style={[s.cell, s.hCell, s.cCijena]}>Cijena (EUR)</Text>
          <Text style={[s.cell, s.hCell, s.cIznos]}>Iznos (EUR)</Text>
        </View>
        <View style={s.tRow}>
          <Text style={[s.cell, s.cRb]}>1.</Text>
          <Text style={[s.cell, s.cNaziv]}>{edukacija.nazivStavke}</Text>
          <Text style={[s.cell, s.cJmj]}>kom</Text>
          <Text style={[s.cell, s.cKol]}>{formatIznos(data.kolicina)}</Text>
          <Text style={[s.cell, s.cCijena]}>{formatIznos(data.cijena)}</Text>
          <Text style={[s.cell, s.cIznos]}>{formatIznos(data.ukupno)}</Text>
        </View>

        <View style={s.zbrojBlok}>
          <View style={s.zbrojRow}>
            <Text>Ukupno bez PDV-a</Text>
            <Text>{formatIznos(data.ukupno)}</Text>
          </View>
          <View style={s.zbrojRow}>
            <Text>Rabat</Text>
            <Text>{formatIznos(0)}</Text>
          </View>
          <View style={s.zbrojRow}>
            <Text>PDV (0 %)</Text>
            <Text>{formatIznos(0)}</Text>
          </View>
          <View style={s.dvostrukaLinija} />
          <View style={s.zbrojUkupno}>
            <Text>UKUPNO ZA PLAĆANJE (EUR)</Text>
            <Text>{formatIznos(data.ukupno)}</Text>
          </View>
        </View>

        <View style={s.napomene}>
          <Text>{IZDAVATELJ.pdvNapomena}</Text>
          <Text>Rok plaćanja: {formatDatumHr(data.rokPlacanja)}</Text>
          <Text style={s.bold}>Prilikom plaćanja pozovite se na broj: HR00 {data.broj}</Text>
          <Text style={{ marginTop: 4 }}>{IZDAVATELJ.disclaimer1}</Text>
          <Text>{IZDAVATELJ.disclaimer2}</Text>
        </View>

        <View style={s.potpis}>
          <Text>{IZDAVATELJ.naziv}</Text>
          <Text>{data.potpisnik}</Text>
        </View>
      </Page>
    </Document>
  );
}
