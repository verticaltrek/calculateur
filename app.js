// HOOKT Web App JS Controller
console.log("HOOKT Web App Controller loaded (v1.0.1 - Selection Fix)");

// =========================================================================
// 1. DATABASES PORTING
// =========================================================================

const SystemType = {
    NEW_PRO: 0,
    LIGHT_PRO: 1,
    LONG_RANGE: 2
};

const supportTypeMapping = {
    "Rigide (sans potelet basculant)": "Rigide",
    "PB250 (potelet basculant générique)": "PB250",
    "PB HOOKT (potelet basculant HOOKT)": "PB HOOKT"
};

// NEW PRO predict records (from JSON in C++)
const newProPredictRecords = [
    { configId: "GP1", zone: "Grande portée", portee: 15, direction: "sol_mur", ancrage: "ocho+", users: 1, fmax_ancre: 5.1, force_ext1: 13.9, force_ext2: 13.7, fleche: 1300, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "GP5", zone: "Grande portée", portee: 15, direction: "omega", ancrage: "ocho+", users: 1, fmax_ancre: 4.4, force_ext1: 12.2, force_ext2: 12.2, fleche: 1290, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "GP9", zone: "Grande portée", portee: 15, direction: "omega_mini", ancrage: "ocho+", users: 1, fmax_ancre: 4.7, force_ext1: 12.9, force_ext2: 12.5, fleche: 1410, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "GP10", zone: "Grande portée", portee: 15, direction: "overhead", ancrage: "ocho+", users: 1, fmax_ancre: 4.4, force_ext1: 10.8, force_ext2: 10.4, fleche: 1640, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "PP1", zone: "Grande portée", portee: 3, direction: "sol_mur", ancrage: "ocho+", users: 1, fmax_ancre: 6.4, force_ext1: 9.7, force_ext2: 9.6, fleche: 490, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "PP5", zone: "Grande portée", portee: 3, direction: "omega", ancrage: "ocho+", users: 1, fmax_ancre: 5.0, force_ext1: 7.1, force_ext2: 7.2, fleche: 495, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "PP9", zone: "Grande portée", portee: 3, direction: "omega_mini", ancrage: "ocho+", users: 1, fmax_ancre: 5.7, force_ext1: 10.1, force_ext2: 10.0, fleche: 450, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "PP10", zone: "Grande portée", portee: 3, direction: "overhead", ancrage: "ocho+", users: 1, fmax_ancre: 7.2, force_ext1: 11.3, force_ext2: 11.1, fleche: 485, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "GP1", zone: "Grande portée", portee: 15, direction: "sol_mur", ancrage: "ocho+", users: 2, fmax_ancre: 7.8, force_ext1: 14.9, force_ext2: 15.2, fleche: 2105, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "GP1", zone: "Grande portée", portee: 15, direction: "sol_mur", ancrage: "ocho+", users: 3, fmax_ancre: 7.2, force_ext1: 13.9, force_ext2: 14.0, fleche: 2105, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "GP1", zone: "Grande portée", portee: 15, direction: "sol_mur", ancrage: "ocho+", users: 4, fmax_ancre: 7.6, force_ext1: 14.7, force_ext2: 14.7, fleche: 2105, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "GP1", zone: "Grande portée", portee: 15, direction: "sol_mur", ancrage: "ocho+", users: 5, fmax_ancre: 8.3, force_ext1: 16.0, force_ext2: 16.0, fleche: 2105, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "GP5", zone: "Grande portée", portee: 15, direction: "omega", ancrage: "ocho+", users: 2, fmax_ancre: 6.8, force_ext1: 14.6, force_ext2: 14.4, fleche: 1810, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "GP5", zone: "Grande portée", portee: 15, direction: "omega", ancrage: "ocho+", users: 3, fmax_ancre: 6.5, force_ext1: 13.0, force_ext2: 13.0, fleche: 1810, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "GP5", zone: "Grande portée", portee: 15, direction: "omega", ancrage: "ocho+", users: 4, fmax_ancre: 6.8, force_ext1: 14.1, force_ext2: 13.9, fleche: 1830, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "GP5", zone: "Grande portée", portee: 15, direction: "omega", ancrage: "ocho+", users: 5, fmax_ancre: 7.3, force_ext1: 14.8, force_ext2: 14.6, fleche: 1875, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "GP9", zone: "Grande portée", portee: 15, direction: "omega_mini", ancrage: "ocho+", users: 2, fmax_ancre: 9.5, force_ext1: 18.0, force_ext2: 18.0, fleche: 2110, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "GP9", zone: "Grande portée", portee: 15, direction: "omega_mini", ancrage: "ocho+", users: 3, fmax_ancre: 7.5, force_ext1: 13.6, force_ext2: 13.9, fleche: 2110, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "GP9", zone: "Grande portée", portee: 15, direction: "omega_mini", ancrage: "ocho+", users: 4, fmax_ancre: 7.8, force_ext1: 14.1, force_ext2: 14.4, fleche: 2110, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "GP9", zone: "Grande portée", portee: 15, direction: "omega_mini", ancrage: "ocho+", users: 5, fmax_ancre: 8.5, force_ext1: 15.6, force_ext2: 15.8, fleche: 2110, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "GP10", zone: "Grande portée", portee: 15, direction: "overhead", ancrage: "ocho+", users: 2, fmax_ancre: 9.0, force_ext1: 18.1, force_ext2: 17.8, fleche: 1850, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "GP10", zone: "Grande portée", portee: 15, direction: "overhead", ancrage: "ocho+", users: 3, fmax_ancre: 7.2, force_ext1: 14.8, force_ext2: 14.8, fleche: 1850, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "GP10", zone: "Grande portée", portee: 15, direction: "overhead", ancrage: "ocho+", users: 4, fmax_ancre: 7.2, force_ext1: 14.8, force_ext2: 14.8, fleche: 1860, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "GP10", zone: "Grande portée", portee: 15, direction: "overhead", ancrage: "ocho+", users: 5, fmax_ancre: 8.0, force_ext1: 16.2, force_ext2: 16.2, fleche: 1860, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "PP1", zone: "Grande portée", portee: 3, direction: "sol_mur", ancrage: "ocho+", users: 2, fmax_ancre: 9.7, force_ext1: 13.9, force_ext2: 13.5, fleche: 550, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "PP1", zone: "Grande portée", portee: 3, direction: "sol_mur", ancrage: "ocho+", users: 3, fmax_ancre: 9.5, force_ext1: 12.3, force_ext2: 12.4, fleche: 575, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "PP1", zone: "Grande portée", portee: 3, direction: "sol_mur", ancrage: "ocho+", users: 4, fmax_ancre: 9.9, force_ext1: 13.1, force_ext2: 13.2, fleche: 585, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "PP1", zone: "Grande portée", portee: 3, direction: "sol_mur", ancrage: "ocho+", users: 5, fmax_ancre: 9.8, force_ext1: 12.6, force_ext2: 12.7, fleche: 610, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "PP5", zone: "Grande portée", portee: 3, direction: "omega", ancrage: "ocho+", users: 2, fmax_ancre: 7.9, force_ext1: 10.8, force_ext2: 10.7, fleche: 555, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "PP5", zone: "Grande portée", portee: 3, direction: "omega", ancrage: "ocho+", users: 3, fmax_ancre: 8.3, force_ext1: 10.6, force_ext2: 10.3, fleche: 560, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "PP5", zone: "Grande portée", portee: 3, direction: "omega", ancrage: "ocho+", users: 4, fmax_ancre: 8.5, force_ext1: 10.5, force_ext2: 10.2, fleche: 560, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "PP5", zone: "Grande portée", portee: 3, direction: "omega", ancrage: "ocho+", users: 5, fmax_ancre: 8.8, force_ext1: 10.6, force_ext2: 10.4, fleche: 560, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "PP9", zone: "Grande portée", portee: 3, direction: "omega_mini", ancrage: "ocho+", users: 2, fmax_ancre: 8.0, force_ext1: 13.1, force_ext2: 13.0, fleche: 535, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "PP9", zone: "Grande portée", portee: 3, direction: "omega_mini", ancrage: "ocho+", users: 3, fmax_ancre: 8.7, force_ext1: 12.5, force_ext2: 12.7, fleche: 555, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "PP9", zone: "Grande portée", portee: 3, direction: "omega_mini", ancrage: "ocho+", users: 4, fmax_ancre: 8.9, force_ext1: 11.5, force_ext2: 12.0, fleche: 585, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "PP9", zone: "Grande portée", portee: 3, direction: "omega_mini", ancrage: "ocho+", users: 5, fmax_ancre: 9.1, force_ext1: 11.8, force_ext2: 11.8, fleche: 625, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "PP10", zone: "Grande portée", portee: 3, direction: "overhead", ancrage: "ocho+", users: 2, fmax_ancre: 10.2, force_ext1: 16.4, force_ext2: 16.3, fleche: 505, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "PP10", zone: "Grande portée", portee: 3, direction: "overhead", ancrage: "ocho+", users: 3, fmax_ancre: 9.9, force_ext1: 15.4, force_ext2: 15.4, fleche: 505, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "PP10", zone: "Grande portée", portee: 3, direction: "overhead", ancrage: "ocho+", users: 4, fmax_ancre: 10.2, force_ext1: 15.4, force_ext2: 15.4, fleche: 505, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "PP10", zone: "Grande portée", portee: 3, direction: "overhead", ancrage: "ocho+", users: 5, fmax_ancre: 10.3, force_ext1: 15.4, force_ext2: 15.5, fleche: 505, supportType: "Rigide", fallFactor: 2.0 }
];

