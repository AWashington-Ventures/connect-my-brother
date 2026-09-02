/**
 * Grand Lodge Verification Utility
 * Validates that the entered Grand Lodge is a real, recognized Masonic jurisdiction.
 * Covers Prince Hall, Regular (AF&AM), UGLE District Lodges, and major international bodies.
 */

// Normalized list of recognized Grand Lodge keywords
// We match by checking if the input contains any of these canonical names
const RECOGNIZED_GRAND_LODGES: string[] = [
  // === US PRINCE HALL GRAND LODGES ===
  'prince hall grand lodge of alabama',
  'prince hall grand lodge of alaska',
  'prince hall grand lodge of arizona',
  'prince hall grand lodge of arkansas',
  'prince hall grand lodge of california',
  'prince hall grand lodge of colorado',
  'prince hall grand lodge of connecticut',
  'prince hall grand lodge of delaware',
  'prince hall grand lodge of florida',
  'prince hall grand lodge of georgia',
  'prince hall grand lodge of hawaii',
  'prince hall grand lodge of idaho',
  'prince hall grand lodge of illinois',
  'prince hall grand lodge of indiana',
  'prince hall grand lodge of iowa',
  'prince hall grand lodge of kansas',
  'prince hall grand lodge of kentucky',
  'prince hall grand lodge of louisiana',
  'prince hall grand lodge of maine',
  'prince hall grand lodge of maryland',
  'prince hall grand lodge of massachusetts',
  'most worshipful prince hall grand lodge of dc',
  'most worshipful prince hall grand lodge of the district of columbia',
  'prince hall grand lodge of dc',
  'prince hall grand lodge of the district of columbia',
  'prince hall grand lodge of michigan',
  'prince hall grand lodge of minnesota',
  'prince hall grand lodge of mississippi',
  'prince hall grand lodge of missouri',
  'prince hall grand lodge of montana',
  'prince hall grand lodge of nebraska',
  'prince hall grand lodge of nevada',
  'prince hall grand lodge of new hampshire',
  'prince hall grand lodge of new jersey',
  'prince hall grand lodge of new mexico',
  'prince hall grand lodge of new york',
  'prince hall grand lodge of north carolina',
  'prince hall grand lodge of north dakota',
  'prince hall grand lodge of ohio',
  'prince hall grand lodge of oklahoma',
  'prince hall grand lodge of oregon',
  'prince hall grand lodge of pennsylvania',
  'prince hall grand lodge of rhode island',
  'prince hall grand lodge of south carolina',
  'prince hall grand lodge of south dakota',
  'prince hall grand lodge of tennessee',
  'prince hall grand lodge of texas',
  'prince hall grand lodge of utah',
  'prince hall grand lodge of vermont',
  'prince hall grand lodge of virginia',
  'prince hall grand lodge of washington',
  'prince hall grand lodge of west virginia',
  'prince hall grand lodge of wisconsin',
  'prince hall grand lodge of wyoming',
  // === US REGULAR (AF&AM) GRAND LODGES ===
  'grand lodge of alabama',
  'grand lodge of alaska',
  'grand lodge of arizona',
  'grand lodge of arkansas',
  'grand lodge of california',
  'grand lodge of colorado',
  'grand lodge of connecticut',
  'grand lodge of delaware',
  'grand lodge of florida',
  'grand lodge of georgia',
  'grand lodge of hawaii',
  'grand lodge of idaho',
  'grand lodge of illinois',
  'grand lodge of indiana',
  'grand lodge of iowa',
  'grand lodge of kansas',
  'grand lodge of kentucky',
  'grand lodge of louisiana',
  'grand lodge of maine',
  'grand lodge of maryland',
  'grand lodge of massachusetts',
  'grand lodge of michigan',
  'grand lodge of minnesota',
  'grand lodge of mississippi',
  'grand lodge of missouri',
  'grand lodge of montana',
  'grand lodge of nebraska',
  'grand lodge of nevada',
  'grand lodge of new hampshire',
  'grand lodge of new jersey',
  'grand lodge of new mexico',
  'grand lodge of new york',
  'grand lodge of north carolina',
  'grand lodge of north dakota',
  'grand lodge of ohio',
  'grand lodge of oklahoma',
  'grand lodge of oregon',
  'grand lodge of pennsylvania',
  'grand lodge of rhode island',
  'grand lodge of south carolina',
  'grand lodge of south dakota',
  'grand lodge of tennessee',
  'grand lodge of texas',
  'grand lodge of utah',
  'grand lodge of vermont',
  'grand lodge of virginia',
  'grand lodge of washington',
  'grand lodge of west virginia',
  'grand lodge of wisconsin',
  'grand lodge of wyoming',
  'grand lodge of dc',
  'grand lodge of the district of columbia',
  // === CANADIAN GRAND LODGES ===
  'grand lodge of alberta',
  'grand lodge of british columbia',
  'grand lodge of manitoba',
  'grand lodge of new brunswick',
  'grand lodge of newfoundland',
  'grand lodge of nova scotia',
  'grand lodge of ontario',
  'grand lodge of prince edward island',
  'grand lodge of quebec',
  'grand lodge of saskatchewan',
  // === UK / UGLE ===
  'united grand lodge of england',
  'ugle',
  'grand lodge of scotland',
  'grand lodge of ireland',
  // === UGLE DISTRICT GRAND LODGES ===
  'district grand lodge of nigeria',
  'district grand lodge of ghana',
  'district grand lodge of south africa',
  'district grand lodge of kenya',
  'district grand lodge of zimbabwe',
  'district grand lodge of the caribbean',
  'district grand lodge of west africa',
  'district grand lodge of east africa',
  // === CARIBBEAN & INTERNATIONAL ===
  'grand lodge of jamaica',
  'grand lodge of barbados',
  'grand lodge of trinidad',
  'grand lodge of the bahamas',
  'grand lodge of guyana',
  'grand lodge of bermuda',
  'grand lodge of panama',
  'grand lodge of nigeria',
  'grand lodge of ghana',
  'grand lodge of south africa',
  'grand lodge of kenya',
  'grand lodge of australia',
  'grand lodge of new zealand',
  'grand lodge of india',
  'grand lodge of france',
  'grand lodge of germany',
  'grand lodge of mexico',
  'grand lodge of brazil',
  'grand lodge of philippines',
  // === COMMON SHORTHAND (allow just state/country names under these patterns) ===
  'mwphgl',  // Most Worshipful Prince Hall Grand Lodge (common abbreviation)
  'af&am',
  'f.&a.m',
  'f. & a.m',
  'f.a.m.',
  'free and accepted masons',
  'ancient free and accepted masons',
  'ancient accepted scottish rite',
]

