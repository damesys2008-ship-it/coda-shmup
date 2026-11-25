export default class GameConstants {
    public static readonly Events = Object.freeze({
        PLAYER_SPAWNED_EVENT: "playerSpawned",
        ENEMY_SPAWNED_EVENT: "enemySpawned",
    } as const);

    public static readonly SceneKeys = Object.freeze({
        HOME: "HomeScene",
        MAIN_GAME: "MainGameScene",
        MAIN_UI: "MainUIScene",
        GAME_OVER: "GameOverScene",
    } as const);

    public static readonly MAX_SCORE_DIGITS: number = 3;

    public static formatScore(score: number): string {
        const safeScore = Number.isFinite(score) ? Math.min(Math.max(Math.trunc(score), 0), 999) : 0;
        return safeScore.toString().padStart(GameConstants.MAX_SCORE_DIGITS, "0");
    }
}