// Reference intermediate records (for NEW PRO)
const intermediateRecords = [
    { configId: "INT3", zone: "Ancre inter.", portee: 15.0, direction: "potelet OMEGA", ancrage: "ocho+", users: 1, fmax_ancre: 8.20, force_ext1: -1.0, force_ext2: -1.0, fleche: -1.0, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "INT6", zone: "Ancre inter.", portee: 15.0, direction: "potelet OMEGA mini", ancrage: "ocho", users: 1, fmax_ancre: 9.90, force_ext1: -1.0, force_ext2: -1.0, fleche: -1.0, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "INT7", zone: "Ancre inter.", portee: 15.0, direction: "overhead", ancrage: "ocho+", users: 1, fmax_ancre: 8.30, force_ext1: -1.0, force_ext2: -1.0, fleche: -1.0, supportType: "Rigide", fallFactor: 2.0 },
    { configId: "INT8", zone: "Ancre inter.", portee: 15.0, direction: "overhead", ancrage: "ocho", users: 1, fmax_ancre: 9.70, force_ext1: -1.0, force_ext2: -1.0, fleche: -1.0, supportType: "Rigide", fallFactor: 2.0 }
];

// Reference records for long range
const longRangePredictRecords = [
    { portee: 56.0, users: 1, fmax_ancre: 4.0, force_ext1: 17.9, force_ext2: 18.0, fleche: 2600.0, configId: "EN795" },
    { portee: 56.0, users: 2, fmax_ancre: 6.3, force_ext1: 25.2, force_ext2: 25.6, fleche: 3260.0, configId: "TS16415" },
    { portee: 56.0, users: 3, fmax_ancre: 5.1, force_ext1: 21.0, force_ext2: 21.2, fleche: 3260.0, configId: "TS16415" },
    { portee: 34.0, users: 1, fmax_ancre: 4.5, force_ext1: 16.3, force_ext2: 16.8, fleche: 2450.0, configId: "EN795" },
    { portee: 34.0, users: 2, fmax_ancre: 7.5, force_ext1: 20.4, force_ext2: 20.9, fleche: 3140.0, configId: "TS16415" },
    { portee: 34.0, users: 3, fmax_ancre: 7.1, force_ext1: 19.1, force_ext2: 19.9, fleche: 3170.0, configId: "TS16415" },
    { portee: 10.0, users: 1, fmax_ancre: 4.8, force_ext1: 14.0, force_ext2: 14.7, fleche: 780.0, configId: "EN795" },
    { portee: 10.0, users: 2, fmax_ancre: 8.9, force_ext1: 26.5, force_ext2: 27.0, fleche: 905.0, configId: "TS16415" },
    { portee: 10.0, users: 3, fmax_ancre: 8.1, force_ext1: 21.9, force_ext2: 22.4, fleche: 905.0, configId: "TS16415" }
];

// =========================================================================
// 2. MATHEMATICAL CALCULATION FUNCTIONS
// =========================================================================

function calculateTriangleTension(fmax_ancre, portee, fleche) {
    if (fleche <= 0.0) return 0.0;
    const f_m = fleche / 1000.0; // mm to m
    return fmax_ancre * Math.sqrt(portee * portee + 4.0 * f_m * f_m) / (4.0 * f_m);
}

