import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tarifs — Club Génie Informatique",
  description: "Grille des prix des services aux soutenants : design graphique, impression, mise en forme et présentation.",
};

const pricingData = {
  sections: [
    {
      ref: "A",
      title: "Création Graphique (Design)",
      color: "primary",
      items: [
        { ref: "A1", label: "Conception Graphique — Flyer A4 (Annonces Soutenances)", unit: "Forfait", price: "2 500", note: "—" },
        { ref: "A2", label: "Conception Graphique — Flyer Personnalisé", unit: "Forfait", price: "2 500", note: "Identité visuelle sur mesure" },
        { ref: "A3", label: "Conception Graphique — Banderole Intérieure (2,5m × 0,8m)", unit: "Forfait", price: "3 500", note: "—" },
        { ref: "A4", label: "Conception Graphique — Banderole Extérieure (2m × 0,8m)", unit: "Forfait", price: "3 500", note: "—" },
        { ref: "A5", label: "Conception Graphique — Stand Photo", unit: "Forfait", price: "5 000", note: "Fond + habillage visuel" },
      ],
    },
    {
      ref: "B",
      title: "Personnalisation & Impression",
      color: "accent",
      items: [
        { ref: "B1", label: "Personnalisation Flyer A4 (lot de 65 unités)", unit: "Lot", price: "23 000", note: "~354 FCFA/unité" },
        { ref: "B2", label: "Impression Banderole Intérieure (2,5m × 0,8m)", unit: "Unité", price: "8 500", note: "—" },
        { ref: "B3", label: "Impression Banderole Extérieure (2m × 0,8m)", unit: "Unité", price: "6 800", note: "—" },
        { ref: "B4", label: "Impression Banderole Grand Format (2m × 2m)", unit: "Unité", price: "17 000", note: "—" },
        { ref: "B5", label: "Transport & Livraison", unit: "Forfait", price: "1 500", note: "Dans la ville" },
      ],
    },
    {
      ref: "C",
      title: "Mise en Forme Documents",
      color: "indigo",
      items: [
        { ref: "C1", label: "Mise en page Rapport de Stage", unit: "Forfait", price: "Sur devis", note: "Selon nombre de pages" },
        { ref: "C2", label: "Présentation PowerPoint (Soutenance)", unit: "Forfait", price: "Sur devis", note: "Selon nombre de diapositives" },
      ],
    },
  ],
};

const colorMap: Record<string, { badge: string; accent: string; icon: string; border: string }> = {
  primary: {
    badge: "bg-blue-50 text-[#1F4E79] border border-blue-100",
    accent: "bg-[#1F4E79]",
    icon: "text-[#1F4E79]",
    border: "border-l-[#1F4E79]",
  },
  accent: {
    badge: "bg-orange-50 text-orange-700 border border-orange-100",
    accent: "bg-orange-500",
    icon: "text-orange-500",
    border: "border-l-orange-500",
  },
  indigo: {
    badge: "bg-indigo-50 text-indigo-700 border border-indigo-100",
    accent: "bg-indigo-500",
    icon: "text-indigo-500",
    border: "border-l-indigo-500",
  },
};

const sectionIcons: Record<string, string> = {
  A: "✦",
  B: "⬡",
  C: "◈",
};

