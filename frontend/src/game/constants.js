// ==========================================
// GAME WORLD CONFIGURATION & CONSTANTS
// Spider-Man Inspired Urban Superhero Prototype
// ==========================================

export const WORLD_WIDTH = 1800;
export const WORLD_HEIGHT = 1400;

export const PLAYER_SPEED = 240; // pixels per sec
export const SPRINT_SPEED = 380;
export const WEB_ZIP_SPEED = 700;
export const INTERACTION_RADIUS = 78;

// All 7 NPCs with world positions, visuals, and initial dialogue
export const NPCS = [
  {
    id: "ned",
    name: "Ned Leeds",
    role: "Tech Specialist & Guy in the Chair",
    alignment: "Allied",
    badge: "TECH ALLY",
    color: "#38bdf8", // Sky blue
    avatar: "💻",
    x: 1400,
    y: 390,
    facing: "down",
    zone: "Queens Radio Bodega",
    initialTrust: 75,
    relationship: "Friendly",
    greeting: "Yo! Police scanners are going crazy across Queens! I'm decrypting frequencies right now—what do you need me to scan for?",
    lore: "Your best friend and technical support. Monitors radio traffic, hacks security terminals, and tracks anomalous power surges."
  },
  {
    id: "mj",
    name: "MJ (Mary Jane)",
    role: "Investigative Reporter",
    alignment: "Allied",
    badge: "INVESTIGATOR",
    color: "#fb7185", // Rose red
    avatar: "📸",
    x: 360,
    y: 390,
    facing: "right",
    zone: "Daily Chronicle Cafe",
    initialTrust: 70,
    relationship: "Friendly",
    greeting: "Keep your voice down. Something major is brewing in this neighborhood. I've been cross-referencing Oscorp shipping manifests all morning.",
    lore: "Investigative journalist for the Daily Chronicle. Noticed dangerous ties between sudden chemical thefts and villain sightings."
  },
  {
    id: "aunt_may",
    name: "Aunt May",
    role: "Caring Mentor & Moral Anchor",
    alignment: "Allied",
    badge: "FAMILY",
    color: "#facc15", // Warm gold
    avatar: "👵",
    x: 900,
    y: 1120,
    facing: "up",
    zone: "Park View Brownstone Stoop",
    initialTrust: 90,
    relationship: "Supportive",
    greeting: "You look like you're carrying the weight of the whole world on your shoulders. Come sit down for a moment. Have you eaten anything today?",
    lore: "The heart of the neighborhood. Her words keep the Hero grounded in compassion, responsibility, and the true purpose of heroism."
  },
  {
    id: "flash",
    name: "Flash Thompson",
    role: "Midtown High Jock",
    alignment: "Unresponsive",
    badge: "UNRESPONSIVE",
    color: "#94a3b8", // Slate gray
    avatar: "🏈",
    x: 330,
    y: 1060,
    facing: "up",
    zone: "Midtown High Bleachers",
    initialTrust: 10,
    relationship: "Unresponsive",
    greeting: "Yeah? What do you want? I'm waiting on someone, so move along before you embarrass yourself.",
    lore: "High school tough guy. Brusque, dismissive, and acts uninterested. Secretly admires Spider-Man and witnessed mysterious night activity."
  },
  {
    id: "goblin",
    name: "Green Goblin",
    role: "Chaotic Terror & Major Threat",
    alignment: "Villain",
    badge: "MAJOR THREAT",
    color: "#22c55e", // Toxic green
    avatar: "👺",
    x: 880,
    y: 270, // In front of clocktower on open plaza
    facing: "down",
    zone: "Clocktower Rooftop Overlook",
    initialTrust: 0,
    relationship: "Hostile",
    greeting: "Ah, the neighborhood's little web-spinner crawls into the light! Did you really think you could stop what's coming, hero?",
    lore: "Norman Osborn under the psychotic thrall of the Goblin formula. Terrorizes the borough from his glider, mocking the Hero's moral code."
  },
  {
    id: "doc_ock",
    name: "Doctor Octopus",
    role: "Mastermind & Visionary Scientist",
    alignment: "Villain",
    badge: "MASTERMIND",
    color: "#f97316", // Mechanical orange
    avatar: "🐙",
    x: 1440,
    y: 1060, // On the open shipping wharf dock below warehouse
    facing: "left",
    zone: "Oscorp Docks Warehouse",
    initialTrust: 5,
    relationship: "Hostile",
    greeting: "You are intruding upon historic scientific advancement. Turn back now, insect, before my mechanical arms dissect your curiosity.",
    lore: "Dr. Otto Octavius. Driven by hubris to construct an unstable fusion reactor, viewing anyone who objects as an obstacle to scientific destiny."
  },
  {
    id: "mysterio",
    name: "Mysterio",
    role: "Master of Illusion & Deception",
    alignment: "Villain",
    badge: "TRICKSTER",
    color: "#a855f7", // Arcane purple
    avatar: "🔮",
    x: 260,
    y: 680, // In open theater alleyway
    facing: "right",
    zone: "Old Grand Theater Alley",
    initialTrust: 15,
    relationship: "Suspicious",
    greeting: "Welcome to the final act, web-slinger! But tell me... do your eyes deceive you, or is everything you see merely smoke and mirrors?",
    lore: "Quentin Beck. Theatrical trickster employing psychoactive smoke, holographic drones, and dramatic misdirection to confuse the Hero."
  }
];