function getBaselineFmax(system, users, portee, supportType) {
    if (system === SystemType.LIGHT_PRO) {
        const t = Math.max(0.0, Math.min(1.0, (portee - 2.0) / (15.0 - 2.0)));
        if (supportType.toLowerCase().includes("hookt")) {
            if (users === 1) return 5.6 + t * (5.0 - 5.6);
            if (users === 2) return 6.7 + t * (6.5 - 6.7);
            if (users === 3) return 7.0 + t * (7.4 - 7.0);
            return 7.4;
        } else if (supportType.toLowerCase().includes("pb250")) {
            if (users === 1) return 5.6 + t * (8.3 - 5.6);
            return 8.3;
        } else { // rigide
            if (users === 1) return 6.4 + t * (6.3 - 6.4);
            if (users === 2) return 8.3;
            if (users === 3) return 5.1;
            return 4.7;
        }
    }
    if (system === SystemType.LONG_RANGE) {
        let f10 = 4.8;
        let f34 = 4.5;
        let f56 = 4.0;

        let usersToUse = Math.min(users, 3);
        if (usersToUse === 2) {
            f10 = 8.9; f34 = 7.5; f56 = 6.3;
        } else if (usersToUse === 3) {
            f10 = 8.1; f34 = 7.1; f56 = 5.1;
        }

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

function getRefLanyardForce(system, norm, zone, portee, direction, supportType, users, selectedFallFactor) {
    if (selectedFallFactor === 0.0) {
        return 1.0 * users;
    }

    let fancre_ref = 6.0;

    if (system === SystemType.LIGHT_PRO) {
        if (selectedFallFactor === 1.0) {
            return (users === 1) ? 1.5 : 5.0;
        }
        fancre_ref = getBaselineFmax(SystemType.LIGHT_PRO, users, portee, supportType);
    } else if (system === SystemType.LONG_RANGE) {
        fancre_ref = getBaselineFmax(SystemType.LONG_RANGE, users, portee, supportType);
    } else if (system === SystemType.NEW_PRO) {
        if (zone === "Sur ancre intermédiaire") {
            let targetDir = "potelet OMEGA";
            if (direction.toLowerCase().includes("mini")) {
                targetDir = "potelet OMEGA mini";
            } else if (direction.toLowerCase().includes("omega")) {
                targetDir = "potelet OMEGA";
            } else if (direction.toLowerCase().includes("overhead")) {
                targetDir = "overhead";
            }

            const match = intermediateRecords.find(r => r.direction === targetDir);
            fancre_ref = match ? match.fmax_ancre : 8.20;
        } else {
            // Portee unique
            let searchDir = "sol_mur";
            if (direction.toLowerCase().includes("mini")) {
                searchDir = "omega_mini";
            } else if (direction.toLowerCase().includes("omega")) {
                searchDir = "omega";
            } else if (direction.toLowerCase().includes("overhead")) {
                searchDir = "overhead";
            } else if (direction.toLowerCase().includes("sol")) {
                searchDir = "sol_mur";
            }

            const rec_3 = newProPredictRecords.find(r => r.direction === searchDir && r.users === users && r.portee === 3.0);
            const rec_15 = newProPredictRecords.find(r => r.direction === searchDir && r.users === users && r.portee === 15.0);

            if (rec_3 && rec_15) {
                const t = Math.max(0.0, Math.min(1.0, (portee - 3.0) / 12.0));
                fancre_ref = rec_3.fmax_ancre + t * (rec_15.fmax_ancre - rec_3.fmax_ancre);
            } else {
                fancre_ref = 5.10;
            }
        }
    }

    // fall factor scaling
    let k_fc = 1.0;
    if (selectedFallFactor === 2.0) {
        k_fc = 1.0;
    } else if (selectedFallFactor === 1.0) {
        k_fc = Math.sqrt(0.5); // 0.7071
    } else {
        k_fc = 0.25;
    }

    return fancre_ref * k_fc;
}

function calculate(system, norm, zone, portee, direction, ancrage, users, fmax_ancre_input, supportType, selectedFallFactor) {
    if (fmax_ancre_input <= 0) return null;

    let outResult = {
        fmax_ancre_ref: fmax_ancre_input,
        force_ext1_ref: -1.0,
        force_ext2_ref: -1.0,
        fleche_ref: -1.0,
        force_ext1_calc: -1.0,
        force_ext2_calc: -1.0,
        fleche_calc: -1.0,
        force_ext1_baseline: -1.0,
        force_ext2_baseline: -1.0,
        fleche_baseline: -1.0,
        fmax_ancre_baseline: -1.0,
        confidence_pct: 10,
        isExtrapolated: false,
        isIntermediate: false,
        matchedConfig: ""
    };

    // ==========================================
    // LONG RANGE CALCULATIONS
    // ==========================================
    if (system === SystemType.LONG_RANGE) {
        outResult.isIntermediate = false;
        outResult.isExtrapolated = (portee < 10.0 || portee > 56.0);
        outResult.matchedConfig = "LongRange Calibration";

        let usersToUse = Math.min(users, 3);
        const matchingRecs = longRangePredictRecords.filter(r => r.users === usersToUse)
            .sort((a, b) => a.portee - b.portee);

        if (matchingRecs.length === 0) return null;

        let rec1, rec2;
        if (portee <= 10.0) {
            rec1 = rec2 = matchingRecs[0];
        } else if (portee <= 34.0) {
            rec1 = matchingRecs[0]; // 10m
            rec2 = matchingRecs[1]; // 34m
        } else if (portee <= 56.0) {
            rec1 = matchingRecs[1]; // 34m
            rec2 = matchingRecs[2]; // 56m
        } else {
            rec1 = rec2 = matchingRecs[2]; // 56m
        }

        const P1 = rec1.portee;
        const P2 = rec2.portee;
        let t = 0.0;
        if (P2 > P1) t = (portee - P1) / (P2 - P1);

        let fleche_ref = rec1.fleche + t * (rec2.fleche - rec1.fleche);
        let fancre_ref = rec1.fmax_ancre + t * (rec2.fmax_ancre - rec1.fmax_ancre);
        let fext1_ref = rec1.force_ext1 + t * (rec2.force_ext1 - rec1.force_ext1);
        let fext2_ref = rec1.force_ext2 + t * (rec2.force_ext2 - rec1.force_ext2);

        if (fleche_ref < 10.0) fleche_ref = 10.0;

        const fc = selectedFallFactor;
        let k_fc = 1.0;
        let k_fleche_fc = 1.0;

        if (fc === 2.0) {
            k_fc = 1.0; k_fleche_fc = 1.0;
        } else if (fc === 1.0) {
            k_fc = 0.90; k_fleche_fc = Math.sqrt(0.5);
        } else {
            k_fc = 1.0; k_fleche_fc = 0.50;
        }

        const fmax_ancre_calc = fmax_ancre_input * k_fc;
        const ratio_longe = Math.max(0.0, fmax_ancre_calc / fancre_ref);
        const k_fleche = k_fleche_fc * Math.sqrt(ratio_longe);
        const fleche_calc = fleche_ref * k_fleche;

        const fmax_ancre_base = getBaselineFmax(system, users, portee, supportType);

        outResult.force_ext1_baseline = fext1_ref;
        outResult.force_ext2_baseline = fext2_ref;
        outResult.fleche_baseline = fleche_ref;
        outResult.fmax_ancre_baseline = fmax_ancre_base;

        let fext1_calc = fext1_ref * (fmax_ancre_calc / fancre_ref);
        let fext2_calc = fext2_ref * (fmax_ancre_calc / fancre_ref);
        if (fc === 0.0) {
            fext1_calc += 1.0;
            fext2_calc += 1.0;
        }
        outResult.force_ext1_calc = fext1_calc;
        outResult.force_ext2_calc = fext2_calc;
        outResult.fleche_calc = fleche_calc;

        outResult.force_ext1_ref = fext1_ref * (fmax_ancre_input / fancre_ref);
        outResult.force_ext2_ref = fext2_ref * (fmax_ancre_input / fancre_ref);
        outResult.fleche_ref = fleche_ref;
        outResult.fmax_ancre_ref = fmax_ancre_input;

        outResult.confidence_pct = (fc === 2.0) ? 10 : (fc === 1.0) ? 15 : 25;
        return outResult;
    }

    // ==========================================
    // LIGHT PRO CALCULATIONS
    // ==========================================
    if (system === SystemType.LIGHT_PRO) {
        outResult.isIntermediate = false;

        let K_a = 0.6064, K_b = 0.5753;
        let f_a = 771.4, f_b = 0.3453;
        let mu = 0.03;
        let confidence_pct = 12.0;
        let calibration = "";

        if (supportType.toLowerCase().includes("pb250")) {
            K_a = 0.3314; K_b = 0.9476;
            f_a = 441.7; f_b = 0.7050;
            confidence_pct = 15.0;
            calibration = "GP1-PB 15m + RQC chutes 2m/15m — R²=0.986";
        } else if (supportType.toLowerCase().includes("hookt")) {
            K_a = 0.3314; K_b = 0.9476;
            f_a = 390.0; f_b = 0.6800;
            confidence_pct = 15.0;
            calibration = "RQC2026-123-1 — 6 pts (2m+15m, chutes 1-3)";
        } else {
            // Rigide
            K_a = 0.6064; K_b = 0.5753;
            f_a = 771.4; f_b = 0.3453;
            confidence_pct = 12.0;
            calibration = "GP1 15m + PP1 2m — R²=1.000";
        }

        const fmax_ancre_base = getBaselineFmax(system, users, portee, supportType);

        const pred_fleche = Math.max(10.0, f_a * Math.pow(portee, f_b));

        const fc = selectedFallFactor;
        let k_fc = 1.0;
        if (fc === 1.0) {
            k_fc = Math.sqrt(0.5);
        }

        const fmax_ancre_calc = fmax_ancre_input * k_fc;
        const ratio_longe = Math.max(0.0, fmax_ancre_calc / fmax_ancre_base);
        const k_fleche = Math.sqrt(ratio_longe);
        const fleche_calc = pred_fleche * k_fleche;

        const T_base = calculateTriangleTension(fmax_ancre_base, portee, pred_fleche);
        const T_ref = calculateTriangleTension(fmax_ancre_input, portee, pred_fleche);
        const T_calc = calculateTriangleTension(fmax_ancre_calc, portee, fleche_calc);

        outResult.isExtrapolated = (portee < 2.0 || portee > 15.0);
        outResult.matchedConfig = calibration;

        outResult.force_ext1_baseline = T_base * (1.0 - mu);
        outResult.force_ext2_baseline = T_base * (1.0 + mu);
        outResult.fleche_baseline = pred_fleche;
        outResult.fmax_ancre_baseline = fmax_ancre_base;

        let fext1_calc = T_calc * (1.0 - mu);
        let fext2_calc = T_calc * (1.0 + mu);
        if (fc === 0.0) {
            fext1_calc += 1.0;
            fext2_calc += 1.0;
        }

        outResult.force_ext1_calc = fext1_calc;
        outResult.force_ext2_calc = fext2_calc;
        outResult.fleche_calc = fleche_calc;

        outResult.force_ext1_ref = T_ref * (1.0 - mu);
        outResult.force_ext2_ref = T_ref * (1.0 + mu);
        outResult.fleche_ref = pred_fleche;
        outResult.fmax_ancre_ref = fmax_ancre_input;

        outResult.confidence_pct = Math.round(confidence_pct);
        return outResult;
    }

    // ==========================================
    // NEW PRO CALCULATIONS
    // ==========================================
    if (system === SystemType.NEW_PRO) {
        if (zone === "Sur ancre intermédiaire") {
            outResult.isIntermediate = true;
            outResult.isExtrapolated = false;
            outResult.force_ext1_ref = -1.0;
            outResult.force_ext2_ref = -1.0;
            outResult.fleche_ref = -1.0;
            outResult.force_ext1_calc = -1.0;
            outResult.force_ext2_calc = -1.0;
            outResult.fleche_calc = -1.0;

            let targetDir = "potelet OMEGA";
            if (direction.toLowerCase().includes("mini")) {
                targetDir = "potelet OMEGA mini";
            } else if (direction.toLowerCase().includes("omega")) {
                targetDir = "potelet OMEGA";
            } else if (direction.toLowerCase().includes("overhead")) {
                targetDir = "overhead";
            }

            const match = intermediateRecords.find(r => r.direction === targetDir);
            if (match) {
                outResult.fmax_ancre_ref = match.fmax_ancre;
                outResult.matchedConfig = match.configId;

                const fc = selectedFallFactor;
                let k = 1.0;
                if (fc === 2.0) {
                    k = fmax_ancre_input / match.fmax_ancre;
                } else if (fc === 1.0) {
                    const f_1 = (users === 1) ? 1.5 : 5.0;
                    k = f_1 / match.fmax_ancre;
                } else {
                    const f_0 = 1.0 * users;
                    k = f_0 / match.fmax_ancre;
                }

                outResult.force_ext1_baseline = -1.0;
                outResult.force_ext2_baseline = -1.0;
                outResult.fleche_baseline = -1.0;
                outResult.fmax_ancre_baseline = match.fmax_ancre;

                outResult.fmax_ancre_ref *= k;
                outResult.confidence_pct = (fc === 2.0) ? 10 : (fc === 1.0) ? 15 : 25;
                return outResult;
            }
            return null;
        }

        // Grande ou Petite Portee
        outResult.isIntermediate = false;
        outResult.isExtrapolated = (portee < 3.0 || portee > 15.0);

        let searchDir = "sol_mur";
        if (direction.toLowerCase().includes("mini")) {
            searchDir = "omega_mini";
        } else if (direction.toLowerCase().includes("omega")) {
            searchDir = "omega";
        } else if (direction.toLowerCase().includes("overhead")) {
            searchDir = "overhead";
        } else if (direction.toLowerCase().includes("sol")) {
            searchDir = "sol_mur";
        }

        const rec_3 = newProPredictRecords.find(r => r.direction === searchDir && r.users === users && r.portee === 3.0);
        const rec_15 = newProPredictRecords.find(r => r.direction === searchDir && r.users === users && r.portee === 15.0);

        if (!rec_3 || !rec_15) return null;

        const t = (portee - 3.0) / 12.0;
        let fleche_pred = rec_3.fleche + t * (rec_15.fleche - rec_3.fleche);
        let fancre_ref = rec_3.fmax_ancre + t * (rec_15.fmax_ancre - rec_3.fmax_ancre);

        if (fleche_pred <= 10.0) fleche_pred = 10.0;

        const fc = selectedFallFactor;
        let k = 1.0;
        let k_fleche = 1.0;

        if (fc === 2.0) {
            k = 1.0; k_fleche = 1.0;
        } else if (fc === 1.0) {
            k = Math.sqrt(0.5); k_fleche = Math.sqrt(0.5);
        } else {
            k = 1.0; k_fleche = 0.50;
        }

        let fleche_calc = fleche_pred * k_fleche;

        let fext1_ref_base = rec_3.force_ext1 + t * (rec_15.force_ext1 - rec_3.force_ext1);
        let fext2_ref_base = rec_3.force_ext2 + t * (rec_15.force_ext2 - rec_3.force_ext2);

        outResult.force_ext1_baseline = fext1_ref_base;
        outResult.force_ext2_baseline = fext2_ref_base;
        outResult.fleche_baseline = fleche_pred;
        outResult.fmax_ancre_baseline = fancre_ref;

        const ratio_force = (fmax_ancre_input * k) / fancre_ref;
        let fext1_calc = fext1_ref_base * ratio_force;
        let fext2_calc = fext2_ref_base * ratio_force;

        if (fc === 0.0) {
            fext1_calc += 1.0;
            fext2_calc += 1.0;
        }

        outResult.force_ext1_calc = fext1_calc;
        outResult.force_ext2_calc = fext2_calc;
        outResult.fleche_calc = fleche_calc;

        const ratio_ref = fmax_ancre_input / fancre_ref;
        outResult.force_ext1_ref = fext1_ref_base * ratio_ref;
        outResult.force_ext2_ref = fext2_ref_base * ratio_ref;
        outResult.fleche_ref = fleche_pred;
        outResult.fmax_ancre_ref = fmax_ancre_input;

        outResult.confidence_pct = (fc === 2.0) ? 10 : (fc === 1.0) ? 15 : 25;
        outResult.matchedConfig = `${rec_3.configId} / ${rec_15.configId}`;

        return outResult;
    }

    return null;
}

function getNewProRefRatio(direction, norm, users, portee) {
    let searchDir = "sol_mur";
    if (direction.toLowerCase().includes("mini")) {
        searchDir = "omega_mini";
    } else if (direction.toLowerCase().includes("omega")) {
        searchDir = "omega";
    } else if (direction.toLowerCase().includes("overhead")) {
        searchDir = "overhead";
    } else if (direction.toLowerCase().includes("sol")) {
        searchDir = "sol_mur";
    }

    let r3 = 1.5;
    let r15 = 2.7;

    if (norm === "EN 795" || users === 1) {
        if (searchDir === "sol_mur") {
            r3 = 9.65 / 6.4; r15 = 13.8 / 5.1;
        } else if (searchDir === "omega") {
            r3 = 7.15 / 5.0; r15 = 12.2 / 4.4;
        } else if (searchDir === "omega_mini") {
            r3 = 10.05 / 5.7; r15 = 12.7 / 4.7;
        } else if (searchDir === "overhead") {
            r3 = 11.2 / 7.2; r15 = 10.6 / 4.4;
        }
    } else {
        if (searchDir === "sol_mur") {
            if (users === 2) { r3 = 13.7 / 9.7; r15 = 15.05 / 7.8; }
            else if (users === 3) { r3 = 12.35 / 9.5; r15 = 13.95 / 7.2; }
            else if (users === 4) { r3 = 13.15 / 9.9; r15 = 14.7 / 7.6; }
            else { r3 = 12.65 / 9.8; r15 = 16.0 / 8.3; }
        } else if (searchDir === "omega") {
            if (users === 2) { r3 = 10.75 / 7.9; r15 = 14.5 / 6.8; }
            else if (users === 3) { r3 = 10.45 / 8.3; r15 = 13.0 / 6.5; }
            else if (users === 4) { r3 = 10.35 / 8.5; r15 = 14.0 / 6.8; }
            else { r3 = 10.5 / 8.8; r15 = 14.7 / 7.3; }
        } else if (searchDir === "omega_mini") {
            if (users === 2) { r3 = 13.05 / 8.0; r15 = 18.0 / 9.5; }
            else if (users === 3) { r3 = 12.6 / 8.7; r15 = 13.75 / 7.5; }
            else if (users === 4) { r3 = 11.75 / 8.9; r15 = 14.25 / 7.8; }
            else { r3 = 11.8 / 9.1; r15 = 15.7 / 8.5; }
        } else if (searchDir === "overhead") {
            if (users === 2) { r3 = 16.35 / 10.2; r15 = 17.95 / 9.0; }
            else if (users === 3) { r3 = 15.4 / 9.9; r15 = 14.8 / 7.2; }
            else if (users === 4) { r3 = 15.4 / 10.2; r15 = 14.8 / 7.2; }
            else { r3 = 15.45 / 10.3; r15 = 16.2 / 8.0; }
        }
    }

    const t = (portee - 3.0) / 12.0;
    return r3 + t * (r15 - r3);
}

// =========================================================================
// 3. UI STATE & ROUTING CONTROLLER
// =========================================================================

let currentSystem = SystemType.NEW_PRO;
let isDarkMode = true;
let chartInstance = null;
let currentResult = null;

// DOM Cache
const selectionPage = document.getElementById("selection-page");
const calculatorPage = document.getElementById("calculator-page");
const normSelect = document.getElementById("norm-select");
const zoneSelect = document.getElementById("zone-select");
const porteeInput = document.getElementById("portee-input");
const porteeTypeSelect = document.getElementById("portee-type-select");
const supportSelect = document.getElementById("support-select");
const supportGroup = document.getElementById("support-group");
const directionSelect = document.getElementById("direction-select");
const ancrageSelect = document.getElementById("ancrage-select");
const absorberInput = document.getElementById("absorber-input");
const usersInput = document.getElementById("users-input");
const fallFactorSelect = document.getElementById("fall-factor-select");
const fmaxAncreInput = document.getElementById("fmax-ancre-input");
const systemBadge = document.getElementById("system-badge");
const configRefLabel = document.getElementById("config-ref-label");
const warningLabel = document.getElementById("warning-label");

const ext1Card = document.getElementById("ext1-card");
const ext2Card = document.getElementById("ext2-card");
const flecheCard = document.getElementById("fleche-card");
const ratioCard = document.getElementById("ratio-card");

const ext1Val = document.getElementById("ext1-val");
const ext2Val = document.getElementById("ext2-val");
const flecheVal = document.getElementById("fleche-val");
const ratioVal = document.getElementById("ratio-val");

const themeToggle = document.getElementById("theme-toggle");
const backBtn = document.getElementById("back-btn");
const pdfBtn = document.getElementById("pdf-btn");

const btnDecUsers = document.getElementById("btn-dec-users");
const btnIncUsers = document.getElementById("btn-inc-users");



// Initialize application listeners
document.getElementById("cardNewPro").addEventListener("click", () => startCalculator(SystemType.NEW_PRO));
document.getElementById("cardLightPro").addEventListener("click", () => startCalculator(SystemType.LIGHT_PRO));
document.getElementById("cardLongRange").addEventListener("click", () => startCalculator(SystemType.LONG_RANGE));

backBtn.addEventListener("click", () => {
    calculatorPage.classList.remove("active");
    setTimeout(() => {
        calculatorPage.style.display = "none";
        selectionPage.style.display = "flex";
        setTimeout(() => selectionPage.classList.add("active"), 50);
    }, 300);
});

themeToggle.addEventListener("click", toggleTheme);
pdfBtn.addEventListener("click", exportPDF);

// Change events for dropdown selects


btnDecUsers.addEventListener("click", () => {
    let min = parseInt(usersInput.min) || 1;
    let val = parseInt(usersInput.value) || 1;
    if (val > min) {
        usersInput.value = val - 1;
        onFallFactorOrUsersChanged();
    }
});

btnIncUsers.addEventListener("click", () => {
    let max = parseInt(usersInput.max) || 5;
    let val = parseInt(usersInput.value) || 1;
    if (val < max) {
        usersInput.value = val + 1;
        onFallFactorOrUsersChanged();
    }
});

// Attach change listeners to form inputs
const inputElements = [normSelect, zoneSelect, porteeInput, porteeTypeSelect, supportSelect, directionSelect, ancrageSelect, fallFactorSelect, fmaxAncreInput];
inputElements.forEach(el => {
    el.addEventListener("input", onInputChanged);
    el.addEventListener("change", onInputChanged);
});

// Specialized events
normSelect.addEventListener("change", onNormChanged);
zoneSelect.addEventListener("change", onZoneChanged);
supportSelect.addEventListener("change", onFallFactorOrUsersChanged);
fallFactorSelect.addEventListener("change", onFallFactorOrUsersChanged);

function startCalculator(system) {
    currentSystem = system;

    // UI Transitions
    selectionPage.classList.remove("active");
    setTimeout(() => {
        selectionPage.style.display = "none";
        calculatorPage.style.display = "flex";
        setTimeout(() => {
            calculatorPage.classList.add("active");
            reconfigureUI();
            performCalculation();


        }, 50);
    }, 300);
}

function toggleTheme() {
    isDarkMode = !isDarkMode;
    if (isDarkMode) {
        document.body.className = "dark-theme";
        themeToggle.textContent = "☀️ Mode Clair";
    } else {
        document.body.className = "light-theme";
        themeToggle.textContent = "🌙 Mode Sombre";
    }



    // Redraw chart with updated colors
    if (chartInstance) {
        updateChartColors();
    }
}

function reconfigureUI() {
    // 1. Clear dropdowns
    normSelect.innerHTML = "";
    zoneSelect.innerHTML = "";
    directionSelect.innerHTML = "";
    ancrageSelect.innerHTML = "";

    if (currentSystem === SystemType.NEW_PRO) {
        supportGroup.style.display = "none";

        systemBadge.textContent = "NEW PRO";
        systemBadge.className = "system-badge new-pro";

        // Normes
        normSelect.innerHTML = `<option value="EN 795">EN 795</option><option value="TS 16415">TS 16415</option>`;
        normSelect.disabled = false;

        // Zones
        zoneSelect.innerHTML = `
            <option value="Grande portée (milieu)">Grande portée (milieu)</option>
            <option value="Petite portée (milieu)">Petite portée (milieu)</option>
            <option value="Sur ancre intermédiaire">Sur ancre intermédiaire</option>
        `;
        zoneSelect.disabled = false;

        porteeTypeSelect.disabled = false;

        // Directions
        directionSelect.innerHTML = `
            <option value="sol/mur">sol/mur</option>
            <option value="sur potelet OMEGA">sur potelet OMEGA</option>
            <option value="sur potelet OMEGA mini">sur potelet OMEGA mini</option>
            <option value="overhead">overhead</option>
        `;
        directionSelect.disabled = false;

        // Ancrages
        ancrageSelect.innerHTML = `
            <option value="ocho+">ocho+</option>
            <option value="ocho">ocho</option>
            <option value="connecteur EN 362">connecteur EN 362</option>
        `;

        usersInput.min = 1;
        usersInput.max = 5;
        usersInput.value = 1;

        absorberInput.value = "NEWPRO80";
        porteeInput.value = "15.00";
        porteeInput.disabled = false;

    } else if (currentSystem === SystemType.LIGHT_PRO) {
        supportGroup.style.display = "flex";

        systemBadge.textContent = "LIGHT PRO";
        systemBadge.className = "system-badge light-pro";

        normSelect.innerHTML = `<option value="EN 795">EN 795</option>`;
        normSelect.disabled = true;

        zoneSelect.innerHTML = `
            <option value="Grande portée (milieu)">Grande portée (milieu)</option>
            <option value="Petite portée (milieu)">Petite portée (milieu)</option>
        `;
        zoneSelect.disabled = false;

        porteeTypeSelect.value = "Unique";
        porteeTypeSelect.disabled = true;

        directionSelect.innerHTML = `
            <option value="sol/mur">sol/mur</option>
            <option value="sur potelet PB250">sur potelet PB250</option>
            <option value="sur potelet PB HOOKT">sur potelet PB HOOKT</option>
        `;
        directionSelect.disabled = false;

        ancrageSelect.innerHTML = `
            <option value="ocho+">ocho+</option>
            <option value="ocho">ocho</option>
            <option value="connecteur EN 362">connecteur EN 362</option>
        `;

        usersInput.min = 1;
        usersInput.max = 3;
        usersInput.value = 1;

        absorberInput.value = "LIGHT PRO";
        porteeInput.value = "10.00";
        porteeInput.disabled = false;

    } else if (currentSystem === SystemType.LONG_RANGE) {
        supportGroup.style.display = "none";

        systemBadge.textContent = "LONG RANGE";
        systemBadge.className = "system-badge long-range";

        normSelect.innerHTML = `<option value="EN 795">EN 795</option><option value="TS 16415">TS 16415</option>`;
        normSelect.disabled = false;

        zoneSelect.innerHTML = `
            <option value="Grande portée (milieu)">Grande portée (milieu)</option>
            <option value="Petite portée (milieu)">Petite portée (milieu)</option>
        `;
        zoneSelect.disabled = false;

        porteeTypeSelect.value = "Unique";
        porteeTypeSelect.disabled = true;

        directionSelect.innerHTML = `<option value="sol">sol</option>`;
        directionSelect.disabled = true;

        ancrageSelect.innerHTML = `
            <option value="ocho+">ocho+</option>
            <option value="NIO">NIO</option>
            <option value="connecteur EN 362">connecteur EN 362</option>
        `;

        usersInput.min = 1;
        usersInput.max = 3;
        usersInput.value = 1;

        absorberInput.value = "End Pack";
        porteeInput.value = "56.00";
        porteeInput.disabled = false;
    }

    updateDefaultLanyardForce();
}

function onNormChanged() {
    const norm = normSelect.value;
    if (currentSystem === SystemType.NEW_PRO) {
        if (norm === "EN 795") {
            usersInput.value = 1;
            btnDecUsers.disabled = true;
            btnIncUsers.disabled = true;
        } else {
            btnDecUsers.disabled = false;
            btnIncUsers.disabled = false;
            if (parseInt(usersInput.value) < 2) {
                usersInput.value = 2;
            }
        }
    }
    onInputChanged();
}

function onZoneChanged() {
    const zone = zoneSelect.value;
    if (currentSystem === SystemType.NEW_PRO && zone === "Sur ancre intermédiaire") {
        porteeInput.value = "15.00/3.00";
        porteeInput.disabled = true;
    } else {
        porteeInput.disabled = false;
        if (porteeInput.value === "15.00/3.00" || porteeInput.value === "") {
            porteeInput.value = zone.includes("Grande") ? "15.00" : "3.00";
            if (currentSystem === SystemType.LIGHT_PRO && !zone.includes("Grande")) {
                porteeInput.value = "2.00";
            }
        }
    }
    onInputChanged();
}

function updateDefaultLanyardForce() {
    const norm = normSelect.value;
    const zone = zoneSelect.value;
    const direction = directionSelect.value;
    const supportVal = supportSelect.value;
    const supportType = supportTypeMapping[supportVal] || "Rigide";
    const users = parseInt(usersInput.value) || 1;
    const parsedFF = parseFloat(fallFactorSelect.value);
    const selectedFallFactor = isNaN(parsedFF) ? 2.0 : parsedFF;

    let porteeVal = 15.0;
    if (zone !== "Sur ancre intermédiaire") {
        porteeVal = parseFloat(porteeInput.value) || 15.0;
    }

    const defaultForce = getRefLanyardForce(
        currentSystem, norm, zone, porteeVal, direction, supportType, users, selectedFallFactor
    );

    fmaxAncreInput.value = defaultForce.toFixed(2);
}

function onFallFactorOrUsersChanged() {
    updateDefaultLanyardForce();
    performCalculation();
}

function onInputChanged() {
    performCalculation();
}

function performCalculation() {
    // Reset error styling
    porteeInput.classList.remove("error");
    fmaxAncreInput.classList.remove("error");

    const norm = normSelect.value;
    const zone = zoneSelect.value;
    const direction = directionSelect.value;
    const ancrage = ancrageSelect.value;
    const users = parseInt(usersInput.value) || 1;
    const supportVal = supportSelect.value;
    const supportType = supportTypeMapping[supportVal] || "Rigide";
    const parsedFF = parseFloat(fallFactorSelect.value);
    const selectedFallFactor = isNaN(parsedFF) ? 2.0 : parsedFF;

    let porteeVal = 15.0;
    if (zone !== "Sur ancre intermédiaire") {
        porteeVal = parseFloat(porteeInput.value);
        if (isNaN(porteeVal) || porteeInput.value === "") {
            porteeInput.classList.add("error");
            updateResultPanelState("ERROR", "SAISIE INVALIDE", "Veuillez saisir une portée numérique valide.");
            return;
        }
    }

    const fmaxAncreVal = parseFloat(fmaxAncreInput.value);
    if (isNaN(fmaxAncreVal) || fmaxAncreInput.value === "") {
        fmaxAncreInput.classList.add("error");
        updateResultPanelState("ERROR", "SAISIE INVALIDE", "Veuillez saisir une force longe Fmax ancre valide.");
        return;
    }

    // Specific validation checks
    let isExtrapolatedMultiUser = false;

    if (currentSystem === SystemType.LIGHT_PRO) {
        if (users > 3) {
            updateResultPanelState("ERROR", "NON VALIDÉ", "Non validé : LIGHT PRO validé pour 3 utilisateurs maximum");
            return;
        }
        if (selectedFallFactor === 2.0 && porteeVal > 10.0 && users > 1) {
            isExtrapolatedMultiUser = true;
        }

        if (supportType.includes("HOOKT")) {
            if (porteeVal < 2.0 || porteeVal > 15.0) {
                porteeInput.classList.add("error");
                updateResultPanelState("ERROR", "NON VALIDÉ", "Non validé : Portée hors limites (2 m à 15 m) pour PB HOOKT");
                return;
            }
        } else if (supportType.includes("PB250")) {
            if (users > 1) isExtrapolatedMultiUser = true;
            if (Math.abs(porteeVal - 15.0) > 0.01) isExtrapolatedMultiUser = true;
        } else { // Rigide
            if (users > 1) isExtrapolatedMultiUser = true;
            if (porteeVal < 2.0 || porteeVal > 15.0) {
                porteeInput.classList.add("error");
                updateResultPanelState("ERROR", "NON VALIDÉ", "Non validé : Portée hors limites (2 m à 15 m) pour Rigide");
                return;
            }
        }
    }

    if (currentSystem === SystemType.LONG_RANGE) {
        if (porteeVal < 10.0 || porteeVal > 56.0) {
            porteeInput.classList.add("error");
            updateResultPanelState("ERROR", "NON VALIDÉ", "Non validé : Portée hors limites (10 m à 56 m) pour LongRange");
            return;
        }
        if (users > 3) {
            updateResultPanelState("ERROR", "NON VALIDÉ", "Non validé : LongRange validé pour 3 utilisateurs maximum");
            return;
        }
    }

    if (currentSystem === SystemType.NEW_PRO) {
        if (users > 5) {
            updateResultPanelState("ERROR", "NON VALIDÉ", "New PRO validé jusqu'à 5 utilisateurs maximum");
            return;
        }
        if (zone !== "Sur ancre intermédiaire" && porteeVal > 15.0) {
            porteeInput.classList.add("error");
            updateResultPanelState("ERROR", "NON VALIDÉ", "Hors limites système — portée max validée : 15 m");
            return;
        }
    }

    // Execute calculation
    const res = calculate(
        currentSystem, norm, zone, porteeVal, direction, ancrage,
        users, fmaxAncreVal, supportType, selectedFallFactor
    );

    if (res) {
        currentResult = res;
        const configLabelText = `Config. référence : ${res.matchedConfig}`;

        // Mettre à jour le résumé de configuration pour l'export PDF
        const sysNames = { 0: "NEW PRO", 1: "LIGHT PRO", 2: "LONG RANGE" };
        document.getElementById("print-sys-val").textContent = sysNames[currentSystem];
        document.getElementById("print-norm-val").textContent = norm;
        document.getElementById("print-zone-val").textContent = zone;
        document.getElementById("print-portee-val").textContent = porteeInput.value;
        document.getElementById("print-portee-type-val").textContent = porteeTypeSelect.value;

        const supportCell = document.getElementById("print-support-cell");
        if (currentSystem === SystemType.LIGHT_PRO) {
            supportCell.style.display = "table-cell";
            document.getElementById("print-support-val").textContent = supportSelect.value;
        } else {
            supportCell.style.display = "none";
        }

        document.getElementById("print-dir-val").textContent = direction;
        document.getElementById("print-ancrage-val").textContent = ancrage;
        document.getElementById("print-absorber-val").textContent = absorberInput.value;
        document.getElementById("print-users-val").textContent = users;
        document.getElementById("print-fc-val").textContent = fallFactorSelect.options[fallFactorSelect.selectedIndex].text.split("—")[0].trim();
        document.getElementById("print-fmax-val").textContent = parseFloat(fmaxAncreInput.value).toFixed(2);

        if (res.isIntermediate) {
            const deviation = Math.abs(fmaxAncreVal - res.fmax_ancre_ref) / res.fmax_ancre_ref * 100.0;
            let state = "INFO";
            let desc = `Efforts extrémités non mesurés en multi-portée — seule la Fmax ancre intermédiaire est disponible (Réf: ${res.fmax_ancre_ref.toFixed(2)} kN, Écart: ${deviation.toFixed(1)}%).`;

            if (deviation > 20.0) {
                state = "NON_CONFORME";
                desc = `⚠️ Écart critique sur l'effort longe : ${deviation.toFixed(1)}% par rapport aux essais (Seuil max ±20%).`;
            } else if (deviation > 15.0) {
                state = "PROCHE_LIMITE";
                desc = `⚠️ Écart proche de la limite sur l'effort longe : ${deviation.toFixed(1)}% (Seuil max ±20%).`;
            }

            updateResultPanelState(state, state === "NON_CONFORME" ? "NON CONFORME" : "INFORMATION", desc, -1, -1, -1, -1, configLabelText);
            clearChart();
            return;
        }

        // Calculate deviations (New Pro only)
        let maxDev = 0.0;
        let ratioDeviation = 0.0;
        if (currentSystem === SystemType.NEW_PRO) {
            let devExt1 = 0.0;
            let devExt2 = 0.0;
            let devFleche = 0.0;

            if (res.force_ext1_ref > 0.0) {
                devExt1 = Math.abs(res.force_ext1_calc - res.force_ext1_ref) / res.force_ext1_ref * 100.0;
                devExt2 = Math.abs(res.force_ext2_calc - res.force_ext2_ref) / res.force_ext2_ref * 100.0;
            }
            if (res.fleche_ref > 0.0) {
                devFleche = Math.abs(res.fleche_calc - res.fleche_ref) / res.fleche_ref * 100.0;
            }
            maxDev = Math.max(devExt1, devExt2, devFleche);

            const ratioTh = getNewProRefRatio(direction, norm, users, porteeVal);
            const fextBrute = (res.force_ext1_ref + res.force_ext2_ref) / 2.0;
            const ratioReel = fextBrute / fmaxAncreVal;
            ratioDeviation = Math.abs(ratioReel - ratioTh) / ratioTh * 100.0;
        }

        // Rupture ratio
        let ratioCable = -1.0;
        let fBreaking = 65.0;
        if (currentSystem === SystemType.LONG_RANGE) {
            fBreaking = 57.0;
        }

        const fMaxExt = Math.max(res.force_ext1_calc, res.force_ext2_calc);
        if (fMaxExt > 0.0) {
            ratioCable = (fMaxExt / fBreaking) * 100.0;
        }

        // Determine conformity status
        let state = "CONFORME";
        let desc = "Le système est conforme à l'enveloppe d'essais expérimentaux.";

        if (currentSystem === SystemType.LIGHT_PRO) {
            const maxExtForce = Math.max(res.force_ext1_calc, res.force_ext2_calc);

            if (fmaxAncreVal > 12.0) {
                desc = "⚠️ Attention : Effort longe saisi élevé (> 12 kN), proche des valeurs de rupture observées.";
                state = "PROCHE_LIMITE";
            }

            if (ratioCable >= 50.0) {
                state = "NON_CONFORME";
                desc = `⚠️ Non conforme : le ratio de tension câble dépasse 50% de la rupture (${ratioCable.toFixed(1)}%).`;
            } else if (ratioCable >= 45.0) {
                if (state !== "NON_CONFORME") {
                    state = "PROCHE_LIMITE";
                    desc = `⚠️ Attention : charge câble proche du seuil de 50% de la rupture (${ratioCable.toFixed(1)}%).`;
                }
            }

            if (res.isExtrapolated) {
                if (state === "CONFORME") {
                    state = "PROCHE_LIMITE";
                    desc = "⚠️ Avertissement : valeur hors plage de données.";
                } else {
                    desc += " (valeur hors plage de données).";
                }
            }

            // PB HOOKT specific checks
            if (supportType.includes("HOOKT")) {
                if (users === 3) {
                    if (porteeVal <= 2.0) {
                        state = "PROCHE_LIMITE";
                        desc = "⚠️ Basculement du potelet à une extrémité observé après 3 chutes cumulées — vérifier l'installation";
                    } else {
                        state = "INFO";
                        desc = "ℹ️ Glissement du câble dans les ancres LIGHTPRO observé après 3 essais cumulés — comportement attendu, vérifier le serrage avant remise en service";
                    }
                }
            }

            if (isExtrapolatedMultiUser) {
                state = "PROCHE_LIMITE";
                desc = "⚠️ Extrapolé : configuration multi-utilisateurs / portée non testée expérimentalement pour ce support.";
            }

        } else if (currentSystem === SystemType.LONG_RANGE) {
            if (ratioCable >= 50.0) {
                state = "NON_CONFORME";
                desc = `⚠️ Non conforme : le ratio de tension câble dépasse 50% de la rupture (${ratioCable.toFixed(1)}%).`;
            } else if (ratioCable >= 45.0) {
                if (state !== "NON_CONFORME") {
                    state = "PROCHE_LIMITE";
                    desc = `⚠️ Attention : charge câble proche du seuil de 50% de la rupture (${ratioCable.toFixed(1)}%).`;
                }
            }

            if (res.isExtrapolated) {
                if (state === "CONFORME") {
                    state = "PROCHE_LIMITE";
                    desc = "⚠️ Avertissement : valeur hors plage de données.";
                } else {
                    desc += " (valeur hors plage de données).";
                }
            }

        } else {
            // NEW PRO
            const maxFextCalc = Math.max(res.force_ext1_calc, res.force_ext2_calc);
            let hasOrangeWarning = false;
            let warningMsg = "";

            if (fmaxAncreVal > 12.0 && porteeVal >= 15.0) {
                hasOrangeWarning = true;
                warningMsg = "⚠️ Fmax ancre élevée — vérifier la configuration";
            } else if (fmaxAncreVal > 10.0 && porteeVal <= 3.0) {
                hasOrangeWarning = true;
                warningMsg = "⚠️ Fmax ancre proche de la limite";
            } else if (porteeVal < 3.0) {
                hasOrangeWarning = true;
                warningMsg = "⚠️ Portée inférieure au minimum testé (3 m) — extrapolation";
            } else if (ratioDeviation > 30.0) {
                hasOrangeWarning = true;
                warningMsg = "⚠️ Valeur de Fmax ancre inhabituelle pour cette configuration";
            }

            if (maxDev > 20.0) {
                state = "NON_CONFORME";
                desc = `⚠️ Non conforme : écart sur efforts ou flèche supérieur à ±20% par rapport aux essais (${maxDev.toFixed(1)}%).`;
            } else if (ratioCable >= 50.0) {
                state = "NON_CONFORME";
                desc = `⚠️ Non conforme : le ratio de tension câble dépasse 50% de la rupture (${ratioCable.toFixed(1)}%).`;
            } else if (hasOrangeWarning) {
                state = "PROCHE_LIMITE";
                desc = warningMsg;
            } else if (maxDev > 15.0) {
                state = "PROCHE_LIMITE";
                desc = `⚠️ Attention : écarts proches de la limite de ±20% (${maxDev.toFixed(1)}%).`;
            } else if (ratioCable >= 45.0) {
                state = "PROCHE_LIMITE";
                desc = `⚠️ Attention : charge câble proche du seuil de 50% de la rupture (${ratioCable.toFixed(1)}%).`;
            } else if (res.isExtrapolated) {
                state = "PROCHE_LIMITE";
                desc = "⚠️ Avertissement : portée en extrapolation.";
            }
        }

        // Fall Factor 2.0 thresholds check (New Pro / Light Pro only)
        if (selectedFallFactor === 2.0 && currentSystem !== SystemType.LONG_RANGE) {
            if (res.fmax_ancre_ref > 15.0) {
                state = "NON_CONFORME";
                desc = "Effort longe calculé très élevé — hors plage de validation";
            }
        }

        updateResultPanelState(state, state === "NON_CONFORME" ? "NON CONFORME" : "CONFORME", desc, res.force_ext1_calc, res.force_ext2_calc, res.fleche_calc, ratioCable, configLabelText);
        updateChart(res.fmax_ancre_ref, res.force_ext1_ref, res.force_ext2_ref, fmaxAncreVal, res.force_ext1_calc, res.force_ext2_calc);
    } else {
        updateResultPanelState("ERROR", "ERREUR", "Impossible d'effectuer les calculs pour cette configuration.");
        clearChart();
    }
}

function updateResultPanelState(state, statusText, description, ext1, ext2, fleche, ratio, matchedConfig) {
    configRefLabel.textContent = matchedConfig;

    // Enable or disable PDF download
    pdfBtn.disabled = (state === "ERROR");

    // Reset classes
    warningLabel.className = "warning-label";
    warningLabel.style.display = "block";

    if (state === "ERROR") {
        warningLabel.classList.add("danger");
        warningLabel.textContent = description;
    } else if (state === "NON_CONFORME") {
        warningLabel.classList.add("danger");
        warningLabel.textContent = description;
    } else if (state === "PROCHE_LIMITE") {
        warningLabel.classList.add("warning");
        warningLabel.textContent = description;
    } else if (state === "INFO") {
        warningLabel.classList.add("default");
        warningLabel.textContent = description;
    } else {
        warningLabel.classList.add("default");
        warningLabel.textContent = description;
    }

    // Format card values
    const formatVal = (val, unit) => {
        return val < 0 ? "N/A" : `${val.toFixed(2)} ${unit}`;
    };

    ext1Val.textContent = formatVal(ext1, "kN");
    ext2Val.textContent = formatVal(ext2, "kN");
    flecheVal.textContent = formatVal(fleche, "mm");
    ratioVal.textContent = ratio < 0 ? "N/A" : `${ratio.toFixed(1)} %`;

    // Visual states of cards (optional accent color border in web)
    const cards = [ext1Card, ext2Card, flecheCard, ratioCard];
    cards.forEach(c => {
        c.className = "result-sub-card";
        if (state === "NON_CONFORME") {
            c.style.borderColor = "#ef4444";
        } else if (state === "PROCHE_LIMITE") {
            c.style.borderColor = "#f59e0b";
        } else if (state === "ERROR") {
            c.style.borderColor = "#e2e8f0";
        } else {
            c.style.borderColor = "#10b981"; // Conforme green border
        }
    });
}

// =========================================================================
// 4. CHART.JS CONTROLLER (Line Plot replacement)
// =========================================================================

function getChartColors() {
    if (isDarkMode) {
        return {
            text: "#cbd5e1", // slate-300 instead of slate-400 for ticks/labels
            grid: "#334155",
            title: "#ffffff", // pure white instead of slate-200 for higher contrast
            tooltipBg: "#0f172a",
            tooltipBorder: "#475569"
        };
    } else {
        return {
            text: "#1e293b", // slate-800 instead of slate-600 for high contrast axes labels/ticks
            grid: "#cbd5e1",
            title: "#0f172a", // slate-900 (almost black)
            tooltipBg: "#ffffff",
            tooltipBorder: "#cbd5e1"
        };
    }
}

function clearChart() {
    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }
    const ctx = document.getElementById("lanyard-chart").getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.fillStyle = isDarkMode ? "#94a3b8" : "#475569";
    ctx.font = "bold 13px Inter";
    ctx.textAlign = "center";
    ctx.fillText("En attente de calcul...", ctx.canvas.width / 2, ctx.canvas.height / 2);
}

function updateChartColors() {
    if (!chartInstance) return;
    const colors = getChartColors();

    chartInstance.options.scales.x.grid.color = colors.grid;
    chartInstance.options.scales.x.ticks.color = colors.text;
    chartInstance.options.scales.x.title.color = colors.text;

    chartInstance.options.scales.y.grid.color = colors.grid;
    chartInstance.options.scales.y.ticks.color = colors.text;
    chartInstance.options.scales.y.title.color = colors.text;

    chartInstance.options.plugins.legend.labels.color = colors.title;
    chartInstance.options.plugins.title.color = colors.title;

    chartInstance.update();
}

function updateChart(fmax_ancre_ref, force_ext1_ref, force_ext2_ref, fmax_ancre_input, force_ext1_calc, force_ext2_calc) {
    const ctx = document.getElementById("lanyard-chart").getContext("2d");
    const colors = getChartColors();

    // Bounds
    const xMin = 0.0;
    let xMax = 15.0;
    if (fmax_ancre_input > xMax) {
        xMax = Math.ceil(fmax_ancre_input / 5.0) * 5.0;
    }

    const yValMax1 = force_ext1_ref * (xMax / fmax_ancre_ref);
    const yValMax2 = force_ext2_ref * (xMax / fmax_ancre_ref);
    let yMax = Math.max(yValMax1, yValMax2);
    if (yMax < 15.0) yMax = 15.0;
    yMax = Math.ceil(yMax / 5.0) * 5.0;

    // Dataset lines representing proportional values
    const dataExt1 = [
        { x: 0, y: 0 },
        { x: xMax, y: yValMax1 }
    ];

    const dataExt2 = [
        { x: 0, y: 0 },
        { x: xMax, y: yValMax2 }
    ];

    const dataCurrentPointExt1 = [
        { x: fmax_ancre_input, y: force_ext1_calc }
    ];

    const dataCurrentPointExt2 = [
        { x: fmax_ancre_input, y: force_ext2_calc }
    ];

    const dataCurrentAncre = [
        { x: fmax_ancre_input, y: (force_ext1_calc + force_ext2_calc) / 2.0 }
    ];

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'F. Extrémité 1',
                    data: dataExt1,
                    type: 'line',
                    borderColor: '#38bdf8', // Sky Blue
                    borderWidth: 2,
                    pointRadius: 0,
                    showLine: true
                },
                {
                    label: 'F. Extrémité 2',
                    data: dataExt2,
                    type: 'line',
                    borderColor: '#10b981', // Emerald Green
                    borderWidth: 2,
                    pointRadius: 0,
                    showLine: true
                },
                {
                    label: 'Point Ext 1',
                    data: dataCurrentPointExt1,
                    backgroundColor: '#ffffff',
                    borderColor: '#38bdf8',
                    borderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7
                },
                {
                    label: 'Point Ext 2',
                    data: dataCurrentPointExt2,
                    backgroundColor: '#ffffff',
                    borderColor: '#10b981',
                    borderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7
                },
                {
                    label: 'Point Ancre Longe',
                    data: dataCurrentAncre,
                    backgroundColor: '#ef4444',
                    borderColor: '#ef4444',
                    borderWidth: 1,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: "Courbe d'Effort Longe vs Extrémités",
                    color: colors.title,
                    font: {
                        family: 'Inter',
                        size: 14, // Increased from 13
                        weight: 'bold'
                    },
                    padding: { bottom: 10 }
                },
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: colors.title,
                        boxWidth: 12,
                        font: { family: 'Inter', size: 11, weight: 'bold' }, // Increased from 10
                        filter: function (item) {
                            // Only show primary curves in legend
                            return item.text === 'F. Extrémité 1' || item.text === 'F. Extrémité 2';
                        }
                    }
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: colors.tooltipBg,
                    titleColor: colors.title,
                    bodyColor: colors.title,
                    borderColor: colors.tooltipBorder,
                    borderWidth: 1,
                    callbacks: {
                        label: function (context) {
                            return `${context.dataset.label}: ${context.raw.y.toFixed(2)} kN (Longe: ${context.raw.x.toFixed(2)} kN)`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    min: xMin,
                    max: xMax,
                    grid: {
                        color: colors.grid,
                        borderDash: [4, 4]
                    },
                    ticks: {
                        color: colors.text,
                        font: { family: 'Inter', size: 10 } // Increased from 9
                    },
                    title: {
                        display: true,
                        text: "Effort longe Fmax ancre (kN) ➔",
                        color: colors.text,
                        font: { family: 'Inter', size: 10, weight: 'bold' } // Increased from 9
                    }
                },
                y: {
                    min: 0,
                    max: yMax,
                    grid: {
                        color: colors.grid,
                        borderDash: [4, 4]
                    },
                    ticks: {
                        color: colors.text,
                        font: { family: 'Inter', size: 10 } // Increased from 9
                    },
                    title: {
                        display: true,
                        text: "Forces d'extrémités (kN)",
                        color: colors.text,
                        font: { family: 'Inter', size: 10, weight: 'bold' } // Increased from 9
                    }
                }
            }
        }
    });
}

