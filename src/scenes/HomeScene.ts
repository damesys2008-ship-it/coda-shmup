import {Loader} from "phaser";
import GameConstants from "../GameConstants.ts";
import SaveManager from "../managers/SaveManager.ts";
import SaveConstants from "../SaveConstants.ts";

export default class HomeScene extends Phaser.Scene {
    private saveManager: SaveManager;

    constructor() {
        super(GameConstants.SceneKeys.HOME);
    }

    preload() {
        const width: number = this.scale.width;
        const y: number = this.scale.height / 2;

        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(0, y, width, 64);
        this.load.on(Loader.Events.PROGRESS, function (value: number) { // 0-1
            console.log("Loading : " + value);

            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(0, y, width * value, 64);
        });
        this.load.on(Loader.Events.COMPLETE, function () {
            console.log("Loading complete");

            progressBar.destroy();
            progressBox.destroy();
        });

        this.load.setPath('assets');

        this.load.image('bg', 'Backgrounds/darkPurple.png');
        this.load.image('planet', 'Planets/planet00.png');
        this.load.atlas('sprites', 'Spritesheet/gameSprites.png', 'Spritesheet/gameSprites.json');
        this.load.bitmapFont('future-bmp', 'Fonts/kenvector_future.png', 'Fonts/kenvector_future.xml');
        this.load.font('future', 'Fonts/kenvector_future.ttf');
        this.load.json('playerShips', 'Data/playerShips.json');
        this.load.audio('sfx_laser1', 'Sounds/sfx_laser1.ogg');
        this.load.audio('sfx_laser2', 'Sounds/sfx_laser2.ogg');
    }

    create() {
        this.saveManager?.load();

        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        const width = this.scale.width;
        const height = this.scale.height;

        this.add.tileSprite(centerX, centerY, width, height, 'bg').setTileScale(2).setAlpha(0.92);
        this.add.rectangle(centerX, centerY, width, height, 0x080d24, 0.30);

        this.createStars();

        this.add.image(width - 92, 270, 'planet')
            .setScale(1.15)
            .setAlpha(0.42)
            .setAngle(-12);

        this.add.image(150, 520, 'sprites', 'ufoRed')
            .setScale(0.9)
            .setAlpha(0.82)
            .setAngle(180);

        this.add.text(centerX, 520, 'ARCADE  /  SECTOR 7',
            {
                fontFamily: 'future',
                fontSize: '22px',
                color: '#91c4d8'
            })
            .setOrigin(0.5);

        this.add.text(centerX, 650, 'RE\nPHASER',
            {
                fontFamily: 'future',
                fontSize: '96px',
                color: '#f4f7ff',
                align: 'center',
                stroke: '#5a78a8',
                strokeThickness: 7,
                lineSpacing: -8
            })
            .setOrigin(0.5);

        this.add.text(centerX, 860, 'Hold the line',
            {
                fontFamily: 'future',
                fontSize: '26px',
                color: '#dcecff',
                align: 'center'
            })
            .setOrigin(0.5);

        const bestScore = Number(this.saveManager?.getData(SaveConstants.Keys.PLAYER_BEST_SCORE) ?? 0);
        const scorePanel = this.add.container(centerX, 968);
        const scoreBackground = this.add.rectangle(0, 0, 620, 86, 0x10182d, 0.88)
            .setStrokeStyle(2, 0x91c4d8, 0.38);
        const scoreLabel = this.add.text(-155, 0, 'BEST SCORE',
            {fontFamily: 'future', fontSize: '24px', color: '#b6d4e4'})
            .setOrigin(0.5);
        const scoreValue = this.add.text(155, 0, GameConstants.formatScore(bestScore),
            {fontFamily: 'future', fontSize: '42px', color: '#ffffff'})
            .setOrigin(0.5);
        const scoreSeparator = this.add.rectangle(0, 0, 2, 48, 0x91c4d8, 0.22);
        scorePanel.add([scoreBackground, scoreLabel, scoreSeparator, scoreValue]);

        const startPanel = this.add.container(centerX, 1112);
        const startShadow = this.add.ellipse(0, 12, 620, 150, 0x05070f, 0.60);
        const startBackground = this.add.rectangle(0, 0, 620, 112, 0xeff8ff)
            .setStrokeStyle(4, 0xa8d5e6);
        const startText = this.add.text(0, -3, 'START MISSION',
            {
                fontFamily: 'future',
                fontSize: '34px',
                color: '#10182d'
            })
            .setOrigin(0.5);
        const startHint = this.add.text(0, 47, 'ENTER  /  SPACE',
            {
                fontFamily: 'future',
                fontSize: '16px',
                color: '#51627d'
            })
            .setOrigin(0.5);

        startPanel.add([startShadow, startBackground, startText, startHint])
            .setSize(620, 112)
            .setInteractive({useHandCursor: true});

        startPanel.on('pointerover', () => {
            startBackground.setFillStyle(0xdff4ff);
        });
        startPanel.on('pointerout', () => {
            startBackground.setFillStyle(0xeff8ff);
        });
        startPanel.on('pointerdown', () => this.startGame());

        this.add.text(centerX, 1328,
            'MOVE   ARROWS  ·  FIRE   SPACE',
            {
                fontFamily: 'future',
                fontSize: '19px',
                color: '#91a4bb',
                align: 'center'
            })
            .setOrigin(0.5);

        this.add.image(centerX, 1536, 'sprites', 'playerShip1_blue')
            .setScale(1.2)
            .setAngle(-90);

        if (this.input.keyboard) {
            this.input.keyboard.on('keydown-ENTER', (event: KeyboardEvent) => {
                if (!event.repeat)
                    this.startGame();
            });
            this.input.keyboard.on('keydown-SPACE', (event: KeyboardEvent) => {
                if (!event.repeat)
                    this.startGame();
            });
        }

        console.log("HomeScene created");
    }

    private createStars(): void {
        for (let i = 0; i < 38; i++) {
            this.add.circle(
                Phaser.Math.Between(28, this.scale.width - 28),
                Phaser.Math.Between(28, this.scale.height - 28),
                Phaser.Math.Between(1, 3),
                i % 5 === 0 ? 0xc8efff : 0xdce6ff,
                Phaser.Math.FloatBetween(0.18, 0.58)
            );
        }
    }

    private startGame(): void {
        this.input.keyboard?.off('keydown-ENTER');
        this.input.keyboard?.off('keydown-SPACE');
        this.scene.launch(GameConstants.SceneKeys.MAIN_UI);
        this.scene.start(GameConstants.SceneKeys.MAIN_GAME);
    }
}