// ==========================================
// HOOKT LIFELINE CONFIGURATOR - CORE JS ENGINE
// Clean White Theme Edition: 3D Visualizer & Mechanical Calculator
// ==========================================

// Global Application State
const state = {
    lineLength: 15.0,     // Desired Lifeline Length L1 (m)
    hasLine2: false,      // Secondary direction line flag
    line2Length: 10.0,    // Secondary Line Length L2 (m)
    xMatrixLocation: "mid",// X-Matrix junction location ("mid" = midpoint, "end" = end of line 1)
    L: 21.0,              // Roof Length (m)
    l: 12.0,              // Roof Width (m)
    roofShape: "flat",    // Roof Shape ("flat", "sloped", "triangle")
    roofSlope: 15,        // Slope angle in degrees
    nbUsers: 1,           // Max Active Users
    fallFactor: 1,        // Fall Factor (0, 1, 2)
    product: "NEW PRO",   // HOOKT Product Family ("NEW PRO", "LIGHT PRO", "LONG RANGE")
    norm: "EN 795",       // Regulatory Standard
    oshaSpanMode: "unique", // OSHA/ANSI span mode: "unique" (2 anchors) or "multi" (4 anchors)
    viewMode: "3d",       // Camera View ("3d", "2d")
    roofTexture: "concrete",// Roof texture surface
    showObstacles: false, // Show skylights / obstacles flag
    gridVisible: true,    // Grid visibility flag
    lang: 0,              // Selected Language
    mountingType: "mini_omega", // Mounting type: "ground", "mini_omega", "rigide"
    checkedComponents: {
        "ground": false,
        "mini_omega": true,
        "rigide": false,
        "x_cone": false,
        "x_matrix": false,
        "absorber": true
    },
    colors: {
        roof: "#cbd5e1",
        anchors: "#f8fafc",
        cable: "#f8fafc"
    }
};

// Real 3D Component Models Database & Exploded Views
const COMPONENTS_DB = {
    "NEW PRO": [
        { id: "New_Pro", name: "NEW PRO ABSORBER", file: "models/new_pro/New_Pro.obj", checked: false, exploded: ["models/new_pro/New_Pro_exploded1.png", "models/new_pro/New_Pro_exploded2.png", "models/new_pro/New_Pro_exploded3.png"] },
        { id: "X-Matrix", name: "X-MATRIX JONCTION MULTIDIRECTIONNELLE", file: "models/new_pro/X-Matrix.obj", checked: false, exploded: ["models/new_pro/X-Matrix_exploded1.png", "models/new_pro/X-Matrix_exploded2.png", "models/new_pro/X-Matrix_exploded3.png"] },
        { id: "Mini_Omega", name: "MINI OMEGA", file: "models/new_pro/Mini_Omega.obj", checked: false, exploded: ["models/new_pro/Mini_Omega_exploded1.png", "models/new_pro/Mini_Omega_exploded2.png", "models/new_pro/Mini_Omega_exploded3.png"] },
        { id: "P_Inox", name: "POTELET INOX RIGIDE", file: "models/new_pro/P_Inox_Rigide.obj", checked: false, exploded: ["models/new_pro/P_Inox_Rigide_exploded1.png", "models/new_pro/P_Inox_Rigide_exploded2.png", "models/new_pro/P_Inox_Rigide_exploded3.png"] },
        { id: "X-Cone", name: "X-CONE", file: "models/new_pro/X-Cone.obj", checked: false, exploded: ["models/new_pro/X-Cone_exploded1.png", "models/new_pro/X-Cone_exploded3.png"] }
    ],
    "LIGHT PRO": [
        { id: "LightPro", name: "LIGHT PRO ABSORBER", file: "models/light_pro/LightPro.obj", checked: false, exploded: ["models/light_pro/LightPro_exploded1.png", "models/light_pro/LightPro_exploded2.png", "models/light_pro/LightPro_exploded3.png"] },
        { id: "PB_HOOKt", name: "POTELET PB HOOKT", file: "models/light_pro/PB_HOOKt.obj", checked: false, exploded: ["models/light_pro/PB_HOOKT_exploded1.png", "models/light_pro/PB_HOOKT_exploded2.png", "models/light_pro/PB_HOOKT_exploded3.png"] },
        { id: "P_Galva", name: "POTELET GALVA RIGIDE", file: "models/light_pro/P_Galva_Rigide.obj", checked: false, exploded: ["models/light_pro/P_Galva_Rigide_exploded1.png", "models/light_pro/P_Galva_Rigide_exploded2.png", "models/light_pro/P_Galva_Rigide_exploded3.png"] },
        { id: "P_Inox", name: "POTELET INOX RIGIDE", file: "models/light_pro/P_Inox_Rigide.obj", checked: false, exploded: ["models/light_pro/P_Inox_Rigide_exploded1.png", "models/light_pro/P_Inox_Rigide_exploded2.png", "models/light_pro/P_Inox_Rigide_exploded3.png"] }
    ],
    "LONG RANGE": [
        { id: "LongRange", name: "LONG RANGE HEAVY ABSORBER", file: "models/long_range/LongRange.obj", checked: false, exploded: ["models/long_range/LongRange_exploded1.png", "models/long_range/LongRange_exploded2.png", "models/long_range/LongRange_exploded3.png"] },
        { id: "A-Fix", name: "A-FIX ANCHOR", file: "models/long_range/A-Fix.obj", checked: false, exploded: ["models/long_range/A-Fix_exploded1.png", "models/long_range/A-Fix_exploded2.png"] }
    ]
};

// 3D OBJ Models Cache
const objCache = {};
const objLoader = new THREE.OBJLoader();

function loadOBJModel(filePath) {
    if (objCache[filePath]) {
        return Promise.resolve(objCache[filePath]);
    }
    return new Promise((resolve) => {
        objLoader.load(
            filePath,
            (object) => {
                objCache[filePath] = object;
                resolve(object);
            },
            undefined,
            () => resolve(null)
        );
    });
}

function preloadActiveModels() {
    const list = COMPONENTS_DB[state.product] || [];
    const files = list.map(c => c.file).filter(Boolean);
    const uniqueFiles = [...new Set(files)];
    const promises = uniqueFiles.map(f => loadOBJModel(f));

    Promise.all(promises).then(() => {
        if (typeof update3DScene === "function") update3DScene();
    });
}

// ==========================================
// ==========================================
// CALCULATOR ENGINE & DATASETS (EN 795 / TS 16415 & OSHA/ANSI)
// ==========================================

const newProPredictRecords = [
    { configId: "GP1", zone: "Grande portée", portee: 15, direction: "sol_mur", ancrage: "ocho+", users: 1, fmax_ancre: 5.1, force_ext1: 13.9, force_ext2: 13.7, fleche: 1300, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "GP5", zone: "Grande portée", portee: 15, direction: "omega", ancrage: "ocho+", users: 1, fmax_ancre: 4.4, force_ext1: 12.2, force_ext2: 12.2, fleche: 1290, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "GP9", zone: "Grande portée", portee: 15, direction: "omega_mini", ancrage: "ocho+", users: 1, fmax_ancre: 4.7, force_ext1: 12.9, force_ext2: 12.5, fleche: 1410, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "GP10", zone: "Grande portée", portee: 15, direction: "overhead", ancrage: "ocho+", users: 1, fmax_ancre: 4.4, force_ext1: 10.8, force_ext2: 10.4, fleche: 1640, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "PP1", zone: "Grande portée", portee: 3, direction: "sol_mur", ancrage: "ocho+", users: 1, fmax_ancre: 6.4, force_ext1: 9.7, force_ext2: 9.6, fleche: 490, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "PP5", zone: "Grande portée", portee: 3, direction: "omega", ancrage: "ocho+", users: 1, fmax_ancre: 5.0, force_ext1: 7.1, force_ext2: 7.2, fleche: 495, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "PP9", zone: "Grande portée", portee: 3, direction: "omega_mini", ancrage: "ocho+", users: 1, fmax_ancre: 5.7, force_ext1: 10.1, force_ext2: 10.0, fleche: 450, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "PP10", zone: "Grande portée", portee: 3, direction: "overhead", ancrage: "ocho+", users: 1, fmax_ancre: 7.2, force_ext1: 11.3, force_ext2: 11.1, fleche: 485, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "GP1", zone: "Grande portée", portee: 15, direction: "sol_mur", ancrage: "ocho+", users: 2, fmax_ancre: 6.15, force_ext1: 13.9, force_ext2: 13.85, fleche: 1700, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "GP1", zone: "Grande portée", portee: 15, direction: "sol_mur", ancrage: "ocho+", users: 3, fmax_ancre: 7.2, force_ext1: 13.9, force_ext2: 14.0, fleche: 2105, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "GP1", zone: "Grande portée", portee: 15, direction: "sol_mur", ancrage: "ocho+", users: 4, fmax_ancre: 7.6, force_ext1: 14.7, force_ext2: 14.7, fleche: 2105, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "GP1", zone: "Grande portée", portee: 15, direction: "sol_mur", ancrage: "ocho+", users: 5, fmax_ancre: 8.3, force_ext1: 16.0, force_ext2: 16.0, fleche: 2105, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "GP5", zone: "Grande portée", portee: 15, direction: "omega", ancrage: "ocho+", users: 2, fmax_ancre: 5.45, force_ext1: 12.6, force_ext2: 12.6, fleche: 1550, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "GP5", zone: "Grande portée", portee: 15, direction: "omega", ancrage: "ocho+", users: 3, fmax_ancre: 6.5, force_ext1: 13.0, force_ext2: 13.0, fleche: 1810, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "GP5", zone: "Grande portée", portee: 15, direction: "omega", ancrage: "ocho+", users: 4, fmax_ancre: 6.8, force_ext1: 14.1, force_ext2: 13.9, fleche: 1830, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "GP5", zone: "Grande portée", portee: 15, direction: "omega", ancrage: "ocho+", users: 5, fmax_ancre: 7.3, force_ext1: 14.8, force_ext2: 14.6, fleche: 1875, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "GP9", zone: "Grande portée", portee: 15, direction: "omega_mini", ancrage: "ocho+", users: 2, fmax_ancre: 6.1, force_ext1: 13.25, force_ext2: 13.2, fleche: 1760, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "GP9", zone: "Grande portée", portee: 15, direction: "omega_mini", ancrage: "ocho+", users: 3, fmax_ancre: 7.5, force_ext1: 13.6, force_ext2: 13.9, fleche: 2110, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "GP9", zone: "Grande portée", portee: 15, direction: "omega_mini", ancrage: "ocho+", users: 4, fmax_ancre: 7.8, force_ext1: 14.1, force_ext2: 14.4, fleche: 2110, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "GP9", zone: "Grande portée", portee: 15, direction: "omega_mini", ancrage: "ocho+", users: 5, fmax_ancre: 8.5, force_ext1: 15.6, force_ext2: 15.8, fleche: 2110, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "GP10", zone: "Grande portée", portee: 15, direction: "overhead", ancrage: "ocho+", users: 2, fmax_ancre: 5.8, force_ext1: 12.8, force_ext2: 12.6, fleche: 1745, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "GP10", zone: "Grande portée", portee: 15, direction: "overhead", ancrage: "ocho+", users: 3, fmax_ancre: 7.2, force_ext1: 14.8, force_ext2: 14.8, fleche: 1850, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "GP10", zone: "Grande portée", portee: 15, direction: "overhead", ancrage: "ocho+", users: 4, fmax_ancre: 7.2, force_ext1: 14.8, force_ext2: 14.8, fleche: 1860, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "GP10", zone: "Grande portée", portee: 15, direction: "overhead", ancrage: "ocho+", users: 5, fmax_ancre: 8.0, force_ext1: 16.2, force_ext2: 16.2, fleche: 1860, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "PP1", zone: "Grande portée", portee: 3, direction: "sol_mur", ancrage: "ocho+", users: 2, fmax_ancre: 7.95, force_ext1: 11.0, force_ext2: 11.0, fleche: 532, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "PP1", zone: "Grande portée", portee: 3, direction: "sol_mur", ancrage: "ocho+", users: 3, fmax_ancre: 9.5, force_ext1: 12.3, force_ext2: 12.4, fleche: 575, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "PP1", zone: "Grande portée", portee: 3, direction: "sol_mur", ancrage: "ocho+", users: 4, fmax_ancre: 9.9, force_ext1: 13.1, force_ext2: 13.2, fleche: 585, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "PP1", zone: "Grande portée", portee: 3, direction: "sol_mur", ancrage: "ocho+", users: 5, fmax_ancre: 9.8, force_ext1: 12.6, force_ext2: 12.7, fleche: 610, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "PP5", zone: "Grande portée", portee: 3, direction: "omega", ancrage: "ocho+", users: 2, fmax_ancre: 6.65, force_ext1: 8.85, force_ext2: 8.75, fleche: 527, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "PP5", zone: "Grande portée", portee: 3, direction: "omega", ancrage: "ocho+", users: 3, fmax_ancre: 8.3, force_ext1: 10.6, force_ext2: 10.3, fleche: 560, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "PP5", zone: "Grande portée", portee: 3, direction: "omega", ancrage: "ocho+", users: 4, fmax_ancre: 8.5, force_ext1: 10.5, force_ext2: 10.2, fleche: 560, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "PP5", zone: "Grande portée", portee: 3, direction: "omega", ancrage: "ocho+", users: 5, fmax_ancre: 8.8, force_ext1: 10.6, force_ext2: 10.4, fleche: 560, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "PP9", zone: "Grande portée", portee: 3, direction: "omega_mini", ancrage: "ocho+", users: 2, fmax_ancre: 7.2, force_ext1: 11.3, force_ext2: 11.35, fleche: 502, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "PP9", zone: "Grande portée", portee: 3, direction: "omega_mini", ancrage: "ocho+", users: 3, fmax_ancre: 8.7, force_ext1: 12.5, force_ext2: 12.7, fleche: 555, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "PP9", zone: "Grande portée", portee: 3, direction: "omega_mini", ancrage: "ocho+", users: 4, fmax_ancre: 8.9, force_ext1: 11.5, force_ext2: 12.0, fleche: 585, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "PP9", zone: "Grande portée", portee: 3, direction: "omega_mini", ancrage: "ocho+", users: 5, fmax_ancre: 9.1, force_ext1: 11.8, force_ext2: 11.8, fleche: 625, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "PP10", zone: "Grande portée", portee: 3, direction: "overhead", ancrage: "ocho+", users: 2, fmax_ancre: 8.55, force_ext1: 13.35, force_ext2: 13.25, fleche: 495, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "PP10", zone: "Grande portée", portee: 3, direction: "overhead", ancrage: "ocho+", users: 3, fmax_ancre: 9.9, force_ext1: 15.4, force_ext2: 15.4, fleche: 505, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "PP10", zone: "Grande portée", portee: 3, direction: "overhead", ancrage: "ocho+", users: 4, fmax_ancre: 10.2, force_ext1: 15.4, force_ext2: 15.4, fleche: 505, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "PP10", zone: "Grande portée", portee: 3, direction: "overhead", ancrage: "ocho+", users: 5, fmax_ancre: 10.3, force_ext1: 15.4, force_ext2: 15.5, fleche: 505, supportType: "Rigide", fallFactor: 2.0 }
];

const longRangePredictRecords = [
    { portee: 56.0, users: 1, fmax_ancre: 4.0, force_ext1: 17.9, force_ext2: 18.0, fleche: 2600.0, configId: "EN795" },
    { portee: 56.0, users: 2, fmax_ancre: 4.55, force_ext1: 19.45, force_ext2: 19.6, fleche: 2930.0, configId: "TS16415" },
    { portee: 56.0, users: 3, fmax_ancre: 5.1, force_ext1: 21.0, force_ext2: 21.2, fleche: 3260.0, configId: "TS16415" },
    { portee: 34.0, users: 1, fmax_ancre: 4.5, force_ext1: 16.3, force_ext2: 16.8, fleche: 2450.0, configId: "EN795" },
    { portee: 34.0, users: 2, fmax_ancre: 5.8, force_ext1: 17.7, force_ext2: 18.35, fleche: 2810.0, configId: "TS16415" },
    { portee: 34.0, users: 3, fmax_ancre: 7.1, force_ext1: 19.1, force_ext2: 19.9, fleche: 3170.0, configId: "TS16415" },
    { portee: 10.0, users: 1, fmax_ancre: 4.8, force_ext1: 14.0, force_ext2: 14.7, fleche: 780.0, configId: "EN795" },
    { portee: 10.0, users: 2, fmax_ancre: 6.45, force_ext1: 17.95, force_ext2: 18.55, fleche: 842.0, configId: "TS16415" },
    { portee: 10.0, users: 3, fmax_ancre: 8.1, force_ext1: 21.9, force_ext2: 22.4, fleche: 905.0, configId: "TS16415" }
];

function calculateTriangleTension(fmax_ancre, portee, fleche) {
    if (fleche <= 0.0) return 0.0;
    const f_m = fleche / 1000.0;
    return fmax_ancre * Math.sqrt(portee * portee + 4.0 * f_m * f_m) / (4.0 * f_m);
}

