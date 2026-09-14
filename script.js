"use strict";

/* =========================================================
   KIDS SCIENCE - SHARED WEBSITE SYSTEM
   ========================================================= */

const ACCOUNTS_KEY = "kidsScienceAccounts";
const CURRENT_KEY = "kidsScienceCurrentUID";
const CHAT_KEY = "kidsScienceChat";
const PURCHASES_KEY = "kidsScienceVideoPurchases";
const BONUS_KEY = "kidsScienceBonusDate";

let accounts = [];
let currentAccount = null;

/* =========================================================
   ACCOUNT SYSTEM
   ========================================================= */

function loadAccounts() {

    try {

        accounts =
            JSON.parse(
                localStorage.getItem(
                    ACCOUNTS_KEY
                )
            ) || [];

        if (!Array.isArray(accounts)) {
            accounts = [];
        }

    } catch {
        accounts = [];
    }
}

function saveAccounts() {

    localStorage.setItem(
        ACCOUNTS_KEY,
        JSON.stringify(accounts)
    );
}

function createUID() {

    const chars =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let uid;

    do {

        uid = "KID-";

        for (let i = 0; i < 6; i++) {

            uid +=
                chars[
                    Math.floor(
                        Math.random() *
                        chars.length
                    )
                ];
        }

    } while (
        accounts.some(
            account =>
                account.uid === uid
        )
    );

    return uid;
}

function createAccount(name) {

    const emojis = [
        "🔬",
        "🧪",
        "🚀",
        "🌎",
        "🧬",
        "🧠",
        "🌟",
        "🪐"
    ];

    const account = {

        uid: createUID(),

        name: name,

        emoji:
            emojis[
                Math.floor(
                    Math.random() *
                    emojis.length
                )
            ],

        balance: 500,

        transactions: [
            {
                text: "🎁 Welcome PlayCoins",
                amount: 500,
                date:
                    new Date()
                    .toLocaleString()
            }
        ]

    };

    accounts.push(account);

    saveAccounts();

    return account;
}

function getCurrentAccount() {

    const uid =
        localStorage.getItem(
            CURRENT_KEY
        );

    if (!uid) {
        return null;
    }

    return accounts.find(
        account =>
            account.uid === uid
    ) || null;
}

/* =========================================================
   LOGIN
   ========================================================= */

function login() {

    const input =
        document.getElementById(
            "scienceName"
        );

    const error =
        document.getElementById(
            "loginError"
        );

    if (!input) return;

    const name =
        input.value.trim();

    if (!name) {

        if (error) {
            error.textContent =
                "Please enter your scientist nickname.";
        }

        input.focus();

        return;
    }

    if (name.length < 2) {

        if (error) {
            error.textContent =
                "Nickname must contain at least 2 characters.";
        }

        return;
    }

    loadAccounts();

    let account =
        accounts.find(
            item =>
                item.name.toLowerCase() ===
                name.toLowerCase()
        );

    if (!account) {

        account =
            createAccount(name);
    }

    currentAccount = account;

    localStorage.setItem(
        CURRENT_KEY,
        account.uid
    );

    giveDailyBonus();

    window.location.href =
        "home.html";
}

/* =========================================================
   AUTO LOGIN / PROTECTED PAGES
   ========================================================= */

function protectPage() {

    loadAccounts();

    currentAccount =
        getCurrentAccount();

    if (!currentAccount) {

        window.location.href =
            "index.html";

        return false;
    }

    return true;
}

/* =========================================================
   DAILY BONUS
   ========================================================= */

function today() {

    return new Date()
        .toISOString()
        .slice(0, 10);
}

function giveDailyBonus() {

    if (!currentAccount) return;

    const date =
        today();

    if (
        currentAccount.lastBonusDate ===
        date
    ) {
        return;
    }

    currentAccount.lastBonusDate =
        date;

    currentAccount.balance =
        Number(
            currentAccount.balance || 0
        ) + 100;

    currentAccount.transactions =
        currentAccount.transactions || [];

    currentAccount.transactions.unshift({

        text: "🎁 Daily Science Bonus",

        amount: 100,

        date:
            new Date()
            .toLocaleString()

    });

    saveAccounts();
}

/* =========================================================
   UI
   ========================================================= */

function updateUserUI() {

    if (!currentAccount) return;

    document
        .querySelectorAll(
            "[data-name]"
        )
        .forEach(element => {

            element.textContent =
                currentAccount.name;
        });

    document
        .querySelectorAll(
            "[data-avatar]"
        )
        .forEach(element => {

            element.textContent =
                currentAccount.emoji;
        });

    document
        .querySelectorAll(
            "[data-uid]"
        )
        .forEach(element => {

            element.textContent =
                currentAccount.uid;
        });

    document
        .querySelectorAll(
            "[data-balance]"
        )
        .forEach(element => {

            element.textContent =
                Number(
                    currentAccount.balance || 0
                );
        });

    document
        .querySelectorAll(
            "[data-big-balance]"
        )
        .forEach(element => {

            element.textContent =
                Number(
                    currentAccount.balance || 0
                );
        });
}

/* =========================================================
   TRANSACTIONS
   ========================================================= */

function renderTransactions() {

    const container =
        document.getElementById(
            "transactions"
        );

    if (
        !container ||
        !currentAccount
    ) {
        return;
    }

    container.innerHTML = "";

    const transactions =
        currentAccount.transactions || [];

    if (!transactions.length) {

        container.innerHTML =
            "<p>No transactions yet.</p>";

        return;
    }

    transactions
        .slice(0, 30)
        .forEach(transaction => {

            const row =
                document.createElement(
                    "div"
                );

            row.className =
                "transaction";

            const name =
                document.createElement(
                    "span"
                );

            name.textContent =
                transaction.text;

            const amount =
                document.createElement(
                    "strong"
                );

            amount.textContent =
                (
                    Number(
                        transaction.amount
                    ) >= 0
                        ? "+"
                        : ""
                ) +
                transaction.amount +
                " 🪙";

            row.appendChild(name);
            row.appendChild(amount);

            container.appendChild(row);
        });
}

