const LORE_CHAPTERS = [
    {
        id: 1,
        threshold: 0, // Débloqué au début
        title: "CHAPITRE 1 : L'OBSOLESCENCE",
        text: "Pixeland était autrefois un village libre. Puis Gargle est arrivé avec ses mises à jour forcées. 'Votre matériel est trop vieux', disaient-ils. Ils nous ont forcé à jeter nos écrans cathodiques fonctionnels. Mais nous avons gardé les pièces. Dans l'ombre, nous reconstruisons."
    },
    {
        id: 2,
        threshold: 500, // Il faut 500 points cumulés (score total)
        title: "CHAPITRE 2 : LA DÉCHARGE",
        text: "Les montagnes de déchets électroniques grandissent. C'est là que nous trouvons notre or. Une barrette de RAM par ci, un processeur par là. Le Coach NIRD nous apprend à réparer ce que les autres jettent. C'est ça, la vraie résistance."
    },
    {
        id: 3,
        threshold: 2000,
        title: "CHAPITRE 3 : L'OPEN SOURCE",
        text: "Nous avons découvert Linux. Un système qui n'espionne pas. Qui ne ralentit pas votre PC exprès. Gargle a peur. Ils envoient leurs drones publicitaires, mais nos bloqueurs tiennent bon."
    },
    {
        id: 4,
        threshold: 10000,
        title: "CHAPITRE 4 : L'INDÉPENDANCE",
        text: "Pixeland est autonome. Nos serveurs tournent à l'énergie solaire et au code propre. Nous sommes prêts à aider les autres écoles à se libérer. La révolution numérique est en marche."
    }
];

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('lore-list');
    const currentScore = (window.GameData && GameData.points) || 0;

    LORE_CHAPTERS.forEach(chap => {
        const isUnlocked = currentScore >= chap.threshold;

        const div = document.createElement('div');
        div.className = `lore-entry ${isUnlocked ? 'unlocked' : 'locked'}`;

        let content = '';

        if (isUnlocked) {
            // Version lisible
            content = `
                <h3 class="lore-title">${chap.title}</h3>
                <p class="lore-text">${chap.text}</p>
            `;
        } else {
            // Version masquée : pas de vrai texte dans le DOM
            content = `
                <h3 class="lore-title">${chap.title}</h3>
                <p class="locked-text">
                    ████████████████████████████████████████████████████████████████████
                </p>
                <p class="lock-caption">
                    🔒 Chapitre verrouillé – augmente ton score NIRD pour le débloquer
                    (req : ${chap.threshold} OL)
                </p>
            `;
        }

        div.innerHTML = content;
        container.appendChild(div);
    });
});