function getBaselineFmax(system, users, portee, supportType) {
    const sType = (supportType || "").toLowerCase();
    if (system === "LIGHT PRO") {
        const t = Math.max(0.0, Math.min(1.0, (portee - 2.0) / (15.0 - 2.0)));
        if (sType.includes("hookt")) {
            if (users === 1) return 5.6 + t * (5.0 - 5.6);
            if (users === 2) return 6.3 + t * (6.2 - 6.3);
            if (users === 3) return 7.0 + t * (7.4 - 7.0);
            return 7.4;
        } else if (sType.includes("pb250")) {
            if (users === 1) return 5.6 + t * (8.3 - 5.6);
            if (users === 2) return 6.0 + t * (7.4 - 6.0);
            return 8.3;
        } else {
            if (users === 1) return 6.4 + t * (6.3 - 6.4);
            if (users === 2) return 5.75 + t * (5.7 - 5.75);
            if (users === 3) return 5.1;
            return 4.7;
        }
    }
    if (system === "LONG RANGE" || system === "LongRange") {
        let f10 = 4.8, f34 = 4.5, f56 = 4.0;
        let usersToUse = Math.max(1, Math.min(users, 3));
        if (usersToUse === 2) { f10 = 6.45; f34 = 5.8; f56 = 4.55; }
        else if (usersToUse === 3) { f10 = 8.1; f34 = 7.1; f56 = 5.1; }

        if (portee <= 10.0) return f10;
        if (portee <= 34.0) {
            const t = (portee - 10.0) / (34.0 - 10.0);
            return f10 + t * (f34 - f10);
        }
        if (portee <= 56.0) {
            const t = (portee - 34.0) / (56.0 - 34.0);
            return f34 + t * (f56 - f34);
        }
        const t = (portee - 34.0) / (56.0 - 34.0);
        const val = f34 + t * (f56 - f34);
        return val < 2.0 ? 2.0 : val;
    }
    return 6.0;
}

function getActiveSupport() {
    if (typeof state === 'undefined') return "omega_mini";
    const list = (typeof COMPONENTS_DB !== 'undefined' ? COMPONENTS_DB[state.product] : []) || [];
    const checked = list.find(c => c.checked);
    if (checked) {
        const id = checked.id.toLowerCase();
        if (id.includes("mini")) return "omega_mini";
        if (id.includes("pb_hookt") || id.includes("hookt")) return "hookt";
        if (id.includes("galva")) return "pb250";
        if (id.includes("omega")) return "omega";
        if (id.includes("overhead")) return "overhead";
    }
    return state.mountingType || "omega_mini";
}

function getActivePostName() {
    if (typeof state === 'undefined') return "MINI OMEGA";
    const list = (typeof COMPONENTS_DB !== 'undefined' ? COMPONENTS_DB[state.product] : []) || [];
    const postComp = list.find(c => c.id !== "Contre_Plaque" && c.id !== "X-Cone" && c.id !== "Pack_Matrix" && c.id !== "X-Matrix" && c.id !== "New_Pro" && c.id !== "LightPro" && c.id !== "LongRange" && c.checked);
    if (postComp) return postComp.name;
    if (state.product === "NEW PRO") return "MINI OMEGA";
    if (state.product === "LIGHT PRO") return "Potelet Basculant";
    if (state.product === "LONG RANGE") return "A-FIX";
    return "Potelet / Ancrage";
}

