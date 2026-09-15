javascript
"use strict";

/*
=========================================================
 KIDS SCIENCE
 COMPLETE ACCOUNT / AUTO LOGIN SYSTEM
=========================================================
*/


/* ========================================================
   STORAGE KEYS
======================================================== */

const ACCOUNTS_KEY =
    "kidsScienceAccounts";

const CURRENT_ACCOUNT_KEY =
    "kidsScienceCurrentUID";

const CHAT_KEY =
    "kidsScienceChat";

const VIDEO_KEY =
    "kidsScienceWatchVideo";

const BONUS_KEY =
    "kidsScienceBonusDate";


/* ========================================================
   GLOBAL DATA
======================================================== */

let accounts = [];

let currentAccount = null;


/* ========================================================
   AVATARS
======================================================== */

const SCIENCE_EMOJIS = [
    "🧑‍🔬",
    "👩‍🔬",
    "👨‍🚀",
    "👩‍🚀",
    "🧪",
    "🔬",
    "🧬",
    "🌎",
    "🪐",
    "🚀",
    "🦖",
    "🐼",
    "🦊",
    "🐯",
    "🐨",
    "🐸"
];


/* ========================================================
   LOAD ALL ACCOUNTS
======================================================== */

function loadAccounts() {

    try {

        const saved =
            localStorage.getItem(
                ACCOUNTS_KEY
            );

        accounts =
            saved
                ? JSON.parse(saved)
                : [];

        if (!Array.isArray(accounts)) {

            accounts = [];

        }

    } catch (error) {

        console.error(
            "Could not load accounts:",
            error
        );

        accounts = [];

    }

}


/* ========================================================
   SAVE ALL ACCOUNTS
======================================================== */

function saveAccounts() {

    localStorage.setItem(
        ACCOUNTS_KEY,
        JSON.stringify(accounts)
    );

}


/* ========================================================
   GENERATE UID
======================================================== */

function generateUID() {

    const characters =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let uid;

    do {

        let randomPart = "";

        for (
            let i = 0;
            i < 6;
            i++
        ) {

            randomPart +=
                characters[
                    Math.floor(
                        Math.random() *
                        characters.length
                    )
                ];

        }

        uid = "KID-" + randomPart;

    } while (
        accounts.some(
            account =>
                account.uid === uid
        )
    );


    return uid;

}


/* ========================================================
   GET CURRENT ACCOUNT
======================================================== */

function loadCurrentAccount() {

    loadAccounts();


    const currentUID =
        localStorage.getItem(
            CURRENT_ACCOUNT_KEY
        );


    if (!currentUID) {

        currentAccount = null;

        return null;

    }


    currentAccount =
        accounts.find(
            account =>
                account.uid === currentUID
        ) || null;


    /*
       If the saved UID no longer exists,
       clean the broken current-session value.
    */

    if (!currentAccount) {

        localStorage.removeItem(
            CURRENT_ACCOUNT_KEY
        );

    }


    return currentAccount;

}


/* ========================================================
   SAVE CURRENT ACCOUNT
======================================================== */

function saveCurrentAccount() {

    if (!currentAccount) {

        return;

    }


    const index =
        accounts.findIndex(
            account =>
                account.uid ===
                currentAccount.uid
        );


    if (index === -1) {

        accounts.push(
            currentAccount
        );

    } else {

        accounts[index] =
            currentAccount;

    }


    saveAccounts();

}


/* ========================================================
   SET CURRENT ACCOUNT
======================================================== */

function setCurrentAccount(account) {

    currentAccount = account;


    localStorage.setItem(
        CURRENT_ACCOUNT_KEY,
        account.uid
    );


    saveCurrentAccount();

}


/* ========================================================
   DATE
======================================================== */

function todayString() {

    const date =
        new Date();

    return date
        .toISOString()
        .slice(0, 10);

}


/* ========================================================
   TRANSACTION
======================================================== */

