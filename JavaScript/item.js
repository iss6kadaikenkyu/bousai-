class Item {
    constructor(x, y, name, correct) {
        this.rect = new Rect(x, y, ITEM_SIZE, ITEM_SIZE);
        this.name = name;
        this.correct = correct;
        this.collected = false;

        const imageFiles = {
            "水": "images/water.png",
            "ヘルメット": "images/herumetto.png",
            "ラジオ": "images/raziio.png",
            "懐中電灯": "images/raito.png",
            "救急セット": "images/aid.png",
            "ゲーム機": "images/game.png",
            "漫画": "images/comic.png",
            "おもちゃ": "images/toy.png"
        };

        this.image = null;
        if (imageFiles[this.name]) {
            this.image = new Image();
            this.image.src = imageFiles[this.name];
        }

        this.infoData = {
            "水": {
                desc: "持ち運びに適した500mlの飲料水ペットボトル。",
                reason: "避難時は重い2Lボトルより軽量で分配しやすい500mlが鉄則。脱水症防止だけでなく、服薬や傷口の洗浄にも不可欠です。"
            },
            "ヘルメット": {
                desc: "落下物や瓦礫の直撃から頭部を守る保護具。",
                reason: "余震による屋根瓦や窓ガラス、エアコン室外機の落下から頭を守ります。両手を自由に使える状態で避難するために必須です。"
            },
            "ラジオ": {
                desc: "手回し充電や電池で動く小型ポータブルラジオ。",
                reason: "大災害時はスマホ回線が遮断・混雑します。停電下でもデマに惑わされず、公式な津波・避難指示を確実に受信できる命綱です。"
            },
            "懐中電灯": {
                desc: "停電時や夜間の暗闇を照らすLEDライト。",
                reason: "足元の割れたガラスや倒壊物を発見し転倒を防ぎます。水を入れたペットボトルに光を当てると簡易ランタンとしても機能します。"
            },
            "救急セット": {
                desc: "絆創膏・包帯・消毒液・常備薬が入った救急箱。",
                reason: "避難中に怪我をした際、[Q]キーを押すことでいつでも応急手当をして移動速度を回復できます！"
            },
            "ゲーム機": {
                desc: "娯楽用の携帯型ゲーム機。",
                reason: "命を守る緊急避難時には不要です。重くて荷物になり、避難のスピードを落として逃げ遅れる原因になります。"
            },
            "漫画": {
                desc: "単行本・雑誌などの書籍類。",
                reason: "紙類は非常に重くリュックを圧迫します。避難時は両手を空け、命を守る必需品だけに絞ることが最優先です。"
            },
            "おもちゃ": {
                desc: "玩具やぬいぐるみ。",
                reason: "津波避難は一分一秒を争います。一次避難では持ち出さず、まずは自分の命を最優先にして迅速に高台を目指しましょう。"
            }
        };
    }

    check(player) {
        if (this.collected) return null;

        const pickupArea = this.rect.inflate(30, 30);
        if (pickupArea.colliderect(player.rect)) {
            if (keys["KeyE"] || keys["e"] || keys["E"] || keys["Space"] || keys[" "]) {
                // キー入力フラグを消費して同時取得を防止
                keys["KeyE"] = false;
                keys["e"] = false;
                keys["E"] = false;
                keys["Space"] = false;
                keys[" "] = false;

                this.collected = true;

                let healNotice = "";
                if (this.name === "救急セット") {
                    healNotice = "（[Q]キーでいつでも手当可能！）";
                }

                if (this.correct) {
                    player.score += 100;
                    player.items.push(this.name);
                } else {
                    player.score = Math.max(0, player.score - 50);
                }

                const itemDetails = this.infoData[this.name] || {
                    desc: "防災グッズ",
                    reason: "避難時に活用できます。"
                };

                return {
                    name: this.name,
                    correct: this.correct,
                    desc: itemDetails.desc,
                    reason: itemDetails.reason,
                    healNotice: healNotice,
                    image: this.image
                };
            }
        }
        return null;
    }

    draw(ctx, player) {
        if (this.collected) return;

        let isNear = false;
        if (player) {
            const distX = Math.abs(this.rect.centerx - player.rect.centerx);
            const distY = Math.abs(this.rect.centery - player.rect.centery);
            if (distX < 95 && distY < 95) {
                isNear = true;
            }
        }

        // 接近時は中立な白光のみ表示
        if (isNear) {
            const pulse = Math.sin(Date.now() / 200) * 4;
            const glowRadius = this.rect.width / 2 + 8 + pulse;

            ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
            ctx.beginPath();
            ctx.arc(this.rect.centerx, this.rect.centery, glowRadius, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.rect.centerx, this.rect.centery, glowRadius - 2, 0, Math.PI * 2);
            ctx.stroke();
        }

        if (this.image && this.image.complete && this.image.naturalWidth > 0) {
            ctx.drawImage(this.image, this.rect.x, this.rect.y, this.rect.width, this.rect.height);
        } else {
            ctx.fillStyle = "rgb(120, 130, 150)";
            ctx.beginPath();
            ctx.roundRect(this.rect.x, this.rect.y, this.rect.width, this.rect.height, 6);
            ctx.fill();
            ctx.strokeStyle = WHITE;
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = WHITE;
            ctx.font = "bold 14px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(this.name, this.rect.centerx, this.rect.centery);
        }

        if (isNear) {
            const boxW = 84;
            const boxH = 26;
            const boxX = this.rect.centerx - boxW / 2;
            const boxY = this.rect.y - 32;

            ctx.fillStyle = "rgb(15, 20, 30)";
            ctx.beginPath();
            ctx.roundRect(boxX, boxY, boxW, boxH, 6);
            ctx.fill();
            ctx.strokeStyle = "rgb(255, 220, 0)";
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.font = "bold 14px sans-serif";
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "rgb(255, 220, 0)";
            ctx.fillText("[E]", boxX + 8, boxY + boxH / 2);
            ctx.fillStyle = WHITE;
            ctx.fillText("ひろう", boxX + 36, boxY + boxH / 2);
        }
    }
}