// 画面定数
const WIDTH = 1280;
const HEIGHT = 720;
const FPS = 60;

// アイテムサイズ（60 -> 80 に拡大）
const ITEM_SIZE = 80;

// 色定義
const WHITE = "#FFFFFF";
const BLACK = "#000000";

// 矩形管理クラス (PygameのRect互換)
class Rect {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    get left() { return this.x; }
    set left(v) { this.x = v; }
    get right() { return this.x + this.width; }
    set right(v) { this.x = v - this.width; }
    get top() { return this.y; }
    set top(v) { this.y = v; }
    get bottom() { return this.y + this.height; }
    set bottom(v) { this.y = v - this.height; }
    get centerx() { return this.x + this.width / 2; }
    get centery() { return this.y + this.height / 2; }

    // 衝突判定
    colliderect(other) {
        return (
            this.x < other.x + other.width &&
            this.x + this.width > other.x &&
            this.y < other.y + other.height &&
            this.y + this.height > other.y
        );
    }

    // 判定領域の拡大・縮小
    inflate(dw, dh) {
        return new Rect(
            this.x - dw / 2,
            this.y - dh / 2,
            this.width + dw,
            this.height + dh
        );
    }
}

// キー入力状態の保持
const keys = {};
window.addEventListener("keydown", (e) => {
    keys[e.code] = true;
    keys[e.key] = true;
});
window.addEventListener("keyup", (e) => {
    keys[e.code] = false;
    keys[e.key] = false;
});