/* =========================================================
   VIDEO PURCHASES
   ========================================================= */

function getPurchases() {

    try {

        return JSON.parse(
            localStorage.getItem(
                PURCHASES_KEY
            )
        ) || [];

    } catch {

        return [];
    }
}

function savePurchases(list) {

    localStorage.setItem(
        PURCHASES_KEY,
        JSON.stringify(list)
    );
}

function hasVideo(videoId) {

    const purchases =
        getPurchases();

    return purchases.includes(
        currentAccount.uid +
        "_" +
        videoId
    );
}

function buyVideo(button) {

    if (!currentAccount) return;

    const videoId =
        button.dataset.videoId;

    const price =
        Number(
            button.dataset.price
        );

    if (
        hasVideo(videoId)
    ) {

        openVideo(videoId);

        return;
    }

    if (
        Number(
            currentAccount.balance
        ) < price
    ) {

        alert(
            "You need more PlayCoins to buy this video."
        );

        return;
    }

    currentAccount.balance -=
        price;

    currentAccount.transactions =
        currentAccount.transactions || [];

    currentAccount.transactions.unshift({

        text:
            "🎥 Video purchased",

        amount:
            -price,

        date:
            new Date()
            .toLocaleString()

    });

    saveAccounts();

    const purchases =
        getPurchases();

    purchases.push(
        currentAccount.uid +
        "_" +
        videoId
    );

    savePurchases(
        purchases
    );

    updateUserUI();

    button.textContent =
        "WATCH NOW";

    button.dataset.purchased =
        "true";

    alert(
        "Video purchased successfully!"
    );

    openVideo(videoId);
}

function openVideo(videoId) {

    const modal =
        document.getElementById(
            "videoModal"
        );

    const container =
        document.getElementById(
            "videoContainer"
        );

    if (!modal || !container) {
        return;
    }

    container.innerHTML =
        '<iframe src="https://www.youtube.com/embed/' +
        videoId +
        '?rel=0" ' +
        'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" ' +
        'allowfullscreen></iframe>';

    modal.classList.remove(
        "hidden"
    );
}

/* =========================================================
   CHAPTER Q&A
   ========================================================= */

function setupQuestions() {

    document
        .querySelectorAll(
            ".answer-button"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                function () {

                    const question =
                        button.closest(
                            ".question"
                        );

                    if (!question) return;

                    const result =
                        question.querySelector(
                            ".answer-result"
                        );

                    const buttons =
                        question.querySelectorAll(
                            ".answer-button"
                        );

                    buttons.forEach(
                        item => {
                            item.disabled =
                                true;
                        }
                    );

                    if (
                        button.dataset.answer ===
                        "correct"
                    ) {

                        button.classList.add(
                            "correct-answer"
                        );

                        result.textContent =
                            "✅ Correct! Great job! +20 PlayCoins";

                        rewardChapter();

                    } else {

                        button.classList.add(
                            "wrong-answer"
                        );

                        result.textContent =
                            "❌ Not quite. Try the chapter again!";
                    }

                }
            );

        });
}

function rewardChapter() {

    if (!currentAccount) return;

    const rewardKey =
        "kidsScienceChapterRewards";

    let rewards = {};

    try {

        rewards =
            JSON.parse(
                localStorage.getItem(
                    rewardKey
                )
            ) || {};

    } catch {

        rewards = {};
    }

    const chapter =
        location.pathname
        .split("/")
        .pop();

    const uniqueKey =
        currentAccount.uid +
        "_" +
        chapter;

    if (rewards[uniqueKey]) {
        return;
    }

    rewards[uniqueKey] =
        true;

    localStorage.setItem(
        rewardKey,
        JSON.stringify(rewards)
    );

    currentAccount.balance +=
        20;

    currentAccount.transactions =
        currentAccount.transactions || [];

    currentAccount.transactions.unshift({

        text:
            "🧠 Chapter Q&A reward",

        amount:
            20,

        date:
            new Date()
            .toLocaleString()

    });

    saveAccounts();

    updateUserUI();
}

/* =========================================================
   QUIZ
   ========================================================= */

const quizQuestions = [

    {
        question:
            "Which planet is called the Red Planet?",

        answers: [
            "Mars",
            "Earth",
            "Venus",
            "Jupiter"
        ],

        correct: "Mars"
    },

    {
        question:
            "What do plants need to make food?",

        answers: [
            "Sunlight",
            "Plastic",
            "Metal",
            "Smoke"
        ],

        correct: "Sunlight"
    },

    {
        question:
            "What do animals need to survive?",

        answers: [
            "Food and water",
            "Only rocks",
            "Only toys",
            "Nothing"
        ],

        correct:
            "Food and water"
    }

];

let quizIndex = 0;

function startQuiz() {

    const box =
        document.getElementById(
            "quizBox"
        );

    if (!box) return;

    box.classList.remove(
        "hidden"
    );

    quizIndex =
        Math.floor(
            Math.random() *
            quizQuestions.length
        );

    showQuizQuestion();
}

function showQuizQuestion() {

    const question =
        quizQuestions[
            quizIndex
        ];

    const questionElement =
        document.getElementById(
            "quizQuestion"
        );

    const options =
        document.getElementById(
            "quizOptions"
        );

    const result =
        document.getElementById(
            "quizResult"
        );

    if (!questionElement || !options) {
        return;
    }

    questionElement.textContent =
        question.question;

    options.innerHTML = "";

    if (result) {
        result.textContent = "";
    }

    question.answers
        .forEach(answer => {

            const button =
                document.createElement(
                    "button"
                );

            button.className =
                "quiz-option";

            button.textContent =
                answer;

            button.addEventListener(
                "click",
                function () {

                    if (
                        answer ===
                        question.correct
                    ) {

                        result.textContent =
                            "✅ Correct! +30 PlayCoins";

                        addCoins(
                            30,
                            "🧠 Science Quiz Reward"
                        );

                    } else {

                        result.textContent =
                            "❌ Try another question!";
                    }

                }
            );

            options.appendChild(
                button
            );
        });
}

/* =========================================================
   ADD COINS
   ========================================================= */

