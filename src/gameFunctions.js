import Phaser from 'phaser'

// === MAIN GAME FUNCTIONS ===
function preload() {
    this.load.image('background', 'background.jpg', { flipY: true })
    this.load.image('donut', 'donut.png', { flipY: true })
    this.load.image('meteor', 'meteor.png', { flipY: true })
    this.load.image('enemy', 'enemy.png', { flipY: true })
    this.load.spritesheet('player', 'spritesheet.png',
        { frameWidth: 60, frameHeight: 60, flipY: true }
    )
    this.load.image('bullet', 'bullet.png', { flipY: true })
}

let player
let donuts
let bullets
let score = 0
let ammo = 10
let scoreText
let enemies
let gameover = false
function create() {
    // pause game by default
    this.scene.pause()
    // use game background
    this.add.image(500, 300, 'background')
    // static platforms/images
    const platforms = this.physics.add.staticGroup()
    randomMeteors(4, platforms) // que la dificultad sea un parametro
    // player
    player = this.physics.add.sprite(100, 450, 'player')
    player.setBounce(0.2)
    player.setCollideWorldBounds(true)
    player.setSize(player.width * 0.4, player.height * 0.4)
    // player animations (LEFT, TURN, RIGHT, DOWN)
    this.anims.create({
        key: 'left',
        frames: [{ key: 'player', frame: 2 }],
        frameRate: 10,
        repeat: -1
    })
    this.anims.create({
        key: 'turn',
        frames: [{ key: 'player', frame: 3 }],
        frameRate: 20
    })
    this.anims.create({
        key: 'right',
        frames: [{ key: 'player', frame: 1 }],
        frameRate: 10,
        repeat: -1
    })
    this.anims.create({
        key: 'down',
        frames: [{ key: 'player', frame: 0 }],
        frameRate: 10,
        repeat: -1
    })
    // collider
    this.physics.add.collider(player, platforms)
    // donuts
    donuts = this.physics.add.group({
        key: 'donut',
        repeat: 3,
        setXY: { x: 50, y: 50, stepX: 70 }
    })
    donuts.children.iterate(function (child) {
        child.setScale(0.03, 0.03)
        let x = Phaser.Math.Between(50, 750)
        let y = Phaser.Math.Between(50, 500)
        for (let i = 0; i < donuts.children.entries.length; i++) {
            if (donuts.children.entries[i].x === x && donuts.children.entries[i].y === y) {
                x = Phaser.Math.Between(50, 750)
                y = Phaser.Math.Between(50, 500)
                i = -1
            }
        }
        child.setPosition(x, y)
    })
    this.physics.add.collider(donuts, platforms)
    // take donuts
    this.physics.add.overlap(player, donuts, collectDonuts, null, this)
    // score
    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '36px', fill: '#91248a', fontFamily: 'Arial' })
    // ammo
    ammo = this.add.text(16, 50, 'Ammo: 10', { fontSize: '25px', fill: '#fc030f', fontFamily: 'Arial' })
    // enemies
    enemies = this.physics.add.group()
    this.physics.add.collider(enemies, platforms)
    this.physics.add.overlap(player, enemies, gameOver, null, this)
    // bullets
    bullets = this.physics.add.group()
    this.physics.add.collider(bullets, platforms, destroyBullet, null, this)
    this.physics.add.overlap(bullets, enemies, hitEnemy, null, this)
}