const Calculator = {
    getMaxSpan: function (product) {
        if (product === "LONG RANGE" || product === "LongRange") return 56.0;
        return 15.0;
    },

    calculateAnchorPositions: function (L, l, maxSpan) {
        const lineLenTotal = state.lineLength;
        const marginPerEnd = (state.product === "LONG RANGE") ? 0.30 : 0.20;
        const lineLen = Math.max(0.5, lineLenTotal - 2 * marginPerEnd);

        // On sloped mono-pitch roof, Line 1 runs along Z (slope direction)
        if (state.roofShape === "sloped") {
            const slopeRad = (state.roofSlope || 15) * (Math.PI / 180);
            const line1LenGround = lineLen * Math.cos(slopeRad);

            state.l = lineLenTotal * Math.cos(slopeRad) + 6.0;
            state.L = state.hasLine2 ? Math.max(12.0, state.line2Length + 6.0) : 12.0;

            const startZ = 3.0 + marginPerEnd * Math.cos(slopeRad);
            const xPos = 3.0;
            const line1Nodes = [];
            const intCount1 = Math.max(1, Math.ceil(lineLen / maxSpan));
            const step1Ground = line1LenGround / intCount1;

            for (let i = 0; i <= intCount1; i++) {
                const z = startZ + i * step1Ground;
                const type = (i === 0 || i === intCount1) ? "extremite" : "intermediaire";
                line1Nodes.push({
                    x: parseFloat(xPos.toFixed(2)),
                    y: 0.0,
                    z: parseFloat(z.toFixed(4)),
                    type: type,
                    rotY: Math.PI / 2,
                    line: 1
                });
            }

            if (state.hasLine2) {
                const line2Nodes = [];
                const endZ = startZ + line1LenGround;
                const line2LenTotal = state.line2Length;
                const line2Len = Math.max(0.5, line2LenTotal - marginPerEnd);
                const intCount2 = Math.max(1, Math.ceil(line2Len / maxSpan));
                const step2 = line2Len / intCount2;

                for (let j = 1; j <= intCount2; j++) {
                    const x2 = xPos + j * step2;
                    const type2 = (j === intCount2) ? "extremite" : "intermediaire";
                    line2Nodes.push({
                        x: parseFloat(x2.toFixed(2)),
                        y: 0.0,
                        z: parseFloat(endZ.toFixed(2)),
                        type: type2,
                        rotY: 0,
                        line: 2
                    });
                }

                return {
                    line1: line1Nodes,
                    line2: line2Nodes,
                    junctionNode: line1Nodes[line1Nodes.length - 1],
                    all: [...line1Nodes, ...line2Nodes]
                };
            }

            return {
                line1: line1Nodes,
                line2: [],
                junctionNode: null,
                all: line1Nodes
            };
        }

        // Determine roof dimensions based on line 1 and line 2 lengths
        state.L = lineLenTotal + 6.0;
        if (state.hasLine2) {
            state.l = Math.max(12.0, state.line2Length + 6.0);
        } else {
            state.l = 12.0;
        }

        const startX = 3.0 + marginPerEnd;
        const zPos = (state.roofShape === "triangle") ? state.l / 2 : 3.0;

        // Handle X-Matrix junction location on Line 1 with 3m anchors on either side
        const isXMatrixChecked = (COMPONENTS_DB[state.product] || []).some(c => c.id === "X-Matrix" && c.checked);
        const hasJunction = state.hasLine2 || isXMatrixChecked;

        const line1Nodes = [];

        if (hasJunction) {
            const endX = startX + lineLen;

            if (state.xMatrixLocation === "end") {
                // END CORNER JUNCTION: Smooth wide-radius curve
                const cornerR = 0.8;
                const cornerX = endX;
                const cornerZ = zPos;

                // Line 1 nodes (from startX to cornerX - cornerR)
                const line1LenActual = lineLen - cornerR;
                const intCount1 = Math.max(1, Math.ceil(line1LenActual / maxSpan));
                const step1 = line1LenActual / intCount1;

                for (let i = 0; i < intCount1; i++) {
                    const x = startX + i * step1;
                    const type = (i === 0) ? "extremite" : "intermediaire";
                    line1Nodes.push({ x: parseFloat(x.toFixed(2)), y: 0.0, z: parseFloat(zPos.toFixed(2)), type: type, line: 1 });
                }

                // Post 1 (positioned on Line 1 at cornerX - cornerR, aligned with Line 1)
                const cornerPost1 = {
                    x: parseFloat((cornerX - cornerR).toFixed(2)),
                    y: 0.0,
                    z: parseFloat(cornerZ.toFixed(2)),
                    type: "intermediaire",
                    rotY: 0,
                    line: 1
                };
                line1Nodes.push(cornerPost1);

                // Line 2 nodes (starting at cornerZ + cornerR)
                if (state.hasLine2) {
                    const line2Nodes = [];

                    // Post 2 (positioned on Line 2 at cornerZ + cornerR, rotated 180° on Y-axis)
                    const cornerPost2 = {
                        x: parseFloat(cornerX.toFixed(2)),
                        y: 0.0,
                        z: parseFloat((cornerZ + cornerR).toFixed(2)),
                        type: "intermediaire",
                        rotY: (3 * Math.PI) / 2,
                        line: 2
                    };
                    line2Nodes.push(cornerPost2);

                    const line2LenTotal = state.line2Length;
                    const line2Len = Math.max(0.5, line2LenTotal - marginPerEnd);
                    const line2LenActual = line2Len - cornerR;
                    if (line2LenActual <= 0) {
                        line2Nodes[0].type = "extremite";
                    } else {
                        const intCountL2 = Math.max(1, Math.ceil(line2LenActual / maxSpan));
                        const stepL2 = line2LenActual / intCountL2;

                        for (let j = 1; j <= intCountL2; j++) {
                            const z2 = cornerZ + cornerR + j * stepL2;
                            const type2 = (j === intCountL2) ? "extremite" : "intermediaire";
                            line2Nodes.push({
                                x: parseFloat(cornerX.toFixed(2)),
                                y: 0.0,
                                z: parseFloat(z2.toFixed(2)),
                                type: type2,
                                line: 2
                            });
                        }
                    }

                    return {
                        line1: line1Nodes,
                        line2: line2Nodes,
                        junctionNode: cornerPost1,
                        all: [...line1Nodes, ...line2Nodes]
                    };
                }
            } else {
                // MIDPOINT T-JUNCTION with X-Matrix
                const line1MidX = startX + lineLen / 2;
                const xj = parseFloat(line1MidX.toFixed(2));

                // Start extremity
                line1Nodes.push({ x: parseFloat(startX.toFixed(2)), y: 0.0, z: parseFloat(zPos.toFixed(2)), type: "extremite", line: 1 });

                // Segment 1 (startX to xj - 3.0)
                const left3mX = xj - 3.0;
                if (left3mX > startX + 0.5) {
                    const seg1Len = left3mX - startX;
                    const intCount1 = Math.max(1, Math.ceil(seg1Len / maxSpan));
                    const step1 = seg1Len / intCount1;
                    for (let k = 1; k < intCount1; k++) {
                        const xk = startX + k * step1;
                        line1Nodes.push({ x: parseFloat(xk.toFixed(2)), y: 0.0, z: parseFloat(zPos.toFixed(2)), type: "intermediaire", line: 1 });
                    }
                    line1Nodes.push({ x: parseFloat(left3mX.toFixed(2)), y: 0.0, z: parseFloat(zPos.toFixed(2)), type: "intermediaire", line: 1 });
                }

                // X-Matrix junction node
                const jNode = { x: xj, y: 0.0, z: parseFloat(zPos.toFixed(2)), type: "x_matrix", compId: "X-Matrix", line: 1 };
                line1Nodes.push(jNode);

                // Segment 2 (xj + 3.0 to endX)
                const right3mX = xj + 3.0;
                if (right3mX < endX - 0.5) {
                    line1Nodes.push({ x: parseFloat(right3mX.toFixed(2)), y: 0.0, z: parseFloat(zPos.toFixed(2)), type: "intermediaire", line: 1 });
                    const seg2Len = endX - right3mX;
                    const intCount2 = Math.max(1, Math.ceil(seg2Len / maxSpan));
                    const step2 = seg2Len / intCount2;
                    for (let k = 1; k < intCount2; k++) {
                        const xk = right3mX + k * step2;
                        line1Nodes.push({ x: parseFloat(xk.toFixed(2)), y: 0.0, z: parseFloat(zPos.toFixed(2)), type: "intermediaire", line: 1 });
                    }
                }

                // End extremity
                line1Nodes.push({ x: parseFloat(endX.toFixed(2)), y: 0.0, z: parseFloat(zPos.toFixed(2)), type: "extremite", line: 1 });

                if (state.hasLine2) {
                    const line2LenTotal = state.line2Length;
                    const line2Len = Math.max(0.5, line2LenTotal - marginPerEnd);
                    const line2Nodes = [];

                    if (line2Len <= 3.0) {
                        line2Nodes.push({ x: jNode.x, y: 0.0, z: parseFloat((jNode.z + line2Len).toFixed(2)), type: "extremite", line: 2 });
                    } else {
                        line2Nodes.push({ x: jNode.x, y: 0.0, z: parseFloat((jNode.z + 3.0).toFixed(2)), type: "intermediaire", line: 2 });
                        const remLen = line2Len - 3.0;
                        const intCountL2 = Math.max(1, Math.ceil(remLen / maxSpan));
                        const stepL2 = remLen / intCountL2;

                        for (let j = 1; j <= intCountL2; j++) {
                            const z2 = jNode.z + 3.0 + j * stepL2;
                            const type2 = (j === intCountL2) ? "extremite" : "intermediaire";
                            line2Nodes.push({ x: jNode.x, y: 0.0, z: parseFloat(z2.toFixed(2)), type: type2, line: 2 });
                        }
                    }

                    return {
                        line1: line1Nodes,
                        line2: line2Nodes,
                        junctionNode: jNode,
                        all: [...line1Nodes, ...line2Nodes]
                    };
                }
            }
        } else {
            // Standard line 1 layout
            const endX = startX + lineLen;
            const intCount1 = Math.max(1, Math.ceil(lineLen / maxSpan));
            const step1 = lineLen / intCount1;

            for (let i = 0; i <= intCount1; i++) {
                const x = startX + i * step1;
                const type = (i === 0 || i === intCount1) ? "extremite" : "intermediaire";
                line1Nodes.push({
                    x: parseFloat(x.toFixed(2)),
                    y: 0.0,
                    z: parseFloat(zPos.toFixed(2)),
                    type: type,
                    line: 1
                });
            }
        }

        return {
            line1: line1Nodes,
            line2: [],
            junctionNode: null,
            all: line1Nodes
        };
    },

    calculateTotalLineLength: function (layout, product) {
        const prod = product || (typeof state !== 'undefined' ? state.product : "NEW PRO");
        const marginPerEnd = (prod === "LONG RANGE") ? 0.30 : 0.20;

        if (!layout) return 0.0;

        if (layout.line1 && Array.isArray(layout.line1)) {
            let total = 0.0;
            if (layout.line1.length >= 2) {
                for (let i = 0; i < layout.line1.length - 1; i++) {
                    const p1 = layout.line1[i];
                    const p2 = layout.line1[i + 1];
                    const y1 = p1.y + (typeof getRoofHeightAt === 'function' ? getRoofHeightAt(p1.x, p1.z) : 0);
                    const y2 = p2.y + (typeof getRoofHeightAt === 'function' ? getRoofHeightAt(p2.x, p2.z) : 0);
                    total += Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(y1 - y2, 2) + Math.pow(p1.z - p2.z, 2));
                }
                total += 2 * marginPerEnd;
            }

            if (layout.line2 && layout.line2.length > 0 && layout.junctionNode) {
                const jNode = layout.junctionNode;
                const pFirst = layout.line2[0];
                const yJ = jNode.y + (typeof getRoofHeightAt === 'function' ? getRoofHeightAt(jNode.x, jNode.z) : 0);
                const yF = pFirst.y + (typeof getRoofHeightAt === 'function' ? getRoofHeightAt(pFirst.x, pFirst.z) : 0);
                total += Math.sqrt(Math.pow(jNode.x - pFirst.x, 2) + Math.pow(yJ - yF, 2) + Math.pow(jNode.z - pFirst.z, 2));

                for (let i = 0; i < layout.line2.length - 1; i++) {
                    const p1 = layout.line2[i];
                    const p2 = layout.line2[i + 1];
                    const y1 = p1.y + (typeof getRoofHeightAt === 'function' ? getRoofHeightAt(p1.x, p1.z) : 0);
                    const y2 = p2.y + (typeof getRoofHeightAt === 'function' ? getRoofHeightAt(p2.x, p2.z) : 0);
                    total += Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(y1 - y2, 2) + Math.pow(p1.z - p2.z, 2));
                }
                total += marginPerEnd;
            }
            return total;
        }

        const positions = Array.isArray(layout) ? layout : (layout.all || []);
        if (positions.length < 2) return 0.0;
        let total = 0.0;
        for (let i = 0; i < positions.length - 1; i++) {
            const p1 = positions[i];
            const p2 = positions[i + 1];
            const y1 = p1.y + (typeof getRoofHeightAt === 'function' ? getRoofHeightAt(p1.x, p1.z) : 0);
            const y2 = p2.y + (typeof getRoofHeightAt === 'function' ? getRoofHeightAt(p2.x, p2.z) : 0);
            total += Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(y1 - y2, 2) + Math.pow(p1.z - p2.z, 2));
        }
        return total + 2 * marginPerEnd;
    },

    calculateMaxRealSpan: function (layout) {
        if (!layout) return 0.0;
        let maxDist = 0.0;

        function getSpanInList(nodesList) {
            if (!nodesList || nodesList.length < 2) return;
            for (let i = 0; i < nodesList.length - 1; i++) {
                const p1 = nodesList[i];
                const p2 = nodesList[i + 1];
                const y1 = p1.y + (typeof getRoofHeightAt === 'function' ? getRoofHeightAt(p1.x, p1.z) : 0);
                const y2 = p2.y + (typeof getRoofHeightAt === 'function' ? getRoofHeightAt(p2.x, p2.z) : 0);
                const dist = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(y1 - y2, 2) + Math.pow(p1.z - p2.z, 2));
                if (dist > maxDist) maxDist = dist;
            }
        }

        const line1 = layout.line1 || (Array.isArray(layout) ? layout : []);
        getSpanInList(line1);

        if (layout.line2 && layout.line2.length > 0 && layout.junctionNode) {
            const jNode = layout.junctionNode;
            const p2First = layout.line2[0];
            const y1 = jNode.y + (typeof getRoofHeightAt === 'function' ? getRoofHeightAt(jNode.x, jNode.z) : 0);
            const y2 = p2First.y + (typeof getRoofHeightAt === 'function' ? getRoofHeightAt(p2First.x, p2First.z) : 0);
            const distJ = Math.sqrt(Math.pow(jNode.x - p2First.x, 2) + Math.pow(y1 - y2, 2) + Math.pow(jNode.z - p2First.z, 2));
            if (distJ > maxDist) maxDist = distJ;

            getSpanInList(layout.line2);
        }

        return maxDist;
    },

    effortLonge: function (product, span, nbUsers, norm, fallFactor = 1, support = "omega_mini", isMultiSpan = false) {
        if (norm === "OSHA/ANSI" || norm === "OSHA" || norm === "ANSI") {
            let k_FC = fallFactor <= 0.0 ? 0.5 : (fallFactor < 1.0 ? 0.5 + fallFactor * (Math.sqrt(0.5) - 0.5) : (fallFactor < 2.0 ? Math.sqrt(0.5) + (fallFactor - 1.0) * (1.0 - Math.sqrt(0.5)) : 1.0));
            const u = Math.max(1, Math.min(5, nbUsers));
            const F_user = 1.37 * u + 4.65;
            if (product === "NEW PRO") {
                const spanClamped = Math.max(3.0, Math.min(15.2, span));
                const spanRatio = (15.2 - spanClamped) / (15.2 - 3.0);
                let k_support = 1.0;
                if (support === "omega") k_support = 5.0 / 5.7;
                else if (support === "sol_mur") k_support = 6.4 / 5.7;
                else if (support === "overhead") k_support = 7.2 / 5.7;
                return F_user * (5.7 / 11.5) * k_support * k_FC * (1.0 + 0.15 * spanRatio);
            }
            return F_user * k_FC;
        }

        if (fallFactor <= 0.0) return 1.0 * nbUsers;

        let fancre_ref = 6.0;
        if (product === "LIGHT PRO") {
            fancre_ref = getBaselineFmax("LIGHT PRO", nbUsers, span, support);
        } else if (product === "LONG RANGE" || product === "LongRange") {
            fancre_ref = getBaselineFmax("LONG RANGE", nbUsers, span, support);
        } else if (product === "NEW PRO") {
            let searchDir = (support || "").toLowerCase().includes("mini") ? "omega_mini" : ((support || "").toLowerCase().includes("omega") ? "omega" : ((support || "").toLowerCase().includes("overhead") ? "overhead" : "sol_mur"));
            const rec_3 = newProPredictRecords.find(r => r.direction === searchDir && r.users === nbUsers && r.portee === 3.0);
            const rec_15 = newProPredictRecords.find(r => r.direction === searchDir && r.users === nbUsers && r.portee === 15.0);
            if (rec_3 && rec_15) {
                const t = Math.max(0.0, Math.min(1.0, (span - 3.0) / 12.0));
                fancre_ref = rec_3.fmax_ancre + t * (rec_15.fmax_ancre - rec_3.fmax_ancre);
            } else fancre_ref = 5.10;
        }

        let k_fc = fallFactor >= 2.0 ? 1.0 : (fallFactor === 1.0 ? Math.sqrt(0.5) : (fallFactor > 0.0 ? 0.25 + fallFactor * (Math.sqrt(0.5) - 0.25) : 0.25));
        return fancre_ref * k_fc;
    },

    deflection: function (product, span, fallFactor = 1, support = "omega_mini", nbUsers = 1, norm = "EN 795", isMultiSpan = false) {
        if (norm === "OSHA/ANSI" || norm === "OSHA" || norm === "ANSI") {
            let k_FC = fallFactor <= 0.0 ? 0.5 : (fallFactor < 1.0 ? 0.5 + fallFactor * (Math.sqrt(0.5) - 0.5) : (fallFactor < 2.0 ? Math.sqrt(0.5) + (fallFactor - 1.0) * (1.0 - Math.sqrt(0.5)) : 1.0));
            const u = Math.max(1, Math.min(5, nbUsers));
            const F_user = 1.37 * u + 4.65;
            if (product === "NEW PRO") {
                const spanRatio = Math.max(2.0, Math.min(15.2, span)) / 15.2;
                let k_support = support === "omega" ? 1290 / 1410 : (support === "sol_mur" ? 1300 / 1410 : (support === "overhead" ? 1640 / 1410 : 1.0));
                return (isMultiSpan ? 1530.0 : 2200.0) * spanRatio * (F_user / 11.5) * k_support * k_FC;
            } else if (product === "LIGHT PRO") {
                const spanRatio = Math.max(2.0, Math.min(12.2, span)) / 12.2;
                let f_ref = support === "hookt" ? (isMultiSpan ? 2250.0 : 2600.0) : (isMultiSpan ? 1500.0 : 1800.0);
                return f_ref * spanRatio * (F_user / 8.8) * k_FC;
            } else if (product === "LONG RANGE" || product === "LongRange") {
                const spanRatio = Math.max(10.0, Math.min(54.9, span)) / 54.9;
                return (isMultiSpan ? 1510.0 : 2790.0) * spanRatio * (F_user / 8.8) * k_FC;
            }
        }

        let k_fleche_fc = fallFactor >= 2.0 ? 1.0 : (fallFactor === 1.0 ? Math.sqrt(0.5) : (fallFactor > 0.0 ? 0.50 + fallFactor * (Math.sqrt(0.5) - 0.50) : 0.50));
        const fmax_ancre_calc = this.effortLonge(product, span, nbUsers, norm, fallFactor, support, isMultiSpan);

        if (product === "LONG RANGE" || product === "LongRange") {
            let usersToUse = Math.max(1, Math.min(3, nbUsers));
            const matchingRecs = longRangePredictRecords.filter(r => r.users === usersToUse).sort((a, b) => a.portee - b.portee);
            if (matchingRecs.length > 0) {
                let rec1 = matchingRecs[0], rec2 = matchingRecs[0];
                if (span > 10.0 && span <= 34.0) { rec1 = matchingRecs[0]; rec2 = matchingRecs[1]; }
                else if (span > 34.0) { rec1 = matchingRecs[1]; rec2 = matchingRecs[2] || matchingRecs[1]; }
                let t = rec2.portee > rec1.portee ? (span - rec1.portee) / (rec2.portee - rec1.portee) : 0.0;
                let fleche_ref = Math.max(10.0, rec1.fleche + t * (rec2.fleche - rec1.fleche));
                let fancre_ref = rec1.fmax_ancre + t * (rec2.fmax_ancre - rec1.fmax_ancre);
                return Math.round(fleche_ref * k_fleche_fc * Math.sqrt(fancre_ref > 0.0 ? Math.max(0.0, fmax_ancre_calc / fancre_ref) : 1.0));
            }
            return 780.0;
        } else if (product === "LIGHT PRO") {
            let f_a = 771.4, f_b = 0.3453;
            const sLower = (support || "").toLowerCase();
            if (sLower.includes("pb250")) { f_a = 441.7; f_b = 0.7050; }
            else if (sLower.includes("hookt")) { f_a = 390.0; f_b = 0.6800; }
            const pred_fleche = Math.max(10.0, f_a * Math.pow(span, f_b));
            const fmax_ancre_base = getBaselineFmax("LIGHT PRO", nbUsers, span, support);
            return Math.round(pred_fleche * k_fleche_fc * Math.sqrt(fmax_ancre_base > 0.0 ? Math.max(0.0, fmax_ancre_calc / fmax_ancre_base) : 1.0));
        } else {
            let searchDir = (support || "").toLowerCase().includes("mini") ? "omega_mini" : ((support || "").toLowerCase().includes("omega") ? "omega" : ((support || "").toLowerCase().includes("overhead") ? "overhead" : "sol_mur"));
            const rec_3 = newProPredictRecords.find(r => r.direction === searchDir && r.users === nbUsers && r.portee === 3.0);
            const rec_15 = newProPredictRecords.find(r => r.direction === searchDir && r.users === nbUsers && r.portee === 15.0);
            if (rec_3 && rec_15) {
                const t = Math.max(0.0, Math.min(1.0, (span - 3.0) / 12.0));
                let fleche_pred = Math.max(10.0, rec_3.fleche + t * (rec_15.fleche - rec_3.fleche));
                let fancre_ref = rec_3.fmax_ancre + t * (rec_15.fmax_ancre - rec_3.fmax_ancre);
                return Math.round(fleche_pred * k_fleche_fc * Math.sqrt(fancre_ref > 0.0 ? Math.max(0.0, fmax_ancre_calc / fancre_ref) : 1.0));
            }
            return 500.0;
        }
    },

    extremiteForce1: function (product, span, nbUsers, norm, effortLonge, deflection, fallFactor = 1, support = "omega_mini", isMultiSpan = false) {
        if (norm === "OSHA/ANSI" || norm === "OSHA" || norm === "ANSI") {
            let k_FC = fallFactor <= 0.0 ? 0.5 : (fallFactor < 1.0 ? 0.5 + fallFactor * (Math.sqrt(0.5) - 0.5) : (fallFactor < 2.0 ? Math.sqrt(0.5) + (fallFactor - 1.0) * (1.0 - Math.sqrt(0.5)) : 1.0));
            const u = Math.max(1, Math.min(5, nbUsers));
            const F_user = 1.37 * u + 4.65;
            if (product === "NEW PRO") return (isMultiSpan ? 13.05 : 12.50) * (F_user / 11.5) * k_FC;
            if (product === "LIGHT PRO") {
                const spanRatio = 1.0 + (support === "hookt" ? 0.10 : 0.12) * ((12.2 - Math.max(2.0, Math.min(12.2, span))) / (12.2 - 2.0));
                let fext1_ref = support === "hookt" ? (isMultiSpan ? 8.30 : 9.00) : (isMultiSpan ? 13.65 : 11.60);
                return fext1_ref * (F_user / 8.8) * spanRatio * k_FC;
            }
            if (product === "LONG RANGE" || product === "LongRange") return (isMultiSpan ? 10.40 : 19.30) * (F_user / 8.8) * k_FC;
        }

        if (product === "LIGHT PRO") {
            const currentDefl = (deflection > 0.0) ? deflection : this.deflection(product, span, fallFactor, support, nbUsers, norm, isMultiSpan);
            if (currentDefl <= 0.0) return 0.0;
            const currentEffort = (effortLonge > 0.0) ? effortLonge : this.effortLonge(product, span, nbUsers, norm, fallFactor, support, isMultiSpan);
            return calculateTriangleTension(currentEffort, span, currentDefl) * 0.97 + (fallFactor <= 0.0 ? 1.0 : 0.0);
        } else if (product === "NEW PRO") {
            let searchDir = (support || "").toLowerCase().includes("mini") ? "omega_mini" : ((support || "").toLowerCase().includes("omega") ? "omega" : ((support || "").toLowerCase().includes("overhead") ? "overhead" : "sol_mur"));
            const rec_3 = newProPredictRecords.find(r => r.direction === searchDir && r.users === nbUsers && r.portee === 3.0);
            const rec_15 = newProPredictRecords.find(r => r.direction === searchDir && r.users === nbUsers && r.portee === 15.0);
            if (rec_3 && rec_15) {
                const t = Math.max(0.0, Math.min(1.0, (span - 3.0) / 12.0));
                let fancre_ref = rec_3.fmax_ancre + t * (rec_15.fmax_ancre - rec_3.fmax_ancre);
                let fext1_ref_base = rec_3.force_ext1 + t * (rec_15.force_ext1 - rec_3.force_ext1);
                const currentEffort = (effortLonge > 0.0) ? effortLonge : this.effortLonge(product, span, nbUsers, norm, fallFactor, support, isMultiSpan);
                return fext1_ref_base * (fancre_ref > 0.0 ? currentEffort / fancre_ref : 1.0) + (fallFactor <= 0.0 ? 1.0 : 0.0);
            }
            return 10.0;
        } else {
            let usersToUse = Math.max(1, Math.min(3, nbUsers));
            const matchingRecs = longRangePredictRecords.filter(r => r.users === usersToUse).sort((a, b) => a.portee - b.portee);
            if (matchingRecs.length > 0) {
                let rec1 = matchingRecs[0], rec2 = matchingRecs[0];
                if (span > 10.0 && span <= 34.0) { rec1 = matchingRecs[0]; rec2 = matchingRecs[1]; }
                else if (span > 34.0) { rec1 = matchingRecs[1]; rec2 = matchingRecs[2] || matchingRecs[1]; }
                let t = rec2.portee > rec1.portee ? (span - rec1.portee) / (rec2.portee - rec1.portee) : 0.0;
                let fancre_ref = rec1.fmax_ancre + t * (rec2.fmax_ancre - rec1.fmax_ancre);
                let fext1_ref = rec1.force_ext1 + t * (rec2.force_ext1 - rec1.force_ext1);
                const currentEffort = (effortLonge > 0.0) ? effortLonge : this.effortLonge(product, span, nbUsers, norm, fallFactor, support, isMultiSpan);
                return fext1_ref * (fancre_ref > 0.0 ? currentEffort / fancre_ref : 1.0) + (fallFactor <= 0.0 ? 1.0 : 0.0);
            }
            return 14.0;
        }
    },

    extremiteForce2: function (product, span, nbUsers, norm, effortLonge, deflection, fallFactor = 1, support = "omega_mini", isMultiSpan = false) {
        if (norm === "OSHA/ANSI" || norm === "OSHA" || norm === "ANSI") {
            let k_FC = fallFactor <= 0.0 ? 0.5 : (fallFactor < 1.0 ? 0.5 + fallFactor * (Math.sqrt(0.5) - 0.5) : (fallFactor < 2.0 ? Math.sqrt(0.5) + (fallFactor - 1.0) * (1.0 - Math.sqrt(0.5)) : 1.0));
            const u = Math.max(1, Math.min(5, nbUsers));
            const F_user = 1.37 * u + 4.65;
            if (product === "NEW PRO") return (isMultiSpan ? 12.55 : 12.05) * (F_user / 11.5) * k_FC;
            if (product === "LIGHT PRO") {
                const spanRatio = 1.0 + (support === "hookt" ? 0.10 : 0.12) * ((12.2 - Math.max(2.0, Math.min(12.2, span))) / (12.2 - 2.0));
                let fext2_ref = support === "hookt" ? (isMultiSpan ? 8.10 : 9.00) : (isMultiSpan ? 13.05 : 11.30);
                return fext2_ref * (F_user / 8.8) * spanRatio * k_FC;
            }
            if (product === "LONG RANGE" || product === "LongRange") return (isMultiSpan ? 10.20 : 18.95) * (F_user / 8.8) * k_FC;
        }

        if (product === "LIGHT PRO") {
            const currentDefl = (deflection > 0.0) ? deflection : this.deflection(product, span, fallFactor, support, nbUsers, norm, isMultiSpan);
            if (currentDefl <= 0.0) return 0.0;
            const currentEffort = (effortLonge > 0.0) ? effortLonge : this.effortLonge(product, span, nbUsers, norm, fallFactor, support, isMultiSpan);
            return calculateTriangleTension(currentEffort, span, currentDefl) * 1.03 + (fallFactor <= 0.0 ? 1.0 : 0.0);
        } else if (product === "NEW PRO") {
            let searchDir = (support || "").toLowerCase().includes("mini") ? "omega_mini" : ((support || "").toLowerCase().includes("omega") ? "omega" : ((support || "").toLowerCase().includes("overhead") ? "overhead" : "sol_mur"));
            const rec_3 = newProPredictRecords.find(r => r.direction === searchDir && r.users === nbUsers && r.portee === 3.0);
            const rec_15 = newProPredictRecords.find(r => r.direction === searchDir && r.users === nbUsers && r.portee === 15.0);
            if (rec_3 && rec_15) {
                const t = Math.max(0.0, Math.min(1.0, (span - 3.0) / 12.0));
                let fancre_ref = rec_3.fmax_ancre + t * (rec_15.fmax_ancre - rec_3.fmax_ancre);
                let fext2_ref_base = rec_3.force_ext2 + t * (rec_15.force_ext2 - rec_3.force_ext2);
                const currentEffort = (effortLonge > 0.0) ? effortLonge : this.effortLonge(product, span, nbUsers, norm, fallFactor, support, isMultiSpan);
                return fext2_ref_base * (fancre_ref > 0.0 ? currentEffort / fancre_ref : 1.0) + (fallFactor <= 0.0 ? 1.0 : 0.0);
            }
            return 10.0;
        } else {
            let usersToUse = Math.max(1, Math.min(3, nbUsers));
            const matchingRecs = longRangePredictRecords.filter(r => r.users === usersToUse).sort((a, b) => a.portee - b.portee);
            if (matchingRecs.length > 0) {
                let rec1 = matchingRecs[0], rec2 = matchingRecs[0];
                if (span > 10.0 && span <= 34.0) { rec1 = matchingRecs[0]; rec2 = matchingRecs[1]; }
                else if (span > 34.0) { rec1 = matchingRecs[1]; rec2 = matchingRecs[2] || matchingRecs[1]; }
                let t = rec2.portee > rec1.portee ? (span - rec1.portee) / (rec2.portee - rec1.portee) : 0.0;
                let fancre_ref = rec1.fmax_ancre + t * (rec2.fmax_ancre - rec1.fmax_ancre);
                let fext2_ref = rec1.force_ext2 + t * (rec2.force_ext2 - rec1.force_ext2);
                const currentEffort = (effortLonge > 0.0) ? effortLonge : this.effortLonge(product, span, nbUsers, norm, fallFactor, support, isMultiSpan);
                return fext2_ref * (fancre_ref > 0.0 ? currentEffort / fancre_ref : 1.0) + (fallFactor <= 0.0 ? 1.0 : 0.0);
            }
            return 14.0;
        }
    },

    extremiteForce3: function (product, span, nbUsers, norm, effortLonge, deflection, fallFactor = 1, support = "omega_mini", isMultiSpan = false) {
        if (!isMultiSpan) return 0.0;
        let k_FC = fallFactor <= 0.0 ? 0.5 : (fallFactor < 1.0 ? 0.5 + fallFactor * (Math.sqrt(0.5) - 0.5) : (fallFactor < 2.0 ? Math.sqrt(0.5) + (fallFactor - 1.0) * (1.0 - Math.sqrt(0.5)) : 1.0));
        if (norm === "OSHA/ANSI" || norm === "OSHA" || norm === "ANSI") {
            const u = Math.max(1, Math.min(5, nbUsers));
            const F_user = 1.37 * u + 4.65;
            if (product === "NEW PRO") return 3.90 * (F_user / 11.5) * k_FC;
            if (product === "LIGHT PRO") return (support === "hookt" ? 3.80 : 4.50) * (F_user / 8.8) * k_FC;
            if (product === "LONG RANGE" || product === "LongRange") return 3.90 * (F_user / 8.8) * k_FC;
        }
        return effortLonge * 0.35 * k_FC;
    },

    extremiteForce4: function (product, span, nbUsers, norm, effortLonge, deflection, fallFactor = 1, support = "omega_mini", isMultiSpan = false) {
        if (!isMultiSpan) return 0.0;
        let k_FC = fallFactor <= 0.0 ? 0.5 : (fallFactor < 1.0 ? 0.5 + fallFactor * (Math.sqrt(0.5) - 0.5) : (fallFactor < 2.0 ? Math.sqrt(0.5) + (fallFactor - 1.0) * (1.0 - Math.sqrt(0.5)) : 1.0));
        if (norm === "OSHA/ANSI" || norm === "OSHA" || norm === "ANSI") {
            const u = Math.max(1, Math.min(5, nbUsers));
            const F_user = 1.37 * u + 4.65;
            if (product === "NEW PRO") return 5.40 * (F_user / 11.5) * k_FC;
            if (product === "LIGHT PRO") return (support === "hookt" ? 4.20 : 5.10) * (F_user / 8.8) * k_FC;
            if (product === "LONG RANGE" || product === "LongRange") return 4.10 * (F_user / 8.8) * k_FC;
        }
        return effortLonge * 0.45 * k_FC;
    }
};