// =========================================================================
// 5. PDF EXPORT CONTROL
// =========================================================================

function exportPDF() {
    if (!currentResult) return;

    // Set dynamic attributes on result panel for print layout date binding
    const resultPanel = document.querySelector(".result-panel");
    const today = new Date();
    const formattedDate = today.toLocaleDateString("fr-FR", {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    resultPanel.setAttribute("data-date", formattedDate);

    // Call window.print() which triggers the high fidelity @media print styles
    window.print();
}



// Dynamic theme updates for print rendering
window.addEventListener('beforeprint', () => {
    if (chartInstance) {
        // Temporarily force light-theme colors
        const colors = {
            text: "#1e293b",
            grid: "#cbd5e1",
            title: "#0f172a"
        };
        chartInstance.options.scales.x.grid.color = colors.grid;
        chartInstance.options.scales.x.ticks.color = colors.text;
        chartInstance.options.scales.x.title.color = colors.text;
        chartInstance.options.scales.y.grid.color = colors.grid;
        chartInstance.options.scales.y.ticks.color = colors.text;
        chartInstance.options.scales.y.title.color = colors.text;
        chartInstance.options.plugins.legend.labels.color = colors.title;
        chartInstance.options.plugins.title.color = colors.title;

        // Turn off animations and update synchronously
        chartInstance.options.animation = false;
        chartInstance.update('none');
    }
});

window.addEventListener('afterprint', () => {
    // Restore actual theme colors and animations
    if (chartInstance) {
        chartInstance.options.animation = true;
        updateChartColors();
    }
});