let gameoverSound = new Audio('gameover.mp3')
gameoverSound.volume = 0.8
let reloadSound = new Audio('reload.mp3')
reloadSound.volume = 0.8
let soundFlag = false
let bulletsFired = 0
let canShoot = true
let cursors
function update() {
    if (!gameover) {
        // player movement
        cursors = this.input.keyboard.createCursorKeys()
        if (cursors.left.isDown) {
            player.setVelocityX(-140)
            player.anims.play('left', true)
        } else if (cursors.right.isDown) {
            player.setVelocityX(140)
            player.anims.play('right', true)
        } else if (cursors.up.isDown) {
            player.setVelocityY(-140)
        } else if (cursors.down.isDown) {
            player.anims.play('down')
            player.setVelocityY(140)
        } else {
            player.setVelocity(0, 0)
            player.anims.play('turn')
        }
        // keyboard (bullets)
        cursors.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
        if (!gameover) {
            if (cursors.left.isDown && cursors.space.isDown) {
                if (bulletsFired < 10 && canShoot) {
                    const bullet = bullets.create(player.x, player.y, 'bullet')
                    bullet.setScale(0.09, 0.09)
                    bullet.setBounce(1)
                    bullet.setVelocityX(-400)
                    bulletsFired++
                    ammo.setText('Ammo: ' + (10 - bulletsFired))
                    if (bulletsFired === 10) {
                        canShoot = false;
                        setTimeout(resetBulletsFired, 5000)
                    }
                }
            } else if (cursors.right.isDown && cursors.space.isDown) {
                if (bulletsFired < 10 && canShoot) {
                    const bullet = bullets.create(player.x, player.y, 'bullet')
                    bullet.setScale(0.09, 0.09)
                    bullet.setBounce(1)
                    bullet.setVelocityX(400)
                    bulletsFired++
                    ammo.setText('Ammo: ' + (10 - bulletsFired))
                    if (bulletsFired === 10) {
                        canShoot = false;
                        setTimeout(resetBulletsFired, 5000)
                    }
                }
            } else if (cursors.up.isDown && cursors.space.isDown) {
                if (bulletsFired < 10 && canShoot) {
                    const bullet = bullets.create(player.x, player.y, 'bullet')
                    bullet.setScale(0.09, 0.09)
                    bullet.setBounce(1)
                    bullet.setVelocityY(-400)
                    bulletsFired++
                    ammo.setText('Ammo: ' + (10 - bulletsFired))
                    if (bulletsFired === 10) {
                        canShoot = false;
                        setTimeout(resetBulletsFired, 5000)
                    }
                }
            } else if (cursors.down.isDown && cursors.space.isDown) {
                if (bulletsFired < 10 && canShoot) {
                    const bullet = bullets.create(player.x, player.y, 'bullet')
                    bullet.setScale(0.09, 0.09)
                    bullet.setBounce(1)
                    bullet.setVelocityY(400)
                    bulletsFired++
                    ammo.setText('Ammo: ' + (10 - bulletsFired))
                    if (bulletsFired === 10) {
                        canShoot = false;
                        setTimeout(resetBulletsFired, 5000)
                    }
                }
            } else if (cursors.space.isDown) {
                if (bulletsFired < 10 && canShoot) {
                    const bullet = bullets.create(player.x, player.y, 'bullet')
                    bullet.setScale(0.09, 0.09)
                    bullet.setBounce(1)
                    bullet.setVelocityY(-400)
                    bulletsFired++
                    ammo.setText('Ammo: ' + (10 - bulletsFired))
                    if (bulletsFired === 10) {
                        canShoot = false;
                        setTimeout(resetBulletsFired, 5000)
                    }
                }
            }
        }
        // destroy bullets
        bullets.getChildren().forEach((bullet) => {
            if (bullet.x >= 1000 || bullet.x <= 0 || bullet.y >= 600 || bullet.y <= 0) {
                bullet.disableBody(true, true)
                bullet.setVisible(false)
            }
        })
        // enemies movement
        if (enemies.countActive(true) < 3) {
            const x = player.x < 400 ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400)
            const enemy = enemies.create(x, 16, 'enemy')
            enemy.setBounce(1)
            enemy.setCollideWorldBounds(true)
            enemy.setVelocity(Phaser.Math.Between(-1000, 1000), 100)
            enemy.setScale(0.08, 0.08)
            enemy.setSize(enemy.width * 1.2, enemy.height * 1.2)
            enemy.body.setCircle(30)
            this.physics.moveToObject(enemy, player, 100)
        } else {
            enemies.getChildren().forEach((enemy) => {
                enemy.setVelocity(Phaser.Math.Between(-1000, 1000), 100)
                enemy.setScale(0.08, 0.08)
                enemy.setSize(enemy.width * 1.2, enemy.height * 1.2)
                this.physics.moveToObject(enemy, player, 100)
            })
        }
    } else {
        this.physics.pause()
        player.setTint(0xff0000)
        player.anims.play('turn')
        if (!soundFlag) {
            gameoverSound.play()
            soundFlag = true
        }
        this.add.text(400, 270, 'GAME OVER', { fontSize: '36px', fill: '#ffffff', fontFamily: 'Arial' })
        this.add.text(375, 320, 'Press R to restart', { fontSize: '36px', fill: '#e3c30b', fontFamily: 'Arial' })
        this.input.keyboard.on('keydown', (event) => {
            if (event.keyCode === 82) {
                this.scene.restart()
                score = 0
                ammo = 10
                gameover = false
                this.scene.resume()
            }
        })
    }
}

// === INTERNAL GAME FUNCTIONS ===
const randomMeteors = (difficulty, platforms) => {
    const minW = 100
    const maxW = 900
    const minH = 100
    const maxH = 500
    for (let i = 0; i < difficulty; i++) {
        const x = Math.floor(Math.random() * (maxW - minW + 1) + minW)
        const y = Math.floor(Math.random() * (maxH - minH + 1) + minH)
        platforms.create(x, y, 'meteor').setScale(0.04, 0.04).refreshBody()
    }
}

const donutAudio = new Audio('take-donut.mp3')
donutAudio.volume = 0.6
const collectDonuts = (player, donut) => {
    donut.disableBody(true, true)
    donutAudio.play()
    score += 10
    scoreText.setText('Score: ' + score)
    if (donuts.countActive(true) === 0) {
        donuts.children.iterate(function (child) {
            child.enableBody(true, child.x, 0, true, true)
            let x = Phaser.Math.Between(50, 750)
            let y = Phaser.Math.Between(50, 500)
            for (let i = 0; i < donuts.children.entries.length; i++) {
                if (donuts.children.entries[i].x === x && donuts.children.entries[i].y === y) {
                    x = Phaser.Math.Between(50, 750)
                    y = Phaser.Math.Between(50, 500)
                    i = -1
                }
            }
            child.setPosition(x, y)
        })
    }
}

const hitEnemy = (player, bomb) => {
    enemies.getChildren().forEach((enemy) => {
        if (enemy.x === bomb.x && enemy.y === bomb.y) {
            enemy.disableBody(true, true)
            score += 20
            scoreText.setText('Score: ' + score)
        }
    })
}

const destroyBullet = (bullet) => {
    bullet.disableBody(true, true)
    bullet.setVisible(false)
}

const gameOver = () => {
    gameover = true
}

const resetBulletsFired = () => {
    bulletsFired = 0
    if (!gameover) {
        canShoot = true
        ammo.setText('Ammo: ' + (10))
        reloadSound.play()
    }
}

export { preload, create, update }