/**
 * Normalize a string for fuzzy matching
 */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')  // remove punctuation
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Check if a Grand Lodge name is recognized.
 * Returns true if legitimate, false if unrecognized.
 */
export function isRecognizedGrandLodge(input: string): boolean {
  if (!input || input.trim().length < 5) return false

  const norm = normalize(input)

  // Check against recognized list
  for (const canonical of RECOGNIZED_GRAND_LODGES) {
    const normCanon = normalize(canonical)
    // Check if input contains the canonical string or vice versa (substring match)
    if (norm.includes(normCanon) || normCanon.includes(norm)) {
      return true
    }
  }

  // Also accept if input contains BOTH 'grand lodge' AND a US state name
  const hasGrandLodge = norm.includes('grand lodge')
  const usStates = [
    'alabama','alaska','arizona','arkansas','california','colorado','connecticut',
    'delaware','florida','georgia','hawaii','idaho','illinois','indiana','iowa',
    'kansas','kentucky','louisiana','maine','maryland','massachusetts','michigan',
    'minnesota','mississippi','missouri','montana','nebraska','nevada',
    'new hampshire','new jersey','new mexico','new york','north carolina',
    'north dakota','ohio','oklahoma','oregon','pennsylvania','rhode island',
    'south carolina','south dakota','tennessee','texas','utah','vermont',
    'virginia','washington','west virginia','wisconsin','wyoming',
    'district of columbia','dc'
  ]
  const countriesAndProvinces = [
    'england','scotland','ireland','canada','nigeria','ghana','kenya','south africa',
    'zimbabwe','jamaica','barbados','trinidad','bahamas','guyana','bermuda',
    'australia','new zealand','india','france','germany','mexico','brazil',
    'philippines','plateau','nigeria','alberta','ontario','british columbia',
    'quebec','manitoba','nova scotia','new brunswick','ontario',
  ]

  if (hasGrandLodge) {
    for (const state of [...usStates, ...countriesAndProvinces]) {
      if (norm.includes(state)) return true
    }
    // If they said 'grand lodge' with a prince hall or mwphgl prefix
    if (norm.includes('prince hall') || norm.includes('mwphgl') || norm.includes('worshipful')) {
      return true
    }
  }

  return false
}

/**
 * Validate a lodge entry.
 * Lodge name must not be obviously fake (too short, all numbers, etc.)
 */
export function isValidLodgeName(lodgeName: string, lodgeNumber: string): boolean {
  if (!lodgeName || lodgeName.trim().length < 3) return false
  // Lodge names that are clearly fake
  const suspicious = [
    'test', 'fake', 'asdf', 'qwerty', 'jedi', 'illuminati', 'none', 'n/a',
    '123', 'xxx', 'abc', 'aaa', 'bbb'
  ]
  const norm = lodgeName.toLowerCase().trim()
  for (const s of suspicious) {
    if (norm === s || norm.startsWith(s + ' ')) return false
  }
  return true
}
