class Player {
    constructor(x, y) {
        this.rect = new Rect(x, y, 50, 50);
        this.defaultSpeed = 5;
        this.speed = 5;
        this.score = 0;
        this.items = [];
        this.direction = "down";
        this.isInjured = false;
        this.hasSlippers = false; // スリッパ装備フラグ

        // 画像の読み込み
        const img1 = new Image();
        img1.src = "images/player_down1.png";
        const img2 = new Image();
        img2.src = "images/player_down2.png";
        this.images = [img1, img2];

        this.imageIndex = 0;
        this.animationTimer = 0;
    }

    // 救急セットによる怪我治療
    heal() {
        this.isInjured = false;
        this.speed = this.defaultSpeed;
    }

    update(walls, maxX = WIDTH) {
        let dx = 0;
        let dy = 0;
        let isMoving = false;

        // キー入力判定
        if (keys["ArrowLeft"] || keys["KeyA"] || keys["a"] || keys["A"]) {
            dx -= this.speed;
            this.direction = "left";
            isMoving = true;
        }
        if (keys["ArrowRight"] || keys["KeyD"] || keys["d"] || keys["D"]) {
            dx += this.speed;
            this.direction = "right";
            isMoving = true;
        }
        if (keys["ArrowUp"] || keys["KeyW"] || keys["w"] || keys["W"]) {
            dy -= this.speed;
            this.direction = "up";
            isMoving = true;
        }
        if (keys["ArrowDown"] || keys["KeyS"] || keys["s"] || keys["S"]) {
            dy += this.speed;
            this.direction = "down";
            isMoving = true;
        }

        // 歩行アニメーションのコマ送り
        if (isMoving) {
            this.animationTimer++;
            if (this.animationTimer >= 10) {
                this.imageIndex = (this.imageIndex + 1) % this.images.length;
                this.animationTimer = 0;
            }
        } else {
            this.imageIndex = 0;
            this.animationTimer = 0;
        }

        // X軸の移動と壁衝突判定
        this.rect.x += dx;
        for (const wall of walls) {
            if (this.rect.colliderect(wall)) {
                if (dx > 0) this.rect.right = wall.left;
                else if (dx < 0) this.rect.left = wall.right;
            }
        }

        // Y軸の移動と壁衝突判定
        this.rect.y += dy;
        for (const wall of walls) {
            if (this.rect.colliderect(wall)) {
                if (dy > 0) this.rect.bottom = wall.top;
                else if (dy < 0) this.rect.top = wall.bottom;
            }
        }

        // 画面外・マップ境界制限
        if (this.rect.left < 0) this.rect.left = 0;
        if (this.rect.right > maxX) this.rect.right = maxX;
        if (this.rect.top < 0) this.rect.top = 0;
        if (this.rect.bottom > HEIGHT) this.rect.bottom = HEIGHT;
    }

    draw(ctx, offsetX = 0) {
        const drawX = this.rect.x - offsetX;
        const drawY = this.rect.y;

        const currentImg = this.images[this.imageIndex];
        if (currentImg && currentImg.complete && currentImg.naturalWidth > 0) {
            ctx.save();
            const width = 80;
            const height = 80;
            const posX = drawX - 15;
            const posY = drawY - 15;

            // 左移動時は左右反転して描画
            if (this.direction === "left") {
                ctx.translate(posX + width, posY);
                ctx.scale(-1, 1);
                ctx.drawImage(currentImg, 0, 0, width, height);
            } else {
                ctx.drawImage(currentImg, posX, posY, width, height);
            }

            // 怪我エフェクト
            if (this.isInjured) {
                ctx.fillStyle = "rgba(255, 50, 50, 0.45)";
                ctx.beginPath();
                ctx.arc(drawX + 25, drawY + 45, 16, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        } else {
            // 画像ロード前・失敗時の代替描画
            ctx.fillStyle = this.isInjured ? "#FF5555" : "#FFC800";
            ctx.beginPath();
            ctx.roundRect(drawX, drawY, this.rect.width, this.rect.height, 6);
            ctx.fill();
            ctx.strokeStyle = "#C89600";
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }
}