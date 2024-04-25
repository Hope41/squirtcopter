'use strict'

class Hero {
    constructor() {
        this.x = 0
        this.y = 0
        this.w = .5
        this.h = .61
        this.vx = 0
        this.vy = 0
        this.normalColor = [.2, .5, .2]
        this.normalWindow = [.2, .3, .4]
        this.c = this.normalColor // color
        this.s = this.normalWindow // window
        this.n = [.2, .2, .2] // gun
        this.b = [.2, .2, .2] // blade
        this.dir = 1
        this.flip = 1
        this.spin = 0
        this.bullets = []
        this.friends = []
        this.impact = 0

        // [burn for a while after damage]
        this.upg = {
            regen: {curr: 1, inc: 1, price: 10, priceInc: 1.8, max: 15, reveal: 0, hide: 0, quality: .7},
            force: {curr: 2, inc: 1, price: 15, priceInc: 5, max: 10, reveal: 0, hide: 0, quality: .6},
            recover: {curr: 1, inc: 1, price: 20, priceInc: 2, reveal: 15, hide: 10, quality: .7},
            health: {curr: 40, inc: 10, price: 30, priceInc: 1.7, reveal: 20, hide: 10, quality: .7},
            backup: {curr: 0, inc: 1, price: 40, priceInc: 1.6, max: 1, reveal: 30, hide: 20, quality: .6},
            shockwave: {curr: 0, inc: 1, price: 50, priceInc: 4, reveal: 40, hide: 40, quality: .7},
            knockback: {curr: 0, inc: 1, price: 60, priceInc: 2, max: 3, reveal: 60, hide: 40, quality: .7},
            move: {curr: 10, inc: 1, price: 100, priceInc: 2, max: 20, reveal: 70, hide: 80, quality: .2},
            guns: {curr: 1, inc: 1, price: 150, priceInc: 2, max: 10, reveal: 100, hide: 100, quality: 1},
            damage: {curr: 1, inc: 1, price: 350, priceInc: 2, reveal: 200, hide: 100, quality: 1},
            freeze: {curr: 0, inc: 1, price: 400, priceInc: 2, max: 1, reveal: 200, hide: 50, quality: 1},
            explode: {curr: 0, inc: 1, price: 500, priceInc: 1.8, max: 10, reveal: 400, hide: 200, quality: .8},
            cheap: {curr: 0, inc: 1, price: 1000, priceInc: 3, reveal: 550, hide: 100, quality: 1.2},
            life: {curr: 0, inc: 1, price: 2500, priceInc: 2, reveal: 900, hide: 100, quality: 1.1},
            companion: {curr: 0, inc: 1, price: 10000, priceInc: 1.55, reveal: 5000, hide: 100, quality: 2},
        }

        this.upgItems = ['curr', 'inc', 'price', 'priceInc', 'max', 'reveal', 'hide']
        this.upgArr = [
            'regen', 'force', 'recover', 'health', 'backup', 'shockwave', 'knockback',
            'move', 'guns', 'damage', 'freeze', 'explode', 'cheap', 'life', 'companion']

        // CHEAP UPGRADE
        this.upg.cheap.command = () => {
            for (let i = 0; i < this.upgArr.length; i ++) {
                if (this.upgArr[i] == 'cheap') continue
                this.upg[this.upgArr[i]].price *= .5
            }
        }

        // COMPANINON UPGRADE
        this.upg.companion.command = () => {
            this.friends.push({
                x: this.x + random(-2, 2),
                y: this.y + random(-2, 2),
                w: this.w,
                h: this.w,
                vx: random(-.1, .1),
                vy: random(-.1, .1),
                twitch: 0,
                dirX: 0,
                dirY: 0,
                regen: 0,
                spinBlade: 0,
                speak: 0,
                speakDir: 1,
                phrase: 'Hello!',
                speech: {
                    warn: 0,
                    careful: false,
                    danger: false,
                    dead: false}
            })
        }

        this.regen = 0

        this.health = this.upg.health.curr
        this.smoothHealth = this.health
        this.dead = 0
        this.money = 0
        this.smoothMoney = this.money
        this.moneyMax = this.money
        this.sum = 0

        this.shockWave = false
        this.shockTimer = 0
        this.shockCountDown = 200

        // Make sure hero cannot go back too far
        this.backMax = game.padGap / 4
        this.xMax = 0

        // How much you keep after you get destroyed
        this.mainRecoverAmt = .9
        this.deathRecoverAmt = this.mainRecoverAmt

        this.progress = []
        this.progressX = -1
        this.saveProgress()

        this.afterDeath = false
        this.bossesDestroyed = 0

        this.misses = 0
        this.first = false
    }