// Architectural Buildings & Obstacles with collision bounding boxes
export const BUILDINGS = [
  // Northwest: Daily Chronicle & Newsroom
  {
    id: "b_chronicle",
    name: "Daily Chronicle Building",
    x: 100,
    y: 80,
    w: 380,
    h: 270,
    color: "#1e293b",
    roofColor: "#0f172a",
    label: "DAILY CHRONICLE HQ",
    signColor: "#ef4444"
  },
  // North Center: Historic Clocktower & Overlook
  {
    id: "b_clocktower",
    name: "St. Jude Historic Clocktower",
    x: 720,
    y: 50,
    w: 320,
    h: 190,
    color: "#334155",
    roofColor: "#1e293b",
    label: "ST. JUDE CLOCKTOWER",
    signColor: "#22c55e"
  },
  // Northeast: Electronics Bodega & Tech Relays
  {
    id: "b_bodega",
    name: "Queens Radio Bodega & Electronics",
    x: 1260,
    y: 80,
    w: 420,
    h: 270,
    color: "#1e293b",
    roofColor: "#0f172a",
    label: "RADIO & TECH BODEGA",
    signColor: "#38bdf8"
  },
  // West: Old Grand Theater
  {
    id: "b_theater",
    name: "The Majestic Grand Theater",
    x: 90,
    y: 470,
    w: 320,
    h: 180,
    color: "#2a1b3d",
    roofColor: "#180f24",
    label: "MAJESTIC THEATER",
    signColor: "#c084fc"
  },
  // Southwest: Midtown High School
  {
    id: "b_school",
    name: "Midtown Science & Tech High",
    x: 100,
    y: 770,
    w: 380,
    h: 240,
    color: "#1e293b",
    roofColor: "#0f172a",
    label: "MIDTOWN HIGH GYM",
    signColor: "#e2e8f0"
  },
  // South Center: Park View Brownstones
  {
    id: "b_brownstone",
    name: "Park View Historic Brownstones",
    x: 740,
    y: 840,
    w: 320,
    h: 240,
    color: "#451a1a",
    roofColor: "#2d1212",
    label: "PARK BROWNDSTONES",
    signColor: "#facc15"
  },
  // Southeast: Oscorp Industrial Docks
  {
    id: "b_oscorp",
    name: "Oscorp Shipping & High-Tech Wharf",
    x: 1280,
    y: 740,
    w: 420,
    h: 280,
    color: "#182230",
    roofColor: "#0d1520",
    label: "OSCORP INDUSTRIAL DOCKS",
    signColor: "#f97316"
  }
];

// Streetlights that cast dynamic ambient light
export const STREETLIGHTS = [
  { x: 500, y: 390, radius: 110 },
  { x: 1240, y: 390, radius: 110 },
  { x: 500, y: 720, radius: 120 },
  { x: 1240, y: 720, radius: 120 },
  { x: 500, y: 1050, radius: 110 },
  { x: 1240, y: 1050, radius: 110 },
  { x: 880, y: 640, radius: 130 }
];

// Sewer grates with rising steam particles
export const SEWER_GRATES = [
  { x: 450, y: 560 },
  { x: 1320, y: 560 },
  { x: 620, y: 800 },
  { x: 1150, y: 800 }
];

// Initial Quest Chain
export const INITIAL_QUESTS = {
  title: "Web of Shadows: The Neighborhood Syndicate",
  chapter: "Act I: Signal Distortions",
  activeId: "talk_ned",
  tasks: [
    {
      id: "talk_ned",
      title: "Contact Ned Leeds",
      desc: "Visit the Radio Bodega in Northeast Queens to scan police frequencies.",
      targetId: "ned",
      completed: false
    },
    {
      id: "talk_mj",
      title: "Consult with MJ",
      desc: "Meet MJ outside the Daily Chronicle Cafe to inspect Oscorp shipping manifests.",
      targetId: "mj",
      completed: false
    },
    {
      id: "check_flash",
      title: "Question Flash Thompson",
      desc: "Find Flash near the Midtown High bleachers and see what he saw last night.",
      targetId: "flash",
      completed: false
    },
    {
      id: "investigate_mysterio",
      title: "Confront Mysterio",
      desc: "Head west to the Majestic Theater alley and unravel the illusion smoke.",
      targetId: "mysterio",
      completed: false
    },
    {
      id: "infiltrate_doc_ock",
      title: "Infiltrate Oscorp Docks",
      desc: "Stop Doctor Octopus from powering up his unstable magnetic reactor.",
      targetId: "doc_ock",
      completed: false
    },
    {
      id: "face_goblin",
      title: "Rooftop Showdown",
      desc: "Confront Green Goblin at the Clocktower overlook before his strike begins.",
      targetId: "goblin",
      completed: false
    },
    {
      id: "visit_may",
      title: "Check in with Aunt May",
      desc: "Return to the brownstone stoop to recover focus and seek advice.",
      targetId: "aunt_may",
      completed: false
    }
  ]
};
