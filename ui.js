class UI {
    constructor() {
        this.message = "";
        this.messageTime = 0;
    }

    showMessage(text) {
        this.message = text;
        this.messageTime = Date.now();
    }

    // アイテム取得モーダル
    drawItemModal(ctx, modalData, openTime) {
        if (!modalData) return;

        const elapsed = Date.now() - openTime;
        const requiredTime = 3000;
        const canClose = elapsed >= requiredTime;

        ctx.fillStyle = "rgba(0, 0, 0, 0.78)";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        const cardW = 760;
        const cardH = 460;
        const cardX = WIDTH / 2 - cardW / 2;
        const cardY = HEIGHT / 2 - cardH / 2;

        const mainColor = modalData.correct ? "rgb(0, 210, 100)" : "rgb(255, 75, 75)";

        ctx.fillStyle = "rgb(25, 30, 42)";
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardW, cardH, 16);
        ctx.fill();
        ctx.strokeStyle = mainColor;
        ctx.lineWidth = 3.5;
        ctx.stroke();

        // 正解・不正解バッジ
        const badgeText = modalData.correct ? "⭕ 正しい持ち出し品 (+100点)" : "❌ 優先度が低い品 (-50点)";
        ctx.fillStyle = mainColor;
        ctx.beginPath();
        ctx.roundRect(cardX + 40, cardY + 25, 250, 32, 6);
        ctx.fill();
        ctx.fillStyle = BLACK;
        ctx.font = "bold 15px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(badgeText, cardX + 165, cardY + 41);

        // 時間停止中バッジ（案1）
        const stopBadgeW = 250;
        const stopBadgeH = 32;
        const stopBadgeX = cardX + 305;
        const stopBadgeY = cardY + 25;

        ctx.fillStyle = "rgba(0, 160, 240, 0.18)";
        ctx.beginPath();
        ctx.roundRect(stopBadgeX, stopBadgeY, stopBadgeW, stopBadgeH, 6);
        ctx.fill();
        ctx.strokeStyle = "rgb(0, 200, 255)";
        ctx.lineWidth = 1.8;
        ctx.stroke();

        ctx.fillStyle = "rgb(160, 230, 255)";
        ctx.font = "bold 13px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("⏸️ 時間停止中（落ち着いて読もう）", stopBadgeX + stopBadgeW / 2, stopBadgeY + 16);

        // アイテム名
        ctx.fillStyle = WHITE;
        ctx.font = "bold 32px sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(modalData.name, cardX + 40, cardY + 100);

        if (modalData.healNotice) {
            ctx.fillStyle = "rgb(100, 255, 150)";
            ctx.font = "bold 16px sans-serif";
            ctx.fillText(modalData.healNotice, cardX + 220, cardY + 98);
        }

        const imgBoxSize = 90;
        const imgBoxX = cardX + cardW - 130;
        const imgBoxY = cardY + 35;

        ctx.fillStyle = "rgba(45, 55, 75, 0.8)";
        ctx.beginPath();
        ctx.roundRect(imgBoxX, imgBoxY, imgBoxSize, imgBoxSize, 8);
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        if (modalData.image && modalData.image.complete && modalData.image.naturalWidth > 0) {
            ctx.drawImage(modalData.image, imgBoxX + 10, imgBoxY + 10, 70, 70);
        }

        ctx.fillStyle = "rgb(180, 205, 235)";
        ctx.font = "bold 15px sans-serif";
        ctx.fillText("【概要】", cardX + 40, cardY + 145);

        ctx.fillStyle = WHITE;
        ctx.font = "18px sans-serif";
        ctx.fillText(modalData.desc, cardX + 40, cardY + 175);

        const reasonBoxY = cardY + 215;
        ctx.fillStyle = "rgba(35, 45, 65, 0.9)";
        ctx.beginPath();
        ctx.roundRect(cardX + 40, reasonBoxY, cardW - 80, 140, 10);
        ctx.fill();
        ctx.strokeStyle = modalData.correct ? "rgba(0, 210, 100, 0.4)" : "rgba(255, 75, 75, 0.4)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = "rgb(255, 220, 80)";
        ctx.font = "bold 16px sans-serif";
        ctx.fillText(modalData.correct ? "💡 なぜ持っていくべきなのか？（防災の知恵）" : "⚠️ なぜ置いていくべきなのか？", cardX + 60, reasonBoxY + 30);

        ctx.fillStyle = "rgb(230, 235, 245)";
        ctx.font = "16px sans-serif";
        this.wrapText(ctx, modalData.reason, cardX + 60, reasonBoxY + 65, cardW - 120, 24);

        const footerY = cardY + cardH - 55;
        if (!canClose) {
            const progress = Math.min(1, elapsed / requiredTime);
            const barW = 360;
            const barH = 10;
            const barX = WIDTH / 2 - barW / 2;

            ctx.fillStyle = "rgba(60, 70, 90, 0.8)";
            ctx.beginPath();
            ctx.roundRect(barX, footerY + 10, barW, barH, 5);
            ctx.fill();

            ctx.fillStyle = "rgb(255, 215, 0)";
            ctx.beginPath();
            ctx.roundRect(barX, footerY + 10, barW * progress, barH, 5);
            ctx.fill();

            const remainingSec = Math.ceil((requiredTime - elapsed) / 1000);
            ctx.fillStyle = "rgb(180, 195, 215)";
            ctx.font = "14px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(`知識を確認中... (あと ${remainingSec} 秒)`, WIDTH / 2, footerY - 5);
        } else {
            const blink = Math.floor(Date.now() / 350) % 2 === 0;
            ctx.fillStyle = blink ? "rgb(0, 230, 100)" : WHITE;
            ctx.font = "bold 19px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("▶ [E] または [SPACE] を押してゲームを再開", WIDTH / 2, footerY + 15);
        }
    }

    wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        let line = "";
        let curY = y;
        for (let i = 0; i < text.length; i++) {
            const testLine = line + text[i];
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && i > 0) {
                ctx.fillText(line, x, curY);
                line = text[i];
                curY += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, curY);
    }

    draw(ctx, player) {
        // メッセージ通知バナー
        if (this.message) {
            const elapsed = Date.now() - this.messageTime;
            if (elapsed < 4500) {
                const targetY = 85;
                const currentY = Math.min(targetY, -60 + elapsed * 0.7);

                ctx.font = "bold 20px sans-serif";
                const metrics = ctx.measureText(this.message);
                const boxW = Math.max(520, metrics.width + 60);
                const boxH = 54;
                const boxX = WIDTH / 2 - boxW / 2;

                let mainColor = "rgb(255, 215, 0)";
                let tagText = "💡 防災TIPS";

                if (this.message.includes("ペナルティ") || this.message.includes("❌") || this.message.includes("怪我")) {
                    mainColor = "rgb(255, 70, 70)";
                    tagText = "⚠️ CAUTION";
                } else if (this.message.includes("⭕") || this.message.includes("手当て完了")) {
                    mainColor = "rgb(0, 230, 90)";
                    tagText = "⭕ SUCCESS";
                }

                ctx.fillStyle = "rgba(20, 25, 35, 0.95)";
                ctx.beginPath();
                ctx.roundRect(boxX, currentY, boxW, boxH, 10);
                ctx.fill();

                ctx.strokeStyle = mainColor;
                ctx.lineWidth = 3;
                ctx.stroke();

                ctx.fillStyle = WHITE;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(this.message, WIDTH / 2, currentY + boxH / 2);

                const tagW = 120;
                const tagH = 22;
                const tagX = WIDTH / 2 - tagW / 2;
                const tagY = currentY - 11;

                ctx.fillStyle = mainColor;
                ctx.beginPath();
                ctx.roundRect(tagX, tagY, tagW, tagH, 5);
                ctx.fill();

                ctx.fillStyle = BLACK;
                ctx.font = "bold 12px sans-serif";
                ctx.fillText(tagText, WIDTH / 2, tagY + tagH / 2);
            } else {
                this.message = "";
            }
        }

        // 右上：空スロット型チェックリスト
        const correctList = ["水", "ヘルメット", "ラジオ", "懐中電灯", "救急セット"];
        const collectedItems = player.items.filter(name => correctList.includes(name));
        const collectedCount = collectedItems.length;

        const listW = 210;
        const listH = 185;
        const listX = WIDTH - 230;
        const listY = 15;

        ctx.fillStyle = "rgba(15, 20, 30, 0.88)";
        ctx.beginPath();
        ctx.roundRect(listX, listY, listW, listH, 10);
        ctx.fill();
        ctx.strokeStyle = (collectedCount === 5) ? "rgb(0, 230, 100)" : "rgb(255, 215, 0)";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = "rgb(255, 220, 80)";
        ctx.font = "bold 15px sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(`📋 必需品スロット (${collectedCount}/5)`, listX + 16, listY + 22);

        for (let i = 0; i < 5; i++) {
            const rowY = listY + 52 + (i * 26);
            ctx.font = "bold 14px sans-serif";

            if (i < collectedCount) {
                ctx.fillStyle = "rgb(0, 230, 100)";
                ctx.fillText(`[✔] ${collectedItems[i]}`, listX + 16, rowY);
            } else {
                ctx.fillStyle = "rgba(180, 195, 215, 0.55)";
                ctx.fillText(`[  ] ？？？`, listX + 16, rowY);
            }
        }

        // 左下：救急セット所持時の治療ガイド常時表示
        if (player.items.includes("救急セット")) {
            const guideW = 340;
            const guideH = 42;
            const guideX = 20;
            const guideY = HEIGHT - 55;

            const blink = Math.floor(Date.now() / 250) % 2 === 0;

            if (player.isInjured) {
                ctx.fillStyle = blink ? "rgb(220, 30, 30)" : "rgb(30, 20, 20)";
                ctx.beginPath();
                ctx.roundRect(guideX, guideY, guideW, guideH, 8);
                ctx.fill();
                ctx.strokeStyle = "rgb(255, 230, 0)";
                ctx.lineWidth = 2.5;
                ctx.stroke();

                ctx.fillStyle = blink ? WHITE : "rgb(255, 230, 0)";
                ctx.font = "bold 16px sans-serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText("⚠️【怪我中】[Q] キーで手当てせよ！", guideX + guideW / 2, guideY + guideH / 2);
            } else {
                ctx.fillStyle = "rgba(15, 25, 20, 0.88)";
                ctx.beginPath();
                ctx.roundRect(guideX, guideY, guideW, guideH, 8);
                ctx.fill();
                ctx.strokeStyle = "rgb(0, 200, 90)";
                ctx.lineWidth = 2;
                ctx.stroke();

                ctx.fillStyle = "rgb(120, 255, 160)";
                ctx.font = "bold 15px sans-serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText("🩹 救急セット所持: [Q]キーで手当て", guideX + guideW / 2, guideY + guideH / 2);
            }
        }
    }
}