    // Sets all upgrades to previous state
    setProgess(index) {
        for (let i = 0; i < this.upgArr.length; i ++) {
            const key = this.upgArr[i]

            for (let j = 0; j < this.upgItems.length; j ++) {
                const item = this.upgItems[j]
                this.upg[key][item] = this.progress[index][key][item]
            }
        }
    }

    saveProgress() {
        const x = this.x

        // Cancel process if state has already been saved
        if (x <= this.progressX || game.boss) return
        this.progressX = x
        if (game.onPad(x)) this.progressX += game.padSize * 1.5

        // Store lots of improtant information
        const checkPoint = {
            money: this.money,
            progress: this.progressX,
            sum: this.sum,
            bossesDestroyed: this.bossesDestroyed,
            boss: game.boss,
            quest: game.quest,
            questNum: game.questNum,
            misses: this.misses,
            x: this.x,
            friends: []
        }

        // Store the current upgrades
        for (let i = 0; i < this.upgArr.length; i ++) {
            const key = this.upgArr[i]
            checkPoint[key] = {}

            for (let j = 0; j < this.upgItems.length; j ++) {
                const item = this.upgItems[j]
                checkPoint[key][item] = this.upg[key][item]
            }
        }

        // Store current friends
        for (let i = 0; i < this.friends.length; i ++) {
            const friend = this.friends[i]
            checkPoint.friends.push(friend)
        }

        this.progress.push(checkPoint)
    }

    // Go back a few checkpoints if possible
    respawn() {
        this.health = this.upg.health.curr
        this.c = this.normalColor
        this.s = this.normalWindow
        const checkPoint = Math.ceil(this.progress.length * this.deathRecoverAmt) - 1

        /* checkPoint is the thing that says which checkpoint
        you should start at, respectively (0 meaning no checkpoint) */
        if (game.fallBack + checkPoint >= 1) {
            this.shockWave = true
            this.afterDeath = true

            // Undo changes
            this.progress = this.progress.slice(0, checkPoint + 1)

            // Set upgrades
            this.setProgess(checkPoint)
            this.dir = 1
            this.vx = 0
            this.vy = 0
            this.y = GROUND

            const restore = this.progress[checkPoint]
            this.money = restore.money
            this.progressX = restore.progressX
            this.sum = restore.sum
            this.bossesDestroyed = restore.bossesDestroyed
            this.friends = restore.friends
            this.misses = restore.misses

            this.x = restore.x
            this.xMax = this.x

            game.boss = restore.boss
            game.quest = restore.quest
            game.questNum = restore.questNum
            game.questActive = false
            game.oldRight = 0

            if (game.certainBoss) game.certainBoss.eradicate = true

            this.shopped = true
            key.up = false
        }
        else this.restart()
    }

    // Use extra life
    revive() {
        this.health = this.upg.health.curr
        this.c = this.normalColor
        this.s = this.normalWindow
        this.shockWave = true

        this.upg.life.curr --
    }

