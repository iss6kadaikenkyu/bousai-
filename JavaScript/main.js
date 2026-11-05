const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// インスタンス化
let player = new Player(150, 300);
let house = new House();
let ui = new UI();
let outdoor = new Outdoor();

let state = "TITLE"; // TITLE, SETUP, HOUSE, OUTSIDE, CLEAR, GAMEOVER

let earthquakeTimer = 0;
let isShaking = false;
let shakeDuration = 0;
let hasShaken = false;

let showTsunamiAlert = false;
let alertTimer = 0;

// 室内脱出タイムリミット（1分 / 60秒）
let escapeDeadline = 0;
let isEscapeTimerActive = false;

// アイテム取得モーダルの状態
let activeItemModal = null;
let itemModalOpenTime = 0;

// クリア画面の全3ページスライド用 (0, 1, 2)
let clearStep = 0;

// ボタン矩形定義
const startButtonRect = new Rect(WIDTH / 2 - 160, 520, 320, 60);
const retryButtonRect = new Rect(WIDTH / 2 - 270, HEIGHT - 105, 250, 52);
const titleButtonRect = new Rect(WIDTH / 2 + 20, HEIGHT - 105, 250, 52);

let isMouseOverStartBtn = false;
let isMouseOverRetryBtn = false;
let isMouseOverTitleBtn = false;
let hoveredSetupOpt = null; // 事前診断ホバー中の選択肢番号 (1 または 2)

// 家庭環境診断設定
let homeConfig = {
    furnitureFixed: false,
    hasSlippers: false,
    buildingType: "wood"
};

let setupStep = 0;
const setupQuestions = [
    {
        title: "Q1. 家具の転倒防止対策",
        question: "テレビや食器棚などの大型家具は固定していますか？",
        options: [
            {
                text: "1. 固定している（突っ張り棒・耐震マットなど）",
                effect: "➔ 【影響】家具が倒れず通路が確保され、ガラス片も最小限になります。"
            },
            {
                text: "2. 固定していない",
                effect: "➔ 【影響】地震後に家具が倒れて通路が塞がり、多くのガラスが散乱します。"
            }
        ]
    },
    {
        title: "Q2. 室内での足元の備え",
        question: "部屋や寝室のすぐ近くにスリッパや室内履きを置いていますか？",
        options: [
            {
                text: "1. 置いている（すぐ履ける状態）",
                effect: "➔ 【影響】スリッパを履くため、散乱したガラス片を踏んでも怪我をしません。"
            },
            {
                text: "2. 置いていない（裸足または靴下）",
                effect: "➔ 【影響】素足のため、ガラス片を踏むと怪我をして移動速度が半減します。"
            }
        ]
    },
    {
        title: "Q3. 自宅の建物構造",
        question: "あなたの住まいの構造はどちらですか？",
        options: [
            {
                text: "1. 木造一戸建て",
                effect: "➔ 【影響】揺れ時間が短め（約5.6秒）となり、比較的早く避難行動に移れます。"
            },
            {
                text: "2. 鉄筋コンクリート（マンションなど）",
                effect: "➔ 【影響】長周期地震動を再現し、共振によって揺れ時間が長く（約7.6秒）なります。"
            }
        ]
    }
];

// アイテム初期配置
let items = [];
function resetItems() {
    const spawnPoints = [
        { x: 170, y: 220 },
        { x: 220, y: 350 },
        { x: 300, y: 530 },
        { x: 380, y: 200 },
        { x: 420, y: 360 },
        { x: 640, y: 210 },
        { x: 740, y: 350 },
        { x: 920, y: 350 },
        { x: 340, y: 440 },
        { x: 700, y: 520 },
        { x: 580, y: 360 }
    ];

    for (let i = spawnPoints.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [spawnPoints[i], spawnPoints[j]] = [spawnPoints[j], spawnPoints[i]];
    }

    const itemDefs = [
        { name: "水", correct: true },
        { name: "ヘルメット", correct: true },
        { name: "ラジオ", correct: true },
        { name: "懐中電灯", correct: true },
        { name: "救急セット", correct: true },
        { name: "ゲーム機", correct: false },
        { name: "おもちゃ", correct: false },
        { name: "漫画", correct: false }
    ];

    items = itemDefs.map((def, idx) => {
        const pt = spawnPoints[idx];
        return new Item(pt.x, pt.y, def.name, def.correct);
    });
}
resetItems();

function getCanvasMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
    };
}

