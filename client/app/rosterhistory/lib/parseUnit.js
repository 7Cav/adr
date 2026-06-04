/**
 * Parse a XenForo position_title into a structured unit object.
 *
 * Position title formats (from live DB):
 *   "Trooper 3/2/A/1-7"           → { battalion: '1-7',  company: 'A', platoon: '2' }
 *   "Platoon Sergeant 2/A/3-7"    → { battalion: '3-7',  company: 'A', platoon: '2' }
 *   "Commander A/1-7"             → { battalion: '1-7',  company: 'A' }
 *   "1-7 Commanding Officer"      → { battalion: '1-7' }
 *   "DEVCOM 1IC"                  → { battalion: 'DEVCOM' }
 *   "Regimental Technical Aide"   → { battalion: 'Regimental' }
 *   "S1 1IC"                      → { battalion: 'S1' }
 *   "MP 1IC"                      → { battalion: 'MP' }
 *   "New Recruit", "Retired", …   → null (unclassified)
 *
 * Returns null for unclassified positions (hidden when any unit filter is active).
 */
export function parseUnit(positionTitle) {
  if (!positionTitle) return null;

  // Full line billet: Role S/P/Co/Bn  e.g. "Trooper 3/2/A/1-7"
  let m = positionTitle.match(/(\d+)\/(\d+)\/([A-Z]+)\/([A-Z0-9-]+)$/);
  if (m) return { battalion: m[4], company: m[3], platoon: m[2] };

  // Platoon-level: Role P/Co/Bn  e.g. "Platoon Sergeant 2/A/3-7"
  m = positionTitle.match(/(\d+)\/([A-Z]+)\/([A-Z0-9-]+)$/);
  if (m) return { battalion: m[3], company: m[2], platoon: m[1] };

  // Company-level: Role Co/Bn  e.g. "Commander A/1-7"
  m = positionTitle.match(/([A-Z]+)\/([A-Z0-9-]+)$/);
  if (m) return { battalion: m[2], company: m[1] };

  // Battalion leadership: "1-7 Commanding Officer", "ACD Staff Officer", "DEVCOM 1IC"
  m = positionTitle.match(/^(\d+-\d+|ACD|DEVCOM)\s/);
  if (m) return { battalion: m[1] };

  // Staff departments: S1, S2, S6, MP, RRD, RDC, WAG, Auxiliary
  m = positionTitle.match(/^(S\d+|MP|RRD|RDC|WAG|Auxiliary)\s/);
  if (m) return { battalion: m[1] };

  // Regimental staff + aides
  if (/^(Regimental|Aide)\s/i.test(positionTitle))
    return { battalion: "Regimental" };

  return null; // New Recruit, Retired, etc. — unclassified
}
