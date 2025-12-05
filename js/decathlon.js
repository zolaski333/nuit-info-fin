// === BASE DE DONNÉES ===
const QUIZ_DB = [
    {
        phase: "PHASE 1/3 : SCAN CORPOREL",
        question: "Identifiez votre zone de douleur principale :",
        options: [
            { txt: "Bas du dos (Lombaires)", scores: { dos: 5 } },
            { txt: "Nuque / Épaules", scores: { nuque: 5 } },
            { txt: "Poignets / Mains", scores: { poignet: 5 } },
            { txt: "Aucune (Je suis un robot)", scores: { fit: 2 } }
        ]
    },
    {
        phase: "PHASE 1/3 : SCAN CORPOREL",
        question: "Touchez vos orteils jambes tendues :",
        options: [
            { txt: "Facile (Mains au sol)", scores: { fit: 2 } },
            { txt: "Ça tire derrière les cuisses", scores: { jambes: 3 } },
            { txt: "Bloqué aux genoux", scores: { dos: 2, jambes: 2 } }
        ]
    },
    {
        phase: "PHASE 2/3 : AUDIT ERGONOMIQUE",
        question: "Position de votre écran ?",
        options: [
            { txt: "Face aux yeux", scores: { fit: 1 } },
            { txt: "Plus bas (Laptop)", scores: { nuque: 3 } },
            { txt: "Sur le côté", scores: { nuque: 4 } }
        ]
    },
    {
        phase: "PHASE 2/3 : AUDIT ERGONOMIQUE",
        question: "Vos pieds en codant ?",
        options: [
            { txt: "À plat au sol", scores: { fit: 1 } },
            { txt: "Croisés / En tailleur", scores: { jambes: 2, dos: 1 } },
            { txt: "Dans le vide", scores: { dos: 2 } }
        ]
    },
    {
        phase: "PHASE 3/3 : HABITUDES",
        question: "Hydratation (Eau) ?",
        options: [
            { txt: "Régulière", scores: { fit: 1 } },
            { txt: "Café / Soda uniquement", scores: { stress: 2 } },
            { txt: "Rien du tout", scores: { stress: 3 } }
        ]
    }
];

const SOLUTIONS = {
    dos: {
        symptome: "LOMBAIRES COMPRIMÉES",
        titre: "SWISS BALL",
        realName: "Gym Ball Résistant",
        desc: "Force vos muscles profonds à travailler pour vous tenir droit.",
        steps: ["Remplacez votre chaise 30min/jour.", "Pieds à plat, dos droit.", "Faites des cercles avec le bassin."],
        imgUrl: "./assets/swiss-ball.jpg",
        link: "https://www.decathlon.fr/search?Ntt=swiss%20ball"
    },
    nuque: {
        symptome: "TENSION CERVICALE",
        titre: "BALLE MASSAGE",
        realName: "Double Balle",
        desc: "Masse les muscles para-vertébraux sans toucher les os.",
        steps: ["Placez la balle entre nuque et mur.", "Mouvements verticaux lents.", "Insistez sur les zones douloureuses."],
        imgUrl: "./assets/balle-massage.jpg",
        link: "https://www.decathlon.fr/search?Ntt=balle%20massage"
    },
    poignet: {
        symptome: "TUNNEL CARPIEN",
        titre: "HAND GRIP",
        realName: "Musclet Main",
        desc: "Renforce les avant-bras pour soulager les tendons.",
        steps: ["Résistance minimum au début.", "3 séries de 15 répétitions.", "Étirez vos fléchisseurs après."],
        imgUrl: "./assets/hand-grip.jpg",
        link: "https://www.decathlon.fr/search?Ntt=hand%20grip"
    },
    jambes: {
        symptome: "CIRCULATION LENTE",
        titre: "FOAM ROLLER",
        realName: "Rouleau Massage",
        desc: "Relance le flux sanguin dans les jambes.",
        steps: ["Rouleau sous les mollets.", "Soulevez les fesses.", "Roulez d'avant en arrière."],
        imgUrl: "./assets/foam-roller.jpg",
        link: "https://www.decathlon.fr/search?Ntt=foam%20roller"
    },
    fit: {
        symptome: "MAINTENANCE",
        titre: "ELASTIQUES",
        realName: "Training Bands",
        desc: "Pour s'étirer et se renforcer partout.",
        steps: ["Étirez les épaules avec la bande légère.", "Quelques squats avec la forte.", "Gardez sur le bureau."],
        imgUrl: "./assets/elastique.jpg",
        link: "https://www.decathlon.fr/search?Ntt=elastique%20fitness"
    },
    stress: {
        symptome: "SURCHAUFFE",
        titre: "TAPIS YOGA",
        realName: "Tapis Confort",
        desc: "Isolez-vous du sol et respirez.",
        steps: ["Allongez-vous 5 min.", "Fermez les yeux.", "Respiration lente."],
        imgUrl: "./assets/tapis-yoga.jpg",
        link: "https://www.decathlon.fr/search?Ntt=tapis%20yoga"
    }
};