export default function TarifsPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc]">
      {/* Hero */}
      <section className="gradient-hero relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-80px] left-[-80px] w-[340px] h-[340px] rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-[-60px] right-[-60px] w-[280px] h-[280px] rounded-full bg-orange-400/10 blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase bg-white/10 text-orange-300 mb-6 border border-white/10">
            Club Génie Informatique
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
            Grille des{" "}
            <span className="text-gradient-accent">Prix</span>
          </h1>
          <p className="text-blue-200 text-base sm:text-lg max-w-xl mx-auto">
            Services aux soutenants — Design graphique, impression, mise en forme et présentation.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-14 space-y-12">

        {pricingData.sections.map((section) => {
          const colors = colorMap[section.color];
          return (
            <div key={section.ref} className="bg-white rounded-2xl shadow-md overflow-hidden border border-[#e2e8f0]">
              {/* Section header */}
              <div className="flex items-center gap-4 px-6 py-5 border-b border-[#e2e8f0]">
                <div className={`w-10 h-10 rounded-xl ${colors.accent} flex items-center justify-center text-white font-bold text-lg shadow`}>
                  {sectionIcons[section.ref]}
                </div>
                <div>
                  <span className={`text-xs font-bold uppercase tracking-widest ${colors.icon}`}>
                    Section {section.ref}
                  </span>
                  <h2 className="text-lg font-bold text-[#0f172a] leading-tight">
                    {section.title}
                  </h2>
                </div>
              </div>

              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#f8fafc] text-[#64748b] text-xs uppercase tracking-wider">
                      <th className="px-6 py-3 text-left font-semibold w-16">Réf.</th>
                      <th className="px-4 py-3 text-left font-semibold">Désignation</th>
                      <th className="px-4 py-3 text-center font-semibold w-28">Unité</th>
                      <th className="px-4 py-3 text-right font-semibold w-36">Prix (FCFA)</th>
                      <th className="px-6 py-3 text-left font-semibold w-48">Observations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {section.items.map((item, i) => (
                      <tr
                        key={item.ref}
                        className={`transition-colors hover:bg-[#f8fafc] ${i % 2 === 0 ? "bg-white" : "bg-[#fcfcfe]"}`}
                      >
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold ${colors.badge}`}>
                            {item.ref}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-[#0f172a] font-medium">{item.label}</td>
                        <td className="px-4 py-4 text-center text-[#64748b]">{item.unit}</td>
                        <td className="px-4 py-4 text-right">
                          {item.price === "Sur devis" ? (
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 italic">
                              Sur devis
                            </span>
                          ) : (
                            <span className="font-bold text-[#0f172a] text-base">
                              {item.price}{" "}
                              <span className="text-xs font-normal text-[#64748b]">FCFA</span>
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-[#64748b] text-xs">{item.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="sm:hidden divide-y divide-[#f1f5f9]">
                {section.items.map((item) => (
                  <div
                    key={item.ref}
                    className={`px-5 py-4 border-l-4 ${colors.border}`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <span className={`shrink-0 inline-block px-2 py-0.5 rounded-md text-xs font-bold ${colors.badge}`}>
                        {item.ref}
                      </span>
                      <span className="text-right">
                        {item.price === "Sur devis" ? (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 italic">
                            Sur devis
                          </span>
                        ) : (
                          <span className="font-bold text-[#0f172a]">
                            {item.price}{" "}
                            <span className="text-xs font-normal text-[#64748b]">FCFA</span>
                          </span>
                        )}
                      </span>
                    </div>
                    <p className="text-sm text-[#0f172a] font-medium leading-snug">{item.label}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-[#64748b]">
                      <span className="bg-[#f1f5f9] px-2 py-0.5 rounded">{item.unit}</span>
                      {item.note !== "—" && <span>· {item.note}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Note */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-6 py-5 flex gap-4 items-start">
          <span className="text-amber-500 text-xl mt-0.5">⚠</span>
          <div className="text-sm text-amber-800 space-y-1">
            <p className="font-semibold">Note importante</p>
            <p>
              Pour chaque montage, au-delà de <span className="font-bold">3 modifications</span>, le client sera
              facturé de <span className="font-bold">300 FCFA</span> pour le Flyer et{" "}
              <span className="font-bold">500 FCFA</span> pour la Banderole.
            </p>
            <p className="text-amber-700 mt-1">
              Les prix « Sur devis » sont établis après évaluation du volume de travail demandé.
            </p>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-[#64748b] pb-4">
          Document établi par{" "}
          <span className="font-semibold text-[#0f172a]">TIEMOUO DJIOLIO DORCAS</span>
          {" "}— Chargée de Communication, Club Génie Informatique et Télécommunications.
        </p>
      </section>
    </main>
  );
}