class Outdoor {
    constructor() {
        // 画像読み込み
        this.imgStreet = new Image();
        this.imgStreet.src = "images/outdoor.png";
        this.imgStreet.onerror = () => {
            if (!this.imgStreet.src.includes("street.png")) this.imgStreet.src = "images/street.png";
        };

        this.imgFork = new Image();
        this.imgFork.src = "images/outdoor2.png";
        this.imgFork.onerror = () => {
            if (!this.imgFork.src.includes("fork.png")) this.imgFork.src = "images/fork.png";
        };

        this.imgHigh = new Image();
        this.imgHigh.src = "images/outdoor4.png";

        this.imgLow = new Image();
        this.imgLow.src = "images/outdoor5.png";

        this.imgCurve = new Image();
        this.imgCurve.src = "images/outdoor6.png";

        this.imgShelter = new Image();
        this.imgShelter.src = "images/outdoor7.png";

        // エリア状態: "area1", "area2", "low", "curve", "high", "shelter"
        this.currentArea = "area1";
        this.roadInjuryTriggered = false;

        // エリア1（直線道路）の壁
        this.walls1 = [
            new Rect(0, 0, WIDTH, 230),
            new Rect(0, 450, WIDTH, 270)
        ];

        // エリア2（分岐路）の壁
        this.walls2 = [
            new Rect(0, 0, 700, 230),
            new Rect(0, 470, 700, 250),
            new Rect(700, 0, 110, 170),
            new Rect(810, 0, 90, 90),
            new Rect(700, 530, 110, 190),
            new Rect(810, 610, 90, 110),
            new Rect(820, 310, 80, 100),
            new Rect(900, 270, 90, 180),
            new Rect(990, 230, 100, 260),
            new Rect(1090, 190, 190, 340)
        ];

        // 直線道路壁
        this.wallsStraight = [
            new Rect(0, 0, WIDTH, 230),
            new Rect(0, 450, WIDTH, 270)
        ];

        // 連絡坂道（outdoor6）の壁
        this.wallsCurve = [
            new Rect(0, 0, 650, 230),
            new Rect(0, 450, 650, 270),
            new Rect(650, 0, 110, 170),
            new Rect(760, 0, 90, 90),
            new Rect(650, 480, 630, 240),
            new Rect(760, 360, 110, 150),
            new Rect(870, 270, 110, 150),
            new Rect(980, 200, 110, 150),
            new Rect(1090, 160, 190, 150)
        ];

        // 避難所（outdoor7）の壁
        this.wallsShelter = [
            new Rect(0, 0, 320, 210),
            new Rect(0, 520, 340, 200),
            new Rect(380, 50, 440, 210),
            new Rect(760, 50, 520, 230),
            new Rect(420, 600, 180, 120),
            new Rect(820, 600, 460, 120),
            new Rect(540, 260, 160, 170)
        ];

        // 難易度向上・実践避難クイズ（全6問）
        this.quizData = {
            "area1_q1": {
                area: "area1", x: 450, y: 340, cleared: false, isCorrect: null, quiz: {
                    question: "Q1: 避難の途中で強い余震が発生した！屋外で最も適切な行動はどれ？",
                    options: [
                        "1. 落下物を防ぐため、近くのビル壁際や自動販売機の横に密着して屈む",
                        "2. 窓ガラスの落下や塀の倒壊を避け、道路中央でカバン等で頭を守り低くしゃがむ",
                        "3. 揺れが収まるのを待たずに、全力疾走で近くの建物の中へ飛び込む"
                    ],
                    answer: 2
                }
            },
            "area1_q2": {
                area: "area1", x: 950, y: 340, cleared: false, isCorrect: null, quiz: {
                    question: "Q2: 津波警報発令中、浸水や道路破壊のおそれがある道を逃げる際の履物は？",
                    options: [
                        "1. 水の中でも足が濡れず、靴の中にゴミが入らない「長靴」",
                        "2. 水没しても足が軽く、すぐに脱ぎ捨てられる「マリンサンダル」",
                        "3. 底が厚く、靴紐をしっかり締め、ガラス片を踏み抜かない「スニーカー」"
                    ],
                    answer: 3
                }
            },
            "area2_q3": {
                area: "area2", x: 400, y: 340, cleared: false, isCorrect: null, quiz: {
                    question: "Q3: 大分県沿岸における南海トラフ地震の津波について、正しい認識はどれ？",
                    options: [
                        "1. 豊後水道を通過するため、地震発生から第1波到達まで最短でも2時間以上かかる",
                        "2. 沿岸部では最短十数分で津波が到達し、海だけでなく川を猛スピードで遡上する",
                        "3. 津波は海からしか来ないため、河口から1km以上離れた川沿いなら堤防の上でも安全"
                    ],
                    answer: 2
                }
            },
            "low_q4": {
                area: "low", x: 650, y: 340, cleared: false, isCorrect: null, quiz: {
                    question: "Q4: 道路が濁った水で冠水している場所を通る時、潜む最大の罠はどれ？",
                    options: [
                        "1. 水圧でフタが外れ、見えない底なしの落とし穴となった「マンホール」への落下",
                        "2. 水が冷たくて体温が奪われ、急激な低体温症に陥ること",
                        "3. 水の抵抗によってスニーカーの靴底が剥がれてしまうこと"
                    ],
                    answer: 1
                }
            },
            "high_q5": {
                area: "high", x: 450, y: 340, cleared: false, isCorrect: null, quiz: {
                    question: "Q5: 気象庁から「予想される津波の高さ 1m」と発表された。正しい判断はどれ？",
                    options: [
                        "1. 1mなら大人の腰の高さ程度なので、踏ん張れば流されずに耐えられる",
                        "2. 海水浴の1mの白波と同じなので、ライフジャケットがあれば安全である",
                        "3. 1mの津波は数トンの水の塊であり、巻き込まれた場合の死亡率はほぼ100%に達する"
                    ],
                    answer: 3
                }
            },
            "high_q6": {
                area: "high", x: 920, y: 340, cleared: false, isCorrect: null, quiz: {
                    question: "Q6: 避難場所へ向かう途中で絶対に取ってはならない誤った行動はどれ？",
                    options: [
                        "1. 家族の安否を確認するため、災害用伝言ダイヤル(171)に録音を入れる",
                        "2. 第1波が引き、海が静かに見えたので、自宅のペットや貴重品を取りに戻る",
                        "3. 避難所に到着後、名簿に自分の名前と安否を記入する"
                    ],
                    answer: 2
                }
            }
        };

        this.current_quiz = null;
        this.in_quiz = false;

        this.remainingSeconds = 58.0;
        this.tsunami_speed_rate = 1.0;
        this.tsunami_x = -600;

        this.shelterGoal = new Rect(520, 320, 240, 200);
    }