// ==========================================
// THREE.JS 3D ENGINE MODULE
// ==========================================
let scene, perspectiveCam, orthographicCam, activeCam, renderer, controls;
let roofMesh, gridHelper, anchorGroup, cableGroup, previewCableMesh, obstacleGroup;
let raycaster, mouseVector, mouseHoverPoint = null;

function initThreeEngine() {
    const container = document.getElementById("canvas3d");
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene with soft slate background for maximum 3D visual contrast
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf1f5f9);

    // 2. Cameras
    const aspect = width / height;
    perspectiveCam = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    perspectiveCam.position.set(25, 20, 25);

    const d = 20;
    orthographicCam = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 0.1, 1000);
    orthographicCam.position.set(state.L / 2, 40, state.l / 2);
    orthographicCam.lookAt(state.L / 2, 0, state.l / 2);

    activeCam = perspectiveCam;

    // 3. Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // 4. Orbit Controls
    controls = new THREE.OrbitControls(perspectiveCam, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.02;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xe2e8f0, 0.6);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(30, 40, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);

    // Groups & Raycaster
    anchorGroup = new THREE.Group();
    scene.add(anchorGroup);

    cableGroup = new THREE.Group();
    scene.add(cableGroup);

    obstacleGroup = new THREE.Group();
    scene.add(obstacleGroup);

    raycaster = new THREE.Raycaster();
    mouseVector = new THREE.Vector2();

    renderer.domElement.addEventListener("pointermove", onCanvasPointerMove);
    renderer.domElement.addEventListener("pointerdown", onCanvasPointerDown);

    window.addEventListener("resize", onWindowResize);

    preloadActiveModels();

    update3DScene();
    animate();
}

function onCanvasPointerMove(e) {
    if (!renderer || !roofMesh) return;
    const rect = renderer.domElement.getBoundingClientRect();
    mouseVector.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseVector.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    if (state.drawingMode === "draw" && state.customPoints.length > 0) {
        raycaster.setFromCamera(mouseVector, activeCam);
        const intersects = raycaster.intersectObject(roofMesh, true);
        if (intersects.length > 0) {
            const pt = intersects[0].point;
            mouseHoverPoint = new THREE.Vector3(
                Math.max(0.1, Math.min(state.L - 0.1, pt.x)),
                pt.y + 0.54,
                Math.max(0.1, Math.min(state.l - 0.1, pt.z))
            );
            updatePreviewCable();
        }
    }
}

function onCanvasPointerDown(e) {
    if (!renderer || !roofMesh) return;
    if (e.button !== 0) return;

    const rect = renderer.domElement.getBoundingClientRect();
    mouseVector.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseVector.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouseVector, activeCam);

    if (state.drawingMode === "draw") {
        const intersects = raycaster.intersectObject(roofMesh, true);
        if (intersects.length > 0) {
            const pt = intersects[0].point;
            const xClamped = Math.max(0.2, Math.min(state.L - 0.2, pt.x));
            const zClamped = Math.max(0.2, Math.min(state.l - 0.2, pt.z));

            const isFirst = state.customPoints.length === 0;
            state.customPoints.push({
                x: parseFloat(xClamped.toFixed(2)),
                y: 0.0,
                z: parseFloat(zClamped.toFixed(2)),
                type: isFirst ? "extremite" : "intermediaire"
            });

            update3DScene();
        }
    } else if (state.drawingMode === "place") {
        const intersects = raycaster.intersectObjects(anchorGroup.children, true);
        if (intersects.length > 0) {
            let hitObj = intersects[0].object;
            while (hitObj.parent && hitObj.parent !== anchorGroup) {
                hitObj = hitObj.parent;
            }
            const nodeIndex = anchorGroup.children.indexOf(hitObj);
            if (nodeIndex >= 0) {
                state.selectedNodeIndex = nodeIndex;
                highlightSelectedNode();
            }
        }
    }
}

function autoAlignNodeRotation(idx) {
    const activePositions = Calculator.calculateAnchorPositions(state.L, state.l, Calculator.getMaxSpan(state.product));
    if (idx < 0 || idx >= activePositions.length) return;

    const node = state.customPoints[idx] || activePositions[idx];
    if (activePositions.length > 1) {
        let dx = 0, dz = 0;
        if (idx < activePositions.length - 1) {
            const next = activePositions[idx + 1];
            dx = next.x - node.x;
            dz = next.z - node.z;
        } else {
            const prev = activePositions[idx - 1];
            dx = node.x - prev.x;
            dz = node.z - prev.z;
        }
        if (dx !== 0 || dz !== 0) {
            node.rotY = Math.atan2(dz, dx);
        }
    }
}

function highlightSelectedNode() {
    const card = document.getElementById("node-inspector-card");
    const activePositions = Calculator.calculateAnchorPositions(state.L, state.l, Calculator.getMaxSpan(state.product));

    if (state.selectedNodeIndex < 0 || state.selectedNodeIndex >= activePositions.length) {
        if (card) card.classList.add("hidden");
        return;
    }

    const pos = activePositions[state.selectedNodeIndex];
    const node = (state.drawingMode !== "auto" && state.customPoints[state.selectedNodeIndex]) ? state.customPoints[state.selectedNodeIndex] : pos;

    if (card) {
        card.classList.remove("hidden");
        document.getElementById("node-id-val").textContent = `#${state.selectedNodeIndex + 1}`;
        document.getElementById("node-coords-val").textContent = `X: ${node.x}m, Z: ${node.z}m`;

        let nextSpan = 0.0;
        if (state.selectedNodeIndex < activePositions.length - 1) {
            const next = activePositions[state.selectedNodeIndex + 1];
            nextSpan = Math.sqrt(Math.pow(node.x - next.x, 2) + Math.pow(node.z - next.z, 2));
        }
        document.getElementById("node-span-val").textContent = `${nextSpan.toFixed(2)}m`;
        document.getElementById("node-type-select").value = node.type || "intermediaire";

        // Update component selection dropdown
        const compSelect = document.getElementById("node-comp-select");
        if (compSelect) {
            compSelect.innerHTML = `<option value="">Standard Potelet</option>`;
            const allComps = COMPONENTS_DB[state.product] || [];
            allComps.forEach(c => {
                const opt = document.createElement("option");
                opt.value = c.id;
                opt.textContent = c.name;
                if (node.compId === c.id) opt.selected = true;
                compSelect.appendChild(opt);
            });
        }

        // Update 3D rotation slider and degree value
        const rotDeg = Math.round(((node.rotY || 0) * 180 / Math.PI) % 360);
        const normDeg = rotDeg < 0 ? rotDeg + 360 : rotDeg;
        const slider = document.getElementById("node-rot-slider");
        if (slider) slider.value = normDeg;
        const valDisp = document.getElementById("node-rot-val");
        if (valDisp) valDisp.textContent = `${normDeg}°`;
    }
}

function updatePreviewCable() {
    if (previewCableMesh) scene.remove(previewCableMesh);
    if (!mouseHoverPoint || state.customPoints.length === 0) return;

    const lastPt = state.customPoints[state.customPoints.length - 1];
    const lastRoofY = getRoofHeightAt(lastPt.x, lastPt.z);
    
    const slopeRad = (state.roofSlope || 15) * (Math.PI / 180);
    let rotX = 0;
    if (state.roofShape === "sloped") {
        rotX = -slopeRad;
    } else if (state.roofShape === "triangle") {
        const halfW = state.l / 2;
        if (Math.abs(lastPt.z - halfW) < 0.05) {
            rotX = 0;
        } else {
            rotX = (lastPt.z < halfW) ? -slopeRad : slopeRad;
        }
    }

    const postH = 0.54;
    const topY = lastPt.y + lastRoofY + postH * Math.cos(rotX);
    const topZ = lastPt.z + postH * Math.sin(rotX);

    const points = [
        new THREE.Vector3(lastPt.x, topY, topZ),
        mouseHoverPoint
    ];
    const geom = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineDashedMaterial({
        color: 0x0f172a,
        dashSize: 0.2,
        gapSize: 0.1
    });
    previewCableMesh = new THREE.Line(geom, mat);
    previewCableMesh.computeLineDistances();
    scene.add(previewCableMesh);
}

function onWindowResize() {
    const container = document.getElementById("canvas3d");
    if (!container || !renderer) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    const aspect = width / height;

    perspectiveCam.aspect = aspect;
    perspectiveCam.updateProjectionMatrix();

    const d = Math.max(state.L, state.l);
    orthographicCam.left = -d * aspect;
    orthographicCam.right = d * aspect;
    orthographicCam.top = d;
    orthographicCam.bottom = -d;
    orthographicCam.updateProjectionMatrix();

    renderer.setSize(width, height);
}

function animate() {
    requestAnimationFrame(animate);
    if (controls && state.viewMode === "3d") {
        controls.update();
    }
    if (renderer && scene && activeCam) {
        renderer.render(scene, activeCam);
    }
}

// Helper: Prepare loaded OBJ model with Z-up to Y-up orientation, 45° offset for NEW PRO / LIGHT PRO, scaling, material, and bottom Y alignment
function prepareOBJModel(rawObj, rotY, modelFile = null) {
    const wrapper = new THREE.Group();
    const clone = rawObj.clone();

    // Rotate CAD model: X and Z axis orientation adjustments for specific models
    if (modelFile && (modelFile.includes("LongRange") || modelFile.includes("long_range") || modelFile.includes("Long_Range"))) {
        clone.rotation.x = Math.PI / 2; // Rotate 90° around X-axis strictly for Long Range models
        clone.rotation.z = 0;
    } else {
        clone.rotation.x = -Math.PI / 2; // Default vertical orientation for all other system models (NEW PRO, LIGHT PRO, etc.)
        clone.rotation.z = 0;
    }

    // High-visibility polished stainless steel / chrome material for all components
    const matColor = state.colors.anchors || "#f8fafc";
    const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(matColor),
        metalness: 0.92,
        roughness: 0.12,
        emissive: new THREE.Color(matColor),
        emissiveIntensity: 0.15,
        side: THREE.DoubleSide
    });
    
    clone.traverse(c => {
        if (c.isMesh) {
            c.material = mat;
            c.castShadow = true;
            c.receiveShadow = true;
        }
    });

    // Compute bounding box after Z-to-Y rotation
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());

    // Scale mm to meters if size is large (>10 units)
    let scaleFactor = 1.0;
    if (size.y > 10 || size.x > 10 || size.z > 10) {
        scaleFactor = 0.001;
    }
    
    if (scaleFactor !== 1.0) {
        clone.scale.set(scaleFactor, scaleFactor, scaleFactor);
        box.setFromObject(clone);
        box.getSize(size);
    }

    // Align bottom of object (box.min.y) flush at Y=0 and center X/Z
    const center = box.getCenter(new THREE.Vector3());
    clone.position.set(-center.x, -box.min.y, -center.z);

    // Apply base Y-axis rotation offset for NEW PRO & LIGHT PRO models
    const isNewOrLightPro = modelFile ? (modelFile.includes("new_pro") || modelFile.includes("light_pro")) : (state.product === "NEW PRO" || state.product === "LIGHT PRO");
    let angleOffset = isNewOrLightPro ? (Math.PI / 2) : 0;

    // Additional Y-axis rotation offsets for specific models
    if (modelFile) {
        if (modelFile.includes("Mini_Omega") || modelFile.includes("X-Cone") || (modelFile.includes("light_pro") && (modelFile.includes("P_Inox") || modelFile.includes("P_Galva")))) {
            angleOffset += Math.PI / 2;
        } else if (modelFile.includes("LongRange") || modelFile.includes("long_range") || modelFile.includes("Long_Range")) {
            angleOffset += Math.PI / 2;
        }
    }

    const rotGroup = new THREE.Group();
    rotGroup.rotation.y = rotY + angleOffset;
    rotGroup.add(clone);

    wrapper.add(rotGroup);

    // Save actual model height for precise cable attachment
    wrapper.userData.height = (size.y > 0.05 && size.y < 3.0) ? size.y : 0.45;

    return wrapper;
}

// Real OBJ 3D Anchor Post Mesh Creator (Renders all checked models for a node position in 3D)
function createAnchorMesh(colorHex, nodeType = "intermediaire", compId = null, rotY = 0) {
    const list = COMPONENTS_DB[state.product] || [];
    const mainGroup = new THREE.Group();
    const filesToRender = [];

    // 1. If explicit compId is defined on the node and checked in sidebar
    if (compId) {
        const match = list.find(c => c.id === compId && c.checked);
        if (match) filesToRender.push(match.file);
    }

    // 2. Otherwise check which components in COMPONENTS_DB are checked for active product
    if (filesToRender.length === 0) {
        if (nodeType === "x_matrix") {
            const xmat = list.find(c => c.id === "X-Matrix" && c.checked);
            if (xmat) {
                filesToRender.push(xmat.file);
            } else {
                const checkedComps = list.filter(c => c.id !== "Contre_Plaque" && c.id !== "X-Cone" && c.id !== "Pack_Matrix" && c.id !== "X-Matrix" && c.checked);
                checkedComps.forEach(c => filesToRender.push(c.file));
            }
        } else if (nodeType === "extremite") {
            // Include checked absorbers (LongRange.obj contains both LongRange + A-Fix)
            const checkedAbsorbers = list.filter(c => (c.id === "New_Pro" || c.id === "LightPro" || c.id === "LongRange") && c.checked);
            const hasLongRangeAbsorber = checkedAbsorbers.some(a => a.id === "LongRange");
            
            checkedAbsorbers.forEach(a => filesToRender.push(a.file));

            if (!hasLongRangeAbsorber) {
                const checkedPosts = list.filter(c => c.id !== "Contre_Plaque" && c.id !== "X-Cone" && c.id !== "Pack_Matrix" && c.id !== "X-Matrix" && c.id !== "New_Pro" && c.id !== "LightPro" && c.id !== "LongRange" && c.checked);
                checkedPosts.forEach(p => filesToRender.push(p.file));
            }
        } else {
            // Intermediate node post
            const checkedPosts = list.filter(c => c.id !== "Contre_Plaque" && c.id !== "X-Cone" && c.id !== "Pack_Matrix" && c.id !== "X-Matrix" && c.id !== "New_Pro" && c.id !== "LightPro" && c.id !== "LongRange" && c.checked);
            if (checkedPosts.length > 0) {
                checkedPosts.forEach(p => filesToRender.push(p.file));
            } else {
                const anyPost = list.filter(c => c.id !== "Contre_Plaque" && c.id !== "X-Cone" && c.id !== "Pack_Matrix" && c.id !== "X-Matrix" && c.checked);
                anyPost.forEach(p => filesToRender.push(p.file));
            }
        }
    }

    let maxHeight = 0.05;
    filesToRender.forEach(file => {
        if (file && objCache[file]) {
            const modelObj = prepareOBJModel(objCache[file], rotY, file);
            if (modelObj.userData && modelObj.userData.height) {
                maxHeight = Math.max(maxHeight, modelObj.userData.height);
            }
            mainGroup.add(modelObj);
        } else if (file) {
            loadOBJModel(file).then(() => {
                if (typeof update3DScene === "function") update3DScene();
            });
        }
    });

    mainGroup.userData.height = maxHeight;
    return mainGroup;
}

// Helper: Calculate exact Roof Height at any (x, z) coordinate
function getRoofHeightAt(x, z) {
    const slopeRad = (state.roofSlope || 15) * (Math.PI / 180);
    if (state.roofShape === "sloped") {
        return Math.max(0, z * Math.tan(slopeRad));
    } else if (state.roofShape === "triangle") {
        const ridgeW = 1.6;
        const slopeZ = Math.max(0, (state.l - ridgeW) / 2);
        const ridgeH = slopeZ * Math.tan(slopeRad);

        if (z < slopeZ) {
            return Math.max(0, z * Math.tan(slopeRad));
        } else if (z > state.l - slopeZ) {
            return Math.max(0, (state.l - z) * Math.tan(slopeRad));
        } else {
            return ridgeH; // Flat summit platform
        }
    }
    return 0.0;
}