    // Start the game again
    restart() {
        if (game.certainBoss) game.certainBoss.eradicate = true

        this.health = this.upg.health.curr
        this.c = this.normalColor
        this.s = this.normalWindow

        this.x = 0
        this.xMax = this.x
        this.progressX = -1

        game.bg = []
        this.y = 0
        this.money = 0
        this.moneyMax = 0
        this.sum = 0
        this.dir = 1
        this.vx = 0
        this.vy = 0
        this.misses = 0

        this.bossesDestroyed = 0

        this.setProgess(0)
        game.restart()
    }

    boom(dt) {
        if (!this.dead) {
            zzfx(...[2,.1,99,,,.4,1,,-2,-1,,,.04,.8,2,,.1,,.2,.22])
            game.cloud(this.x, this.y, this.w, this.h, .6, 15, '#3339', .02, .015)
            cam.boom(.5, 15)
        }
        this.dead += dt
        this.c = [.1, .1, .1]
        this.s = [.2, .25, .3]

        game.cloud(this.x, this.y, this.w, this.h, .2, 1, '#520', .02, .02)
    }

    updateFriends(dt) {
        // Follow constants
        const MOMENTUM = .99
        const MAXSPEED = .96
        const FICKLENESS = 300
        const RANDFORCE = .005
        const TWITCHTIMERMIN = 50
        const TWITCHTIMERMAX = 200

        // Power constants
        const REGENCOPY = .85

        for (let i = 0; i < this.friends.length; i ++) {
            const item = this.friends[i]
            const DIFF = Math.sin(i)
            let xOffset = -1

            // DETECT WHEN TO SAY SOMETHING
            const hp = this.health / this.upg.health.curr

            if (i < 3) {
                if (hp > .5 + DIFF / 3) {
                    item.speech.warn -= dt
                    if (item.speech.warn < 0) {
                        item.speech.careful = false
                        item.speech.danger = false
                        item.speech.dead = false
                    }
                }
                else item.speech.warn = 300

                if (hp < .5 + DIFF / 3 && !item.speech.careful) {
                    item.speech.careful = true

                    let options = []
                    if (!i) options = ['Careful..', 'Ouch', 'Steady...']
                    else if (i == 1) options = ['Oooh..', '']
                    else options = ['Look out!']

                    item.phrase = options[randomInt(0, options.length)]
                    item.speakDir = 1
                }

                if (hp < .2 + DIFF / 3 && !item.speech.danger) {
                    item.speech.danger = true

                    let options = []
                    if (!i) options = ['Oof', 'Whoa', 'Look out!!', 'Careful there!']
                    else if (i == 1) options = ['That was close!', 'Eeh', 'Yikes']
                    else options = ['You can do this', 'SQUIRT THEM!']

                    item.phrase = options[randomInt(0, options.length)]
                    item.speakDir = 1
                }

                if (this.dead && !item.speech.dead) {
                    item.speech.dead = true

                    let options = []
                    if (!i) options = ['Nooooooo!', 'Captain no!']
                    else if (i == 1) options = ['']
                    else options = ['You got so far', 'You were so close']

                    item.phrase = options[randomInt(0, options.length)]
                    item.speakDir = 1
                }
            }

            if (hp < .5 + DIFF / 3 && !this.dead)
                xOffset = 1 + this.vx * 8

            const dx = (this.x + this.w / 2 + xOffset) - (item.x + item.w / 2)
            const dy = (this.y + this.h / 2) - (item.y + item.h / 2)

            // RANDOMNESS
            item.twitch -= dt
            if (item.twitch < 0) {
                item.dirX = random(-RANDFORCE, RANDFORCE)
                item.dirY = random(-RANDFORCE, RANDFORCE)
                item.twitch = random(TWITCHTIMERMIN, TWITCHTIMERMAX)
            }
            item.vx += item.dirX
            item.vy += item.dirY

            // MOVEMENT
            item.vx += dx / FICKLENESS
            item.vy += dy / FICKLENESS

            let moveX = MOMENTUM + Math.abs(dx) / 3
            let moveY = MOMENTUM + Math.abs(dy) / 3
            if (moveX > MAXSPEED) moveX = MAXSPEED
            if (moveY > MAXSPEED) moveY = MAXSPEED
            item.vx *= Math.pow(moveX, dt)
            item.vy *= Math.pow(moveY, dt)

            // RESTRICTORS
            if (item.y > GROUND - item.h) {
                item.y = GROUND - item.h
                item.vy -= .01
            }
            if (item.y < CEILING) {
                item.y = CEILING
                item.vy += .01
            }

            item.x += item.vx * dt
            item.y += item.vy * dt

            // BULLETS
            item.regen -= this.upg.regen.curr * .01 * REGENCOPY * dt
            if (item.regen < 0) {
                const speed = this.upg.force.curr * .002 + Math.abs(item.vx * .08)
                const len = Math.ceil(this.upg.guns.curr / 2)
                const range = 1.5 / len

                for (let i = 0; i < len; i ++) this.bullets.push({
                    x: item.x + item.w,
                    y: item.y + item.h * .7,
                    momentum: .9,
                    vx: speed / .1, vy: 0, speed,
                    angle: i * range - ((len - 1) * range / 2) + this.vy / 5 + random(-.1, .1),
                    w: .1, h: .1, life: 1000, shrapnel: false})

                item.regen = 1
            }

            // DRAW SPEECH
            item.speak += item.speakDir * dt
            if (item.speak > 0) {
                const SPEED = .1

                // GET WIDTH OF STATEMENT
                const width = item.phrase.length * .145

                // DRAW BOX
                let time = item.speak * SPEED
                if (time > 1) time = 1
                const boxW = quad(time) * width
                ctx.fillStyle = '#fff5'
                fillRect(item.x + item.w / 2 - boxW / 2, item.y - boxW / width * .42, boxW, .24)

                // DRAW TEXT
                ctx.textAlign = 'center'
                ctx.font = (game.scale / 5) + 'px font'
                ctx.fillStyle = rgb(.1, .1, .1, item.speak * SPEED - 1)
                fillText(item.phrase, item.x + item.w / 2, item.y - .23)
                ctx.textAlign = 'left'

                // STOP TALKING
                if (item.speak > 8 / SPEED)
                    item.speakDir = -1
            }
            else item.speak = 0

            // DRAW
            const a = 1.3
            ctx.fillStyle = '#884'
            fillRect(item.x, item.y, item.w, item.h)

            ctx.fillStyle = rgb(this.s[0]*a, this.s[1]*a, this.s[2]*a)
            fillRect(item.x + item.w, item.y + .07, -item.w * .6, item.h * .5)

            ctx.fillStyle = '#222'
            fillRect(item.x + item.w, item.y + item.h * .7, .06, .1)

            ctx.fillStyle = '#333'
            fillRect(item.x + item.w / 2 - .03, item.y, .06, -.1)

            item.spinBlade += (item.vy + Math.abs(item.vx)) * 9
            let blade = Math.abs(Math.sin(item.spinBlade)) * item.w * .9
            if (blade < .06) blade = .06

            fillRect(item.x + item.w / 2 - blade / 2, item.y - .12, blade, .08)
        }
    }