    get_active_walls() {
        if (this.currentArea === "area1") return this.walls1;
        if (this.currentArea === "area2") return this.walls2;
        if (this.currentArea === "curve") return this.wallsCurve;
        if (this.currentArea === "shelter") return this.wallsShelter;
        return this.wallsStraight;
    }

    update(player) {
        if (!this.in_quiz) {
            if (this.currentArea !== "shelter") {
                this.remainingSeconds -= (1 / 60) * this.tsunami_speed_rate;

                if (this.remainingSeconds <= 12) {
                    this.tsunami_x = WIDTH - (this.remainingSeconds / 12) * WIDTH;
                    if (this.tsunami_x >= player.rect.x) {
                        return "GAME_OVER";
                    }
                } else {
                    this.tsunami_x = -600;
                }

                if (this.remainingSeconds <= 0) {
                    return "GAME_OVER";
                }
            } else {
                this.tsunami_x = -600;
            }

            player.speed = player.isInjured ? 2.5 : 5;

            // 確定怪我イベント
            if (this.currentArea === "area1" && !this.roadInjuryTriggered && player.rect.x >= 720) {
                this.roadInjuryTriggered = true;
                player.isInjured = true;
                player.speed = 2.5;
                player.score = Math.max(0, player.score - 30);
                return "ROAD_INJURY";
            }

            // エリア1 ➔ エリア2
            if (this.currentArea === "area1" && player.rect.x >= 1220) {
                this.currentArea = "area2";
                player.rect.x = 60;
                player.rect.y = 340;
                return "SWITCH_AREA";
            }

            // エリア2（分岐路）からの遷移
            if (this.currentArea === "area2") {
                const isHeadingHigh = (player.rect.y <= 60 && player.rect.x >= 880) ||
                                      (player.rect.x >= 1100 && player.rect.y <= 160);
                if (isHeadingHigh) {
                    this.currentArea = "high";
                    this.tsunami_speed_rate = 1.0;
                    player.rect.x = 60;
                    player.rect.y = 340;
                    return "SWITCH_HIGH";
                }

                const isHeadingLow = (player.rect.y >= 640 && player.rect.x >= 880) ||
                                     (player.rect.x >= 1100 && player.rect.y >= 540);
                if (isHeadingLow) {
                    this.currentArea = "low";
                    this.tsunami_speed_rate = 2.4;
                    player.rect.x = 60;
                    player.rect.y = 340;
                    return "SWITCH_LOW";
                }
            }

            // 低地 ➔ 連絡坂道
            if (this.currentArea === "low" && player.rect.x >= 1220) {
                this.currentArea = "curve";
                player.rect.x = 60;
                player.rect.y = 340;
                return "SWITCH_CURVE";
            }

            // 連絡坂道 ➔ 高台地区
            if (this.currentArea === "curve") {
                const isClimbingOut = (player.rect.y <= 60 && player.rect.x >= 850) ||
                                      (player.rect.x >= 1100 && player.rect.y <= 160);
                if (isClimbingOut) {
                    this.currentArea = "high";
                    this.tsunami_speed_rate = 1.0;
                    player.rect.x = 60;
                    player.rect.y = 340;
                    return "MERGE_HIGH";
                }
            }

            // 高台地区 ➔ 避難所
            if (this.currentArea === "high" && player.rect.x >= 1220) {
                this.currentArea = "shelter";
                player.rect.x = 60;
                player.rect.y = 340;
                return "SWITCH_SHELTER";
            }

            // クイズ発生判定
            for (const key in this.quizData) {
                const q = this.quizData[key];
                if (q.area === this.currentArea && !q.cleared && player.rect.x >= q.x) {
                    this.triggerQuiz(q);
                    break;
                }
            }
        }
        return null;
    }