// Render Roof Skylights / Lanterneaux
function createSkylightsObstacles(L, l) {
    while (obstacleGroup.children.length > 0) {
        obstacleGroup.remove(obstacleGroup.children[0]);
    }

    if (!state.showObstacles) return;

    const kerbMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.5 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, transparent: true, opacity: 0.7, roughness: 0.1 });

    const sky1 = new THREE.Group();
    const kerb1 = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.4, 2.0), kerbMat);
    kerb1.position.y = 0.2;
    const top1 = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.1, 1.8), glassMat);
    top1.position.y = 0.45;
    sky1.add(kerb1); sky1.add(top1);
    const sky1RoofY = getRoofHeightAt(L * 0.25, l * 0.7);
    sky1.position.set(L * 0.25, sky1RoofY, l * 0.7);
    obstacleGroup.add(sky1);

    const sky2 = new THREE.Group();
    const kerb2 = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.4, 2.0), kerbMat);
    kerb2.position.y = 0.2;
    const top2 = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.1, 1.8), glassMat);
    top2.position.y = 0.45;
    sky2.add(kerb2); sky2.add(top2);
    const sky2RoofY = getRoofHeightAt(L * 0.65, l * 0.7);
    sky2.position.set(L * 0.65, sky2RoofY, l * 0.7);
    obstacleGroup.add(sky2);
}

// Build 3D Volumetric Roof Mesh according to Roof Shape
function create3DRoofShape(L, l, roofMat) {
    const shape = state.roofShape;
    const slopeRad = (state.roofSlope || 15) * (Math.PI / 180);
    const roofGroup = new THREE.Group();

    // Dark edge outline for crisp 3D shape visibility
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x0f172a });

    if (shape === "sloped") {
        const l_slope = l / Math.cos(slopeRad);
        const roofGeo = new THREE.BoxGeometry(L, 0.2, l_slope);
        const mesh = new THREE.Mesh(roofGeo, roofMat);
        mesh.rotation.x = -slopeRad;
        const midY = (l / 2) * Math.tan(slopeRad);
        mesh.position.set(L / 2, midY - 0.1 * Math.cos(slopeRad), l / 2);
        mesh.receiveShadow = true;
        roofGroup.add(mesh);

        const edges = new THREE.EdgesGeometry(roofGeo);
        const line = new THREE.LineSegments(edges, edgeMat);
        line.rotation.x = -slopeRad;
        line.position.set(L / 2, midY - 0.1 * Math.cos(slopeRad), l / 2);
        roofGroup.add(line);

        return roofGroup;
    } else if (shape === "triangle") {
        const ridgeW = 1.6;
        const slopeZ = Math.max(0, (l - ridgeW) / 2);
        const ridgeH = slopeZ * Math.tan(slopeRad);
        const halfLen = slopeZ / Math.cos(slopeRad);

        // 1. Front slope (z=0 to z=slopeZ): Slopes UP to the flat summit
        const slope1Geo = new THREE.BoxGeometry(L, 0.2, halfLen);
        const slope1 = new THREE.Mesh(slope1Geo, roofMat);
        slope1.rotation.x = -slopeRad;
        slope1.position.set(L / 2, (ridgeH / 2) - 0.1 * Math.cos(slopeRad), slopeZ / 2);
        slope1.receiveShadow = true;
        roofGroup.add(slope1);

        const edges1 = new THREE.EdgesGeometry(slope1Geo);
        const line1 = new THREE.LineSegments(edges1, edgeMat);
        line1.rotation.x = -slopeRad;
        line1.position.set(L / 2, (ridgeH / 2) - 0.1 * Math.cos(slopeRad), slopeZ / 2);
        roofGroup.add(line1);

        // 2. Flat Summit Platform (z=slopeZ to z=l-slopeZ): Flat horizontal top
        const summitGeo = new THREE.BoxGeometry(L, 0.2, ridgeW);
        const summitMesh = new THREE.Mesh(summitGeo, roofMat);
        summitMesh.position.set(L / 2, ridgeH - 0.1, l / 2);
        summitMesh.receiveShadow = true;
        roofGroup.add(summitMesh);

        const summitEdges = new THREE.EdgesGeometry(summitGeo);
        const summitLine = new THREE.LineSegments(summitEdges, edgeMat);
        summitLine.position.set(L / 2, ridgeH - 0.1, l / 2);
        roofGroup.add(summitLine);

        // 3. Back slope (z=l-slopeZ to z=l): Slopes DOWN from the flat summit
        const slope2Geo = new THREE.BoxGeometry(L, 0.2, halfLen);
        const slope2 = new THREE.Mesh(slope2Geo, roofMat);
        slope2.rotation.x = slopeRad;
        slope2.position.set(L / 2, (ridgeH / 2) - 0.1 * Math.cos(slopeRad), l - slopeZ / 2);
        slope2.receiveShadow = true;
        roofGroup.add(slope2);

        const edges2 = new THREE.EdgesGeometry(slope2Geo);
        const line2 = new THREE.LineSegments(edges2, edgeMat);
        line2.rotation.x = slopeRad;
        line2.position.set(L / 2, (ridgeH / 2) - 0.1 * Math.cos(slopeRad), l - slopeZ / 2);
        roofGroup.add(line2);

        return roofGroup;
    }

    // Flat roof slab with thick 3D volumetric block and dark edge outline
    const roofGeo = new THREE.BoxGeometry(L, 0.2, l);
    const roofMeshFlat = new THREE.Mesh(roofGeo, roofMat);
    roofMeshFlat.position.set(L / 2, -0.1, l / 2);
    roofMeshFlat.receiveShadow = true;
    roofGroup.add(roofMeshFlat);

    const edgesFlat = new THREE.EdgesGeometry(roofGeo);
    const lineFlat = new THREE.LineSegments(edgesFlat, edgeMat);
    lineFlat.position.set(L / 2, -0.1, l / 2);
    roofGroup.add(lineFlat);

    return roofGroup;
}

// 3D Procedural Cable End Loop Terminal with Crimped Sleeves (Manchons de sertissage)
function createCableLoopTerminal(pos, dir, cableColorHex) {
    const group = new THREE.Group();
    const compColor = cableColorHex || state.colors.cable || "#f8fafc";
    const matCable = new THREE.MeshStandardMaterial({
        color: new THREE.Color(compColor),
        metalness: 0.92,
        roughness: 0.12,
        emissive: new THREE.Color(compColor),
        emissiveIntensity: 0.15
    });
    const matSleeve = new THREE.MeshStandardMaterial({
        color: new THREE.Color(compColor),
        metalness: 0.95,
        roughness: 0.10,
        emissive: new THREE.Color(compColor),
        emissiveIntensity: 0.15
    });

    const sleeveLength = 0.08;
    const sleeveRadius = 0.015;
    
    // Main Crimp Sleeve Cylinder
    const sleeveGeo = new THREE.CylinderGeometry(sleeveRadius, sleeveRadius, sleeveLength, 16);
    const sleeveMesh = new THREE.Mesh(sleeveGeo, matSleeve);
    sleeveMesh.position.set(0, 0, sleeveLength / 2);
    sleeveMesh.rotation.x = Math.PI / 2;
    group.add(sleeveMesh);

    // 3 Stamped Crimp Rings on sleeve
    const numRings = 3;
    for (let r = 1; r <= numRings; r++) {
        const ringGeo = new THREE.TorusGeometry(sleeveRadius + 0.002, 0.0025, 10, 20);
        const ringMesh = new THREE.Mesh(ringGeo, matSleeve);
        const ringZ = (r * sleeveLength) / (numRings + 1);
        ringMesh.position.set(0, 0, ringZ);
        group.add(ringMesh);
    }

    // Two parallel cable strands inside/entering the sleeve
    const cableR = 0.0075;
    const offset = 0.0065;
    const cGeo = new THREE.CylinderGeometry(cableR, cableR, sleeveLength, 10);
    const c1 = new THREE.Mesh(cGeo, matCable);
    c1.position.set(-offset, 0, sleeveLength / 2);
    c1.rotation.x = Math.PI / 2;
    group.add(c1);

    const c2 = new THREE.Mesh(cGeo, matCable);
    c2.position.set(offset, 0, sleeveLength / 2);
    c2.rotation.x = Math.PI / 2;
    group.add(c2);

    // Teardrop Cable Loop
    const loopLength = 0.12;
    const loopWidth = 0.032;
    const pts = [
        new THREE.Vector3(-offset, 0, sleeveLength),
        new THREE.Vector3(-loopWidth, 0, sleeveLength + loopLength * 0.35),
        new THREE.Vector3(-loopWidth * 0.7, 0, sleeveLength + loopLength * 0.85),
        new THREE.Vector3(0, 0, sleeveLength + loopLength),
        new THREE.Vector3(loopWidth * 0.7, 0, sleeveLength + loopLength * 0.85),
        new THREE.Vector3(loopWidth, 0, sleeveLength + loopLength * 0.35),
        new THREE.Vector3(offset, 0, sleeveLength)
    ];

    const loopCurve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.1);
    const loopGeo = new THREE.TubeGeometry(loopCurve, 32, cableR, 10, false);
    const loopMesh = new THREE.Mesh(loopGeo, matCable);
    group.add(loopMesh);

    // Orient and position terminal group along dir
    group.position.copy(pos);

    const unitDir = dir.clone().normalize();
    const defaultDir = new THREE.Vector3(0, 0, 1);
    const quat = new THREE.Quaternion().setFromUnitVectors(defaultDir, unitDir);
    group.quaternion.copy(quat);

    return group;
}

// 3D Procedural X-Matrix Stopper Pin (Butée de jonction X-Matrix avec boulon de verrouillage)
function createXMatrixStopperPin(pos, dir) {
    const group = new THREE.Group();
    const compColor = state.colors.anchors || "#f8fafc";
    const matPin = new THREE.MeshStandardMaterial({
        color: new THREE.Color(compColor),
        metalness: 0.92,
        roughness: 0.12,
        emissive: new THREE.Color(compColor),
        emissiveIntensity: 0.15
    });
    const matBolt = new THREE.MeshStandardMaterial({
        color: new THREE.Color("#64748b"),
        metalness: 0.95,
        roughness: 0.15
    });

    const pinRadius = 0.012;
    const pinHeight = 0.045;
    
    // Main Stopper Cylinder (Butée)
    const pinGeo = new THREE.CylinderGeometry(pinRadius, pinRadius, pinHeight, 16);
    const pinMesh = new THREE.Mesh(pinGeo, matPin);
    pinMesh.position.set(0, pinHeight / 2, 0);
    group.add(pinMesh);

    // Top Hexagonal Locking Bolt
    const boltRadius = 0.009;
    const boltHeight = 0.010;
    const boltGeo = new THREE.CylinderGeometry(boltRadius, boltRadius, boltHeight, 6);
    const boltMesh = new THREE.Mesh(boltGeo, matBolt);
    boltMesh.position.set(0, pinHeight + boltHeight / 2, 0);
    group.add(boltMesh);

    // Position stopper pin along dir at the arm slot of X-Matrix (~0.055m from center)
    const offsetPos = pos.clone().add(dir.clone().normalize().multiplyScalar(0.055));
    group.position.copy(offsetPos);

    return group;
}