function addTransaction(
    text,
    amount
) {

    if (!currentAccount) {

        return;

    }


    if (!Array.isArray(
        currentAccount.transactions
    )) {

        currentAccount.transactions = [];

    }


    currentAccount.transactions.unshift({

        text: text,

        amount: amount,

        date:
            new Date().toLocaleString()

    });


    /*
       Keep the local account reasonably small.
    */

    currentAccount.transactions =
        currentAccount.transactions
            .slice(0, 100);


    saveCurrentAccount();

}


/* ========================================================
   CREATE ACCOUNT
======================================================== */

function createScienceAccount(
    nickname,
    emoji
) {

    nickname =
        nickname.trim();


    if (!nickname) {

        throw new Error(
            "Please enter a nickname."
        );

    }


    if (nickname.length < 2) {

        throw new Error(
            "Nickname must contain at least 2 characters."
        );

    }


    /*
       Duplicate nickname check.
       Existing accounts are NOT replaced.
    */

    const duplicate =
        accounts.some(
            account =>
                String(
                    account.name
                ).toLowerCase() ===
                nickname.toLowerCase()
        );


    if (duplicate) {

        throw new Error(
            "This nickname is already being used."
        );

    }


    const account = {

        uid:
            generateUID(),

        name:
            nickname,

        emoji:
            emoji || "🧑‍🔬",

        balance:
            500,

        pass:
            "FREE",

        passExpires:
            null,

        transactions: [
            {
                text:
                    "🎁 Welcome bonus",

                amount:
                    500,

                date:
                    new Date().toLocaleString()
            }
        ],

        unlockedVideos: [],

        purchasedVideos: [],

        unlockedCourses: [],

        lastBonusDate:
            todayString(),

        lastDailyPassReward:
            null,

        createdAt:
            new Date().toISOString()

    };


    accounts.push(account);

    saveAccounts();


    localStorage.setItem(
        CURRENT_ACCOUNT_KEY,
        account.uid
    );


    currentAccount =
        account;


    return account;

}


/* ========================================================
   LOGOUT
======================================================== */

function logoutScienceAccount() {

    /*
       IMPORTANT:
       Logout removes ONLY the current session.
       It does NOT delete the saved account.
    */

    currentAccount = null;

    localStorage.removeItem(
        CURRENT_ACCOUNT_KEY
    );


    window.location.href =
        "index.html";

}


/* ========================================================
   DELETE ACCOUNT
======================================================== */

function deleteScienceAccount() {

    if (!currentAccount) {

        return;

    }


    const confirmed =
        window.confirm(
            "Delete your KIDS SCIENCE account permanently from this device?"
        );


    if (!confirmed) {

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
        CURRENT_ACCOUNT_KEY
    );


    currentAccount = null;


    /*
       Account is now actually deleted.
    */

    window.location.href =
        "index.html";

}


/* ========================================================
   ADD PLAYCOINS
======================================================== */

function addScienceCoins(
    amount,
    reason
) {

    if (!currentAccount) {

        return false;

    }


    amount =
        Number(amount);


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        return false;

    }


    currentAccount.balance =
        Number(
            currentAccount.balance || 0
        ) + amount;


    addTransaction(
        reason || "PlayCoins reward",
        amount
    );


    saveCurrentAccount();


    return true;

}


/* ========================================================
   SPEND PLAYCOINS
======================================================== */

function spendScienceCoins(
    amount,
    reason
) {

    if (!currentAccount) {

        return false;

    }


    amount =
        Number(amount);


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        return false;

    }


    const balance =
        Number(
            currentAccount.balance || 0
        );


    if (balance < amount) {

        return false;

    }


    currentAccount.balance =
        balance - amount;


    addTransaction(
        reason || "PlayCoins purchase",
        -amount
    );


    saveCurrentAccount();


    return true;

}