    update(dt) {
        this.updateFriends(dt)
        this.smoothHealth += (this.health - this.smoothHealth) / 4 * dt
        this.impact -= .1 * dt
        if (this.impact < 0) this.impact = 0

        // SHOCKWAVE UPGRADE
        const readyForShock = this.health < this.upg.health.curr * .2
        if (!readyForShock) this.shockTimer -= dt

        // Initiate shockwave if copter was just destroyed or else appropriate
        if (!this.afterDeath) this.shockWave = false
        if ((readyForShock && this.upg.shockwave.curr && this.shockTimer < 0) ||
            (this.afterDeath && this.shockWave)) {
            this.shockWave = true
            cam.boom(.1, 10)
            game.filter = 1
            zzfx(...[2,.1,99,,,.4,1,,-2,-1,,,.04,.8,2,,.1,,.2,.22])

            // The copter has to be safe for at least shockCountDown frames before another wave
            this.shockTimer = this.shockCountDown
        }
        this.afterDeath = false

        const velocityX = this.upg.move.curr * .002
        const velocityY = .01
        const momentum = .9
        const damping = .5
        const gravity = .002

        // Restrictors
        let air = true

        if (this.y + this.vy / 2 < CEILING) {
            this.y = CEILING
            this.vy = 0
            air = false
        }
        else if (this.y + this.vy / 2 > GROUND - this.h - game.padHeight &&
            game.onPad(this.x + this.w / 2 - game.padSize)) {
            this.y = GROUND - this.h - .2
            this.vy = 0
            air = false

            if (key.up) this.shopped = true
            if (!this.shopped && !this.dead) {
                key.down = false
                key.left = false
                key.right = false
                game.shop = true
                zzfx(...[2,.1,50,.1,.11,.2,,1.3,,.13,,,,.5,,,,.9,.06])
            }
        }
        else {
            this.shopped = false
            if (this.y + this.vy / 2 > GROUND - this.h) {
                this.y = GROUND - this.h
                this.vy = 0
                air = false
            }
        }

        // Death
        if (this.health <= 0) {
            this.boom(dt)
            this.health = 0
            this.vy += gravity * dt
            this.y += this.vy * damping * dt
            return
        }
        else {
            this.health += this.upg.recover.curr * .02 * dt
            if (this.health > this.upg.health.curr)
                this.health = this.upg.health.curr
        }

        // Keys
        if (key.up) this.vy -= velocityY * dt
        if (key.down) this.vy += velocityY * dt
        if (air) {
            if (key.left) this.vx -= velocityX * dt
            if (key.right) this.vx += velocityX * dt
        }

        // Movement
        this.vx *= Math.pow(momentum, dt)
        this.vy += gravity * dt
        this.x += this.vx * damping * dt
        this.y += this.vy * damping * dt

        // Flip
        const flipSpeed = .35
        if (this.vx < 0) this.dir = -1
        else this.dir = 1
        if (this.flip > this.dir) this.flip -= flipSpeed * dt
        else if (this.flip < this.dir) this.flip += flipSpeed * dt
        if (this.flip < -1) this.flip = -1
        else if (this.flip > 1) this.flip = 1

        this.spin += (Math.abs(this.vy) + Math.abs(this.vx)) * 2 * dt

        // Guns
        const bulletMomentum = .9
        this.regen -= this.upg.regen.curr * .01 * dt
        if (this.regen < 0) {
            const volume = .8/(this.upg.regen.curr/6)
            zzfx(...[volume,.05,99,,,,,,,1,,,.04,.6,,,.1,,,.22])

            const w = .12
            const h = .12
            const xSizeOft = w * (this.dir / 2 - .5)
            const xOft = this.w / 2 * this.dir

            const speed = this.upg.force.curr * .002 + Math.abs(this.vx * .05)
            const len = this.upg.guns.curr
            const range = 1.5 / len

            for (let i = 0; i < len; i ++) {
                this.bullets.push({
                    x: this.x + this.w / 2 + xOft + xSizeOft,
                    y: this.y + .5 - w / 2,
                    momentum: bulletMomentum,
                    vx: (speed / (1 - bulletMomentum)) * this.dir, vy: 0, speed,
                    angle: i * range - ((len - 1) * range / 2) +
                        (this.dir * Math.PI / 2 - Math.PI / 2) + this.vy / 5 +
                        random(-.1, .1),
                    w, h, life: 1000, shrapnel: false})
            }

            this.regen = 1
            cam.boom(.02, 10)
        }

        const newBullets = []
        for (let i = 0; i < this.bullets.length; i ++) {
            const item = this.bullets[i]

            item.vx += Math.cos(item.angle) * item.speed * dt
            item.vy += Math.sin(item.angle) * item.speed * dt

            for (let j = 0; j < game.bots.length; j ++) {
                const bot = game.bots[j]
                const range = {
                    x: bot.x + bot.w / 2 - bot.w2 / 2,
                    y: bot.y + bot.h / 2 - bot.h2 / 2,
                    w: bot.w2, h: bot.h2}

                if (collide(item, range)) {
                    const dx = (range.x + range.w / 2) - item.x
                    const dy = (range.y + range.h / 2) - item.y
                    item.angle = Math.atan2(dy, dx)

                    if (collide(item, bot)) {
                        bot.life -= this.upg.damage.curr
                        bot.hit = 1

                        // BACK UP
                        if (this.upg.backup && this.health < this.upg.health.curr / 2)
                            bot.life -= this.upg.damage.curr

                        // KNOCK BACK
                        if (this.upg.knockback.curr) {
                            let amt = .03 / ((bot.phase * 40) + 1)
                            if (bot.boss) amt = .03
                            bot.vx += Math.cos(item.angle) * this.upg.knockback.curr * amt
                            bot.vy += Math.sin(item.angle) * this.upg.knockback.curr * amt
                        }

                        // FREEZE
                        if (!bot.boss && this.upg.freeze.curr && random(0, 100) < 40)
                            bot.frozen = this.upg.freeze.curr * 100

                        item.life = 0
                        if (bot.life <= 0 && !item.shrapnel) {
                            item.shrapnel = true
                            for (let k = 0; k < this.upg.explode.curr; k ++) {
                                const speed = .01
                                newBullets.push({
                                    x: item.x, y: item.y, momentum: bulletMomentum,
                                    vx: (speed / (1 - bulletMomentum)) * this.dir, vy: 0, speed,
                                    angle: k / this.upg.explode.curr * Math.PI * 2 + random(0, .5),
                                    w: item.w, h: item.h, life: 200, shrapnel: false})
                            }
                        }
                    }
                }
            }

            item.life -= dt
            if (item.life < 0 || offScreen(item, 1.15)) {
                this.bullets.splice(i, 1)
                i --
            }

            item.vx *= Math.pow(item.momentum, dt)
            item.vy *= Math.pow(item.momentum, dt)
            item.x += item.vx * dt
            item.y += item.vy * dt

            const maxBullets = 700
            if (i > this.bullets.length - maxBullets) {
                const grayMax = .4
                let R = rnd(0, grayMax, this.upg.explode.curr*9)
                let G = rnd(0, grayMax, (this.upg.guns.curr-1)*99)
                let B = rnd(0, grayMax, (this.upg.damage.curr-1)*999)

                const GRAY = .7
                const SWITCHSPEED = 7
                const SWITCHOFT = 2
                let range = game.Z*SWITCHSPEED-SWITCHOFT
                if (range < 0) range = 0
                if (range > 1) range = 1
                ctx.fillStyle = rgb(
                    lerp(GRAY+R,R,range),
                    lerp(GRAY+G,G,range),
                    lerp(GRAY+B,B,range))
                fillRect(item.x, item.y, item.w, item.h)
            }
        }

        this.bullets.push(...newBullets)

        // Completed quest
        if (this.sum >= game.questNum) {
            game.quest ++
            zzfx(...[.2,0,445,.01,.1,.26,,20,,,128,.1,,,,,,.5,.2,.1])

            const set = () => {
                game.questTime = 0
                game.questActive = true
                game.questNum += Math.floor(game.questInc / (1 + (game.quest / 1.8)))
                if (game.questNum > 100) game.questNum = 100

                this.sum = 0
                this.money += game.questReward
            }

            // Check if it was a boss battle
            if (game.killedBoss) {
                game.killedBoss = false
                game.questReward = this.x * 6
                this.health = this.upg.health.curr
                this.shockWave = true
                this.afterDeath = true
                game.questNum = game.oldQuestNum

                game.fallBack = hero.progress.length - 1
                game.fallRise = 0

                this.deathRecoverAmt = this.mainRecoverAmt

                set()

                hero.progress = []
                hero.saveProgress()

                if (game.quest == 21) {
                    this.shockWave = true
                    this.afterDeath = true
                    this.upg.regen.curr = 0
                    this.regen = 0

                    game.ending = hero.x + cvs.width / game.scale / 2
                }
            }

            else {
                game.questReward = game.questNum * (2.2 + (game.quest - 1) / 2)
                set()

                if (game.quest == 16) game.mist = dt

                // Initiate boss if ready
                if (game.quest % 10 == 0) {
                    /* hero.sum goes up only when the boss is defeated,
                    so you only need to destroy "one" robot, so to speak */

                    game.oldQuestNum = game.questNum
                    game.questNum = 1
                    game.boss = true

                    this.shockWave = true
                    this.afterDeath = true
                    this.deathRecoverAmt = 1

                    // Create boss just off the screen
                    const bossX = cam.x + 5 + cvs.width / 2 / game.scale
                    const bot = new Bot(bossX, CEILING + 2, 0, item => {
                        const size = 6

                        item.boss = true
                        item.w *= size
                        item.h *= size
                        item.w2 = item.w
                        item.h2 = item.h
                        item.maxLife =
                            this.upg.damage.curr * this.upg.guns.curr *
                            ((this.upg.companion.curr * .6) + 1) * 100
                        item.spawnable = true
                        item.spawnFreq = 40

                        // Make max proximities
                        item.upg = []
                        item.createProx(100)

                        // Swing proximities around
                        item.swingVel = 4

                        item.spawnABot = () => game.botRequests.push({
                            x: item.x + rnd(0, size - 1, item.spawns),
                            y: item.y + rnd(0, size - 1, item.spawns * 9),
                            type: Math.floor(rnd(1, 15, item.spawns * 99))})
                    }, this.bossesDestroyed)
                    game.bots.push(bot)
                    game.certainBoss = bot
                }
            }
        }

        if (this.x > this.xMax)
            this.xMax = this.x
        if (this.x < this.xMax - this.backMax) {
            this.x = this.xMax - this.backMax
            this.vx = 0
        }
    }