function update3DScene() {
    if (!scene) return;

    if (roofMesh) scene.remove(roofMesh);
    if (gridHelper) scene.remove(gridHelper);
    if (cableGroup) {
        while (cableGroup.children.length > 0) {
            const child = cableGroup.children[0];
            child.traverse((obj) => {
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) {
                    if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
                    else obj.material.dispose();
                }
            });
            cableGroup.remove(child);
        }
    }

    while (anchorGroup.children.length > 0) {
        anchorGroup.remove(anchorGroup.children[0]);
    }

    const maxSpan = Calculator.getMaxSpan(state.product);
    const layout = Calculator.calculateAnchorPositions(state.L, state.l, maxSpan);
    const positions = layout.all;

    const L = state.L;
    const l = state.l;

    let roofMatColor = new THREE.Color(0x475569);
    let roofRoughness = 0.7;
    let roofMetalness = 0.2;

    if (state.roofTexture === "concrete") {
        roofMatColor = new THREE.Color(0x64748b);
    } else if (state.roofTexture === "metal") {
        roofMatColor = new THREE.Color(0x334155);
        roofMetalness = 0.7;
    } else if (state.roofTexture === "bitumen") {
        roofMatColor = new THREE.Color(0x1e293b);
    }

    const roofMat = new THREE.MeshStandardMaterial({
        color: roofMatColor,
        roughness: roofRoughness,
        metalness: roofMetalness,
        side: THREE.DoubleSide
    });

    roofMesh = create3DRoofShape(L, l, roofMat);
    scene.add(roofMesh);

    if (state.gridVisible) {
        const gridDim = Math.max(L, l) * 1.5;
        gridHelper = new THREE.GridHelper(gridDim, Math.round(gridDim), 0x475569, 0x94a3b8);
        gridHelper.position.set(L / 2, -0.01, l / 2);
        scene.add(gridHelper);
    }

    createSkylightsObstacles(L, l);

    const line1TopPts = [];
    const line2TopPts = [];

    // Determine uniform cable post height across all nodes to ensure 100% level cable line touching anchor heads
    let activePostHeight = 0.45;
    const activeList = COMPONENTS_DB[state.product] || [];
    const activeComps = activeList;
    const activePostComp = activeList.find(c => c.id !== "Contre_Plaque" && c.id !== "X-Cone" && c.id !== "Pack_Matrix" && c.id !== "X-Matrix" && c.checked);
    if (activePostComp && objCache[activePostComp.file]) {
        const dummy = prepareOBJModel(objCache[activePostComp.file], 0, activePostComp.file);
        if (dummy && dummy.userData && dummy.userData.height) {
            activePostHeight = dummy.userData.height;
        }
    } else {
        const sampleAnchor = createAnchorMesh(state.colors.anchors, "intermediaire");
        if (sampleAnchor && sampleAnchor.userData && sampleAnchor.userData.height > 0.05) {
            activePostHeight = sampleAnchor.userData.height;
        }
    }

    // Helper to process node lists
    function processNodes(nodesList, targetPtsArray) {
        nodesList.forEach((pos, idx) => {
            let rotY = pos.rotY;
            if (rotY === undefined && nodesList.length > 1) {
                let dx = 0, dz = 0;
                if (idx < nodesList.length - 1) {
                    dx = nodesList[idx + 1].x - pos.x;
                    dz = nodesList[idx + 1].z - pos.z;
                } else {
                    dx = pos.x - nodesList[idx - 1].x;
                    dz = pos.z - nodesList[idx - 1].z;
                }
                rotY = Math.atan2(dz, dx);
            }

            // Orient extremity anchors in OPPOSITE directions strictly for LONG RANGE
            if ((state.product === "LONG RANGE" || (pos.compId && pos.compId.includes("LongRange"))) && idx === nodesList.length - 1 && nodesList.length > 1) {
                rotY = (rotY || 0) + Math.PI;
            }

            const roofY = getRoofHeightAt(pos.x, pos.z);
            const anchor = createAnchorMesh(state.colors.anchors, pos.type, pos.compId, rotY || 0);

            const slopeRad = (state.roofSlope || 15) * (Math.PI / 180);
            let rotX = 0;
            if (state.roofShape === "sloped") {
                rotX = -slopeRad;
            } else if (state.roofShape === "triangle") {
                const halfW = state.l / 2;
                if (Math.abs(pos.z - halfW) < 0.05) {
                    rotX = 0;
                } else {
                    rotX = (pos.z < halfW) ? -slopeRad : slopeRad;
                }
            }

            anchor.rotation.x = rotX;
            anchor.rotation.z = 0;
            if (pos.type === "x_matrix") {
                // Position X-Matrix junction directly ON the cable line level
                anchor.position.set(pos.x, pos.y + roofY + activePostHeight - 0.035, pos.z);
            } else if (pos.type === "extremite" && anchor && anchor.userData && anchor.userData.height && anchor.userData.height < activePostHeight - 0.05) {
                // Align extremity absorber top level flush with active post height to prevent cable dipping
                anchor.position.set(pos.x, pos.y + roofY + (activePostHeight - anchor.userData.height), pos.z);
            } else {
                anchor.position.set(pos.x, pos.y + roofY, pos.z);
            }
            anchorGroup.add(anchor);

            const cpComp = activeComps.find(c => c.id === "Contre_Plaque" && c.checked);
            if (cpComp && objCache[cpComp.file]) {
                const cpObj = prepareOBJModel(objCache[cpComp.file], rotY || 0, cpComp.file);
                cpObj.position.set(pos.x, pos.y + roofY, pos.z);
                anchorGroup.add(cpObj);
            }

            const packComp = activeComps.find(c => c.id === "Pack_Matrix" && c.checked);
            if (packComp && objCache[packComp.file]) {
                const packObj = prepareOBJModel(objCache[packComp.file], rotY || 0, packComp.file);
                packObj.position.set(pos.x, pos.y + roofY + 0.02, pos.z);
                anchorGroup.add(packObj);
            }

            // Uniform cable height passing 100% straight through top clamp head of posts
            const postH = Math.max(0.05, activePostHeight - 0.035);

            const topY = pos.y + roofY + postH * Math.cos(rotX);
            const topZ = pos.z + postH * Math.sin(rotX);

            targetPtsArray.push(new THREE.Vector3(pos.x, topY, topZ));
        });
    }

    // Render X-CONE safety elements ON the cable at 1.0m (15°-30°) or 0.5m (30°-40°) intervals (STRICTLY when selected by user)
    function renderXConesAlongCable(ptsArray) {
        const list = COMPONENTS_DB[state.product] || [];
        const xconeComp = list.find(c => c.id === "X-Cone");
        const isChecked = xconeComp && xconeComp.checked;

        if (!isChecked) return;
        if (!xconeComp || !objCache[xconeComp.file]) return;

        let spacing = 1.0;
        if (state.roofSlope > 30) {
            spacing = 0.5;
        }

        for (let i = 0; i < ptsArray.length - 1; i++) {
            const pA = ptsArray[i];
            const pB = ptsArray[i + 1];
            const dir = pB.clone().sub(pA);
            const segLen = dir.length();
            if (segLen < spacing) continue;

            const unitDir = dir.clone().normalize();
            const count = Math.floor(segLen / spacing);

            for (let k = 1; k <= count; k++) {
                const dist = k * spacing;
                if (dist > segLen - 0.2) break;

                const posCone = pA.clone().add(unitDir.clone().multiplyScalar(dist));
                const coneObj = prepareOBJModel(objCache[xconeComp.file], 0, xconeComp.file);
                coneObj.position.copy(posCone);

                // Orient cone tip pointing DOWN the slope (-unitDir)
                const downDir = unitDir.clone().negate();
                const rotMatrix = new THREE.Matrix4().lookAt(new THREE.Vector3(0, 0, 0), downDir, new THREE.Vector3(0, 1, 0));
                coneObj.quaternion.setFromRotationMatrix(rotMatrix);

                anchorGroup.add(coneObj);
            }
        }
    }

    processNodes(layout.line1, line1TopPts);
    renderXConesAlongCable(line1TopPts);

    const cableExt = (state.product === "LONG RANGE") ? 0.30 : 0.20;

    if (state.hasLine2 && state.xMatrixLocation === "end" && layout.line2.length > 0) {
        // END CORNER JUNCTION: Single continuous curved cable bending around corner
        processNodes(layout.line2, line2TopPts);
        renderXConesAlongCable(line2TopPts);

        if (line1TopPts.length > 0 && line2TopPts.length > 0) {
            const fullPathCombined = [];
            const p0 = line1TopPts[0];
            const p1 = line1TopPts.length > 1 ? line1TopPts[1] : line2TopPts[0];
            const vStart = p0.clone().sub(p1).normalize();
            const startExt = p0.clone().add(vStart.multiplyScalar(cableExt));

            fullPathCombined.push(startExt);
            line1TopPts.forEach(pt => fullPathCombined.push(pt));

            // Sample points along a clean circular arc between Post 1 (end of Line 1) and Post 2 (start of Line 2)
            const post1Pt = line1TopPts[line1TopPts.length - 1];
            const post2Pt = line2TopPts[0];
            if (post1Pt && post2Pt) {
                const cornerX = post2Pt.x;
                const cornerZ = post1Pt.z;
                const R = Math.abs(cornerX - post1Pt.x);

                const numArcSamples = 10;
                for (let step = 1; step < numArcSamples; step++) {
                    const t = step / numArcSamples;
                    const theta = t * (Math.PI / 2);
                    const arcX = (cornerX - R) + R * Math.sin(theta);
                    const arcZ = (cornerZ + R) - R * Math.cos(theta);
                    fullPathCombined.push(new THREE.Vector3(arcX, post1Pt.y, arcZ));
                }
            }

            line2TopPts.forEach(pt => fullPathCombined.push(pt));

            const endL2 = line2TopPts[line2TopPts.length - 1];
            const prevL2 = line2TopPts.length > 1 ? line2TopPts[line2TopPts.length - 2] : line1TopPts[line1TopPts.length - 1];
            const vEnd2 = endL2.clone().sub(prevL2).normalize();
            const endExt2 = endL2.clone().add(vEnd2.multiplyScalar(cableExt));

            fullPathCombined.push(endExt2);

            const curveCombined = new THREE.CatmullRomCurve3(fullPathCombined, false, 'catmullrom', 0.0);
            const tubeGeoCombined = new THREE.TubeGeometry(curveCombined, fullPathCombined.length * 12, 0.01, 8, false);
            const cableMat = new THREE.MeshStandardMaterial({
                color: new THREE.Color(state.colors.cable),
                metalness: 0.9,
                roughness: 0.1,
                emissive: new THREE.Color(state.colors.cable),
                emissiveIntensity: 0.2
            });
            const meshCombined = new THREE.Mesh(tubeGeoCombined, cableMat);
            cableGroup.add(meshCombined);

            // Add crimped cable end loops (boucles serties avec manchons)
            cableGroup.add(createCableLoopTerminal(startExt, vStart, state.colors.cable));
            cableGroup.add(createCableLoopTerminal(endExt2, vEnd2, state.colors.cable));
        }
    } else {
        // MIDPOINT T-JUNCTION: Separate Line 1 and Line 2 cables
        if (line1TopPts.length > 1) {
            const fullPath1 = [];
            const p0 = line1TopPts[0];
            const p1 = line1TopPts[1];
            const vStart = p0.clone().sub(p1).normalize();
            const startExt = p0.clone().add(vStart.multiplyScalar(cableExt));

            fullPath1.push(startExt);
            line1TopPts.forEach(pt => fullPath1.push(pt));

            const pn = line1TopPts[line1TopPts.length - 1];
            const pnPrev = line1TopPts[line1TopPts.length - 2];
            const vEnd = pn.clone().sub(pnPrev).normalize();
            const endExt = pn.clone().add(vEnd.multiplyScalar(cableExt));

            fullPath1.push(endExt);

            const curve1 = new THREE.CatmullRomCurve3(fullPath1, false, 'catmullrom', 0.05);
            const tubeGeo1 = new THREE.TubeGeometry(curve1, fullPath1.length * 12, 0.01, 8, false);
            const cableMat = new THREE.MeshStandardMaterial({
                color: new THREE.Color(state.colors.cable),
                metalness: 0.9,
                roughness: 0.1,
                emissive: new THREE.Color(state.colors.cable),
                emissiveIntensity: 0.2
            });
            const mesh1 = new THREE.Mesh(tubeGeo1, cableMat);
            cableGroup.add(mesh1);

            // Add crimped cable end loops (boucles serties avec manchons) for Line 1
            cableGroup.add(createCableLoopTerminal(startExt, vStart, state.colors.cable));
            cableGroup.add(createCableLoopTerminal(endExt, vEnd, state.colors.cable));
        }

        if (layout.line2.length > 0 && layout.junctionNode) {
            const jIndex = layout.line1.indexOf(layout.junctionNode);
            const jTopPt = line1TopPts[jIndex];

            processNodes(layout.line2, line2TopPts);
            renderXConesAlongCable(line2TopPts);

            if (jTopPt && line2TopPts.length > 0) {
                const fullPath2 = [jTopPt, ...line2TopPts];

                const endL2 = line2TopPts[line2TopPts.length - 1];
                const prevL2 = line2TopPts.length > 1 ? line2TopPts[line2TopPts.length - 2] : jTopPt;
                const vEnd2 = endL2.clone().sub(prevL2).normalize();
                const endExt2 = endL2.clone().add(vEnd2.multiplyScalar(cableExt));
                fullPath2.push(endExt2);

                const curve2 = new THREE.CatmullRomCurve3(fullPath2, false, 'catmullrom', 0.05);
                const tubeGeo2 = new THREE.TubeGeometry(curve2, fullPath2.length * 12, 0.01, 8, false);
                const cableMat2 = new THREE.MeshStandardMaterial({
                    color: new THREE.Color(state.colors.cable),
                    metalness: 0.9,
                    roughness: 0.1
                });
                const mesh2 = new THREE.Mesh(tubeGeo2, cableMat2);
                cableGroup.add(mesh2);

                // Add crimped cable end loop at Line 2 end
                cableGroup.add(createCableLoopTerminal(endExt2, vEnd2, state.colors.cable));
            }
        }
    }

    // Render Cable Loops & Stopper Pins (Butées) on X-Matrix arms
    const isXMatrixChecked = (COMPONENTS_DB[state.product] || []).some(c => c.id === "X-Matrix" && c.checked);
    const hasJunctionXMat = state.hasLine2 || isXMatrixChecked;

    if (hasJunctionXMat && line1TopPts.length > 0) {
        if (state.xMatrixLocation === "end" && state.hasLine2 && line2TopPts.length > 0) {
            // CORNER X-MATRIX JUNCTION
            const jTopPt = line1TopPts[line1TopPts.length - 1];
            const vDir1 = (line1TopPts.length > 1) ? line1TopPts[line1TopPts.length - 2].clone().sub(jTopPt).normalize() : new THREE.Vector3(-1, 0, 0);
            const vDir2 = line2TopPts[0].clone().sub(jTopPt).normalize();
            const vDir3 = vDir1.clone().negate();
            const vDir4 = vDir2.clone().negate();

            cableGroup.add(createCableLoopTerminal(jTopPt.clone().add(vDir1.clone().multiplyScalar(0.02)), vDir1, state.colors.cable));
            cableGroup.add(createCableLoopTerminal(jTopPt.clone().add(vDir2.clone().multiplyScalar(0.02)), vDir2, state.colors.cable));
            cableGroup.add(createXMatrixStopperPin(jTopPt, vDir3));
            cableGroup.add(createXMatrixStopperPin(jTopPt, vDir4));
        } else {
            // MIDPOINT X-MATRIX JUNCTION
            const jIndex = layout.line1.findIndex(n => n.type === "x_matrix");
            if (jIndex >= 0 && line1TopPts[jIndex]) {
                const jTopPt = line1TopPts[jIndex];
                const vDir1 = (jIndex > 0) ? line1TopPts[jIndex - 1].clone().sub(jTopPt).normalize() : new THREE.Vector3(-1, 0, 0);
                const vDir2 = (jIndex < line1TopPts.length - 1) ? line1TopPts[jIndex + 1].clone().sub(jTopPt).normalize() : new THREE.Vector3(1, 0, 0);

                let vDir3 = new THREE.Vector3(0, 0, 1);
                if (state.hasLine2 && line2TopPts.length > 0) {
                    vDir3 = line2TopPts[0].clone().sub(jTopPt).normalize();
                } else {
                    vDir3 = new THREE.Vector3(-vDir1.z, 0, vDir1.x).normalize();
                }
                const vDir4 = vDir3.clone().negate();

                // Arm 1 (Line 1 incoming): Cable Loop
                cableGroup.add(createCableLoopTerminal(jTopPt.clone().add(vDir1.clone().multiplyScalar(0.02)), vDir1, state.colors.cable));
                // Arm 2 (Line 1 outgoing): Cable Loop
                cableGroup.add(createCableLoopTerminal(jTopPt.clone().add(vDir2.clone().multiplyScalar(0.02)), vDir2, state.colors.cable));

                // Arm 3 (Line 2 branch side): Loop if line 2 present, else Stopper Pin (Butée)
                if (state.hasLine2 && line2TopPts.length > 0) {
                    cableGroup.add(createCableLoopTerminal(jTopPt.clone().add(vDir3.clone().multiplyScalar(0.02)), vDir3, state.colors.cable));
                } else {
                    cableGroup.add(createXMatrixStopperPin(jTopPt, vDir3));
                }

                // Arm 4 (Unused arm): Stopper Pin (Butée)
                cableGroup.add(createXMatrixStopperPin(jTopPt, vDir4));
            }
        }
    }

    const centerX = L / 2;
    const centerZ = l / 2;
    controls.target.set(centerX, 0.2, centerZ);

    updateCalculationsUI(layout, maxSpan);
}

// ==========================================
// REAL-TIME UI READOUTS UPDATE
// ==========================================
function updateCalculationsUI(layout, maxSpan) {
    const positions = (layout && layout.all) ? layout.all : (Array.isArray(layout) ? layout : []);
    const anchorPosts = positions.filter(p => p.type !== "x_matrix");
    const totalAnchors = anchorPosts.length > 0 ? anchorPosts.length : positions.length;
    const totalLineLen = Calculator.calculateTotalLineLength(layout, state.product);
    const realSpanMax = Calculator.calculateMaxRealSpan(layout);

    const isOSHA = (state.norm === "OSHA/ANSI" || state.norm === "OSHA" || state.norm === "ANSI");
    const oshaSubtabs = document.getElementById("osha-subtabs");
    if (oshaSubtabs) {
        oshaSubtabs.style.display = isOSHA ? "flex" : "none";
    }

    let isMultiSpan = false;
    if (isOSHA) {
        isMultiSpan = (state.oshaSpanMode === "multi");
    } else {
        isMultiSpan = (totalAnchors > 2);
    }

    const support = getActiveSupport();

    const effortL = Calculator.effortLonge(state.product, realSpanMax, state.nbUsers, state.norm, state.fallFactor, support, isMultiSpan);
    const deflL = Calculator.deflection(state.product, realSpanMax, state.fallFactor, support, state.nbUsers, state.norm, isMultiSpan);

    const ext1L = Calculator.extremiteForce1(state.product, realSpanMax, state.nbUsers, state.norm, effortL, deflL, state.fallFactor, support, isMultiSpan);
    const ext2L = Calculator.extremiteForce2(state.product, realSpanMax, state.nbUsers, state.norm, effortL, deflL, state.fallFactor, support, isMultiSpan);

    const postName = getActivePostName();
    const lblAnchor = document.getElementById("lbl-anchor-count");
    if (lblAnchor) lblAnchor.textContent = `Potelets / Ancrages (${postName})`;
    const valAnchor = document.getElementById("val-anchor-count");
    if (valAnchor) valAnchor.textContent = totalAnchors;

    const lblAbsorber = document.getElementById("lbl-absorber-count");
    if (lblAbsorber) lblAbsorber.textContent = `Absorbeurs (${state.product})`;
    const valAbsorber = document.getElementById("val-absorber-count");
    if (valAbsorber) valAbsorber.textContent = totalAnchors;

    document.getElementById("val-fall-factor").textContent = state.fallFactor;
    document.getElementById("val-max-allowed-span").textContent = `${maxSpan.toFixed(1)}m`;

    const lenElem = document.getElementById("val-total-line-len");
    const marginCm = (state.product === "LONG RANGE") ? 30 : 20;
    if (lenElem) lenElem.textContent = `${totalLineLen.toFixed(2)} m (dont 2×${marginCm}cm libres aux ext.)`;

    document.getElementById("val-span-l").textContent = `${realSpanMax.toFixed(2)} m`;
    document.getElementById("val-force-l").textContent = `${effortL.toFixed(2)} kN`;

    // Flèche : 2 chiffres après la virgule pour OSHA/ANSI, entier arrondi pour EN 795
    const deflElem = document.getElementById("val-defl-l");
    if (deflElem) {
        deflElem.textContent = isOSHA ? `${deflL.toFixed(2)} mm` : `${Math.round(deflL)} mm`;
    }

    document.getElementById("val-ext1-l").textContent = `${ext1L.toFixed(1)} kN`;
    document.getElementById("val-ext2-l").textContent = `${ext2L.toFixed(1)} kN`;

    const rowExt3 = document.getElementById("row-ext3");
    const rowExt4 = document.getElementById("row-ext4");

    if (isOSHA && isMultiSpan) {
        const ext3L = Calculator.extremiteForce3(state.product, realSpanMax, state.nbUsers, state.norm, effortL, deflL, state.fallFactor, support, isMultiSpan);
        const ext4L = Calculator.extremiteForce4(state.product, realSpanMax, state.nbUsers, state.norm, effortL, deflL, state.fallFactor, support, isMultiSpan);
        if (rowExt3) {
            rowExt3.style.display = "flex";
            document.getElementById("val-ext3-l").textContent = `${ext3L.toFixed(1)} kN`;
        }
        if (rowExt4) {
            rowExt4.style.display = "flex";
            document.getElementById("val-ext4-l").textContent = `${ext4L.toFixed(1)} kN`;
        }
    } else {
        if (rowExt3) rowExt3.style.display = "none";
        if (rowExt4) rowExt4.style.display = "none";
    }

    const shapeName = state.roofShape === "flat" ? "Toit Plat" : (state.roofShape === "sloped" ? `Toit Incliné (${state.roofSlope}°)` : `Toit Triangulaire (${state.roofSlope}°)`);
    document.getElementById("header-dims-display").innerHTML = `<i class="fa-solid fa-ruler-combined"></i> ${shapeName} | L1: ${state.lineLength}m ${state.hasLine2 ? `+ L2: ${state.line2Length}m` : ""}`;
    document.getElementById("header-system-display").textContent = state.product;

    const warningElem = document.getElementById("canvas-warning");
    if (realSpanMax > maxSpan + 0.05) {
        warningElem.classList.remove("hidden");
    } else {
        warningElem.classList.add("hidden");
    }
}

// ==========================================
// EXPLODED VIEW CAROUSEL MODAL LOGIC
// ==========================================
let currentCarouselImages = [];
let currentCarouselIndex = 0;

function openExplodedCarousel(component) {
    const modal = document.getElementById("carousel-modal");
    const titleElem = document.getElementById("carousel-title");

    if (!modal || !component.exploded || component.exploded.length === 0) return;

    currentCarouselImages = component.exploded;
    currentCarouselIndex = 0;
    titleElem.textContent = `Vues Éclatées : ${component.name}`;

    renderCarouselSlide();
    modal.classList.add("active");
}

function renderCarouselSlide() {
    const slidesElem = document.getElementById("carousel-slides");
    const dotsElem = document.getElementById("carousel-dots");

    slidesElem.innerHTML = `<img src="${currentCarouselImages[currentCarouselIndex]}" alt="Vue éclatée ${currentCarouselIndex + 1}">`;

    dotsElem.innerHTML = "";
    currentCarouselImages.forEach((_, idx) => {
        const dot = document.createElement("span");
        dot.className = `carousel-dot ${idx === currentCarouselIndex ? "active" : ""}`;
        dot.addEventListener("click", () => {
            currentCarouselIndex = idx;
            renderCarouselSlide();
        });
        dotsElem.appendChild(dot);
    });
}

function setupCarouselEventListeners() {
    const modal = document.getElementById("carousel-modal");
    const closeBtn = document.getElementById("carousel-close-btn");
    const prevBtn = document.getElementById("carousel-prev-btn");
    const nextBtn = document.getElementById("carousel-next-btn");

    if (closeBtn) closeBtn.addEventListener("click", () => modal.classList.remove("active"));

    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            currentCarouselIndex = (currentCarouselIndex - 1 + currentCarouselImages.length) % currentCarouselImages.length;
            renderCarouselSlide();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            currentCarouselIndex = (currentCarouselIndex + 1) % currentCarouselImages.length;
            renderCarouselSlide();
        });
    }
}