    triggerQuiz(quizObj) {
        this.in_quiz = true;
        this.current_quiz = quizObj;
    }

    handleKey(e) {
        if (!this.in_quiz || !this.current_quiz) return null;

        let selected = null;
        if (e.key === "1" || e.code === "Digit1" || e.code === "Numpad1") selected = 1;
        if (e.key === "2" || e.code === "Digit2" || e.code === "Numpad2") selected = 2;
        if (e.key === "3" || e.code === "Digit3" || e.code === "Numpad3") selected = 3;

        if (selected !== null) {
            this.current_quiz.cleared = true;
            const isCorrect = (selected === this.current_quiz.quiz.answer);
            this.current_quiz.isCorrect = isCorrect;
            return isCorrect;
        }
        return null;
    }

    draw(ctx) {
        let currentImg = this.imgStreet;
        if (this.currentArea === "area1") currentImg = this.imgStreet;
        else if (this.currentArea === "area2") currentImg = this.imgFork;
        else if (this.currentArea === "low") currentImg = this.imgLow;
        else if (this.currentArea === "curve") currentImg = this.imgCurve;
        else if (this.currentArea === "high") currentImg = this.imgHigh;
        else if (this.currentArea === "shelter") currentImg = this.imgShelter;

        if (currentImg.complete && currentImg.naturalWidth > 0) {
            ctx.drawImage(currentImg, 0, 0, WIDTH, HEIGHT);
        } else {
            ctx.fillStyle = "rgb(55, 60, 65)";
            ctx.fillRect(0, 0, WIDTH, HEIGHT);
        }

        // 道路上のクイズ発光サークル描画
        for (const key in this.quizData) {
            const q = this.quizData[key];
            if (q.area === this.currentArea) {
                const pulse = Math.sin(Date.now() / 200) * 5;
                const radius = 100 + (q.cleared ? 0 : pulse);

                let fillColor = "rgba(255, 215, 0, 0.18)";
                let strokeColor = "rgb(255, 220, 0)";
                let dashColor = "rgba(255, 220, 0, 0.6)";
                let badgeText = "❓ QUIZ";
                let textColor = "rgb(255, 230, 0)";

                if (q.cleared) {
                    if (q.isCorrect) {
                        fillColor = "rgba(0, 230, 90, 0.14)";
                        strokeColor = "rgb(0, 230, 90)";
                        dashColor = "rgba(0, 230, 90, 0.6)";
                        badgeText = "✔ CLEAR";
                        textColor = "rgb(100, 255, 150)";
                    } else {
                        fillColor = "rgba(255, 60, 60, 0.16)";
                        strokeColor = "rgb(255, 75, 75)";
                        dashColor = "rgba(255, 75, 75, 0.6)";
                        badgeText = "✖ MISS";
                        textColor = "rgb(255, 100, 100)";
                    }
                }

                ctx.fillStyle = fillColor;
                ctx.beginPath();
                ctx.arc(q.x + 20, q.y, radius, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = strokeColor;
                ctx.lineWidth = 3.5;
                ctx.beginPath();
                ctx.arc(q.x + 20, q.y, radius, 0, Math.PI * 2);
                ctx.stroke();

                ctx.save();
                ctx.setLineDash([8, 8]);
                ctx.strokeStyle = dashColor;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(q.x + 20, q.y, radius - 15, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();

                const badgeW = 96;
                const badgeH = 32;
                const badgeX = q.x + 20 - badgeW / 2;
                const badgeY = q.y - badgeH / 2;

                ctx.fillStyle = "rgba(15, 20, 30, 0.92)";
                ctx.beginPath();
                ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 8);
                ctx.fill();
                ctx.strokeStyle = strokeColor;
                ctx.lineWidth = 2;
                ctx.stroke();

                ctx.fillStyle = textColor;
                ctx.font = "bold 15px sans-serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(badgeText, badgeX + badgeW / 2, badgeY + badgeH / 2);
            }
        }

        const blink = Math.floor(Date.now() / 350) % 2 === 0;

        if (this.currentArea === "area2") {
            ctx.fillStyle = blink ? "rgb(0, 230, 90)" : "rgb(0, 180, 70)";
            ctx.font = "bold 16px sans-serif";
            ctx.fillText("↗ 高台地区へ (安全)", 1000, 70);

            ctx.fillStyle = blink ? "rgb(255, 80, 80)" : "rgb(200, 50, 50)";
            ctx.fillText("↘ 低地地区へ (危険)", 1000, 650);
        }

        if (this.currentArea === "low") {
            ctx.fillStyle = blink ? "rgb(255, 230, 0)" : "rgb(255, 100, 100)";
            ctx.font = "bold 16px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("➔ ↗ 高台への坂道（急げ！）", 1120, 340);
        }

        if (this.currentArea === "curve") {
            ctx.fillStyle = blink ? "rgb(0, 230, 90)" : "rgb(255, 220, 80)";
            ctx.font = "bold 16px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("↗ 高台地区へ合流！", 1020, 70);
        }

        if (this.currentArea === "high") {
            ctx.fillStyle = blink ? "rgb(0, 230, 90)" : "rgb(255, 220, 80)";
            ctx.font = "bold 16px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("➔ 避難所入口へ！", 1140, 340);
        }

        if (this.currentArea === "shelter") {
            ctx.fillStyle = "rgba(0, 200, 80, 0.25)";
            ctx.beginPath();
            ctx.roundRect(this.shelterGoal.x, this.shelterGoal.y, this.shelterGoal.width, this.shelterGoal.height, 12);
            ctx.fill();
            ctx.strokeStyle = blink ? "rgb(0, 255, 100)" : "rgb(0, 200, 80)";
            ctx.lineWidth = 3;
            ctx.stroke();

            ctx.fillStyle = WHITE;
            ctx.font = "bold 20px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("🏕️ 避難所広場", this.shelterGoal.x + this.shelterGoal.width / 2, this.shelterGoal.y + 90);
            ctx.fillStyle = "rgb(255, 230, 0)";
            ctx.fillText("【ここに入ってゴール！】", this.shelterGoal.x + this.shelterGoal.width / 2, this.shelterGoal.y + 130);
        }

        if (this.currentArea !== "shelter" && this.tsunami_x > -600) {
            const grad = ctx.createLinearGradient(this.tsunami_x - 600, 0, this.tsunami_x, 0);
            grad.addColorStop(0, "rgba(0, 60, 140, 0)");
            grad.addColorStop(1, "rgba(0, 80, 200, 0.92)");
            ctx.fillStyle = grad;
            ctx.fillRect(this.tsunami_x - 600, 0, 600, HEIGHT);

            ctx.fillStyle = "rgb(180, 230, 255)";
            ctx.fillRect(this.tsunami_x - 12, 0, 12, HEIGHT);
        }
    }

    drawTimer(ctx) {
        const timerW = 340;
        const timerH = 42;
        const timerX = WIDTH / 2 - timerW / 2;
        const timerY = 15;

        if (this.currentArea === "shelter") {
            ctx.fillStyle = "rgb(20, 45, 30)";
            ctx.beginPath();
            ctx.roundRect(timerX, timerY, timerW, timerH, 8);
            ctx.fill();
            ctx.strokeStyle = "rgb(0, 230, 90)";
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = "rgb(100, 255, 150)";
            ctx.font = "bold 18px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("🛡️ 高台避難所到達！安全確保！", timerX + timerW / 2, timerY + timerH / 2);
            return;
        }

        const remSec = Math.max(0, Math.ceil(this.remainingSeconds));
        const isUrgent = remSec <= 15 || this.currentArea === "low" || this.currentArea === "curve";
        const blink = Math.floor(Date.now() / 250) % 2 === 0;

        ctx.fillStyle = isUrgent && blink ? "rgb(220, 30, 30)" : "rgb(20, 25, 35)";
        ctx.beginPath();
        ctx.roundRect(timerX, timerY, timerW, timerH, 8);
        ctx.fill();
        ctx.strokeStyle = isUrgent ? "rgb(255, 230, 0)" : "rgb(0, 180, 255)";
        ctx.lineWidth = 2;
        ctx.stroke();

        let label = "🌊 津波到達まで";
        if (this.currentArea === "low") label = "🚨 低地！津波急接近中";
        else if (this.currentArea === "curve") label = "⚠️ 坂道を登れ！津波接近";

        ctx.fillStyle = isUrgent && blink ? WHITE : "rgb(180, 230, 255)";
        ctx.font = "bold 18px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${label}: あと ${remSec} 秒`, timerX + timerW / 2, timerY + timerH / 2);
    }

    drawMinimap(ctx, player) {
        const mapW = 490;
        const mapH = 58;
        const mapX = WIDTH / 2 - mapW / 2;
        const mapY = HEIGHT - 68;

        ctx.fillStyle = "rgba(12, 18, 30, 0.92)";
        ctx.beginPath();
        ctx.roundRect(mapX, mapY, mapW, mapH, 10);
        ctx.fill();
        ctx.strokeStyle = "rgb(90, 130, 185)";
        ctx.lineWidth = 2;
        ctx.stroke();

        const centerY = mapY + 29;
        const topY = centerY - 14;
        const bottomY = centerY + 14;

        const pStart = mapX + 35;
        const pBranch = mapX + 115;
        const pMerge = mapX + 390;
        const pGoal = mapX + 450;
        const pLowMid = mapX + 225;
        const pCurveMid = mapX + 325;

        // 1. 直線区間
        ctx.strokeStyle = "rgb(180, 195, 215)";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(pStart, centerY);
        ctx.lineTo(pBranch, centerY);
        ctx.stroke();

        // 2. 上ルート（高台）
        ctx.strokeStyle = "rgb(0, 220, 100)";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(pBranch, centerY);
        ctx.lineTo(pBranch + 25, topY);
        ctx.lineTo(pMerge, topY);
        ctx.stroke();

        // 3. 下ルート（低地・坂道）
        ctx.strokeStyle = "rgb(255, 80, 75)";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(pBranch, centerY);
        ctx.lineTo(pBranch + 25, bottomY);
        ctx.lineTo(pCurveMid, bottomY);
        ctx.lineTo(pMerge, topY);
        ctx.stroke();

        // 4. 合流 ➔ ゴール
        ctx.strokeStyle = "rgb(0, 220, 100)";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(pMerge, topY);
        ctx.lineTo(pGoal, topY);
        ctx.stroke();

        ctx.font = "bold 10px sans-serif";
        ctx.fillStyle = "rgb(100, 255, 160)";
        ctx.fillText("高台", mapX + 250, topY - 6);

        ctx.fillStyle = "rgb(255, 120, 110)";
        ctx.fillText("低地・坂道", mapX + 250, bottomY + 12);

        [
            { x: pStart, y: centerY },
            { x: pBranch, y: centerY },
            { x: pMerge, y: topY }
        ].forEach(pt => {
            ctx.fillStyle = "rgb(20, 30, 45)";
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = WHITE;
            ctx.lineWidth = 1.5;
            ctx.stroke();
        });

        ctx.font = "16px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🏕️", pGoal, topY);

        const progress = Math.max(0, Math.min(1, player.rect.x / WIDTH));
        let pinX = pStart;
        let pinY = centerY;

        if (this.currentArea === "area1") {
            pinX = pStart + (pBranch - pStart) * progress;
            pinY = centerY;
        } else if (this.currentArea === "area2") {
            pinX = pBranch + 25 * progress;
            pinY = (player.rect.y < 340) ? centerY - 14 * progress : centerY + 14 * progress;
        } else if (this.currentArea === "high") {
            pinX = (pBranch + 25) + (pMerge - (pBranch + 25)) * progress;
            pinY = topY;
        } else if (this.currentArea === "low") {
            pinX = (pBranch + 25) + (pLowMid - (pBranch + 25)) * progress;
            pinY = bottomY;
        } else if (this.currentArea === "curve") {
            pinX = pLowMid + (pCurveMid - pLowMid) * progress;
            pinY = bottomY - (bottomY - topY) * (progress * 0.8);
        } else if (this.currentArea === "shelter") {
            pinX = pMerge + (pGoal - pMerge) * Math.min(1, player.rect.x / 600);
            pinY = topY;
        }

        const pinPulse = Math.sin(Date.now() / 150) * 3;
        ctx.fillStyle = "rgba(255, 220, 0, 0.4)";
        ctx.beginPath();
        ctx.arc(pinX, pinY, 9 + pinPulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgb(255, 230, 0)";
        ctx.beginPath();
        ctx.arc(pinX, pinY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = WHITE;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.font = "15px sans-serif";
        ctx.fillText("🏃", pinX, pinY - 14);
    }

    // クイズ描画（バッジと問題文の段落を分離して重複を完全防止）
    drawQuiz(ctx) {
        if (this.in_quiz && this.current_quiz) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.82)";
            ctx.fillRect(0, 0, WIDTH, HEIGHT);

            const qBox = new Rect(WIDTH / 2 - 430, HEIGHT / 2 - 215, 860, 430);
            ctx.fillStyle = "rgb(255, 255, 255)";
            ctx.beginPath();
            ctx.roundRect(qBox.x, qBox.y, qBox.width, qBox.height, 14);
            ctx.fill();
            ctx.strokeStyle = "rgb(255, 200, 0)";
            ctx.lineWidth = 4;
            ctx.stroke();

            // 1. 最上段ヘッダー：左側タイトルラベル
            ctx.fillStyle = "rgb(30, 45, 65)";
            ctx.font = "bold 15px sans-serif";
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.fillText("❓ 防災チェックポイント", qBox.x + 28, qBox.y + 26);

            // 1. 最上段ヘッダー：右側「時間停止中」バッジ
            const stopW = 255;
            const stopH = 28;
            const stopX = qBox.x + qBox.width - stopW - 25;
            const stopY = qBox.y + 13;

            ctx.fillStyle = "rgba(0, 160, 240, 0.12)";
            ctx.beginPath();
            ctx.roundRect(stopX, stopY, stopW, stopH, 6);
            ctx.fill();
            ctx.strokeStyle = "rgb(0, 180, 240)";
            ctx.lineWidth = 1.6;
            ctx.stroke();

            ctx.fillStyle = "rgb(0, 120, 210)";
            ctx.font = "bold 13px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("⏸️ 時間停止中（落ち着いて考えよう）", stopX + stopW / 2, stopY + stopH / 2);

            // 2. 2段目：問題文（横幅800pxをフル活用して重なりを解消）
            const qData = this.current_quiz.quiz;
            ctx.fillStyle = "rgb(20, 30, 50)";
            ctx.font = "bold 19px sans-serif";
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.fillText(qData.question, qBox.x + 28, qBox.y + 68);

            // 3. 選択肢リスト
            qData.options.forEach((opt, idx) => {
                const optY = qBox.y + 105 + idx * 100;
                ctx.fillStyle = "rgb(238, 242, 250)";
                ctx.beginPath();
                ctx.roundRect(qBox.x + 28, optY, 804, 82, 8);
                ctx.fill();
                ctx.strokeStyle = "rgb(180, 200, 225)";
                ctx.lineWidth = 2;
                ctx.stroke();

                ctx.fillStyle = "rgb(20, 20, 20)";
                ctx.font = "16px sans-serif";
                ctx.textBaseline = "alphabetic";

                if (opt.length > 38) {
                    const line1 = opt.substring(0, 38);
                    const line2 = opt.substring(38);
                    ctx.fillText(line1, qBox.x + 45, optY + 34);
                    ctx.fillText(line2, qBox.x + 65, optY + 58);
                } else {
                    ctx.fillText(opt, qBox.x + 45, optY + 48);
                }
            });
        }
    }
}