function addCoins(
    amount,
    reason
) {

    if (!currentAccount) return;

    currentAccount.balance +=
        amount;

    currentAccount.transactions =
        currentAccount.transactions || [];

    currentAccount.transactions.unshift({

        text: reason,

        amount: amount,

        date:
            new Date()
            .toLocaleString()

    });

    saveAccounts();

    updateUserUI();
}

/* =========================================================
   FLAPPY BIRD
   ========================================================= */

let birdY = 120;
let velocity = 0;
let pipeX = 500;
let gapY = 100;
let gameScore = 0;
let gameRunning = false;
let gameFrame = null;

function startGame() {

    const area =
        document.getElementById(
            "gameArea"
        );

    if (!area) return;

    area.classList.remove(
        "hidden"
    );

    birdY = 120;
    velocity = 0;
    pipeX =
        area.clientWidth;

    gapY =
        60 +
        Math.random() * 90;

    gameScore = 0;
    gameRunning = true;

    gameLoop();
}

function flap() {

    if (!gameRunning) {

        startGame();

        return;
    }

    velocity = -7;
}

function gameLoop() {

    if (!gameRunning) return;

    const area =
        document.getElementById(
            "gameArea"
        );

    const bird =
        document.getElementById(
            "gameBird"
        );

    const top =
        document.getElementById(
            "gamePipeTop"
        );

    const bottom =
        document.getElementById(
            "gamePipeBottom"
        );

    const score =
        document.getElementById(
            "gameScore"
        );

    if (!area || !bird) {
        gameRunning = false;
        return;
    }

    velocity += .45;

    birdY += velocity;

    pipeX -= 3;

    if (
        pipeX < -70
    ) {

        pipeX =
            area.clientWidth;

        gapY =
            50 +
            Math.random() * 120;

        gameScore++;
    }

    bird.style.top =
        birdY + "px";

    top.style.left =
        pipeX + "px";

    bottom.style.left =
        pipeX + "px";

    top.style.height =
        gapY + "px";

    bottom.style.height =
        Math.max(
            0,
            area.clientHeight -
            gapY -
            130
        ) + "px";

    bottom.style.bottom =
        "0";

    score.textContent =
        gameScore;

    if (
        birdY < 0 ||
        birdY >
        area.clientHeight - 35
    ) {

        endGame();

        return;
    }

    if (
        pipeX < 105 &&
        pipeX > 30 &&
        (
            birdY < gapY ||
            birdY >
            gapY + 130
        )
    ) {

        endGame();

        return;
    }

    gameFrame =
        requestAnimationFrame(
            gameLoop
        );
}

function endGame() {

    gameRunning = false;

    if (gameFrame) {
        cancelAnimationFrame(
            gameFrame
        );
    }

    if (gameScore > 0) {

        addCoins(
            gameScore * 5,
            "🎮 Flappy Bird Reward"
        );
    }

    alert(
        "Game Over! Score: " +
        gameScore
    );
}

/* =========================================================
   LOGOUT / DELETE
   ========================================================= */

function logout() {

    localStorage.removeItem(
        CURRENT_KEY
    );

    currentAccount = null;

    window.location.href =
        "index.html";
}

function deleteAccount() {

    if (!currentAccount) return;

    const confirmDelete =
        confirm(
            "Are you sure you want to permanently delete your account?"
        );

    if (!confirmDelete) {
        return;
    }

    accounts =
        accounts.filter(
            account =>
                account.uid !==
                currentAccount.uid
        );

    saveAccounts();

    localStorage.removeItem(
        CURRENT_KEY
    );

    currentAccount = null;

    window.location.href =
        "index.html";
}

/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadAccounts();

        currentAccount =
            getCurrentAccount();

        /* Login page */

        const enterButton =
            document.getElementById(
                "enterScienceBtn"
            );

        if (enterButton) {

            enterButton.addEventListener(
                "click",
                login
            );
        }

        const scienceName =
            document.getElementById(
                "scienceName"
            );

        if (scienceName) {

            scienceName.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key ===
                        "Enter"
                    ) {

                        event.preventDefault();

                        login();
                    }
                }
            );
        }

        /* Protected pages */

        if (
            !document.body.classList.contains(
                "login-page"
            )
        ) {

            if (!protectPage()) {
                return;
            }

            checkDailyBonus();
        }

        updateUserUI();

        renderTransactions();

        setupQuestions();

        /* Videos */

        document
            .querySelectorAll(
                ".buy-video"
            )
            .forEach(button => {

                const id =
                    button.dataset.videoId;

                if (
                    currentAccount &&
                    hasVideo(id)
                ) {

                    button.textContent =
                        "WATCH NOW";
                }

                button.addEventListener(
                    "click",
                    function () {

                        if (
                            button.dataset.purchased ===
                            "true" ||
                            hasVideo(id)
                        ) {

                            openVideo(id);

                        } else {

                            buyVideo(button);
                        }
                    }
                );
            });

        /* Close video */

        const videoModal =
            document.getElementById(
                "videoModal"
            );

        const closeVideo =
            document.getElementById(
                "closeVideo"
            );

        if (closeVideo) {

            closeVideo.addEventListener(
                "click",
                function () {

                    videoModal.classList.add(
                        "hidden"
                    );

                    document.getElementById(
                        "videoContainer"
                    ).innerHTML = "";
                }
            );
        }

        /* Quiz */

        const quizButton =
            document.getElementById(
                "startQuiz"
            );

        if (quizButton) {

            quizButton.addEventListener(
                "click",
                startQuiz
            );
        }

        /* Game */

        const gameButton =
            document.getElementById(
                "startGame"
            );

        if (gameButton) {

            gameButton.addEventListener(
                "click",
                startGame
            );
        }

        const gameArea =
            document.getElementById(
                "gameArea"
            );

        if (gameArea) {

            gameArea.addEventListener(
                "click",
                flap
            );
        }

        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.code ===
                    "Space"
                ) {

                    if (
                        document.getElementById(
                            "gameArea"
                        )
                    ) {

                        event.preventDefault();

                        flap();
                    }
                }
            }
        );

        /* Account */

        const logoutButton =
            document.getElementById(
                "logoutButton"
            );

        if (logoutButton) {

            logoutButton.addEventListener(
                "click",
                logout
            );
        }

        const deleteButton =
            document.getElementById(
                "deleteButton"
            );

        if (deleteButton) {

            deleteButton.addEventListener(
                "click",
                deleteAccount
            );
        }

        /* Daily bonus */

        const bonusButton =
            document.getElementById(
                "dailyBonus"
            );

        if (bonusButton) {

            bonusButton.addEventListener(
                "click",
                function () {

                    claimManualBonus(
                        bonusButton
                    );
                }
            );
        }

    }
);