// ==========================================
// UI INTERACTIVITY & EVENT BINDINGS
// ==========================================
function setupUIEventListeners() {
    const homeScreen = document.getElementById("home-screen");
    const dashboardScreen = document.getElementById("dashboard-screen");
    const configModal = document.getElementById("config-modal");

    document.getElementById("start-config-btn").addEventListener("click", () => {
        configModal.classList.add("active");
    });

    document.getElementById("reconfig-btn").addEventListener("click", () => {
        configModal.classList.add("active");
    });

    document.getElementById("modal-close-btn").addEventListener("click", () => {
        configModal.classList.remove("active");
    });

    document.getElementById("config-cancel-btn").addEventListener("click", () => {
        configModal.classList.remove("active");
    });

    const roofShapeSelect = document.getElementById("input-roof-shape");
    const roofSlopeGroup = document.getElementById("group-roof-slope");

    if (roofShapeSelect && roofSlopeGroup) {
        roofShapeSelect.addEventListener("change", (e) => {
            const val = e.target.value;
            roofSlopeGroup.style.display = (val === "sloped" || val === "triangle") ? "block" : "none";
            if (val === "sloped" && state.product !== "NEW PRO") {
                alert("⚠️ CONFIGURATION NON SUPPORTÉE :\nLe toit mono-pente (incliné) est uniquement disponible pour le système NEW PRO (et non Light Pro ni Long Range).\nVeuillez contacter l'équipe HOOKT.");
            }
        });
    }

    const chkLine2 = document.getElementById("input-has-line2");
    const groupLine2 = document.getElementById("group-line2-options");
    const selectXLoc = document.getElementById("select-xmatrix-location");

    if (chkLine2 && groupLine2) {
        chkLine2.addEventListener("change", (e) => {
            const locVal = selectXLoc ? selectXLoc.value : "mid";
            if (e.target.checked && locVal === "mid" && state.product !== "NEW PRO") {
                alert("⚠️ CONFIGURATION NON SUPPORTÉE :\nLa jonction X-MATRIX en milieu de ligne est uniquement disponible pour le système NEW PRO (et non Light Pro ni Long Range).\nPour cette étude spécifique, veuillez contacter l'équipe HOOKT.");
                if (selectXLoc) selectXLoc.value = "end";
            }
            groupLine2.style.display = e.target.checked ? "grid" : "none";
        });
    }

    if (selectXLoc) {
        selectXLoc.addEventListener("change", (e) => {
            if (e.target.value === "mid" && state.product !== "NEW PRO") {
                alert("⚠️ CONFIGURATION NON SUPPORTÉE :\nLa jonction X-MATRIX en milieu de ligne est uniquement disponible pour le système NEW PRO (et non Light Pro ni Long Range).\nPour cette étude spécifique, veuillez contacter l'équipe HOOKT.");
                e.target.value = "end";
            }
        });
    }

    document.getElementById("config-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const selectedShape = document.getElementById("input-roof-shape").value || "flat";
        if (selectedShape === "sloped" && state.product !== "NEW PRO") {
            alert("⚠️ CONFIGURATION NON SUPPORTÉE :\nLe toit mono-pente (incliné) est uniquement disponible pour le système NEW PRO (et non Light Pro ni Long Range).\nVeuillez contacter l'équipe HOOKT.");
            return;
        }
        state.roofShape = selectedShape;
        state.roofSlope = parseFloat(document.getElementById("input-roof-slope").value) || 15;
        state.lineLength = parseFloat(document.getElementById("input-line-length").value) || 15;
        state.nbUsers = parseInt(document.getElementById("input-users").value) || 1;
        const chuteVal = parseInt(document.getElementById("input-chute").value);
        state.fallFactor = isNaN(chuteVal) ? 1 : chuteVal;

        if (chkLine2 && chkLine2.checked) {
            const locVal = document.getElementById("select-xmatrix-location").value || "mid";
            if (locVal === "mid" && state.product !== "NEW PRO") {
                alert("⚠️ CONFIGURATION NON SUPPORTÉE :\nLa jonction X-MATRIX en milieu de ligne est uniquement disponible pour le système NEW PRO (et non Light Pro ni Long Range).\nPour cette étude spécifique, veuillez contacter l'équipe HOOKT.");
                return;
            }
        }
        if (chkLine2) {
            state.hasLine2 = chkLine2.checked;
            state.line2Length = parseFloat(document.getElementById("input-line2-length").value) || 10;
            state.xMatrixLocation = document.getElementById("select-xmatrix-location").value || "mid";
        }

        // Reset all components to unchecked initially upon validating configuration
        Object.keys(COMPONENTS_DB).forEach(prod => {
            COMPONENTS_DB[prod].forEach(c => {
                c.checked = false;
            });
        });
        Object.keys(state.checkedComponents).forEach(k => {
            state.checkedComponents[k] = false;
        });

        // Automatically select X-Matrix component if 2nd line is enabled at mid-span
        if (state.hasLine2 && state.xMatrixLocation === "mid") {
            const currentComps = COMPONENTS_DB[state.product] || [];
            const xmat = currentComps.find(c => c.id === "X-Matrix");
            if (xmat) xmat.checked = true;
            state.checkedComponents["X-Matrix"] = true;
        }

        configModal.classList.remove("active");
        homeScreen.classList.remove("active");
        dashboardScreen.classList.add("active");

        if (!renderer) {
            initThreeEngine();
        } else {
            renderComponentsChecklist();
            preloadActiveModels();
            update3DScene();
            onWindowResize();
        }
    });

    // System Cards Selection
    const sysCards = document.querySelectorAll(".system-card");
    sysCards.forEach(card => {
        card.addEventListener("click", () => {
            const chosenSystem = card.dataset.system;
            if (state.roofShape === "sloped" && chosenSystem !== "NEW PRO") {
                alert("⚠️ CONFIGURATION NON SUPPORTÉE :\nLe toit mono-pente (incliné) est uniquement disponible pour le système NEW PRO (et non Light Pro ni Long Range).\nVeuillez contacter l'équipe HOOKT.");
                return;
            }
            const isMidXMat = (state.hasLine2 && state.xMatrixLocation === "mid") || (COMPONENTS_DB[state.product] || []).some(c => c.id === "X-Matrix" && c.checked);
            if (isMidXMat && chosenSystem !== "NEW PRO") {
                alert("⚠️ CONFIGURATION NON SUPPORTÉE :\nLa jonction X-MATRIX en milieu de ligne est uniquement disponible pour le système NEW PRO (et non Light Pro ni Long Range).\nPour cette étude spécifique, veuillez contacter l'équipe HOOKT.");
                return;
            }
            sysCards.forEach(c => c.classList.remove("active"));
            card.classList.add("active");
            state.product = chosenSystem;
            renderComponentsChecklist();
            preloadActiveModels();
            update3DScene();
        });
    });

    // Roof Texture & Color Pickers
    document.getElementById("select-roof-texture").addEventListener("change", (e) => {
        state.roofTexture = e.target.value;
        update3DScene();
    });

    const colRoof = document.getElementById("color-roof");
    if (colRoof) {
        colRoof.addEventListener("input", (e) => {
            state.colors.roof = e.target.value;
            update3DScene();
        });
    }

    const colAnchors = document.getElementById("color-anchors");
    if (colAnchors) {
        colAnchors.addEventListener("input", (e) => {
            state.colors.anchors = e.target.value;
            update3DScene();
        });
    }

    const colCable = document.getElementById("color-cable");
    if (colCable) {
        colCable.addEventListener("input", (e) => {
            state.colors.cable = e.target.value;
            update3DScene();
        });
    }

    const checkObs = document.getElementById("check-obstacles");
    if (checkObs) {
        checkObs.addEventListener("change", (e) => {
            state.showObstacles = e.target.checked;
            update3DScene();
        });
    }

    // View Mode Switches
    const btn3D = document.getElementById("btn-view-3d");
    const btn2D = document.getElementById("btn-view-2d");

    btn3D.addEventListener("click", () => {
        btn3D.classList.add("active");
        btn2D.classList.remove("active");
        state.viewMode = "3d";
        activeCam = perspectiveCam;
        controls.enabled = true;
        update3DScene();
    });

    btn2D.addEventListener("click", () => {
        btn2D.classList.add("active");
        btn3D.classList.remove("active");
        state.viewMode = "2d";
        activeCam = orthographicCam;
        controls.enabled = false;
        update3DScene();
    });

    // Toolbar Actions
    document.getElementById("btn-reset-cam").addEventListener("click", () => {
        if (state.viewMode === "3d") {
            const centerX = state.L / 2;
            const centerZ = state.l / 2;
            const dist = Math.max(state.L, state.l) * 1.4;
            perspectiveCam.position.set(centerX + dist * 0.8, dist * 0.9, centerZ + dist * 0.8);
            controls.target.set(centerX, 0.2, centerZ);
            controls.update();
        }
    });

    document.getElementById("btn-toggle-grid").addEventListener("click", (e) => {
        state.gridVisible = !state.gridVisible;
        e.currentTarget.classList.toggle("active", state.gridVisible);
        update3DScene();
    });

    document.getElementById("btn-fullscreen").addEventListener("click", () => {
        const viewport = document.querySelector(".canvas-wrapper");
        if (!document.fullscreenElement) {
            viewport.requestFullscreen().catch(err => console.log(err));
        } else {
            document.exitFullscreen();
        }
    });

    // Node Inspector Events
    const nodeTypeSelect = document.getElementById("node-type-select");
    if (nodeTypeSelect) {
        nodeTypeSelect.addEventListener("change", (e) => {
            const activePositions = Calculator.calculateAnchorPositions(state.L, state.l, Calculator.getMaxSpan(state.product));
            if (state.selectedNodeIndex >= 0 && state.selectedNodeIndex < activePositions.length) {
                if (state.drawingMode === "auto") {
                    state.customPoints = activePositions.map(p => ({ ...p }));
                    state.drawingMode = "place";
                    setDrawingMode("place");
                }
                state.customPoints[state.selectedNodeIndex].type = e.target.value;
                update3DScene();
            }
        });
    }

    // Node Inspector Component & Rotation Controls
    const compSelect = document.getElementById("node-comp-select");
    if (compSelect) {
        compSelect.addEventListener("change", (e) => {
            const activePositions = Calculator.calculateAnchorPositions(state.L, state.l, Calculator.getMaxSpan(state.product));
            if (state.selectedNodeIndex >= 0 && state.selectedNodeIndex < activePositions.length) {
                if (state.drawingMode === "auto") {
                    state.customPoints = activePositions.map(p => ({ ...p }));
                    state.drawingMode = "place";
                    setDrawingMode("place");
                }
                const selectedCompId = e.target.value;
                state.customPoints[state.selectedNodeIndex].compId = selectedCompId;
                if (selectedCompId === "X-Matrix") {
                    state.customPoints[state.selectedNodeIndex].type = "x_matrix";
                    document.getElementById("node-type-select").value = "x_matrix";
                }
                preloadActiveModels();
                update3DScene();
            }
        });
    }

    const rotSlider = document.getElementById("node-rot-slider");
    if (rotSlider) {
        rotSlider.addEventListener("input", (e) => {
            const activePositions = Calculator.calculateAnchorPositions(state.L, state.l, Calculator.getMaxSpan(state.product));
            if (state.selectedNodeIndex >= 0 && state.selectedNodeIndex < activePositions.length) {
                if (state.drawingMode === "auto") {
                    state.customPoints = activePositions.map(p => ({ ...p }));
                    state.drawingMode = "place";
                    setDrawingMode("place");
                }
                const deg = parseFloat(e.target.value);
                state.customPoints[state.selectedNodeIndex].rotY = deg * Math.PI / 180;
                document.getElementById("node-rot-val").textContent = `${Math.round(deg)}°`;
                update3DScene();
            }
        });
    }

    const btnAlign = document.getElementById("btn-rot-align-line");
    if (btnAlign) {
        btnAlign.addEventListener("click", () => {
            if (state.selectedNodeIndex >= 0) {
                autoAlignNodeRotation(state.selectedNodeIndex);
                highlightSelectedNode();
                update3DScene();
            }
        });
    }

    const btn90 = document.getElementById("btn-rot-90");
    if (btn90) {
        btn90.addEventListener("click", () => {
            const activePositions = Calculator.calculateAnchorPositions(state.L, state.l, Calculator.getMaxSpan(state.product));
            if (state.selectedNodeIndex >= 0 && state.selectedNodeIndex < activePositions.length) {
                if (state.drawingMode === "auto") {
                    state.customPoints = activePositions.map(p => ({ ...p }));
                    state.drawingMode = "place";
                    setDrawingMode("place");
                }
                const node = state.customPoints[state.selectedNodeIndex];
                node.rotY = ((node.rotY || 0) + Math.PI / 2) % (2 * Math.PI);
                highlightSelectedNode();
                update3DScene();
            }
        });
    }

    const btnDeleteNode = document.getElementById("btn-delete-node");
    if (btnDeleteNode) {
        btnDeleteNode.addEventListener("click", () => {
            const activePositions = Calculator.calculateAnchorPositions(state.L, state.l, Calculator.getMaxSpan(state.product));
            if (state.selectedNodeIndex >= 0 && state.selectedNodeIndex < activePositions.length) {
                if (state.drawingMode === "auto") {
                    state.customPoints = activePositions.map(p => ({ ...p }));
                    state.drawingMode = "place";
                    setDrawingMode("place");
                }
                state.customPoints.splice(state.selectedNodeIndex, 1);
                state.selectedNodeIndex = -1;
                highlightSelectedNode();
                update3DScene();
            }
        });
    }

    // Regulatory Norm Tabs & OSHA Subtabs
    const tabEN = document.getElementById("tab-en795");
    const tabOSHA = document.getElementById("tab-osha");
    const subtabUnique = document.getElementById("subtab-span-unique");
    const subtabMulti = document.getElementById("subtab-span-multi");

    if (tabEN) {
        tabEN.addEventListener("click", () => {
            tabEN.classList.add("active");
            if (tabOSHA) tabOSHA.classList.remove("active");
            state.norm = "EN 795";
            update3DScene();
        });
    }

    if (tabOSHA) {
        tabOSHA.addEventListener("click", () => {
            tabOSHA.classList.add("active");
            if (tabEN) tabEN.classList.remove("active");
            state.norm = "OSHA/ANSI";
            update3DScene();
        });
    }

    if (subtabUnique) {
        subtabUnique.addEventListener("click", () => {
            subtabUnique.classList.add("active");
            if (subtabMulti) subtabMulti.classList.remove("active");
            state.oshaSpanMode = "unique";
            update3DScene();
        });
    }

    if (subtabMulti) {
        subtabMulti.addEventListener("click", () => {
            subtabMulti.classList.add("active");
            if (subtabUnique) subtabUnique.classList.remove("active");
            state.oshaSpanMode = "multi";
            update3DScene();
        });
    }

    const exportPdfBtn = document.getElementById("export-pdf-btn");
    if (exportPdfBtn) {
        exportPdfBtn.addEventListener("click", () => {
            generatePDFReport();
        });
    }

    setupCarouselEventListeners();
    renderComponentsChecklist();
}

// ==========================================
// FIXATIONS DATABASE & DYNAMIC RULES ENGINE
// ==========================================
const FIXATIONS_DB = {
    ancrages: {
        "NEW PRO": {
            "matrice_platine": { nombre: 6, type_fixation: "Boulons" },
            "platine_support": { nombre: 2, type_fixation: "—" }
        },
        "LIGHT PRO": {
            "matrice_platine": { nombre: 4, type_fixation: "—" },
            "platine_support": { nombre: 1, type_fixation: "—" }
        },
        "LONG RANGE": {
            "matrice_platine": { nombre: 8, type_fixation: "—" },
            "platine_support": { nombre: 1, type_fixation: "—" }
        }
    },
    pieces: {
        "Potelet galva rigide": {
            "default": { nombre: 4, type_fixation: "—" }
        },
        "Potelet inox rigide": {
            "default": { nombre: 4, type_fixation: "—" }
        },
        "MINI OMEGA": {
            "beton": { nombre: 4, type_fixation: "—" },
            "bac_acier": { nombre: 16, type_fixation: "—" },
            "default": { nombre: 4, type_fixation: "—" }
        },
        "Potelet basculant": {
            "bac_acier": { nombre: 16, type_fixation: "—" },
            "default": { nombre: 16, type_fixation: "—" }
        },
        "A.FIX": {
            "default": { nombre: 2, type_fixation: "Spits 12 ou 14 mm" }
        },
        "X-MATRIX": {
            "default": { nombre: 8, type_fixation: "Vis M6" }
        },
        "X-CONE": {
            "default": { nombre: 4, type_fixation: "Vis BTR M5" }
        }
    }
};

function normalizeSupportKey(roofTextureOrSupport) {
    if (!roofTextureOrSupport) return "beton";
    const s = roofTextureOrSupport.toLowerCase();
    if (s.includes("bac") || s.includes("metal") || s.includes("acier")) return "bac_acier";
    if (s.includes("zinc")) return "toiture_zinc";
    if (s.includes("wood") || s.includes("bois") || s.includes("lamelle")) return "poutre_lamelle_colle";
    if (s.includes("mur") || s.includes("sol") || s.includes("wall")) return "mur_sol";
    if (s.includes("plateforme") || s.includes("platform")) return "plateforme";
    return "beton";
}

