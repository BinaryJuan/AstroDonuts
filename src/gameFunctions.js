import Phaser from 'phaser'

// === MAIN GAME FUNCTIONS ===
function preload() {
    this.load.image('background', 'images/background.jpg', { flipY: true })
    this.load.image('donut', 'images/donut.png', { flipY: true })
    this.load.image('meteor', 'images/meteor.png', { flipY: true })
    this.load.image('enemy', 'images/enemy.png', { flipY: true })
    this.load.spritesheet('player', 'images/spritesheet.png',
        { frameWidth: 60, frameHeight: 60, flipY: true }
    )
    this.load.image('bullet', 'images/bullet.png', { flipY: true })
}

let player
let donuts
let bullets
let score = 0
let ammo = 10
let scoreText
let enemies
let gameover = false
let restart = false
let restartSound = new Audio('tracks/play.mp3')
function create() {
    // pause game by default
    if (!gameover) {
        this.scene.pause()
    }
    if (restart) {
        this.scene.resume()
    }
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
    donuts.children.iterate((child) => {
        child.setScale(0.03, 0.03)
        let x = Phaser.Math.Between(50, 750)
        let y = Phaser.Math.Between(50, 500)
        for (let i = 0; i < donuts.children.entries.length; i++) {
            if ((donuts.children.entries[i].x === x && donuts.children.entries[i].y === y) || checkOverlap(child, platforms)) {
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
    // create event listener for r key using addEventListener (R)
    document.addEventListener('keydown', (event) => {
        if ((event.key === 'r' || event.key === 'R') && gameover) {
            clearTimeout(reloadTimeout)
            score = 0
            ammo = 10
            gameover = false
            soundFlag = false
            bulletsFired = 0
            canShoot = true
            cooldown = 500
            lastShotTime = 0
            restart = true
            this.scene.restart()
            this.scene.resume()
            restartSound.play()
        }
    })
}

let gameoverSound = new Audio('tracks/gameover.mp3')
gameoverSound.volume = 0.8
let reloadSound = new Audio('tracks/reload.mp3')
reloadSound.volume = 0.25
let bulletSound = new Audio('tracks/bullet-sound.mp3')
bulletSound.volume = 0.65
let enemyHitSound = new Audio('tracks/enemy-hit.mp3')
enemyHitSound.volume = 0.65
let soundFlag = false
let bulletsFired = 0
let canShoot = true
let cursors
let cooldown = 500
let lastShotTime = 0
let reloadTimeout
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
                if (bulletsFired < 10 && canShoot && Date.now() - lastShotTime > cooldown) {
                    lastShotTime = Date.now()
                    const bullet = bullets.create(player.x, player.y, 'bullet')
                    bullet.setScale(0.09, 0.09)
                    bullet.setBounce(1)
                    bullet.setVelocityX(-400)
                    bulletsFired++
                    bulletSound.play()
                    ammo.setText('Ammo: ' + (10 - bulletsFired))
                    if (bulletsFired === 10) {
                        canShoot = false;
                        reloadTimeout = setTimeout(resetBulletsFired, 5000)
                    }
                }
            } else if (cursors.right.isDown && cursors.space.isDown) {
                if (bulletsFired < 10 && canShoot && Date.now() - lastShotTime > cooldown) {
                    lastShotTime = Date.now()
                    const bullet = bullets.create(player.x, player.y, 'bullet')
                    bullet.setScale(0.09, 0.09)
                    bullet.setBounce(1)
                    bullet.setVelocityX(400)
                    bulletsFired++
                    bulletSound.play()
                    ammo.setText('Ammo: ' + (10 - bulletsFired))
                    if (bulletsFired === 10) {
                        canShoot = false;
                        reloadTimeout = setTimeout(resetBulletsFired, 5000)
                    }
                }
            } else if (cursors.up.isDown && cursors.space.isDown) {
                if (bulletsFired < 10 && canShoot && Date.now() - lastShotTime > cooldown) {
                    lastShotTime = Date.now()
                    const bullet = bullets.create(player.x, player.y, 'bullet')
                    bullet.setScale(0.09, 0.09)
                    bullet.setBounce(1)
                    bullet.setVelocityY(-400)
                    bulletsFired++
                    bulletSound.play()
                    ammo.setText('Ammo: ' + (10 - bulletsFired))
                    if (bulletsFired === 10) {
                        canShoot = false;
                        reloadTimeout = setTimeout(resetBulletsFired, 5000)
                    }
                }
            } else if (cursors.down.isDown && cursors.space.isDown) {
                if (bulletsFired < 10 && canShoot && Date.now() - lastShotTime > cooldown) {
                    lastShotTime = Date.now()
                    const bullet = bullets.create(player.x, player.y, 'bullet')
                    bullet.setScale(0.09, 0.09)
                    bullet.setBounce(1)
                    bullet.setVelocityY(400)
                    bulletsFired++
                    bulletSound.play()
                    ammo.setText('Ammo: ' + (10 - bulletsFired))
                    if (bulletsFired === 10) {
                        canShoot = false;
                        reloadTimeout = setTimeout(resetBulletsFired, 5000)
                    }
                }
            } else if (cursors.space.isDown) {
                if (bulletsFired < 10 && canShoot && Date.now() - lastShotTime > cooldown) {
                    lastShotTime = Date.now()
                    const bullet = bullets.create(player.x, player.y, 'bullet')
                    bullet.setScale(0.09, 0.09)
                    bullet.setBounce(1)
                    bullet.setVelocityY(-400)
                    bulletsFired++
                    bulletSound.play()
                    ammo.setText('Ammo: ' + (10 - bulletsFired))
                    if (bulletsFired === 10) {
                        canShoot = false;
                        reloadTimeout = setTimeout(resetBulletsFired, 5000)
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
        if (enemies.countActive(true) < 5) {
            const randomPos = Math.random() < 0.5 ? 0 : 1
            const x = player.x < 400 ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400)
            let y
            if (randomPos === 0) {
                y = Phaser.Math.Between(0, 50)
            } else {
                y = Phaser.Math.Between(550, 600)
            }
            const enemy = enemies.create(x, y, 'enemy')
            enemy.setBounce(1)
            enemy.setCollideWorldBounds(true)
            enemy.setVelocity(Phaser.Math.Between(-1000, 1000), 100)
            enemy.setScale(0.08, 0.08)
            enemy.setSize(enemy.width * 1.1, enemy.height * 1.1)
            enemy.body.setCircle(30)
            this.physics.moveToObject(enemy, player, 100)
        } else {
            enemies.getChildren().forEach((enemy) => {
                enemy.setVelocity(Phaser.Math.Between(-1000, 1000), 100)
                enemy.setScale(0.08, 0.08)
                enemy.setSize(enemy.width * 1.1, enemy.height * 1.1)
                this.physics.moveToObject(enemy, player, 100)
            })
        }
    } else {
        player.setTint(0xff0000)
        player.anims.play('turn')
        if (!soundFlag) {
            gameoverSound.play()
            soundFlag = true
        }
        // texts
        this.add.text(340, 270, 'GAME OVER', { fontSize: '36px', fill: '#ffffff', fontFamily: 'PressStart2P' })
        this.add.text(175, 320, 'Press R to restart', { fontSize: '36px', fill: '#e3c30b', fontFamily: 'PressStart2P' })
        // pause game
        this.scene.pause()
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

const checkOverlap = (donut, meteors) => {
    for (let i = 0; i < meteors.children.entries.length; i++) {
        if (donut.x === meteors.children.entries[i].x && donut.y === meteors.children.entries[i].y) {
            console.log('overlap')
            return true
        }
    }
    return false
}

const donutAudio = new Audio('tracks/take-donut.mp3')
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
            enemyHitSound.play()
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