/* ========================================================
   DAILY BONUS
======================================================== */

function claimDailyBonus() {

    if (!currentAccount) {

        return false;

    }


    const today =
        todayString();


    if (
        currentAccount.lastBonusDate ===
        today
    ) {

        return false;

    }


    currentAccount.lastBonusDate =
        today;


    currentAccount.balance =
        Number(
            currentAccount.balance || 0
        ) + 100;


    addTransaction(
        "☀️ Daily PlayCoins bonus",
        100
    );


    saveCurrentAccount();


    return true;

}


/* ========================================================
   AUTO LOGIN
======================================================== */

function autoLogin() {

    loadCurrentAccount();


    /*
       If the current UID exists,
       the account remains logged in.

       This works after:
       - page changes
       - refresh
       - closing browser
       - reopening website
    */

    if (currentAccount) {

        return true;

    }


    return false;

}


/* ========================================================
   LOGIN PAGE
======================================================== */

function initializeLoginPage() {

    const form =
        document.getElementById(
            "accountForm"
        );


    if (!form) {

        return;

    }


    /*
       First check saved account.
    */

    if (autoLogin()) {

        const existingBox =
            document.getElementById(
                "existingBox"
            );


        if (existingBox) {

            existingBox.classList.add(
                "show"
            );

        }


        /*
           The user is already logged in.
           We don't create another account.
        */

        setTimeout(() => {

            window.location.href =
                "accounts.html";

        }, 700);


        return;

    }


    const nicknameInput =
        document.getElementById(
            "nickname"
        );

    const emojiPicker =
        document.getElementById(
            "emojiPicker"
        );

    const errorBox =
        document.getElementById(
            "errorBox"
        );

    const accountButton =
        document.getElementById(
            "accountButton"
        );


    let selectedEmoji =
        SCIENCE_EMOJIS[0];


    /*
       Build emoji selector.
    */

    if (emojiPicker) {

        emojiPicker.innerHTML = "";


        SCIENCE_EMOJIS.forEach(
            emoji => {

                const button =
                    document.createElement(
                        "button"
                    );


                button.type =
                    "button";


                button.className =
                    "emoji-button";


                button.textContent =
                    emoji;


                if (
                    emoji ===
                    selectedEmoji
                ) {

                    button.classList.add(
                        "selected"
                    );

                }


                button.addEventListener(
                    "click",
                    () => {

                        selectedEmoji =
                            emoji;


                        document
                            .querySelectorAll(
                                ".emoji-button"
                            )
                            .forEach(
                                item =>
                                    item.classList
                                        .remove(
                                            "selected"
                                        )
                            );


                        button.classList.add(
                            "selected"
                        );

                    }
                );


                emojiPicker.appendChild(
                    button
                );

            }
        );

    }


    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            if (errorBox) {

                errorBox.style.display =
                    "none";

                errorBox.textContent =
                    "";

            }


            const nickname =
                nicknameInput.value.trim();


            try {

                const account =
                    createScienceAccount(
                        nickname,
                        selectedEmoji
                    );


                /*
                   Account is now saved BEFORE
                   going to the next page.
                */

                console.log(
                    "Account created:",
                    account.uid
                );


                window.location.href =
                    "accounts.html";


            } catch (error) {

                if (errorBox) {

                    errorBox.textContent =
                        error.message;

                    errorBox.style.display =
                        "block";

                }

            }

        }
    );

}


/* ========================================================
   REQUIRE LOGIN
======================================================== */

function requireScienceLogin() {

    loadCurrentAccount();


    if (!currentAccount) {

        window.location.href =
            "index.html";

        return false;

    }


    return true;

}


/* ========================================================
   ACCOUNT PAGE
======================================================== */

function initializeAccountsPage() {

    const area =
        document.getElementById(
            "accountArea"
        );


    if (!area) {

        return;

    }


    if (!requireScienceLogin()) {

        return;

    }


    renderAccountPage();

}