// 事前診断の回答処理（キーボード・マウスクリック共通）
function handleSetupAnswer(answer) {
    if (setupStep === 0) {
        homeConfig.furnitureFixed = (answer === 1);
    } else if (setupStep === 1) {
        homeConfig.hasSlippers = (answer === 1);
    } else if (setupStep === 2) {
        homeConfig.buildingType = (answer === 1) ? "wood" : "rc";
    }

    setupStep++;
    if (setupStep >= setupQuestions.length) {
        state = "HOUSE";
        earthquakeTimer = 0;
        hasShaken = false;
        showTsunamiAlert = false;
        isEscapeTimerActive = false;
        activeItemModal = null;
        clearStep = 0;
        canvas.style.cursor = "default";
        hoveredSetupOpt = null;

        player = new Player(150, 300);
        house = new House();
        outdoor = new Outdoor();
        resetItems();

        player.hasSlippers = homeConfig.hasSlippers;
        house.applyConfig(homeConfig);

        const slipperNotice = homeConfig.hasSlippers ? "【スリッパ装備中】ガラスを踏んでも安全！" : "【素足】ガラス破片を踏むと怪我をするぞ！";
        ui.showMessage(`あなたの家設定で開始！ ${slipperNotice}`);
    }
}

// マウス移動判定
canvas.addEventListener("mousemove", (e) => {
    const pos = getCanvasMousePos(e);

    if (state === "TITLE") {
        isMouseOverStartBtn = (
            pos.x >= startButtonRect.x && pos.x <= startButtonRect.x + startButtonRect.width &&
            pos.y >= startButtonRect.y && pos.y <= startButtonRect.y + startButtonRect.height
        );
        canvas.style.cursor = isMouseOverStartBtn ? "pointer" : "default";
    } else if (state === "SETUP") {
        const cardY = HEIGHT / 2 - 490 / 2;
        const optW = 820;
        const optH = 92;
        const optX = WIDTH / 2 - optW / 2;
        let hovered = false;
        hoveredSetupOpt = null;

        for (let idx = 0; idx < 2; idx++) {
            const optY = cardY + 155 + (idx * 115);
            if (pos.x >= optX && pos.x <= optX + optW && pos.y >= optY && pos.y <= optY + optH) {
                hovered = true;
                hoveredSetupOpt = idx + 1;
                break;
            }
        }
        canvas.style.cursor = hovered ? "pointer" : "default";
    } else if (state === "GAMEOVER" || state === "CLEAR") {
        isMouseOverRetryBtn = (
            pos.x >= retryButtonRect.x && pos.x <= retryButtonRect.x + retryButtonRect.width &&
            pos.y >= retryButtonRect.y && pos.y <= retryButtonRect.y + retryButtonRect.height
        );
        isMouseOverTitleBtn = (
            pos.x >= titleButtonRect.x && pos.x <= titleButtonRect.x + titleButtonRect.width &&
            pos.y >= titleButtonRect.y && pos.y <= titleButtonRect.y + titleButtonRect.height
        );
        canvas.style.cursor = (isMouseOverRetryBtn || isMouseOverTitleBtn) ? "pointer" : "default";
    } else {
        canvas.style.cursor = "default";
    }
});

// マウスクリック判定
canvas.addEventListener("click", (e) => {
    const pos = getCanvasMousePos(e);

    if (state === "TITLE") {
        if (pos.x >= startButtonRect.x && pos.x <= startButtonRect.x + startButtonRect.width &&
            pos.y >= startButtonRect.y && pos.y <= startButtonRect.y + startButtonRect.height) {
            state = "SETUP";
            setupStep = 0;
            canvas.style.cursor = "default";
            isMouseOverStartBtn = false;
        }
    } else if (state === "SETUP") {
        // マウスクリックによる回答選択
        const cardY = HEIGHT / 2 - 490 / 2;
        const optW = 820;
        const optH = 92;
        const optX = WIDTH / 2 - optW / 2;

        for (let idx = 0; idx < 2; idx++) {
            const optY = cardY + 155 + (idx * 115);
            if (pos.x >= optX && pos.x <= optX + optW && pos.y >= optY && pos.y <= optY + optH) {
                handleSetupAnswer(idx + 1);
                break;
            }
        }
    } else if (state === "GAMEOVER" || state === "CLEAR") {
        if (pos.x >= retryButtonRect.x && pos.x <= retryButtonRect.x + retryButtonRect.width &&
            pos.y >= retryButtonRect.y && pos.y <= retryButtonRect.y + retryButtonRect.height) {
            state = "SETUP";
            setupStep = 0;
            clearStep = 0;
            canvas.style.cursor = "default";
            isMouseOverRetryBtn = false;
            isMouseOverTitleBtn = false;
        } else if (pos.x >= titleButtonRect.x && pos.x <= titleButtonRect.x + titleButtonRect.width &&
                 pos.y >= titleButtonRect.y && pos.y <= titleButtonRect.y + titleButtonRect.height) {
            state = "TITLE";
            clearStep = 0;
            canvas.style.cursor = "default";
            isMouseOverRetryBtn = false;
            isMouseOverTitleBtn = false;
        }
    }
});