function getFixationInfo(piece, niveau, support, ligneModel) {
    const model = (ligneModel || state.product || "NEW PRO").toUpperCase().includes("LONG") ? "LONG RANGE" : ((ligneModel || state.product || "NEW PRO").toUpperCase().includes("LIGHT") ? "LIGHT PRO" : "NEW PRO");
    const supportKey = normalizeSupportKey(support || state.roofTexture);

    if (niveau === "matrice_platine" || niveau === "platine_support") {
        const ancrageData = FIXATIONS_DB.ancrages[model];
        if (ancrageData && ancrageData[niveau]) {
            return ancrageData[niveau];
        }
    } else {
        let pKey = Object.keys(FIXATIONS_DB.pieces).find(k => k.toLowerCase() === (piece || "").toLowerCase());
        if (!pKey) {
            const pLower = (piece || "").toLowerCase();
            if (pLower.includes("mini")) pKey = "MINI OMEGA";
            else if (pLower.includes("basculant") || pLower.includes("pb_hookt")) pKey = "Potelet basculant";
            else if (pLower.includes("galva")) pKey = "Potelet galva rigide";
            else if (pLower.includes("inox")) pKey = "Potelet inox rigide";
            else if (pLower.includes("a-fix") || pLower.includes("afix")) pKey = "A.FIX";
            else if (pLower.includes("x-matrix") || pLower.includes("xmatrix")) pKey = "X-MATRIX";
            else if (pLower.includes("x-cone") || pLower.includes("xcone")) pKey = "X-CONE";
        }

        if (pKey && FIXATIONS_DB.pieces[pKey]) {
            const pieceData = FIXATIONS_DB.pieces[pKey];
            if (pieceData[supportKey]) return pieceData[supportKey];
            if (pieceData["default"]) return pieceData["default"];
        }
    }

    return {
        nombre: "Non renseigné — se référer à la notice",
        type_fixation: "Non renseigné — se référer à la notice"
    };
}

function validateProductAssociations() {
    const list = COMPONENTS_DB[state.product] || [];
    const hasMiniOmega = list.some(c => c.checked && (c.id === "Mini_Omega" || c.name.toLowerCase().includes("mini omega")));
    const hasBasculant = list.some(c => c.checked && (c.id === "PB_HOOKt" || c.name.toLowerCase().includes("basculant")));
    const hasRigide = list.some(c => c.checked && (c.id === "P_Galva" || c.id === "P_Inox" || c.name.toLowerCase().includes("rigide")));
    const hasAFix = list.some(c => c.checked && (c.id === "A-Fix" || c.name.toLowerCase().includes("a-fix")));
    const isXMatrixChecked = list.some(c => c.id === "X-Matrix" && c.checked);

    if (state.roofShape === "sloped" && state.product !== "NEW PRO") {
        alert("⚠️ CONFIGURATION NON SUPPORTÉE :\nLe toit mono-pente (incliné) est uniquement disponible pour le système NEW PRO (et non Light Pro ni Long Range).\nVeuillez contacter l'équipe HOOKT.");
        return false;
    }

    const isMidXMatrix = (state.hasLine2 && state.xMatrixLocation === "mid") || isXMatrixChecked || state.checkedComponents["X-Matrix"];

    if (isMidXMatrix && state.product !== "NEW PRO") {
        alert("⚠️ CONFIGURATION NON SUPPORTÉE :\nLa jonction X-MATRIX en milieu de ligne est uniquement disponible pour le système NEW PRO (et non Light Pro ni Long Range).\nPour cette étude spécifique, veuillez contacter l'équipe HOOKT.");
        return false;
    }

    if (hasMiniOmega && state.product !== "NEW PRO") {
        alert("⚠️ ALERTE CONFIGURATION INVALIDE :\nLe potelet MINI OMEGA ne s'utilise qu'avec un ancrage NEWPRO (jamais seul, ni avec Light Pro ou Longue Portée).");
        return false;
    }

    if (hasBasculant && state.product !== "LIGHT PRO") {
        alert("⚠️ ALERTE CONFIGURATION INVALIDE :\nLe potelet basculant ne s'utilise qu'avec un ancrage Light Pro.");
        return false;
    }

    if (hasRigide && state.product === "LONG RANGE") {
        alert("⚠️ ALERTE CONFIGURATION INVALIDE :\nLe potelet rigide ne s'utilise qu'avec les gammes NEWPRO ou Light Pro.");
        return false;
    }

    if (hasAFix && state.product !== "LONG RANGE") {
        alert("⚠️ ALERTE CONFIGURATION INVALIDE :\nLa pièce A.FIX ne s'utilise qu'avec la gamme Longue Portée.");
        return false;
    }

    return true;
}

function formatFixationType(typeFixation) {
    if (!typeFixation || typeFixation === "—" || typeFixation.trim() === "" || typeFixation.includes("Non renseigné")) {
        return "Se référer à la notice";
    }
    return typeFixation;
}

function calculateXConeCount(layout) {
    if (!layout) return 0;
    const spacing = (state.roofSlope > 30) ? 0.5 : 1.0;
    let totalCones = 0;
    const slopeRad = (state.roofSlope || 15) * (Math.PI / 180);

    const countConesForLine = (lineNodes) => {
        if (!lineNodes || lineNodes.length < 2) return;
        for (let i = 0; i < lineNodes.length - 1; i++) {
            const pA = lineNodes[i];
            const pB = lineNodes[i + 1];

            const xA = pA.x;
            const zA = pA.z;
            const yA = (state.roofShape === "sloped" || state.roofShape === "triangle") ? zA * Math.tan(slopeRad) : (pA.y || 0);

            const xB = pB.x;
            const zB = pB.z;
            const yB = (state.roofShape === "sloped" || state.roofShape === "triangle") ? zB * Math.tan(slopeRad) : (pB.y || 0);

            const dx = xB - xA;
            const dy = yB - yA;
            const dz = zB - zA;
            const segLen = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (segLen < spacing) continue;
            const count = Math.floor(segLen / spacing);
            for (let k = 1; k <= count; k++) {
                const dist = k * spacing;
                if (dist > segLen - 0.2) break;
                totalCones++;
            }
        }
    };

    if (layout.line1) countConesForLine(layout.line1);
    if (state.hasLine2 && layout.line2) countConesForLine(layout.line2);

    return totalCones;
}

// ==========================================
// REPORT PDF GENERATOR
// ==========================================
function generatePDFReport() {
    if (!validateProductAssociations()) return;

    if (!window.jspdf || !window.jspdf.jsPDF) {
        alert("Chargement du générateur PDF en cours... Veuillez réespayer dans un instant.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Brand Header
    doc.setFillColor(15, 23, 42); // Slate dark
    doc.rect(0, 0, 210, 26, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("HOOKT", 14, 17);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("RAPPORT D'INSTALLATION & NOTE DE CALCUL LIGNE DE VIE", 50, 16);

    // Section 1: Lifeline Details
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("1. Synthèse de la Ligne de Vie HOOKT", 14, 35);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const today = new Date().toLocaleDateString("fr-FR");

    const activeLayout = Calculator.calculateAnchorPositions(state.L, state.l, Calculator.getMaxSpan(state.product));
    const positions = (activeLayout && activeLayout.all) ? activeLayout.all : (Array.isArray(activeLayout) ? activeLayout : []);
    const anchorPosts = positions.filter(p => p.type !== "x_matrix");
    const totalAnchors = anchorPosts.length > 0 ? anchorPosts.length : positions.length;
    const totalLineLen = Calculator.calculateTotalLineLength(activeLayout, state.product);
    const realSpanMax = Calculator.calculateMaxRealSpan(activeLayout);
    const isOSHA = (state.norm === "OSHA/ANSI" || state.norm === "OSHA" || state.norm === "ANSI");
    const isMultiSpan = isOSHA ? (state.oshaSpanMode === "multi") : (totalAnchors > 2);
    const support = getActiveSupport();

    const effortL = Calculator.effortLonge(state.product, realSpanMax, state.nbUsers, state.norm, state.fallFactor, support, isMultiSpan);
    const deflL = Calculator.deflection(state.product, realSpanMax, state.fallFactor, support, state.nbUsers, state.norm, isMultiSpan);
    const ext1L = Calculator.extremiteForce1(state.product, realSpanMax, state.nbUsers, state.norm, effortL, deflL, state.fallFactor, support, isMultiSpan);
    const ext2L = Calculator.extremiteForce2(state.product, realSpanMax, state.nbUsers, state.norm, effortL, deflL, state.fallFactor, support, isMultiSpan);

    const supportLabel = state.roofTexture === "concrete" ? "Dalle Béton" : (state.roofTexture === "metal" ? "Bac Acier Nervuré" : (state.roofTexture === "bitumen" ? "Étanchéité Bitume" : "Structure Metal / Autre"));
    const slopeText = state.roofShape === "flat" ? "0° (Toit Plat)" : `${state.roofSlope}° (${state.roofShape === "sloped" ? "Toit Incliné" : "Toit Triangulaire"})`;

    const postName = getActivePostName();
    doc.text(`Date de génération : ${today}`, 14, 42);
    doc.text(`Gamme de produit : ${state.product}`, 14, 48);
    doc.text(`Norme de calcul : ${state.norm}`, 14, 54);
    doc.text(`Facteur de chute : Facteur ${state.fallFactor}`, 14, 60);
    doc.text(`Nombre d'ancrages (${postName}) : ${totalAnchors}`, 14, 66);
    doc.text(`Nombre d'absorbeurs (${state.product}) : ${totalAnchors}`, 14, 72);

    doc.text(`Support de pose : ${supportLabel}`, 110, 42);
    doc.text(`Pente de toiture : ${slopeText}`, 110, 48);
    if (state.hasLine2) {
        const juncText = state.xMatrixLocation === "mid" ? "Jonction X-Matrix Milieu" : "Jonction Virage/Extrémité";
        doc.text(`Lignes : L1 = ${state.lineLength} m  |  L2 = ${state.line2Length} m (${juncText})`, 110, 54);
    } else {
        doc.text(`Longueur Ligne (L1) : ${state.lineLength} m`, 110, 54);
    }
    doc.text(`Longueur totale développée : ${totalLineLen.toFixed(2)} m`, 110, 60);
    doc.text(`Nombre d'utilisateurs max : ${state.nbUsers} pers.`, 110, 66);

    // Section 2: Mechanical calculations table
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("2. Résultats Mécaniques & Sollicitations", 14, 83);

    const deflDisplay = isOSHA ? `${deflL.toFixed(2)} mm` : `${Math.round(deflL)} mm`;

    const mechData = [
        ["Portée réelle max", `${realSpanMax.toFixed(2)} m`],
        ["Effort longe (Fmax)", `${effortL.toFixed(2)} kN`],
        ["Flèche maximale", deflDisplay],
        ["Force Extrémité 1", `${ext1L.toFixed(1)} kN`],
        ["Force Extrémité 2", `${ext2L.toFixed(1)} kN`]
    ];

    if (isOSHA && isMultiSpan) {
        const ext3L = Calculator.extremiteForce3(state.product, realSpanMax, state.nbUsers, state.norm, effortL, deflL, state.fallFactor, support, isMultiSpan);
        const ext4L = Calculator.extremiteForce4(state.product, realSpanMax, state.nbUsers, state.norm, effortL, deflL, state.fallFactor, support, isMultiSpan);
        mechData.push(["Force Ancrage 3", `${ext3L.toFixed(1)} kN`]);
        mechData.push(["Force Ancrage 4", `${ext4L.toFixed(1)} kN`]);
    }

    doc.autoTable({
        startY: 86,
        head: [["Indicateur Mécanique", "Valeur Calculée"]],
        body: mechData,
        theme: 'striped',
        headStyles: { fillColor: [15, 23, 42] },
        styles: { fontSize: 8 }
    });

    // Section 3: Components & Fixations Table with exact 3 columns
    const currentY = doc.lastAutoTable.finalY + 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("3. Nomenclatures des Composants & Fixations Préconisées", 14, currentY);

    const compsList = COMPONENTS_DB[state.product] || [];
    const checkedComps = compsList.filter(c => c.checked);

    const hasOmegaOrMini = checkedComps.some(c => {
        const idL = (c.id || "").toLowerCase();
        const nL = (c.name || "").toLowerCase();
        return idL.includes("omega") || idL.includes("mini") || nL.includes("omega") || nL.includes("mini");
    });

    const tableRows = [];

    // 1. Matrice (Absorbeur) selon la gamme
    const matriceName = state.product === "NEW PRO" ? "Matrice NEWPRO (Absorbeur)" : (state.product === "LIGHT PRO" ? "Matrice Light Pro (Absorbeur)" : "Matrice Longue Portée");
    const lvl1 = getFixationInfo(state.product, "matrice_platine", state.roofTexture, state.product);
    const countLvl1 = typeof lvl1.nombre === 'number' ? `${lvl1.nombre * totalAnchors} (${lvl1.nombre}/matrice)` : lvl1.nombre;
    tableRows.push([
        `${matriceName} (x${totalAnchors})`,
        `${countLvl1}`,
        formatFixationType(lvl1.type_fixation)
    ]);

    // 2. Platine de fixation au support / potelet
    const platineName = state.product === "NEW PRO" ? "Platine de fixation NEWPRO" : (state.product === "LIGHT PRO" ? "Platine de fixation Light Pro" : "Platine de fixation Longue Portée");
    const lvl2 = getFixationInfo(state.product, "platine_support", state.roofTexture, state.product);
    const countLvl2 = typeof lvl2.nombre === 'number' ? `${lvl2.nombre * totalAnchors} (${lvl2.nombre}/platine)` : lvl2.nombre;
    const typeFixPlatine = hasOmegaOrMini ? "Boulons Inox M12 x 30 + rondelles" : formatFixationType(lvl2.type_fixation);

    tableRows.push([
        `${platineName} (x${totalAnchors})`,
        `${countLvl2}`,
        typeFixPlatine
    ]);

    // 3. Potelets ou pièces additionnelles présent(e)s dans la configuration
    checkedComps.forEach(c => {
        const cIdLower = (c.id || "").toLowerCase();

        // Skip main absorbers because they are already detailed above as Matrice and Platine
        if (cIdLower === "new_pro" || cIdLower === "lightpro" || cIdLower === "longrange") {
            return;
        }

        const fixInfo = getFixationInfo(c.name, null, state.roofTexture, state.product);
        let qtyItem = totalAnchors;
        let countFix = fixInfo.nombre;

        if (cIdLower.includes("x-matrix") || cIdLower.includes("xmatrix")) {
            qtyItem = 1;
            countFix = typeof fixInfo.nombre === 'number' ? fixInfo.nombre : 8;
        } else if (cIdLower.includes("x-cone") || cIdLower.includes("xcone")) {
            const xConeCount = calculateXConeCount(activeLayout);
            qtyItem = xConeCount;
            countFix = typeof fixInfo.nombre === 'number' ? `${fixInfo.nombre * xConeCount} (${fixInfo.nombre}/x-cone)` : fixInfo.nombre;
        } else if (typeof fixInfo.nombre === 'number') {
            countFix = `${fixInfo.nombre * totalAnchors} (${fixInfo.nombre}/potelet)`;
        }

        tableRows.push([
            `${c.name} (x${qtyItem})`,
            `${countFix}`,
            formatFixationType(fixInfo.type_fixation)
        ]);
    });

    if (tableRows.length === 0) {
        tableRows.push(["Aucun composant coché", "-", "-"]);
    }

    doc.autoTable({
        startY: currentY + 4,
        head: [["Nom de la pièce", "Nombre de fixations", "Type de fixation"]],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235] },
        styles: { fontSize: 8 }
    });

    // Footer on all PDF pages with Website, Email, and Phone number
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.5);
        doc.line(14, 280, 196, 280);

        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 116, 139);

        const currentYear = new Date().getFullYear();
        doc.text(`© ${currentYear} HOOKT. Tous droits réservés. — Protection et Sécurité en Hauteur`, 14, 285);
        doc.text("Site Web : www.go-hookt.com   |   Email : contact@go-hookt.com   |   Tél : 05 59 52 40 48", 14, 289);
        doc.text(`Page ${i} / ${pageCount}`, 180, 289);
    }

    doc.save(`HOOKT_Rapport_Installation_${state.product.replace(/\s+/g, '_')}_${today.replace(/\//g, '-')}.pdf`);
}

function renderComponentsChecklist() {
    const listContainer = document.getElementById("components-list");
    if (!listContainer) return;

    listContainer.innerHTML = "";
    const comps = COMPONENTS_DB[state.product] || [];

    comps.forEach(c => {
        const item = document.createElement("div");
        item.className = `component-check-card ${c.checked ? "active" : ""}`;
        item.dataset.compId = c.id;

        let explodedBtnHTML = "";
        if (c.exploded && c.exploded.length > 0) {
            explodedBtnHTML = `<button type="button" class="btn-exploded" title="Vue Éclatée"><i class="fa-solid fa-eye"></i></button>`;
        }

        item.innerHTML = `
            <div class="comp-chk-wrapper">
                <input type="checkbox" class="comp-chk-input" id="chk-${c.id}" ${c.checked ? "checked" : ""}>
            </div>
            <div class="comp-info">
                <span class="comp-name">${c.name}</span>
            </div>
            ${explodedBtnHTML}
        `;

        const chk = item.querySelector(".comp-chk-input");

        item.addEventListener("click", (e) => {
            if (e.target.closest(".btn-exploded")) return;
            if (e.target !== chk) {
                chk.checked = !chk.checked;
            }
            c.checked = chk.checked;
            item.classList.toggle("active", c.checked);

            if (c.id === "X-Matrix") {
                if (c.checked && state.product !== "NEW PRO") {
                    alert("⚠️ CONFIGURATION NON SUPPORTÉE :\nLa jonction X-MATRIX en milieu de ligne est uniquement disponible pour le système NEW PRO (et non Light Pro ni Long Range).\nPour cette étude spécifique, veuillez contacter l'équipe HOOKT.");
                    c.checked = false;
                    chk.checked = false;
                    item.classList.remove("active");
                    return;
                }
                state.hasLine2 = c.checked;
                state.xMatrixLocation = "mid";
                const chkFormLine2 = document.getElementById("input-has-line2");
                if (chkFormLine2) chkFormLine2.checked = c.checked;
            }

            preloadActiveModels();
            update3DScene();
        });

        const explodedBtn = item.querySelector(".btn-exploded");
        if (explodedBtn) {
            explodedBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                openExplodedCarousel(c);
            });
        }

        listContainer.appendChild(item);
    });
}

// Kickoff
document.addEventListener("DOMContentLoaded", () => {
    setupUIEventListeners();
});