/* ========================================================
   RENDER ACCOUNT
======================================================== */

function renderAccountPage() {

    const area =
        document.getElementById(
            "accountArea"
        );


    if (!area || !currentAccount) {

        return;

    }


    const transactions =
        Array.isArray(
            currentAccount.transactions
        )
            ? currentAccount.transactions
            : [];


    let transactionHTML = "";


    if (transactions.length === 0) {

        transactionHTML =
            `
            <div style="
                color:#7194b8;
                padding:10px 0;
            ">
                No transactions yet.
            </div>
            `;

    } else {

        transactionHTML =
            transactions
                .slice(0, 20)
                .map(
                    transaction => {

                        const amount =
                            Number(
                                transaction.amount ||
                                0
                            );


                        const sign =
                            amount >= 0
                                ? "+"
                                : "";


                        return `
                            <div class="transaction">

                                <div class="transaction-name">
                                    ${escapeHTML(
                                        transaction.text ||
                                        "Transaction"
                                    )}
                                </div>

                                <div class="transaction-amount">
                                    ${sign}${amount} PC
                                </div>

                            </div>
                        `;

                    }
                )
                .join("");

    }


    area.innerHTML = `

        <div class="profile">

            <div class="avatar">
                ${escapeHTML(
                    currentAccount.emoji ||
                    "🧑‍🔬"
                )}
            </div>

            <div>

                <div class="name">
                    ${escapeHTML(
                        currentAccount.name
                    )}
                </div>

                <div class="uid">
                    UID:
                    ${escapeHTML(
                        currentAccount.uid
                    )}
                </div>

            </div>

        </div>


        <div class="stats">

            <div class="stat">

                <div class="stat-label">
                    PlayCoins
                </div>

                <div class="stat-value">
                    🪙
                    ${Number(
                        currentAccount.balance ||
                        0
                    )}
                </div>

            </div>


            <div class="stat">

                <div class="stat-label">
                    Science Pass
                </div>

                <div class="stat-value">
                    ${escapeHTML(
                        currentAccount.pass ||
                        "FREE"
                    )}
                </div>

            </div>


            <div class="stat">

                <div class="stat-label">
                    Videos
                </div>

                <div class="stat-value">
                    ${
                        Array.isArray(
                            currentAccount.unlockedVideos
                        )
                            ? currentAccount
                                .unlockedVideos
                                .length
                            : 0
                    }
                </div>

            </div>

        </div>


        <div class="actions">

            <button
                id="logoutButton"
                class="button"
            >
                LOG OUT
            </button>

            <button
                id="deleteButton"
                class="button danger"
            >
                DELETE ACCOUNT
            </button>

        </div>


        <div class="transactions">

            <h2>
                💳 Recent Activity
            </h2>

            ${transactionHTML}

        </div>

    `;


    document
        .getElementById("logoutButton")
        .addEventListener(
            "click",
            logoutScienceAccount
        );


    document
        .getElementById("deleteButton")
        .addEventListener(
            "click",
            deleteScienceAccount
        );

}


/* ========================================================
   ESCAPE HTML
======================================================== */

function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(value ?? "");


    return div.innerHTML;

}


/* ========================================================
   PAGE INITIALIZATION
======================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const page =
            document.body.dataset.page;


        if (page === "login") {

            initializeLoginPage();

        }


        if (page === "accounts") {

            initializeAccountsPage();

        }

    }
);


/* ========================================================
   GLOBAL FUNCTIONS
======================================================== */

window.KidsScience = {

    getCurrentAccount:
        () => currentAccount,

    loadCurrentAccount,

    saveCurrentAccount,

    addCoins:
        addScienceCoins,

    spendCoins:
        spendScienceCoins,

    logout:
        logoutScienceAccount,

    deleteAccount:
        deleteScienceAccount,

    requireLogin:
        requireScienceLogin

};