/* =========================================================
   DAILY BONUS BUTTON
   ========================================================= */

function checkDailyBonus() {

    if (!currentAccount) return;

    const date =
        today();

    const claimed =
        localStorage.getItem(
            BONUS_KEY +
            "_" +
            currentAccount.uid
        );

    if (claimed !== date) {
        return;
    }
}

function claimManualBonus(button) {

    if (!currentAccount) return;

    const key =
        BONUS_KEY +
        "_" +
        currentAccount.uid;

    if (
        localStorage.getItem(key) ===
        today()
    ) {

        alert(
            "You already claimed today's bonus."
        );

        return;
    }

    localStorage.setItem(
        key,
        today()
    );

    addCoins(
        100,
        "🎁 Daily Wallet Bonus"
    );

    button.textContent =
        "BONUS CLAIMED ✓";

    button.disabled =
        true;
}

/* =========================================================
   STORAGE SYNC
   ========================================================= */

window.addEventListener(
    "storage",
    function (event) {

        if (
            event.key ===
            ACCOUNTS_KEY
        ) {

            loadAccounts();

            currentAccount =
                getCurrentAccount();

            updateUserUI();

            renderTransactions();
        }
    }
);

/* =========================================================
   KIDS SCIENCE
   COURSE BOOK SYSTEM
========================================================= */

"use strict";


/* =========================================================
   CURRENT COURSE STATE
========================================================= */

let currentBook = null;
let currentChapterIndex = 0;
let currentChapter = null;
let quizFinished = false;


/* =========================================================
   SCIENCE BOOK DATA
========================================================= */

