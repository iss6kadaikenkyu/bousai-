class House {
    constructor() {
        // 背景画像の読み込み（通常時と被災後）
        this.imageNormal = new Image();
        this.imageNormal.src = "images/room.png";

        this.imageDamagedNoFix = new Image();
        this.imageDamagedNoFix.src = "images/room2.png";

        this.imageDamagedFixed = new Image();
        this.imageDamagedFixed.src = "images/room3.png";

        // 被災状態フラグ
        this.isDamaged = false;
        this.furnitureFixed = false;

        // 出口（左側のドア）
        this.door = new Rect(0, 220, 50, 140);

        // 基本の壁・家具
        this.baseWalls = [
            new Rect(0, 0, WIDTH, 110),
            new Rect(0, 0, 40, 220),
            new Rect(0, 360, 40, HEIGHT - 360),
            new Rect(WIDTH - 40, 0, 40, HEIGHT),
            new Rect(0, 650, WIDTH, 70),

            // 左下：冷蔵庫・キッチン
            new Rect(35, 435, 75, 205),
            new Rect(110, 510, 160, 130),

            // 上部：小棚
            new Rect(355, 95, 95, 75),

            // 右上：テレビ＆テレビ台
            new Rect(955, 100, 195, 70),

            // 中央：テーブル＆イス
            new Rect(430, 225, 180, 105),
            new Rect(490, 325, 55, 55),

            // 下部中央：ソファ
            new Rect(430, 470, 225, 125),

            // 右下：チェスト
            new Rect(1050, 395, 80, 165)
        ];

        // 家具未固定時に発生する倒壊物
        this.damagedWalls = [
            new Rect(970, 165, 80, 50),
            new Rect(1020, 440, 60, 60)
        ];

        // 全ガラス破片エリア（未固定時：3箇所）
        this.allGlassShards = [
            new Rect(440, 105, 190, 120),  // 中央窓の下
            new Rect(900, 180, 140, 90),   // テレビ台の前
            new Rect(960, 420, 110, 100)   // チェストの前
        ];

        // 家具固定時の限定ガラス破片エリア（窓の下のみ：1箇所）
        this.fixedGlassShards = [
            new Rect(440, 105, 190, 120)
        ];
    }

    applyConfig(config) {
        this.furnitureFixed = config.furnitureFixed;
    }

    getWalls() {
        if (this.isDamaged && !this.furnitureFixed) {
            return [...this.baseWalls, ...this.damagedWalls];
        }
        return this.baseWalls;
    }

    getGlassShards() {
        return this.furnitureFixed ? this.fixedGlassShards : this.allGlassShards;
    }

    draw(ctx) {
        // 1. 背景描画
        let currentImg = this.imageNormal;
        if (this.isDamaged) {
            currentImg = this.furnitureFixed ? this.imageDamagedFixed : this.imageDamagedNoFix;
        }

        if (currentImg && currentImg.complete && currentImg.naturalWidth > 0) {
            ctx.drawImage(currentImg, 0, 0, WIDTH, HEIGHT);
        } else {
            ctx.fillStyle = "rgb(230, 205, 160)";
            ctx.fillRect(0, 0, WIDTH, HEIGHT);
        }

        // 2. ドア前の点滅ガイド枠と矢印
        const blink = Math.floor(Date.now() / 400) % 2 === 0;
        ctx.strokeStyle = blink ? "rgb(0, 230, 90)" : "rgba(0, 230, 90, 0.4)";
        ctx.fillStyle = blink ? "rgba(0, 230, 90, 0.2)" : "rgba(0, 230, 90, 0.05)";
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.roundRect(this.door.x + 5, this.door.y, this.door.width + 15, this.door.height, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = blink ? WHITE : "rgb(0, 230, 90)";
        ctx.font = "bold 16px sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText("◀ 出口", this.door.x + this.door.width + 25, this.door.y + this.door.height / 2);

        // 3. ガラス片の警告表示
        if (this.isDamaged) {
            const activeShards = this.getGlassShards();
            for (const shard of activeShards) {
                ctx.fillStyle = "rgba(255, 60, 60, 0.18)";
                ctx.beginPath();
                ctx.roundRect(shard.x, shard.y, shard.width, shard.height, 6);
                ctx.fill();
                ctx.strokeStyle = "rgba(255, 80, 80, 0.65)";
                ctx.lineWidth = 1.5;
                ctx.stroke();

                const labelW = 90;
                const labelH = 22;
                const labelX = shard.x + shard.width / 2 - labelW / 2;
                const labelY = shard.y + shard.height / 2 - labelH / 2;

                ctx.fillStyle = "rgba(20, 20, 20, 0.75)";
                ctx.beginPath();
                ctx.roundRect(labelX, labelY, labelW, labelH, 4);
                ctx.fill();

                ctx.fillStyle = "rgb(255, 215, 0)";
                ctx.font = "bold 12px sans-serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText("⚠️ ガラス片", shard.x + shard.width / 2, shard.y + shard.height / 2);
            }
        }
    }
}