// キー入力イベント
window.addEventListener("keydown", (e) => {
    if (activeItemModal) {
        const elapsed = Date.now() - itemModalOpenTime;
        if (elapsed >= 3000) {
            if (e.key === "e" || e.key === "E" || e.code === "KeyE" || e.key === " " || e.code === "Space") {
                if (isEscapeTimerActive) {
                    escapeDeadline += elapsed;
                }
                activeItemModal = null;
                keys["KeyE"] = false;
                keys["e"] = false;
                keys["E"] = false;
                keys["Space"] = false;
                keys[" "] = false;
            }
        }
        return;
    }

    if (state === "CLEAR" && (e.key === " " || e.code === "Space" || e.key === "Enter")) {
        clearStep++;
        if (clearStep > 2) {
            state = "TITLE";
            clearStep = 0;
        }
        return;
    }

    if (e.key === "q" || e.key === "Q" || e.code === "KeyQ") {
        if (state === "HOUSE" || state === "OUTSIDE") {
            if (player.items.includes("救急セット")) {
                if (player.isInjured) {
                    player.heal();
                    ui.showMessage("🩹 救急セットで手当て完了！ 移動速度が元に戻った！");
                } else {
                    ui.showMessage("現在は怪我をしていません。");
                }
            } else {
                ui.showMessage("救急セットを持っていません！");
            }
        }
    }

    // キーボードによる回答選択
    if (state === "SETUP") {
        if (e.key === "1" || e.code === "Digit1" || e.code === "Numpad1") handleSetupAnswer(1);
        if (e.key === "2" || e.code === "Digit2" || e.code === "Numpad2") handleSetupAnswer(2);
    } else if (state === "OUTSIDE" && outdoor.in_quiz) {
        const result = outdoor.handleKey(e);
        if (result === true) {
            player.score += 100;
            outdoor.in_quiz = false;
            ui.showMessage("⭕ 正解！ (+100点) その調子で避難しよう！");
        } else if (result === false) {
            player.score = Math.max(0, player.score - 50);
            outdoor.in_quiz = false;
            ui.showMessage("❌ 不正解... (-50点) 正しい知識を身につけよう！");
        }
    }
});