    draw(dt) {
        const tall = this.h - this.w
        const y = this.y + tall
        const windowW = this.w * .6
        const windowH = this.w * .5
        const windowY = .07

        const gunY = .34
        const gunW = .16 + Math.sin(Math.PI / 2 + this.flip * Math.PI) * .1
        const gunH = .1

        const bladeH = .08
        const poleW = .05
        let bladeW = Math.sin(this.spin * 1.5) * this.w * .9
        if (bladeW < poleW && bladeW > -poleW) bladeW = poleW

        // Pod
        const qd = quad(game.Z)
        ctx.fillStyle = rgb(
            lerp(this.c[0]*1.3,this.c[0],qd),
            lerp(this.c[1]*1.3,this.c[1],qd),
            lerp(this.c[2]*1.3,this.c[2],qd))
        fillRect(this.x, y, this.w, this.w)

        // Window
        const halfWindow = this.w / 2 - windowW / 2
        ctx.fillStyle = rgb(this.s[0],this.s[1],this.s[2])
        fillRect(
            this.x + this.w / 2 + halfWindow * this.flip + windowW / 2,
            y + windowY, -windowW, windowH)

        // Gun
        const halfGun = this.w / 2 + gunW / 2
        ctx.fillStyle = rgb(this.n[0],this.n[1],this.n[2])
        fillRect(
            this.x + this.w / 2 + halfGun * this.flip - gunW / 2,
            y + gunY, gunW, gunH)

        // Blade
        ctx.fillStyle = rgb(this.b[0],this.b[1],this.b[2])
        fillRect(
            this.x + this.w / 2 - bladeW / 2,
            this.y, bladeW, bladeH)

        // Pole
        fillRect(
            this.x + this.w / 2 - poleW / 2,
            this.y + bladeH, poleW, tall - bladeH)
    }
}