const scienceBooks = {

    nature: {

        title: "Nature",

        icon: "🌳",

        label: "BOOK 01 • NATURE",

        description:
            "Discover plants, animals, water, air and the amazing natural world.",

        chapters: [

            {

                title: "What Is Nature?",

                subtitle:
                    "Let's discover the world around us.",

                image:
                    "🌳🌎🌱",

                fact:
                    "Nature includes living things and non-living things around us.",

                content: `

                    <p>
                        Nature is everything around us that exists
                        without being made by humans. Trees, rivers,
                        mountains, animals, sunlight, air and soil are
                        all parts of nature.
                    </p>

                    <h2>Living Things</h2>

                    <p>
                        Plants, animals and people are living things.
                        They need things such as water, air and food
                        to survive and grow.
                    </p>

                    <p>
                        A tree grows from a tiny seed. A bird grows
                        from a young bird into an adult. Humans also
                        grow and change as they get older.
                    </p>

                    <h2>Non-Living Things</h2>

                    <p>
                        Rocks, water, sunlight and air are examples
                        of non-living things. They do not grow or
                        reproduce like living organisms.
                    </p>

                    <p>
                        Living and non-living things work together
                        to create ecosystems. Nature is a connected
                        system where many different things depend
                        on one another.
                    </p>

                `,

                questions: [

                    {
                        question:
                            "Which of these is a living thing?",

                        options: [
                            "Rock",
                            "Tree",
                            "Water",
                            "Sunlight"
                        ],

                        answer: 1
                    },

                    {
                        question:
                            "Which is a non-living thing?",

                        options: [
                            "Dog",
                            "Tree",
                            "Rock",
                            "Bird"
                        ],

                        answer: 2
                    },

                    {
                        question:
                            "What do plants need to survive?",

                        options: [
                            "Only toys",
                            "Water and sunlight",
                            "Only rocks",
                            "Nothing"
                        ],

                        answer: 1
                    }

                ]

            },


            {

                title: "Plants",

                subtitle:
                    "Learn how plants grow and make food.",

                image:
                    "🌱☀️🌿",

                fact:
                    "Plants use sunlight to help make their own food.",

                content: `

                    <p>
                        Plants are living organisms found almost
                        everywhere on Earth. They can grow in forests,
                        gardens, deserts and even in water.
                    </p>

                    <h2>Roots</h2>

                    <p>
                        Roots usually grow underground. They help hold
                        the plant in the soil and absorb water and
                        minerals.
                    </p>

                    <h2>Stem</h2>

                    <p>
                        The stem supports the plant. It also helps
                        move water and nutrients to different parts
                        of the plant.
                    </p>

                    <h2>Leaves</h2>

                    <p>
                        Leaves are important because plants use them
                        to make food. This process is called
                        photosynthesis.
                    </p>

                    <p>
                        During photosynthesis, plants use sunlight,
                        water and carbon dioxide to make food.
                    </p>

                `,

                questions: [

                    {
                        question:
                            "Which part absorbs water from the soil?",

                        options: [
                            "Flower",
                            "Root",
                            "Leaf",
                            "Fruit"
                        ],

                        answer: 1
                    },

                    {
                        question:
                            "Where does photosynthesis mainly happen?",

                        options: [
                            "Leaves",
                            "Roots",
                            "Rocks",
                            "Soil"
                        ],

                        answer: 0
                    },

                    {
                        question:
                            "What provides energy for photosynthesis?",

                        options: [
                            "Moonlight",
                            "Sunlight",
                            "Rocks",
                            "Sand"
                        ],

                        answer: 1
                    }

                ]

            },


            {

                title: "Animals",

                subtitle:
                    "Meet the amazing animals of our planet.",

                image:
                    "🦁🐘🦋",

                fact:
                    "Animals can be grouped into different groups based on their features.",

                content: `

                    <p>
                        Animals live in almost every environment on
                        Earth. Some live on land, some live in water
                        and others can fly through the air.
                    </p>

                    <h2>Animal Groups</h2>

                    <p>
                        Scientists classify animals into groups.
                        Mammals, birds, reptiles, amphibians and fish
                        are some major groups.
                    </p>

                    <p>
                        Mammals usually have hair or fur and feed
                        their babies milk. Dogs, cats, elephants and
                        humans are mammals.
                    </p>

                    <h2>Habitats</h2>

                    <p>
                        A habitat is a place where an animal lives.
                        A polar bear lives in cold Arctic environments,
                        while a camel is adapted to hot deserts.
                    </p>

                `,

                questions: [

                    {
                        question:
                            "Which animal is a mammal?",

                        options: [
                            "Elephant",
                            "Frog",
                            "Fish",
                            "Lizard"
                        ],

                        answer: 0
                    },

                    {
                        question:
                            "What is a habitat?",

                        options: [
                            "A type of food",
                            "A place where an organism lives",
                            "A type of weather",
                            "A planet"
                        ],

                        answer: 1
                    },

                    {
                        question:
                            "Which animal is adapted to deserts?",

                        options: [
                            "Camel",
                            "Penguin",
                            "Dolphin",
                            "Polar bear"
                        ],

                        answer: 0
                    }

                ]

            },


            {

                title: "Water",

                subtitle:
                    "Why water is one of Earth's most important resources.",

                image:
                    "💧🌊☁️",

                fact:
                    "Most of Earth's surface is covered by water.",

                content: `

                    <p>
                        Water is essential for life. Humans, animals
                        and plants all need water to survive.
                    </p>

                    <h2>Where Is Water Found?</h2>

                    <p>
                        Water can be found in oceans, rivers, lakes,
                        glaciers, underground and in the atmosphere.
                    </p>

                    <h2>The Water Cycle</h2>

                    <p>
                        Water moves continuously around Earth. The Sun
                        heats water and causes evaporation. Water vapour
                        rises and can form clouds.
                    </p>

                    <p>
                        When water falls from clouds as rain or snow,
                        we call this precipitation.
                    </p>

                    <h2>Saving Water</h2>

                    <p>
                        Clean water is important, so we should avoid
                        wasting it. Turning off a tap when it is not
                        needed is one simple way to save water.
                    </p>

                `,

                questions: [

                    {
                        question:
                            "Why do living things need water?",

                        options: [
                            "To survive",
                            "To become rocks",
                            "To fly",
                            "To make sunlight"
                        ],

                        answer: 0
                    },

                    {
                        question:
                            "What happens during evaporation?",

                        options: [
                            "Water becomes water vapour",
                            "Water becomes rock",
                            "Plants disappear",
                            "Clouds become soil"
                        ],

                        answer: 0
                    },

                    {
                        question:
                            "What is rain an example of?",

                        options: [
                            "Photosynthesis",
                            "Precipitation",
                            "Digestion",
                            "Gravity"
                        ],

                        answer: 1
                    }

                ]

            },


            {

                title: "Air Around Us",

                subtitle:
                    "Discover the invisible mixture that surrounds Earth.",

                image:
                    "🌬️☁️🌍",

                fact:
                    "Earth's atmosphere contains gases that are important for life.",

                content: `

                    <p>
                        We cannot normally see air, but it is all
                        around us. Air is a mixture of different gases.
                    </p>

                    <h2>Oxygen</h2>

                    <p>
                        Oxygen is a gas that humans and many animals
                        need for respiration.
                    </p>

                    <h2>Carbon Dioxide</h2>

                    <p>
                        Plants use carbon dioxide during
                        photosynthesis to help make food.
                    </p>

                    <h2>Moving Air</h2>

                    <p>
                        Moving air is called wind. Wind can be gentle
                        like a breeze or strong during storms.
                    </p>

                `,

                questions: [

                    {
                        question:
                            "Which gas do humans need for respiration?",

                        options: [
                            "Oxygen",
                            "Helium",
                            "Carbon dioxide only",
                            "Water vapour only"
                        ],

                        answer: 0
                    },

                    {
                        question:
                            "What is moving air called?",

                        options: [
                            "Rain",
                            "Wind",
                            "Snow",
                            "Fog"
                        ],

                        answer: 1
                    },

                    {
                        question:
                            "Which gas do plants use during photosynthesis?",

                        options: [
                            "Carbon dioxide",
                            "Gold",
                            "Iron",
                            "Sand"
                        ],

                        answer: 0
                    }

                ]

            }

        ]

    },


    /* =====================================================
       SPACE BOOK
    ===================================================== */

    space: {

        title: "Space",

        icon: "🚀",

        label: "BOOK 02 • SPACE",

        description:
            "Explore the Sun, Moon, planets and our universe.",

        chapters: [

            {

                title: "Our Solar System",

                subtitle:
                    "Meet our Sun and the planets around it.",

                image:
                    "☀️🪐🌍",

                fact:
                    "Our Solar System has eight recognized planets.",

                content: `

                    <p>
                        Our Solar System is a huge collection of
                        objects held together by gravity.
                    </p>

                    <p>
                        At its centre is the Sun, a star that provides
                        light and heat to the planets.
                    </p>

                    <h2>The Planets</h2>

                    <p>
                        The eight planets are Mercury, Venus, Earth,
                        Mars, Jupiter, Saturn, Uranus and Neptune.
                    </p>

                    <p>
                        Each planet is different. Some are rocky
                        worlds, while others are giant planets made
                        mostly of gases or icy materials.
                    </p>

                `,

                questions: [

                    {
                        question:
                            "What is at the centre of our Solar System?",

                        options: [
                            "Earth",
                            "The Moon",
                            "The Sun",
                            "Mars"
                        ],

                        answer: 2
                    },

                    {
                        question:
                            "How many recognized planets are in our Solar System?",

                        options: [
                            "5",
                            "6",
                            "8",
                            "12"
                        ],

                        answer: 2
                    }

                ]

            },


            {

                title: "The Sun",

                subtitle:
                    "The star that gives Earth energy.",

                image:
                    "☀️🔥🌞",

                fact:
                    "The Sun is a star and is much larger than Earth.",

                content: `

                    <p>
                        The Sun is the star at the centre of our
                        Solar System. It is made of extremely hot
                        gases.
                    </p>

                    <h2>Why Is the Sun Important?</h2>

                    <p>
                        The Sun provides light and heat. Life on Earth
                        depends on energy from the Sun.
                    </p>

                    <p>
                        Plants capture sunlight during photosynthesis.
                        This energy then becomes part of food chains.
                    </p>

                `,

                questions: [

                    {
                        question:
                            "What is the Sun?",

                        options: [
                            "A planet",
                            "A star",
                            "A moon",
                            "An asteroid"
                        ],

                        answer: 1
                    },

                    {
                        question:
                            "What does the Sun provide Earth?",

                        options: [
                            "Light and heat",
                            "Only rocks",
                            "Only water",
                            "Gravity-free space"
                        ],

                        answer: 0
                    }

                ]

            },


            {

                title: "The Moon",

                subtitle:
                    "Earth's natural satellite.",

                image:
                    "🌕🌙🌍",

                fact:
                    "The Moon does not make its own light; it reflects sunlight.",

                content: `

                    <p>
                        The Moon is Earth's natural satellite. It
                        travels around Earth in space.
                    </p>

                    <h2>Moonlight</h2>

                    <p>
                        The Moon appears bright in the night sky, but
                        it does not produce its own visible light.
                        It reflects light from the Sun.
                    </p>

                    <h2>Moon Phases</h2>

                    <p>
                        The Moon appears to change shape during the
                        month. These changing appearances are called
                        phases.
                    </p>

                `,

                questions: [

                    {
                        question:
                            "What is the Moon?",

                        options: [
                            "Earth's natural satellite",
                            "A star",
                            "A galaxy",
                            "A cloud"
                        ],

                        answer: 0
                    },

                    {
                        question:
                            "Where does the Moon's visible light come from?",

                        options: [
                            "Earth",
                            "The Sun",
                            "Mars",
                            "The Moon's fire"
                        ],

                        answer: 1
                    }

                ]

            },


            {

                title: "Earth",

                subtitle:
                    "Our home planet.",

                image:
                    "🌍🌊🌱",

                fact:
                    "Earth has liquid water on its surface and supports life.",

                content: `

                    <p>
                        Earth is the planet we call home. It has land,
                        oceans and an atmosphere.
                    </p>

                    <p>
                        Earth has conditions that allow many forms of
                        life to survive, including suitable
                        temperatures and liquid water.
                    </p>

                    <h2>Our Atmosphere</h2>

                    <p>
                        The atmosphere is the layer of gases around
                        Earth. It helps protect our planet and provides
                        gases needed by living organisms.
                    </p>

                `,

                questions: [

                    {
                        question:
                            "Which planet is our home?",

                        options: [
                            "Mars",
                            "Venus",
                            "Earth",
                            "Jupiter"
                        ],

                        answer: 2
                    },

                    {
                        question:
                            "What surrounds Earth?",

                        options: [
                            "An atmosphere",
                            "A wall",
                            "A metal shell",
                            "Nothing"
                        ],

                        answer: 0
                    }

                ]

            },


            {

                title: "Stars and Galaxies",

                subtitle:
                    "Look far beyond our Solar System.",

                image:
                    "🌌⭐✨",

                fact:
                    "The Sun is one of the many stars in the universe.",

                content: `

                    <p>
                        When you look at the night sky, you can see
                        many points of light. Many of these are stars
                        that are extremely far away.
                    </p>

                    <h2>Galaxies</h2>

                    <p>
                        A galaxy is a huge collection of stars, gas,
                        dust and other objects held together by gravity.
                    </p>

                    <p>
                        Our Solar System is inside the Milky Way
                        Galaxy.
                    </p>

                `,

                questions: [

                    {
                        question:
                            "What galaxy contains our Solar System?",

                        options: [
                            "Milky Way",
                            "Andromeda only",
                            "Mars Galaxy",
                            "Solar Galaxy"
                        ],

                        answer: 0
                    },

                    {
                        question:
                            "What is a galaxy?",

                        options: [
                            "A collection of stars and other matter",
                            "A single planet",
                            "A moon",
                            "A cloud only"
                        ],

                        answer: 0
                    }

                ]

            }

        ]

    },


    /* =====================================================
       HUMAN BODY BOOK
    ===================================================== */

    human: {

        title: "Human Body",

        icon: "🧠",

        label: "BOOK 03 • HUMAN BODY",

        description:
            "Discover the amazing systems that make your body work.",

        chapters: [

            {

                title: "The Human Body",

                subtitle:
                    "Your body is an incredible living machine.",

                image:
                    "🧍🫀🧠",

                fact:
                    "The human body is made from trillions of cells.",

                content: `

                    <p>
                        Your body contains many different parts that
                        work together. The brain, heart, lungs, bones,
                        muscles and many other organs all have important
                        jobs.
                    </p>

                    <h2>Cells</h2>

                    <p>
                        Cells are tiny building blocks of living
                        organisms. Your body contains many different
                        types of cells.
                    </p>

                    <h2>Organs</h2>

                    <p>
                        Organs are body structures that perform
                        important functions. The heart pumps blood,
                        while the lungs help with breathing.
                    </p>

                `,

                questions: [

                    {
                        question:
                            "What are cells?",

                        options: [
                            "Building blocks of living organisms",
                            "Types of planets",
                            "Rocks",
                            "Stars"
                        ],

                        answer: 0
                    },

                    {
                        question:
                            "Which organ pumps blood?",

                        options: [
                            "Brain",
                            "Heart",
                            "Lung",
                            "Stomach"
                        ],

                        answer: 1
                    }

                ]

            },


            {

                title: "The Brain",

                subtitle:
                    "The control centre of your nervous system.",

                image:
                    "🧠⚡",

                fact:
                    "The brain helps control thoughts, movement, memory and many body functions.",

                content: `

                    <p>
                        The brain is one of the most important organs
                        in the human body. It is part of the nervous
                        system.
                    </p>

                    <h2>Thinking</h2>

                    <p>
                        Your brain helps you think, learn, remember
                        information and solve problems.
                    </p>

                    <h2>Movement</h2>

                    <p>
                        The brain sends signals through nerves that
                        help control muscles and movement.
                    </p>

                `,

                questions: [

                    {
                        question:
                            "Which organ helps us think and remember?",

                        options: [
                            "Heart",
                            "Brain",
                            "Liver",
                            "Bone"
                        ],

                        answer: 1
                    },

                    {
                        question:
                            "The brain is part of which system?",

                        options: [
                            "Nervous system",
                            "Solar system",
                            "Water cycle",
                            "Rock cycle"
                        ],

                        answer: 0
                    }

                ]

            },


            {

                title: "The Heart",

                subtitle:
                    "The organ that pumps blood around your body.",

                image:
                    "🫀❤️🩸",

                fact:
                    "The heart continuously pumps blood around the body.",

                content: `

                    <p>
                        The heart is a muscular organ. Its main job is
                        to pump blood through the body.
                    </p>

                    <h2>Blood</h2>

                    <p>
                        Blood carries oxygen and nutrients to cells.
                        It also helps carry waste products away.
                    </p>

                    <p>
                        The heart beats again and again throughout
                        your life.
                    </p>

                `,

                questions: [

                    {
                        question:
                            "What does the heart do?",

                        options: [
                            "Pumps blood",
                            "Makes bones",
                            "Sees light",
                            "Stores air"
                        ],

                        answer: 0
                    },

                    {
                        question:
                            "What does blood carry to cells?",

                        options: [
                            "Oxygen and nutrients",
                            "Stars",
                            "Rocks",
                            "Sunlight"
                        ],

                        answer: 0
                    }

                ]

            },


            {

                title: "The Lungs",

                subtitle:
                    "The organs that help you breathe.",

                image:
                    "🫁🌬️",

                fact:
                    "The lungs help move oxygen into the body and carbon dioxide out.",

                content: `

                    <p>
                        Humans need oxygen to survive. The lungs are
                        organs that help us breathe.
                    </p>

                    <h2>Breathing In</h2>

                    <p>
                        When you breathe in, air travels into your
                        lungs. Oxygen from the air can then enter the
                        bloodstream.
                    </p>

                    <h2>Breathing Out</h2>

                    <p>
                        When you breathe out, carbon dioxide is removed
                        from the body.
                    </p>

                `,

                questions: [

                    {
                        question:
                            "Which organs help us breathe?",

                        options: [
                            "Lungs",
                            "Bones",
                            "Brain",
                            "Skin"
                        ],

                        answer: 0
                    },

                    {
                        question:
                            "Which gas do humans need?",

                        options: [
                            "Oxygen",
                            "Gold",
                            "Iron",
                            "Sand"
                        ],

                        answer: 0
                    }

                ]

            },


            {

                title: "Bones and Muscles",

                subtitle:
                    "How your body supports and moves itself.",

                image:
                    "🦴💪",

                fact:
                    "Bones provide support while muscles help move the body.",

                content: `

                    <p>
                        Your skeleton is the framework of your body.
                        Bones provide support and help protect important
                        organs.
                    </p>

                    <h2>Muscles</h2>

                    <p>
                        Muscles contract and relax to create movement.
                        They work together with bones and joints.
                    </p>

                    <p>
                        For example, muscles in your arms help you
                        move your hands and lift objects.
                    </p>

                `,

                questions: [

                    {
                        question:
                            "What provides support for the body?",

                        options: [
                            "Bones",
                            "Clouds",
                            "Water",
                            "Stars"
                        ],

                        answer: 0
                    },

                    {
                        question:
                            "What helps create movement?",

                        options: [
                            "Muscles",
                            "Rocks",
                            "Air only",
                            "Sunlight"
                        ],

                        answer: 0
                    }

                ]

            }

        ]

    }

};