// ゲームメインループ
function gameLoop() {
    if (state === "HOUSE") {
        if (!activeItemModal) {
            if (!isShaking) {
                player.update(house.getWalls());
            }

            if (!hasShaken) {
                earthquakeTimer++;
                if (earthquakeTimer >= 60) {
                    isShaking = true;
                    shakeDuration = (homeConfig.buildingType === "rc") ? 460 : 340;
                    hasShaken = true;
                    ui.showMessage("【大地震発生】頭を守って動くな！揺れが収まるのを待て！");
                }
            }

            if (isShaking) {
                shakeDuration--;
                if (shakeDuration <= 0) {
                    isShaking = false;
                    showTsunamiAlert = true;
                    alertTimer = 210;
                    house.isDamaged = true;

                    escapeDeadline = Date.now() + 60000;
                    isEscapeTimerActive = true;

                    const fixMsg = homeConfig.furnitureFixed
                        ? "家具固定のおかげで倒壊を防げた！急いで出口へ！"
                        : "家具が倒壊して足元が危険だ！気をつけて出口へ！";
                    ui.showMessage(`🌊 津波到達まで1分！必要な物を持って急いでドアへ！ ${fixMsg}`);
                }
            }

            if (isEscapeTimerActive) {
                const remMs = escapeDeadline - Date.now();
                if (remMs <= 0) {
                    isEscapeTimerActive = false;
                    state = "GAMEOVER";
                }
            }

            if (showTsunamiAlert) {
                alertTimer--;
                if (alertTimer <= 0) {
                    showTsunamiAlert = false;
                }
            }

            if (house.isDamaged && !isShaking) {
                const currentShards = house.getGlassShards();
                for (const shard of currentShards) {
                    if (player.rect.colliderect(shard)) {
                        if (player.hasSlippers) {
                            ui.showMessage("💡【スリッパ効果】スリッパのおかげで足の怪我を防げた！");
                        } else if (!player.isInjured) {
                            player.isInjured = true;
                            player.speed = 2.5;
                            player.score = Math.max(0, player.score - 30);
                            ui.showMessage("⚠️【ペナルティ】ガラスを踏んで怪我をした！[Q]キーで手当てしよう！(-30点)");
                        }
                        break;
                    }
                }
            }

            if (!isShaking) {
                for (const item of items) {
                    const itemResult = item.check(player);
                    if (itemResult) {
                        activeItemModal = itemResult;
                        itemModalOpenTime = Date.now();
                        break;
                    }
                }
            }

            const correctItems = ["水", "ヘルメット", "ラジオ", "懐中電灯", "救急セット"];
            const correctCount = player.items.filter(name => correctItems.includes(name)).length;
            if (correctCount === 5 && player.rect.colliderect(house.door)) {
                state = "OUTSIDE";
                isShaking = false;
                showTsunamiAlert = false;
                isEscapeTimerActive = false;
                player.rect.x = 60;
                player.rect.y = HEIGHT / 2;
                ui.showMessage("外へ避難！津波が来る前に高台を目指せ！");
            }
        }
    } else if (state === "OUTSIDE") {
        if (!outdoor.in_quiz) {
            player.update(outdoor.get_active_walls(), WIDTH);
            const res = outdoor.update(player);

            if (res === "ROAD_INJURY") {
                if (player.items.includes("救急セット")) {
                    ui.showMessage("⚠️【足元の危険】路面の段差で足をくじいた！救急セット([Q]キー)で手当てせよ！");
                } else {
                    ui.showMessage("⚠️【足元の危険】路面の段差で足をくじいた！救急セットがないため手当てできない！");
                }
            } else if (res === "SWITCH_AREA") {
                ui.showMessage("二股の道に出た！高台へ続く安全な道を選べ！");
            } else if (res === "SWITCH_HIGH") {
                ui.showMessage("⛰️ 海抜205mの高台地区へ突入！高台避難所を目指せ！");
            } else if (res === "SWITCH_LOW") {
                player.score = Math.max(0, player.score - 100);
                ui.showMessage("⚠️【危険な判断 -100点】津波警報時に低地へ下るのは厳禁！高台への道を探せ！");
            } else if (res === "SWITCH_CURVE") {
                ui.showMessage("🏃‍♂️ 高台への連絡坂道だ！津波に追いつかれる前に駆け上がれ！");
            } else if (res === "MERGE_HIGH") {
                ui.showMessage("⛰️ 高台地区へ合流成功！奥の避難所へ逃げ込め！");
            } else if (res === "SWITCH_SHELTER") {
                ui.showMessage("🏕️ 高台避難所に到着！中央の広場へ進め！");
            } else if (res === "GAME_OVER") {
                state = "GAMEOVER";
            }

            if (outdoor.currentArea === "shelter" && player.rect.colliderect(outdoor.shelterGoal)) {
                state = "CLEAR";
                clearStep = 0;
            }
        }
    }

    // --- 画面描画 ---
    let offsetX = 0;
    let offsetY = 0;
    if (isShaking && state === "HOUSE") {
        const shakePower = [12, 18, 25][Math.floor(Math.random() * 3)];
        offsetX = (Math.random() * shakePower * 2) - shakePower;
        offsetY = (Math.random() * shakePower * 2) - shakePower;
    }

    ctx.save();
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.translate(offsetX, offsetY);

    if (state === "TITLE") {
        ctx.fillStyle = "rgb(20, 28, 45)";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        ctx.fillStyle = "rgb(255, 215, 80)";
        ctx.font = "bold 50px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("防災シミュレーション", WIDTH / 2, 135);

        ctx.fillStyle = "rgb(200, 220, 245)";
        ctx.font = "bold 20px sans-serif";
        ctx.fillText("〜 自分の家庭環境から学ぶ避難体験 〜", WIDTH / 2, 180);

        const panelW = 740;
        const panelH = 220;
        const panelX = WIDTH / 2 - panelW / 2;
        const panelY = 225;

        ctx.fillStyle = "rgba(12, 18, 30, 0.88)";
        ctx.beginPath();
        ctx.roundRect(panelX, panelY, panelW, panelH, 14);
        ctx.fill();
        ctx.strokeStyle = "rgb(90, 130, 190)";
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.fillStyle = "rgb(255, 220, 80)";
        ctx.font = "bold 17px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("🎮 そうさほうほう (CONTROLS)", WIDTH / 2, panelY + 34);

        const rows = [
            { label: "移動", keys: "[W][A][S][D]  または  [矢印キー]" },
            { label: "調べる / ひろう", keys: "[E]  または  [スペースキー]" },
            { label: "クイズ / 診断選択", keys: "数字キー  [1]   [2]   または マウスクリック" }
        ];

        rows.forEach((r, idx) => {
            const rowY = panelY + 76 + idx * 46;
            ctx.fillStyle = "rgb(160, 190, 225)";
            ctx.font = "bold 16px sans-serif";
            ctx.textAlign = "right";
            ctx.fillText(`【 ${r.label} 】`, panelX + 230, rowY);

            ctx.fillStyle = WHITE;
            ctx.font = "bold 17px sans-serif";
            ctx.textAlign = "left";
            ctx.fillText(r.keys, panelX + 250, rowY);
        });

        const btnColor = isMouseOverStartBtn ? "rgb(0, 230, 120)" : "rgb(0, 180, 85)";
        const borderColor = isMouseOverStartBtn ? "rgb(255, 255, 255)" : "rgb(180, 255, 200)";

        ctx.fillStyle = btnColor;
        ctx.beginPath();
        ctx.roundRect(startButtonRect.x, startButtonRect.y, startButtonRect.width, startButtonRect.height, 12);
        ctx.fill();

        ctx.strokeStyle = borderColor;
        ctx.lineWidth = isMouseOverStartBtn ? 4 : 2.5;
        ctx.stroke();

        ctx.fillStyle = WHITE;
        ctx.font = "bold 24px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("▶ GAME START（ゲーム開始）", startButtonRect.x + startButtonRect.width / 2, startButtonRect.y + startButtonRect.height / 2);

        ctx.fillStyle = isMouseOverStartBtn ? "rgb(255, 230, 80)" : "rgb(160, 180, 200)";
        ctx.font = "14px sans-serif";
        ctx.fillText("※ 上のボタンをクリックして開始してください", WIDTH / 2, startButtonRect.y + startButtonRect.height + 30);
    } else if (state === "SETUP") {
        ctx.fillStyle = "rgb(20, 25, 35)";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        const cardW = 920;
        const cardH = 490;
        const cardX = WIDTH / 2 - cardW / 2;
        const cardY = HEIGHT / 2 - cardH / 2;

        ctx.fillStyle = "rgb(35, 45, 65)";
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardW, cardH, 16);
        ctx.fill();
        ctx.strokeStyle = "rgb(255, 215, 0)";
        ctx.lineWidth = 3;
        ctx.stroke();

        const currentQ = setupQuestions[setupStep];

        ctx.fillStyle = "rgb(255, 220, 0)";
        ctx.font = "bold 24px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`【事前診断】${currentQ.title} (${setupStep + 1} / ${setupQuestions.length})`, WIDTH / 2, cardY + 50);

        ctx.fillStyle = WHITE;
        ctx.font = "bold 22px sans-serif";
        ctx.fillText(currentQ.question, WIDTH / 2, cardY + 110);

        // 選択肢カード（ホバー演出＋クリック対応）
        currentQ.options.forEach((optObj, idx) => {
            const optW = 820;
            const optH = 92;
            const optX = WIDTH / 2 - optW / 2;
            const optY = cardY + 155 + (idx * 115);

            const isHovered = (hoveredSetupOpt === idx + 1);
            const boxBg = isHovered ? "rgb(65, 85, 125)" : "rgb(50, 65, 95)";
            const borderCol = isHovered ? "rgb(255, 255, 255)" : "rgb(120, 150, 200)";

            ctx.fillStyle = boxBg;
            ctx.beginPath();
            ctx.roundRect(optX, optY, optW, optH, 10);
            ctx.fill();

            ctx.strokeStyle = borderCol;
            ctx.lineWidth = isHovered ? 3 : 2;
            ctx.stroke();

            // 上段テキスト
            ctx.fillStyle = isHovered ? WHITE : "rgb(255, 230, 0)";
            ctx.font = "bold 19px sans-serif";
            ctx.textAlign = "left";
            ctx.fillText(optObj.text, optX + 30, optY + 34);

            // 下段影響説明
            ctx.fillStyle = isHovered ? "rgb(210, 240, 255)" : "rgb(170, 225, 255)";
            ctx.font = "14px sans-serif";
            ctx.fillText(optObj.effect, optX + 30, optY + 68);
        });

        ctx.fillStyle = "rgb(180, 200, 220)";
        ctx.font = "15px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("※ 数字キー [ 1 ] / [ 2 ] または マウスクリックで選択してください", WIDTH / 2, cardY + cardH - 25);
    } else if (state === "HOUSE" || state === "OUTSIDE") {
        if (state === "HOUSE") {
            house.draw(ctx);
            for (const item of items) {
                item.draw(ctx, player);
            }
            player.draw(ctx);
        } else {
            outdoor.draw(ctx);
            player.draw(ctx);
            outdoor.drawMinimap(ctx, player);
            outdoor.drawTimer(ctx);
            outdoor.drawQuiz(ctx);
        }

        ui.draw(ctx, player);

        ctx.fillStyle = "rgb(20, 20, 30)";
        ctx.beginPath();
        ctx.roundRect(20, 15, 170, 42, 8);
        ctx.fill();
        ctx.strokeStyle = "rgb(255, 220, 0)";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = "rgb(255, 230, 0)";
        ctx.font = "bold 22px sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(`SCORE: ${player.score}`, 35, 36);

        if (state === "HOUSE" && isEscapeTimerActive) {
            const effectiveNow = activeItemModal ? itemModalOpenTime : Date.now();
            const remMs = Math.max(0, escapeDeadline - effectiveNow);
            const remSec = Math.ceil(remMs / 1000);
            const isUrgent = remSec <= 10;
            const blink = Math.floor(Date.now() / 250) % 2 === 0;

            const timerW = 280;
            const timerH = 42;
            const timerX = WIDTH / 2 - timerW / 2;
            const timerY = 15;

            ctx.fillStyle = isUrgent && blink ? "rgb(220, 30, 30)" : "rgb(20, 20, 30)";
            ctx.beginPath();
            ctx.roundRect(timerX, timerY, timerW, timerH, 8);
            ctx.fill();
            ctx.strokeStyle = isUrgent ? "rgb(255, 230, 0)" : "rgb(255, 70, 70)";
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = isUrgent && blink ? WHITE : "rgb(255, 220, 80)";
            ctx.font = "bold 20px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(`⏱️ 津波到達まで: あと ${remSec} 秒`, timerX + timerW / 2, timerY + timerH / 2);
        }

        if (state === "HOUSE") {
            if (isShaking) {
                if (Math.floor(shakeDuration / 10) % 2 === 0) {
                    ctx.fillStyle = "rgba(255, 0, 0, 0.28)";
                    ctx.fillRect(0, 0, WIDTH, HEIGHT);
                }

                const bannerW = 540;
                const bannerH = 68;
                const bannerX = WIDTH / 2 - bannerW / 2;
                const bannerY = 20;

                ctx.fillStyle = "rgb(200, 20, 20)";
                ctx.beginPath();
                ctx.roundRect(bannerX, bannerY, bannerW, bannerH, 6);
                ctx.fill();
                ctx.strokeStyle = "rgb(255, 230, 0)";
                ctx.lineWidth = 3;
                ctx.stroke();

                ctx.fillStyle = WHITE;
                ctx.font = "bold 22px sans-serif";
                ctx.textAlign = "left";
                ctx.fillText("⚠️ 緊急地震速報 (最大震度 6強)", bannerX + 20, bannerY + 28);
                ctx.fillStyle = "rgb(255, 230, 0)";
                ctx.font = "18px sans-serif";
                ctx.fillText("強い揺れです！安全な場所で身を守ってください！", bannerX + 20, bannerY + 54);
            }

            if (showTsunamiAlert) {
                ctx.fillStyle = "rgba(50, 0, 0, 0.65)";
                ctx.fillRect(0, 0, WIDTH, HEIGHT);

                const boxW = 700;
                const boxH = 180;
                const boxX = WIDTH / 2 - boxW / 2;
                const boxY = HEIGHT / 2 - boxH / 2;

                ctx.fillStyle = "rgb(180, 0, 0)";
                ctx.beginPath();
                ctx.roundRect(boxX, boxY, boxW, boxH, 12);
                ctx.fill();
                ctx.strokeStyle = "rgb(255, 230, 0)";
                ctx.lineWidth = 5;
                ctx.stroke();

                const blink = Math.floor(alertTimer / 15) % 2 === 0;
                ctx.fillStyle = blink ? WHITE : "rgb(255, 230, 0)";
                ctx.font = "bold 38px sans-serif";
                ctx.textAlign = "center";
                ctx.fillText("🚨 🌊 大津波警報発令 🌊 🚨", WIDTH / 2, boxY + 65);

                ctx.fillStyle = WHITE;
                ctx.font = "bold 22px sans-serif";
                ctx.fillText("1分以内に持ち物を集めて高台へ避難してください！", WIDTH / 2, boxY + 125);
            }
        }

        if (state === "HOUSE" && activeItemModal) {
            ui.drawItemModal(ctx, activeItemModal, itemModalOpenTime);
        }
    } else if (state === "GAMEOVER") {
        ctx.fillStyle = "rgb(20, 10, 15)";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        ctx.fillStyle = "rgb(255, 80, 80)";
        ctx.font = "bold 46px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("🌊 津波に追いつかれてしまった...", WIDTH / 2, HEIGHT / 2 - 80);

        ctx.fillStyle = WHITE;
        ctx.font = "22px sans-serif";
        ctx.fillText("津波警報が鳴ったら、迷わず迅速に高台を目指しましょう！", WIDTH / 2, HEIGHT / 2 - 20);

        const rColor = isMouseOverRetryBtn ? "rgb(255, 110, 80)" : "rgb(220, 60, 50)";
        ctx.fillStyle = rColor;
        ctx.beginPath();
        ctx.roundRect(retryButtonRect.x, retryButtonRect.y, retryButtonRect.width, retryButtonRect.height, 10);
        ctx.fill();
        ctx.strokeStyle = isMouseOverRetryBtn ? WHITE : "rgb(255, 180, 170)";
        ctx.lineWidth = isMouseOverRetryBtn ? 3.5 : 2;
        ctx.stroke();

        ctx.fillStyle = WHITE;
        ctx.font = "bold 19px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🔁 もう一度挑戦する", retryButtonRect.x + retryButtonRect.width / 2, retryButtonRect.y + retryButtonRect.height / 2);

        const tColor = isMouseOverTitleBtn ? "rgb(80, 110, 160)" : "rgb(50, 75, 115)";
        ctx.fillStyle = tColor;
        ctx.beginPath();
        ctx.roundRect(titleButtonRect.x, titleButtonRect.y, titleButtonRect.width, titleButtonRect.height, 10);
        ctx.fill();
        ctx.strokeStyle = isMouseOverTitleBtn ? WHITE : "rgb(150, 180, 220)";
        ctx.lineWidth = isMouseOverTitleBtn ? 3.5 : 2;
        ctx.stroke();

        ctx.fillStyle = WHITE;
        ctx.font = "bold 19px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🏠 タイトルへ戻る", titleButtonRect.x + titleButtonRect.width / 2, titleButtonRect.y + titleButtonRect.height / 2);
    } else if (state === "CLEAR") {
        ctx.fillStyle = "rgb(20, 28, 45)";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        const finalScore = player.score;
        let rankStr = "";
        let rankColor = "";
        let evalStr = "";

        if (finalScore >= 900) {
            rankStr = "ランク S (防災マスター)";
            rankColor = "rgb(255, 215, 0)";
            evalStr = "完璧な知識と素早い判断でした！自分と周りの命を守れます！";
        } else if (finalScore >= 600) {
            rankStr = "ランク A (防災上級者)";
            rankColor = "rgb(180, 230, 255)";
            evalStr = "素晴らしい避難行動です！知識をしっかり身につけられています！";
        } else if (finalScore >= 300) {
            rankStr = "ランク B (防災見習い)";
            rankColor = "rgb(150, 255, 150)";
            evalStr = "無事に避難できましたが、間違えたクイズを復習しておきましょう！";
        } else {
            rankStr = "ランク C (要トレーニング)";
            rankColor = "rgb(255, 100, 100)";
            evalStr = "もう一度挑戦して、正しく素早い避難行動をマスターしよう！";
        }

        if (clearStep === 0) {
            ctx.fillStyle = "rgb(100, 255, 160)";
            ctx.font = "bold 36px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("🎉 高台避難所 到着！ 【1/3ページ】", WIDTH / 2, 50);

            const cardW = 760;
            const cardH = 360;
            const cardX = WIDTH / 2 - cardW / 2;
            const cardY = 90;

            ctx.fillStyle = "rgb(35, 48, 70)";
            ctx.beginPath();
            ctx.roundRect(cardX, cardY, cardW, cardH, 12);
            ctx.fill();
            ctx.strokeStyle = "rgb(90, 130, 190)";
            ctx.lineWidth = 3;
            ctx.stroke();

            ctx.textAlign = "left";
            ctx.fillStyle = "rgb(255, 220, 80)";
            ctx.font = "bold 21px sans-serif";
            ctx.fillText("🏠 第1ページ: 【室内の備えと避難行動レポート】", cardX + 35, cardY + 40);

            ctx.fillStyle = WHITE;
            ctx.font = "bold 20px sans-serif";
            ctx.fillText(`最終獲得スコア : ${finalScore} 点 / 1000点 （ ${rankStr} ）`, cardX + 50, cardY + 75);

            ctx.fillStyle = "rgb(230, 240, 255)";
            ctx.font = "15px sans-serif";
            ctx.fillText(`【総評】 ${evalStr}`, cardX + 50, cardY + 110);

            const fixReport = homeConfig.furnitureFixed
                ? "・家具固定：対策済み（室内で安全に通路を確保できました）"
                : "・家具固定：未対策（家具の倒壊やガラス散乱のリスクがありました）";
            const slipReport = homeConfig.hasSlippers
                ? "・足元の備え：スリッパあり（室内のガラス片から足を守れました）"
                : "・足元の備え：素足（ガラスで怪我をして足が遅くなるリスクがありました）";
            const correctCount = player.items.filter(name => ["水", "ヘルメット", "ラジオ", "懐中電灯", "救急セット"].includes(name)).length;
            const itemReport = `・持ち出し品：必需品 ${correctCount}/5品 を正しく回収`;

            const routeReport = outdoor.visitedLow
                ? "・避難ルート：低地へ迂回（津波被災リスク大・判断ペナルティ -100点）"
                : "・避難ルート：高台への最短ルートを選択（安全確保・減点なし）";

            ctx.fillStyle = "rgb(255, 225, 120)";
            ctx.font = "bold 15px sans-serif";
            ctx.fillText("📝 あなたの行動評価：", cardX + 50, cardY + 145);

            ctx.fillStyle = WHITE;
            ctx.font = "14px sans-serif";
            ctx.fillText(fixReport, cardX + 65, cardY + 175);
            ctx.fillText(slipReport, cardX + 65, cardY + 205);
            ctx.fillText(itemReport, cardX + 65, cardY + 235);

            ctx.fillStyle = outdoor.visitedLow ? "rgb(255, 110, 110)" : "rgb(120, 255, 160)";
            ctx.fillText(routeReport, cardX + 65, cardY + 265);

            ctx.fillStyle = "rgb(150, 220, 255)";
            ctx.font = "italic 13px sans-serif";
            ctx.fillText("※ 津波警報時は低地へ下りず、何があっても高台を目指すことが鉄則です。", cardX + 65, cardY + 315);

            const blink = Math.floor(Date.now() / 350) % 2 === 0;
            ctx.fillStyle = blink ? "rgb(255, 230, 0)" : WHITE;
            ctx.font = "bold 17px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("▶ [ スペースキー ] または [ Enter ] で次ページへ (2/3)", WIDTH / 2, cardY + cardH + 28);

        } else if (clearStep === 1) {
            ctx.fillStyle = "rgb(120, 200, 255)";
            ctx.font = "bold 36px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("🎉 高台避難所 到着！ 【2/3ページ】", WIDTH / 2, 55);

            const cardW = 740;
            const cardH = 345;
            const cardX = WIDTH / 2 - cardW / 2;
            const cardY = 100;

            ctx.fillStyle = "rgb(35, 48, 70)";
            ctx.beginPath();
            ctx.roundRect(cardX, cardY, cardW, cardH, 12);
            ctx.fill();
            ctx.strokeStyle = "rgb(90, 130, 190)";
            ctx.lineWidth = 3;
            ctx.stroke();

            ctx.textAlign = "left";
            ctx.fillStyle = "rgb(255, 220, 80)";
            ctx.font = "bold 22px sans-serif";
            ctx.fillText("🗺️ 第2ページ: 【避難の判断とルート選択】", cardX + 35, cardY + 45);

            ctx.fillStyle = WHITE;
            ctx.font = "16px sans-serif";
            ctx.fillText("・安全な歩行位置：落下物を避けるため、道路の真ん中を歩くのが鉄則です。", cardX + 55, cardY + 100);
            ctx.fillText("・冠水路の罠：水たまりの下には蓋の外れたマンホールがある危険があります。", cardX + 55, cardY + 150);
            ctx.fillText("・切れた電線：高圧電流が流れているため、数メートル以上離れて近づかない。", cardX + 55, cardY + 200);
            ctx.fillText("・ルート選択：狭い近道（低地・裏道）は瓦礫で塞がれるリスクがあります。", cardX + 55, cardY + 250);

            const blink = Math.floor(Date.now() / 350) % 2 === 0;
            ctx.fillStyle = blink ? "rgb(255, 230, 0)" : WHITE;
            ctx.font = "bold 17px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("▶ [ スペースキー ] または [ Enter ] で次ページへ (3/3)", WIDTH / 2, cardY + cardH + 28);

        } else {
            ctx.fillStyle = "rgb(120, 200, 255)";
            ctx.font = "bold 36px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("🎉 高台避難所 到着！ 【3/3ページ】", WIDTH / 2, 55);

            const cardW = 740;
            const cardH = 345;
            const cardX = WIDTH / 2 - cardW / 2;
            const cardY = 100;

            ctx.fillStyle = "rgb(35, 48, 70)";
            ctx.beginPath();
            ctx.roundRect(cardX, cardY, cardW, cardH, 12);
            ctx.fill();
            ctx.strokeStyle = "rgb(90, 130, 190)";
            ctx.lineWidth = 3;
            ctx.stroke();

            ctx.textAlign = "left";
            ctx.fillStyle = "rgb(255, 220, 80)";
            ctx.font = "bold 22px sans-serif";
            ctx.fillText("🌊 第3ページ: 【津波からの逃げ方と心得】", cardX + 35, cardY + 45);

            ctx.fillStyle = WHITE;
            ctx.font = "16px sans-serif";
            ctx.fillText("・第1波への油断禁物：津波は何度も繰り返し襲来し、後から高くなります。", cardX + 55, cardY + 100);
            ctx.fillText("・絶対に戻らない：財布やペット、忘れ物のために一度出た家に戻らない。", cardX + 55, cardY + 150);
            ctx.fillText("・避難所での共助：中学生も若手戦力として物資配給や誘導で大活躍します。", cardX + 55, cardY + 200);
            ctx.fillText("・公式情報の確認：デマに惑わされず、防災無線や行政の指示に従うこと。", cardX + 55, cardY + 250);

            const blink = Math.floor(Date.now() / 350) % 2 === 0;
            ctx.fillStyle = blink ? "rgb(0, 230, 120)" : WHITE;
            ctx.font = "bold 17px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("🏠 [ スペースキー ] を押すとタイトル画面へ戻ります", WIDTH / 2, cardY + cardH + 28);
        }

        const crColor = isMouseOverRetryBtn ? "rgb(0, 230, 120)" : "rgb(0, 180, 85)";
        ctx.fillStyle = crColor;
        ctx.beginPath();
        ctx.roundRect(retryButtonRect.x, retryButtonRect.y, retryButtonRect.width, retryButtonRect.height, 10);
        ctx.fill();
        ctx.strokeStyle = isMouseOverRetryBtn ? WHITE : "rgb(180, 255, 200)";
        ctx.lineWidth = isMouseOverRetryBtn ? 3.5 : 2;
        ctx.stroke();

        ctx.fillStyle = WHITE;
        ctx.font = "bold 19px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🔁 もう一度挑戦する", retryButtonRect.x + retryButtonRect.width / 2, retryButtonRect.y + retryButtonRect.height / 2);

        const ctColor = isMouseOverTitleBtn ? "rgb(70, 95, 140)" : "rgb(45, 65, 100)";
        ctx.fillStyle = ctColor;
        ctx.beginPath();
        ctx.roundRect(titleButtonRect.x, titleButtonRect.y, titleButtonRect.width, titleButtonRect.height, 10);
        ctx.fill();
        ctx.strokeStyle = isMouseOverTitleBtn ? WHITE : "rgb(150, 180, 220)";
        ctx.lineWidth = isMouseOverTitleBtn ? 3.5 : 2;
        ctx.stroke();

        ctx.fillStyle = WHITE;
        ctx.font = "bold 19px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🏠 タイトルへ戻る", titleButtonRect.x + titleButtonRect.width / 2, titleButtonRect.y + titleButtonRect.height / 2);
    }

    ctx.restore();
    requestAnimationFrame(gameLoop);
}

// ゲーム起動
requestAnimationFrame(gameLoop);