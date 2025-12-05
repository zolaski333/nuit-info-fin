// js/storage.js

// On vérifie si GameData existe déjà pour ne pas le réécraser
if (!window.GameData) {
    const DEFAULT_STATE = {
        points: 0,
        clickPower: 1,
        pointsPerSecond: 0,
        upgradesOwned: {},
        loreUnlocked: 1,
        hasDoneDecathlon: false,
        storyProgress: []
    };

    try {
        const saved = localStorage.getItem('n2i_save');
        if (saved) {
            // Fusion propre : Défaut + Sauvegarde
            window.GameData = { ...DEFAULT_STATE, ...JSON.parse(saved) };
        } else {
            window.GameData = { ...DEFAULT_STATE };
        }
    } catch (e) {
        console.error("Save corrompue", e);
        window.GameData = { ...DEFAULT_STATE };
    }
}

// Fonction globale helper
window.saveData = function() {
    localStorage.setItem('n2i_save', JSON.stringify(window.GameData));
};