const App = {
    state: {
        step: 0,
        scores: { dos: 0, nuque: 0, poignet: 0, jambes: 0, fit: 0, stress: 0 }
    },

    init: function() {
        document.getElementById('btn-start').addEventListener('click', () => this.startQuiz());
        document.getElementById('btn-restart').addEventListener('click', () => location.reload());
        const quitBtns = document.querySelectorAll('#btn-quit-top, #btn-quit-bottom');
        quitBtns.forEach(b => b.addEventListener('click', () => window.location.href = 'index.html'));
    },

    startQuiz: function() {
        this.switchView('quiz-view');
        this.renderQuestion();
    },

    switchView: function(viewId) {
        document.querySelectorAll('.view').forEach(v => {
            v.style.display = 'none';
            v.classList.remove('active');
            v.classList.add('hidden');
        });
        const target = document.getElementById(viewId);
        if(target) {
            target.style.display = 'flex';
            target.classList.remove('hidden');
            setTimeout(() => target.classList.add('active'), 50);
        }
    },

    renderQuestion: function() {
        const q = QUIZ_DB[this.state.step];
        document.getElementById('phase-label').innerText = q.phase;
        const percent = ((this.state.step) / QUIZ_DB.length) * 100;
        document.getElementById('progress-bar').style.width = `${percent}%`;
        document.getElementById('status-line').innerText = `> SCANNING ${this.state.step + 1}/${QUIZ_DB.length}...`;

        const container = document.getElementById('question-container');
        container.innerHTML = `
            <div class="phase-tag">// QUERY_${this.state.step + 1}</div>
            <h2 class="question-text">${q.question}</h2>
            <div class="options-group">
                ${q.options.map((opt, idx) => `
                    <button class="option-btn" data-idx="${idx}">
                        <span class="btn-marker">[ ]</span> ${opt.txt}
                    </button>
                `).join('')}
            </div>
        `;

        container.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.currentTarget.dataset.idx;
                this.handleAnswer(idx, e.currentTarget);
            });
        });
    },

    handleAnswer: function(idx, btnElement) {
        btnElement.classList.add('selected');
        btnElement.querySelector('.btn-marker').innerText = '[X]';
        const scoreObj = QUIZ_DB[this.state.step].options[idx].scores;
        for (let key in scoreObj) this.state.scores[key] += scoreObj[key];
        setTimeout(() => {
            this.state.step++;
            if (this.state.step < QUIZ_DB.length) {
                this.renderQuestion();
            } else {
                this.showResults();
            }
        }, 400);
    },

    showResults: function() {
        this.switchView('result-view');
        document.getElementById('progress-bar').style.width = '100%';
        document.getElementById('status-line').innerText = "> DONE.";

        let problems = [];
        for (let key in this.state.scores) {
            if (key !== 'fit' && this.state.scores[key] >= 3) {
                problems.push({ key: key, score: this.state.scores[key] });
            }
        }
        problems.sort((a, b) => b.score - a.score);

        if (problems.length === 0) {
            let bestKey = 'fit';
            if(this.state.scores.stress > 2) bestKey = 'stress';
            problems.push({ key: bestKey, score: this.state.scores[bestKey] });
        }

        const mainKey = problems[0].key;
        const mainSol = SOLUTIONS[mainKey];

        const errorCard = document.querySelector('.error-card');
        const titleEl = errorCard.querySelector('h3');
        const descEl = errorCard.querySelector('.card-desc');

        if (mainKey === 'fit') {
            errorCard.style.borderColor = 'var(--primary)';
            errorCard.style.color = 'var(--primary)';
            titleEl.innerText = "[ OK ] SYSTÈME OPTIMISÉ";
            descEl.innerText = "Aucune défaillance critique. Maintenance préventive recommandée.";
            document.querySelector('.warning-text').innerText = "CERTIFICAT DE VALIDITÉ";
            document.querySelector('.warning-text').style.color = "var(--primary)";
        } else {
            errorCard.style.borderColor = 'var(--alert)';
            errorCard.style.color = 'var(--alert)';
            titleEl.innerText = `[ ! ] ${problems.length} DÉFAILLANCE(S) DÉTECTÉE(S)`;
            descEl.innerText = "Plusieurs zones critiques identifiées. Intervention prioritaire requise.";
        }

        document.getElementById('result-symptom').innerText = mainSol.symptome;
        document.getElementById('product-name').innerText = mainSol.titre;
        document.getElementById('product-real-name').innerText = mainSol.realName;
        document.getElementById('product-desc').innerText = mainSol.desc;
        document.getElementById('product-img').src = mainSol.imgUrl;
        document.getElementById('decathlon-link').href = mainSol.link;
        document.getElementById('final-advice-list').innerHTML = mainSol.steps.map(s => `<li>${s}</li>`).join('');

        const secondaryContainer = document.getElementById('secondary-patches');
        if (problems.length > 1) {
            let secondaryHTML = `<h4>AUTRES MODULES REQUIS :</h4><div class="secondary-grid">`;
            for(let i = 1; i < problems.length; i++) {
                const secKey = problems[i].key;
                const secSol = SOLUTIONS[secKey];
                secondaryHTML += `
                    <div class="mini-product">
                        <div class="mini-img"><img src="${secSol.imgUrl}"></div>
                        <div class="mini-info">
                            <strong>${secSol.titre}</strong>
                            <span>Pour : ${secSol.symptome}</span>
                            <a href="${secSol.link}" target="_blank" class="mini-link">VOIR ></a>
                        </div>
                    </div>
                `;
            }
            secondaryHTML += `</div>`;
            secondaryContainer.innerHTML = secondaryHTML;
            secondaryContainer.style.display = 'block';
        } else {
             secondaryContainer.style.display = 'none';
        }

        if (typeof GameData !== 'undefined') {
            GameData.hasDoneDecathlon = true;
            saveData();
        }
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