/* =========================================================
   OPEN BOOK
========================================================= */

function openBook(bookId) {

    if (!scienceBooks[bookId]) {
        return;
    }

    currentBook = bookId;
    currentChapterIndex = 0;

    const book = scienceBooks[bookId];

    document.getElementById("courseHome")
        .classList.add("hidden");

    document.getElementById("readerScreen")
        .classList.add("hidden");

    document.getElementById("quizScreen")
        .classList.add("hidden");

    document.getElementById("chapterScreen")
        .classList.remove("hidden");


    document.getElementById("selectedBookIcon")
        .textContent = book.icon;

    document.getElementById("selectedBookTitle")
        .textContent = book.title;

    document.getElementById("selectedBookLabel")
        .textContent = book.label;

    document.getElementById("selectedBookDescription")
        .textContent = book.description;


    renderChapters();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   SHOW CHAPTERS
========================================================= */

function renderChapters() {

    const list =
        document.getElementById("chapterList");

    const book =
        scienceBooks[currentBook];

    list.innerHTML = "";


    book.chapters.forEach(function(chapter, index) {

        const card =
            document.createElement("div");

        card.className = "chapter-card";

        card.onclick = function() {

            openChapter(index);

        };


        card.innerHTML = `

            <div class="chapter-number-box">
                ${String(index + 1).padStart(2, "0")}
            </div>

            <div>

                <h3>
                    Chapter ${index + 1}:
                    ${chapter.title}
                </h3>

                <p>
                    ${chapter.subtitle}
                </p>

            </div>

            <div class="chapter-arrow">
                →
            </div>

        `;


        list.appendChild(card);

    });

}


/* =========================================================
   OPEN CHAPTER
========================================================= */

function openChapter(index) {

    const book =
        scienceBooks[currentBook];

    if (!book || !book.chapters[index]) {
        return;
    }

    currentChapterIndex = index;

    currentChapter =
        book.chapters[index];


    document.getElementById("chapterScreen")
        .classList.add("hidden");

    document.getElementById("courseHome")
        .classList.add("hidden");

    document.getElementById("quizScreen")
        .classList.add("hidden");

    document.getElementById("readerScreen")
        .classList.remove("hidden");


    document.getElementById("readerBook")
        .textContent =
        book.title.toUpperCase();


    document.getElementById("readerChapter")
        .textContent =
        "CHAPTER " + (index + 1);


    document.getElementById("readerTitle")
        .textContent =
        currentChapter.title;


    document.getElementById("readerSubtitle")
        .textContent =
        currentChapter.subtitle;


    document.getElementById("readerImage")
        .textContent =
        currentChapter.image;


    document.getElementById("readerContent")
        .innerHTML =
        currentChapter.content;


    document.getElementById("readerFact")
        .textContent =
        currentChapter.fact;


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   BACK TO BOOKS
========================================================= */

function showCourseHome() {

    document.getElementById("courseHome")
        .classList.remove("hidden");

    document.getElementById("chapterScreen")
        .classList.add("hidden");

    document.getElementById("readerScreen")
        .classList.add("hidden");

    document.getElementById("quizScreen")
        .classList.add("hidden");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   BACK TO CHAPTERS
========================================================= */

function backToChapters() {

    document.getElementById("courseHome")
        .classList.add("hidden");

    document.getElementById("readerScreen")
        .classList.add("hidden");

    document.getElementById("quizScreen")
        .classList.add("hidden");

    document.getElementById("chapterScreen")
        .classList.remove("hidden");

    renderChapters();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   BACK TO READER
========================================================= */

function backToReader() {

    document.getElementById("quizScreen")
        .classList.add("hidden");

    document.getElementById("readerScreen")
        .classList.remove("hidden");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   OPEN QUIZ
========================================================= */

function openQuiz() {

    if (!currentChapter) {
        return;
    }


    quizFinished = false;


    document.getElementById("readerScreen")
        .classList.add("hidden");

    document.getElementById("chapterScreen")
        .classList.add("hidden");

    document.getElementById("quizScreen")
        .classList.remove("hidden");


    document.getElementById("quizTitle")
        .textContent =
        currentChapter.title + " — Q&A";


    const container =
        document.getElementById("quizQuestions");

    container.innerHTML = "";


    currentChapter.questions.forEach(
        function(question, questionIndex) {

            const box =
                document.createElement("div");

            box.className = "quiz-question";


            let optionsHTML = "";


            question.options.forEach(
                function(option, optionIndex) {

                    optionsHTML += `

                        <label class="quiz-option">

                            <input
                                type="radio"
                                name="question-${questionIndex}"
                                value="${optionIndex}"
                            >

                            ${option}

                        </label>

                    `;

                }
            );


            box.innerHTML = `

                <h3>
                    ${questionIndex + 1}.
                    ${question.question}
                </h3>

                ${optionsHTML}

            `;


            container.appendChild(box);

        }
    );


    document.getElementById("submitQuizButton")
        .classList.remove("hidden");

    document.getElementById("quizResult")
        .classList.add("hidden");

    document.getElementById("nextChapterButton")
        .classList.add("hidden");

    document.getElementById("backBookButton")
        .classList.add("hidden");


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   SUBMIT QUIZ
========================================================= */

function submitQuiz() {

    if (quizFinished) {
        return;
    }


    const questions =
        currentChapter.questions;


    let score = 0;

    let unanswered = 0;


    questions.forEach(
        function(question, questionIndex) {

            const selected =
                document.querySelector(
                    `input[name="question-${questionIndex}"]:checked`
                );


            if (!selected) {

                unanswered++;

                return;

            }


            if (
                Number(selected.value) ===
                question.answer
            ) {

                score++;

            }

        }
    );


    if (unanswered > 0) {

        alert(
            "Please answer all questions before checking your answers."
        );

        return;

    }


    quizFinished = true;


    const total =
        questions.length;


    const percentage =
        Math.round((score / total) * 100);


    let reward =
        score * 10;


    if (percentage === 100) {
        reward += 25;
    }


    addScienceCoins(reward);


    const result =
        document.getElementById("quizResult");


    result.classList.remove("hidden");


    result.innerHTML = `

        <h2>
            ${score}/${total}
        </h2>

        <p>
            You scored ${percentage}%!
        </p>

        <p>
            🪙 You earned ${reward} PlayCoins.
        </p>

    `;


    document.getElementById("submitQuizButton")
        .classList.add("hidden");


    const book =
        scienceBooks[currentBook];


    if (
        currentChapterIndex <
        book.chapters.length - 1
    ) {

        document.getElementById("nextChapterButton")
            .classList.remove("hidden");

    } else {

        document.getElementById("backBookButton")
            .classList.remove("hidden");

    }

}


/* =========================================================
   NEXT CHAPTER
========================================================= */

function nextChapter() {

    const book =
        scienceBooks[currentBook];


    if (
        currentChapterIndex <
        book.chapters.length - 1
    ) {

        currentChapterIndex++;

        openChapter(currentChapterIndex);

    } else {

        backToChapters();

    }

}


/* =========================================================
   PLAYCOINS
========================================================= */

function addScienceCoins(amount) {

    if (amount <= 0) {
        return;
    }


    try {

        const accounts =
            JSON.parse(
                localStorage.getItem("kidsScienceAccounts")
            ) || [];


        const currentUID =
            localStorage.getItem(
                "kidsScienceCurrentUID"
            );


        if (!currentUID) {
            return;
        }


        const account =
            accounts.find(
                function(item) {

                    return item.uid === currentUID;

                }
            );


        if (!account) {
            return;
        }


        account.balance =
            Number(account.balance || 0) +
            Number(amount);


        if (!Array.isArray(account.transactions)) {

            account.transactions = [];

        }


        account.transactions.unshift({

            text:
                "📚 Science Quiz Reward",

            amount:
                amount,

            date:
                new Date().toLocaleDateString()

        });


        localStorage.setItem(
            "kidsScienceAccounts",
            JSON.stringify(accounts)
        );


    } catch (error) {

        console.error(
            "PlayCoins update failed:",
            error
        );

    }

}


/* =========================================================
   PAGE START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        if (
            document.getElementById("courseHome")
        ) {

            showCourseHome();

        }

    }
);