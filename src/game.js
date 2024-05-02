'use strict'

class Game {
    constructor() {
        this.scale = 0
        this.time = 0
        this.oldPerf = 0
        this.bots = []
        // Bots spawning bots
        this.botRequests = []

        this.oldRight = 0
        this.particles = []
        this.bad = []
        this.weapons = []

        this.padGap = 90
        this.padSize = 3
        this.padHeight = .2
        this.padStartOft = 50
        this.padOnScreen = false

        this.shop = false
        this.shopTime = 0
        this.shopClose = false
        this.shopIdx = 1
        this.shopSmoothIdx = 0
        this.purchase = 0
        this.cheapest = {index: -1, quality: -1, price: -1}
        this.cheapestScanned = false

        // day/night cycle
        this.Z = 0
        this.bg = []

        this.restart()

        this.filter = 1
        this.restartOption = 0

        this.bossTime = 0
        this.certainBoss = 0
        this.killedBoss = false
        this.fallBack = 0
        this.fallRise = 0

        this.mist = 0
        this.ending = 0

        this.start = true
        this.startTime = 0
        this.startClose = 0
        this.startChoice = 0
        this.dedication = 0

        const TEXT = 'SQUIRTCOPTER'
        this.homeText = []
        for (let i = 0; i < TEXT.length; i ++)
            this.homeText.push({char: TEXT[i], y: 0, ySpeed: 0})

        this.box = 0
        this.giveUp = 0

        this.playTime = 0

        this.resize()
    }

    restart() {
        this.boss = false
        this.quest = 1
        this.questTime = 0
        this.oldQuestNum = 10
        this.questNum = 10
        this.questActive = false
        this.questReward = 2.2
        this.questInc = 50
        this.questSpring = {v: 0, y: 0, goal: 0}
        this.oldRight = 0
    }

    dist(x) {
        return Math.floor(x / 2)
    }

    cloud(x, y, w, h, size, amt, color, boom, shrink, text = '', fade = 0) {
        for (let i = 0; i < amt; i ++)
            this.particles.push({
                x: x + random(0, w),
                y: y + random(0, h),
                vx: random(-boom, boom),
                vy: random(-boom, boom),
                size, color, shrink, text, fade, alpha: 1})
    }

    resize() {
        let box = cvs.width
        if (cvs.width < cvs.height)
            box = cvs.height

        let box2 = cvs.width
        if (cvs.width > cvs.height)
            box2 = cvs.height

        const zoom = .03
        this.scale = (cvs.width + cvs.height) * zoom + box * zoom
        this.box = box2 / 15
    }

    makeBot(idx) {
        if (idx < 1 || this.ending) return
        const maxDense = .75
        let freq = ((idx + this.padSize * 2) % this.padGap) / this.padGap * maxDense

        if (rndDec(idx * idx * 99) < freq + idx / 1800)
            this.bots.push(new Bot(idx, rnd(CEILING + 1, GROUND - 2, idx * 9)))
    }

    overlay(dt, yOft) {
        if (this.boss) {
            this.bossTime += dt
            let time = this.bossTime / 100
            if (time > 1) time = 1

            const boxW = quad(time) * cvs.width * .8
            const boxH = this.scale * .4
            const gap = this.scale * .08

            ctx.fillStyle = '#222'
            ctx.fillRect(cvs.width / 2 - boxW / 2, yOft - boxH - this.scale * .1, boxW, boxH)

            ctx.fillStyle = rgb(.5 + Math.sin(this.bossTime / 10) * .3, .1, .1)
            ctx.fillRect(
                cvs.width / 2 - boxW / 2 + gap,
                yOft - boxH - this.scale * .1 + gap,
                (boxW - gap * 2) * (this.certainBoss.life / this.certainBoss.maxLife), boxH - gap * 2)
        }
        else this.bossTime = 0

        const pause = 50
        if (hero.dead > pause) {
            let time = (hero.dead - pause) / 300
            if (time > 1) time = 1

            let idx = 0
            const makeButton = (y, text, good = true, shake = false) => {
                const hover = this.restartOption == idx
                let bob =  0

                ctx.fillStyle = '#422'
                if (good) ctx.fillStyle = '#343'

                if (hover) {
                    ctx.fillStyle = '#755'
                    if (good) {
                        ctx.fillStyle = '#676'
                        bob = quad(.5 + Math.sin(hero.dead / 5) * .5) * this.scale * .13
                    }
                }
                ctx.fillRect(cvs.width / 2 - buttonW / 2, yOft + boxH * y, buttonW, buttonH)

                let xx = 0
                let yy = 0

                if (shake) {
                    const amt = .02
                    xx = random(-amt, amt)
                    yy = random(-amt, amt)
                }

                ctx.fillStyle = '#000'
                if (hover) ctx.fillStyle = '#fff'
                ctx.font = (this.scale / 3.4) + 'px font'
                ctx.fillText(
                    text, cvs.width / 2 - buttonW * .45 + xx * this.scale,
                    yOft + boxH * y + boxH * .11 + yy * this.scale)

                const w = this.scale * .07
                const segs = 3
                for (let i = 0; i < segs; i ++) {
                    const h = this.scale * .07 * (segs - i)
                    ctx.fillRect(
                        cvs.width / 2 + buttonW * .33 + w * i + bob,
                        yOft + boxH * y + boxH * .075 - h / 2, w, h)
                }

                idx ++
            }

            const pad = this.scale * .2
            const boxW = this.scale * 4.5
            const boxH = this.scale * 3.5
            const buttonW = boxW * .7
            const buttonH = boxH * .15
            const yUp = .7 * this.scale
            const yOft = quad(time) * cvs.height - boxH / 2 - yUp - cvs.height / 2

            ctx.fillStyle = '#111'
            ctx.fillRect(cvs.width / 2 - boxW / 2, yOft + yUp, boxW, boxH)

            ctx.strokeStyle = '#888'
            ctx.lineWidth = this.scale * .07
            ctx.strokeRect(cvs.width / 2 - boxW / 2 + pad, yOft + yUp + pad, boxW - pad * 2, boxH - pad * 2)

            makeButton(.53, 'USE LIVES [' + hero.upg.life.curr + ']', hero.upg.life.curr > 0)
            makeButton(.73, 'CONTINUE')

            if (this.giveUp <= 0) makeButton(.93, 'GIVE UP')
            else {
                this.giveUp -= dt
                if (this.giveUp < 1) this.giveUp = 1
                makeButton(.93, 'DON\'T GIVE UP', false, this.giveUp > 10)
            }

            if (time >= .6) {
                if (key.down) {
                    key.down = false
                    this.restartOption ++
                    if (this.restartOption > idx - 1) this.restartOption = 0
                }

                else if (key.up) {
                    key.up = false
                    this.restartOption --
                    if (this.restartOption < 0) this.restartOption = idx - 1
                }

                else if (key.right) {
                    key.right = false

                    const set = () => {
                        hero.dead = 0
                        hero.afterDeath = true
                        this.giveUp = 0
                        this.restartOption = 0
                    }

                    if (!this.restartOption && hero.upg.life.curr > 0) {
                        set()
                        hero.revive()
                    }
                    else if (this.restartOption == 1) {
                        set()
                        hero.respawn()
                    }
                    else if (this.restartOption == 2) {
                        this.giveUp = 30
                        zzfx(...[.5,,231,.03,.08,.12,,2.67,,,,,.09,1.8,,,.11,.49])
                    }
                }
            }

            ctx.textAlign = 'center'
            ctx.font = (this.scale / 2) + 'px font'
            drawText('DESTROYED', cvs.width / 2, yOft + boxH * .45, '#fff', '#b00')
            ctx.textAlign = 'left'
        }

        else if (hero.dead) {
            ctx.fillStyle = rgb(0, 0, 0, .5 - hero.dead / 60)
            ctx.fillRect(0, 0, cvs.width, cvs.height)
        }

        this.filter -= .025 * dt
        ctx.fillStyle = rgb(1, 1, 1, this.filter * .7)
        ctx.fillRect(0, 0, cvs.width, cvs.height)

        // START SCREEN
        if (this.start) {
            const drop = .02
            if (this.startClose) {
                this.startClose += drop * dt
                if (this.startClose > 1) {
                    this.startClose = 1
                    this.start = false
                }
            }

            const shift = quad(this.startClose)
            const fontSize = this.box * 1.4
            const charWidth = fontSize * .8
            const oft = this.box * .06

            const bg = .06
            ctx.fillStyle = rgb(bg, bg, bg, 1 - shift)
            ctx.fillRect(0, 0, cvs.width, cvs.height)

            // BORDERS
            const max = this.box * .001
            let time = this.startTime * .02
            if (time > 1) time = 1
            const slideIn = (quad(time) - shift) * cvs.width * max

            ctx.fillStyle = '#421'
            ctx.fillRect(0, 0, slideIn, cvs.height)
            ctx.fillRect(cvs.width, 0, -slideIn, cvs.height)

            const s = cvs.width * max * .4
            ctx.fillStyle = '#753'
            ctx.fillRect(slideIn, 0, -s, cvs.height)
            ctx.fillRect(cvs.width - slideIn, 0, s, cvs.height)

            // DESC
            const wait = 100
            const rise = (10 / (this.startTime - wait + 30)) * this.box

            ctx.textAlign = 'center'
            let a = (this.startTime - wait) / 100
            if (a > 1) a = 1
            ctx.fillStyle = rgb(.8, .8, .8, a - shift)
            ctx.font = (this.box * .5) + 'px font, sans-serif'
            ctx.fillText('By Joachim Ford', cvs.width / 2, this.box * 5.2 + rise)

            // LETTERS
            let x = cvs.width / 2 - (this.homeText.length + 1) * charWidth * .5
            ctx.font = fontSize + 'px startFont, sans-serif'

            const drawLetter = (letter, y, i) => {
                x += charWidth
                const Y = y * this.box * 4

                ctx.fillStyle = '#421'
                const w = this.box * .1
                ctx.fillRect(x - w / 2, 0, w, Y - charWidth)

                ctx.fillStyle = '#753'
                ctx.fillText(letter, x, Y)
                ctx.fillStyle = '#fff'
                if (!i) ctx.fillStyle = '#6f6'
                ctx.fillText(letter, x - oft, Y - oft * 2)
            }

            const reveal = 40
            for (let i = 0; i < this.homeText.length; i ++) {
                const item = this.homeText[i]
                const cap = reveal - rnd(0, reveal, i * 2) + i * 3
                drawLetter(item.char, item.y, i)
                if (this.startTime < cap) continue
            
                let goal = rnd(1, 1.2, i * i + 2)
                if (this.startClose > rnd(0, .5, i * 99)) goal = -1
                item.ySpeed += (goal - item.y) / 40 * dt
                item.ySpeed *= Math.pow(.9, dt)
                item.y += item.ySpeed * dt
            }

            let buttonY = 0
            let idx = 0
            const buttonW = this.box * 12
            const buttonH = this.box * 1.7
            const buttonGap = this.box * .5
            const buttonAppear = 150
            const buttonDifference = 5
            const buttonStatic = 25
            const buttonFade = .05

            const button = (text, func) => {
                const scrollOft = buttonAppear - idx * buttonDifference
                let scrolly = (this.startTime - scrollOft) * .2
                if (scrolly < 0) scrolly = 0

                let hover = false
                const yPos = 2.17
                const boxX = cvs.width / 2 - buttonW / 2
                const boxY = cvs.height / yPos + buttonY + (shift + quad(1 / (scrolly + 1))) * cvs.height

                const hoverMouse = collide(mouse, {x: boxX, y: boxY, w: buttonW, h: buttonH})
                if ((hoverMouse || this.startChoice == idx) &&
                    this.startTime > scrollOft + buttonStatic) {

                    if ((mouse.press || key.confirm) &&
                        this.startTime > scrollOft + 100)
                        func()

                    hover = true
                    key.confirm = false
                    this.startChoice = idx
                    if (hoverMouse) document.body.style.cursor = 'pointer'
                }

                let bob = 0
                if (hover) bob = Math.sin(this.dedication * 16) * this.box * .05
                const textY = boxY + buttonH * .65 + oft + bob

                ctx.fillStyle = '#432'
                ctx.fillRect(boxX + oft * 1.5, boxY + oft * 1.5, buttonW, buttonH)
                ctx.fillStyle = '#973'
                if (hover) ctx.fillStyle = '#ca6'
                ctx.fillRect(boxX, boxY, buttonW, buttonH)

                ctx.fillStyle = '#000'
                ctx.fillText(text, cvs.width / 2 + oft, textY + oft)
                ctx.fillStyle = '#fff'
                ctx.fillText(text, cvs.width / 2, textY)

                if (idx == this.startChoice) {
                    const size = buttonW * .05
                    ctx.fillStyle = '#000'
                    ctx.fillRect(
                        boxX + buttonW * .9 + oft,
                        boxY + buttonH / 2 - size / 2 + bob + oft,
                        size, size)
                    ctx.fillStyle = '#fff'
                    ctx.fillRect(
                        boxX + buttonW * .9,
                        boxY + buttonH / 2 - size / 2 + bob,
                        size, size)
                }

                ctx.fillStyle = rgb(bg, bg, bg, (buttonStatic - scrolly) * buttonFade)
                ctx.fillRect(boxX, boxY, buttonW + oft * 1.5, buttonH + oft * 1.5)

                idx ++
                buttonY += buttonH + buttonGap
            }

            ctx.font = (buttonH * .5) + 'px startFont, sans-serif'
            button('PLAY', () => {
                this.startClose += dt * drop
                if (!music.started && music.switchedOn) {
                    playMusic()
                    music.started = true
                }
            })

            if (music.switchedOn) button('SOUND: ON', () => music.switchedOn = false)
            else button('SOUND: OFF', () => music.switchedOn = true)

            ctx.font = (buttonH * .4) + 'px startFont, sans-serif'
            button('JOACHIMFORD.UK', () => window.open('https://joachimford.uk', '_blank'))

            if (key.up) {
                mouse.x = 0
                this.startChoice --
                key.up = false
            }
            if (key.down) {
                mouse.x = 0
                this.startChoice ++
                key.down = false
            }
            if (this.startChoice < 0) this.startChoice = 0
            if (this.startChoice >= idx) this.startChoice = idx - 1

            // DEDICATION
            const pause = 2.5
            this.dedication += .02 * dt
            let ded = this.dedication
            if (ded > 1) ded = 1
            let fadeOut = this.dedication - pause
            if (fadeOut < 0) fadeOut = 0
            if (this.dedication > pause + 2)
                this.startTime += dt

            ctx.fillStyle = rgb(0, 0, 0, (pause + 2) - this.dedication)
            ctx.fillRect(0, 0, cvs.width, cvs.height)

            ctx.font = (this.box) + 'px startFont, sans-serif'
            ctx.fillStyle = rgb(1, 1, 1, ded - fadeOut)
            ctx.fillText('To', cvs.width / 2, cvs.height / 2)
            ctx.fillText('@JeroenG', cvs.width / 2, cvs.height / 2 + this.box)

            ctx.textAlign = 'left'
        }

        mouse.press = false
    }

    onPad(x) {
        if (this.ending && x > this.ending) return false
        x -= this.padStartOft
        return x % this.padGap <= this.padSize && x > 0
    }

    nthPad(x) {
        x -= this.padStartOft / 2
        return Math.floor(x / this.padGap) + 1
    }

    bangOnPad(x) {
        if (this.ending && x > this.ending) return false
        x -= this.padStartOft
        return x % this.padGap == this.padSize && x > 0
    }

    update(dt) {
        const on = !this.shop && !this.start
        if (on) this.time += dt
        else if (this.shop) {
            if (this.shopClose) this.shopTime -= dt
            else this.shopTime += dt
        }
        const dayLength = this.time / 3000

        this.Z = .5 + Math.sin(dayLength) * .5
        if (this.ending && this.Z > .3) this.Z = .3
        const Z = this.Z

        let day = [.7, .9, 1]
        let night = [0, 0, 0]

        let xPos = Math.floor(this.dist(hero.x) / 300)
        if (xPos) {
            if (this.ending) xPos = 4
            const seedDay = 999 + xPos * xPos
            const seedNight = xPos + xPos * 345

            day = [
                rnd(.3, 1, seedDay),
                rnd(.3, 1, seedDay * seedDay),
                rnd(.3, 1, seedDay * seedDay * 99)]

            night = [
                rnd(0, .3, seedNight * 401),
                rnd(0, .3, seedNight * seedNight),
                rnd(0, .3, seedNight * seedNight * 99)]
        }

        const goal = [
            lerp(night[0],day[0],Z),
            lerp(night[1],day[1],Z),
            lerp(night[2],day[2],Z)]
        if (!this.bg.length) this.bg = goal

        const TRANSITION = 2000
        this.bg[0] += (goal[0] - this.bg[0]) / TRANSITION * dt
        this.bg[1] += (goal[1] - this.bg[1]) / TRANSITION * dt
        this.bg[2] += (goal[2] - this.bg[2]) / TRANSITION * dt

        ctx.fillStyle = rgb(this.bg[0], this.bg[1], this.bg[2])
        ctx.fillRect(0, 0, cvs.width, cvs.height)

        // sun and moon
        const oft = -cam.x / 2
        const sunSize = .5 * this.scale
        const sunWhole = cvs.width * 1.5
        ctx.fillStyle = rgb(lerp(.4,1,Z), lerp(.4,1,Z), lerp(.4,.5,Z), .4)
        ctx.fillRect(
            (((oft * this.scale) % sunWhole) + sunWhole) % sunWhole - sunSize,
            cvs.height / 2 - (cam.y + 1.5 + Z * 3) * this.scale,
            sunSize, sunSize)

        ctx.imageSmoothingEnabled = false
        document.body.style.cursor = 'default'

        this.weapons = []
        this.botRequests = []

        cam.update(dt)

        // INRO TEXT
        if (cam.x < 30) {
            ctx.font = (this.scale * .5) + 'px startFont, sans-serif'
            const pos = real(10, -2)
            const pos2 = real(-3, 1)
            drawText('SQUIRT THE ROBOTS!', pos.x, pos.y, '#ddd')
            drawText('CONTROL WITH WASD', pos2.x, pos2.y, '#ddd')
            drawText('OR ARROW KEYS', pos2.x, pos2.y + this.scale / 2, '#ddd')
        }

        else if (cam.x < 100) {
            ctx.font = (this.scale * .5) + 'px startFont, sans-serif'
            const pos = real(46, -2)
            drawText('A POWER STATION!', pos.x, pos.y + this.scale / 2, '#ddd')
        }

        // CLOUDS
        for (let i = 0; i < 15; i ++) {
            const zIdx = rnd(.5, .8, i * i * 99)
            const posX = i - cam.x * zIdx
            const width = 3 * zIdx
            const whole = cvs.width / this.scale + width
            const x = ((posX % whole + whole) % whole) - width

            ctx.fillStyle = rgb(1*Z, 1*Z, 1*Z, .1 + rndDec(i * i) * .2)
            ctx.fillRect(
                x * this.scale,
                real(0, rnd(CEILING, GROUND - 2, i)).y,
                width * this.scale, 1.5 * this.scale * zIdx)
            if (Z < .5) {
                let alpha = 1-Z*2
                if (alpha > .5) alpha = .5
                ctx.fillStyle = rgb(1, 1, 1, alpha)
                ctx.fillRect(
                    x * this.scale,
                    real(0, rnd(CEILING, GROUND - 2, i * i)).y,
                    zIdx / 8 * this.scale, zIdx / 8 * this.scale)
            }
        }

        // BOTS
        const spawn = .7
        const left = Math.floor(cam.x - cvs.width * spawn / this.scale)
        const right = Math.ceil(cam.x + cvs.width * spawn / this.scale)

        // Update
        for (let i = 0; i < this.bots.length; i ++) {
            const item = this.bots[i]
            if (on) item.update(dt)
            item.draw(dt)

            if ((!item.boss || item.eradicate) && (
                item.x <= left || item.x >= right) || item.life <= 0) {
                if (item.x <= left) hero.misses ++
                this.bots.splice(i, 1)
                i --
            }
        }

        // Placement
        if (on && this.oldRight < right && this.oldRight > left)
            for (let x = this.oldRight; x < right; x ++)
                this.makeBot(x)
        this.oldRight = right

        // Make spawn bots
        for (let i = 0; i < this.botRequests.length; i ++) {
            if (this.bots.length > 30) break

            const bot = this.botRequests[i]
            this.bots.unshift(new Bot(
                bot.x, bot.y, bot.type,
                item => {item.maxLife = hero.upg.damage.curr * 5}))
        }

        // PADS
        this.padOnScreen = false
        for (let x = left; x < right; x ++) {
            if (this.bangOnPad(x)) {
                this.padOnScreen = true

                const gray = .5
                const collided = hero.x + hero.w > x && hero.x < x + this.padSize
                if (collided) {
                    ctx.fillStyle = rgb(lerp(gray,0,Z),lerp(gray*1.5,1,Z),lerp(gray,.5,Z),.5)
                    hero.saveProgress()
                }
                else ctx.fillStyle = rgb(lerp(gray,0,Z),lerp(gray,1,Z),lerp(gray,0,Z),.3)
                fillRect(x, CEILING, this.padSize, GROUND - CEILING)

                ctx.fillStyle = rgb(.15, .15, .15)
                fillRect(x, GROUND, this.padSize, -this.padHeight)

                const draw = (X, w, h, yPos) => {
                    const yOft = quad(.5 + Math.sin(this.time / 6 + Math.floor(yPos)) * .5) * .5
                    fillRect(
                        X + x + this.padSize / 2 - w / 2,
                        GROUND - 2 + yPos + yOft, w, h)
                }

                const arrow = X => {
                    draw(X, .24, .3, 0)
                    draw(X, .52, .1, .3)
                    draw(X, .38, .1, .4)
                    draw(X, .24, .1, .5)
                    draw(X, .1, .1, .6)
                }

                if (collided) {
                    ctx.fillStyle = rgb(.4, 0, 0)
                    arrow(.7)
                    arrow(-.7)
                }
            }
        }
        
        // GROUND INFO
        const size = .8
        const x1 = Math.floor((cam.x - cvs.width / 2 / this.scale) / size)
        const x2 = Math.ceil((cam.x + cvs.width / 2 / this.scale) / size)
        const END = this.ending / size

        // Buildings
        if (END && x2 > END) {
            for (let x = x1; x < x2; x ++) {
                const s = rndDec(x) * .07
                if (x > END && s < .035) {
                    const o = lerp(.2, .4, Z) - s
                    const h = size * rnd(2, 10, x * x)

                    ctx.fillStyle = rgb(o, o, o)
                    fillRect(x * size, GROUND - h, size, h)

                    for (let i = 0; i < 10; i ++) {
                        if (rndDec(x+i*i)<.5) continue
                        const inc = 2
                        const gap = .35
                        const wind = .2
                        ctx.fillStyle = rgb(1, 1, 0, .3)
                        fillRect(
                            x * size + .125 + (i % inc) * gap,
                            GROUND - h + .15 + Math.floor(i / inc) * gap,
                            wind, wind)
                    }
                }
            }
        }

        // DEFEATED BOSS STONE
        if (hero.progress.length && hero.bossesDestroyed) {
            const x = hero.progress[0].x + 3
            if (cam.x < x + cvs.width / this.scale / 2) {
                this.fallRise += .01 * dt
                if (this.fallRise > 1) this.fallRise = 1
                const y = GROUND + 1.5 - quad(this.fallRise) * 1.5

                ctx.fillStyle = '#222'
                fillRect(x, y, -1, -1.5)
                ctx.fillStyle = '#bbb'
                ctx.textAlign = 'center'
                const pos = real(x - .5, y - 1.1)
                ctx.font = (this.scale / 4) + 'px font, sans-serif'
                ctx.fillText('BOSS', pos.x, pos.y)
                ctx.fillText('DEFE', pos.x, pos.y + this.scale / 4)
                ctx.fillText('ATED', pos.x, pos.y + this.scale / 2)
                ctx.textAlign = 'left'
            }
        }

        // HERO
        if (on) hero.update(dt)
        hero.draw(dt)

        // Mist
        if (this.mist) {
            this.mist += dt
            const slow = 1000
            if (this.mist > slow) this.mist = slow
            const alpha = this.mist / slow

            const add = .2
            const amt = 25

            for (let i = 0; i < amt; i ++) {
                const y = i * i * .01
                let a = (1 / i) * alpha
                if (!i) a = alpha

                ctx.fillStyle = rgb(1, 1, 1, a)
                const pos = real(0, GROUND - y - add)
                ctx.fillRect(0, pos.y, cvs.width, (y + add) * this.scale)
            }
        }

        // RED WARNING
        const hp = hero.smoothHealth / hero.upg.health.curr
        if (!hero.dead) {
            let a = .45 - hp
            if (a > .2) a = .2
            ctx.fillStyle = rgb(1, 0, 0, a * (.5 + Math.sin(this.time / 5) * .5))
            ctx.fillRect(0, 0, cvs.width, cvs.height)
        }

        // GROUND
        for (let x = x1; x < x2; x ++) {
            const s = rndDec(x) * .07
            const y = GROUND - rndDec(x * 2) * .1

            ctx.fillStyle = rgb(lerp(.1, .3, Z) + s, lerp(.1, .2, Z) + s, .1 + s)
            fillRect(x * size, y, size, 999)

            if (s < .03) {
                const bob = 1.5 + Math.sin(x * x + this.time / rnd(20, 90, x * x))

                const w = .05 + rndDec(x * 3) * .05
                const h = .05 + rndDec(x * 4) * .1
                ctx.fillStyle = rgb(s*Z, (.5 + s) * Z, s*Z)
                fillRect(x * size + size / 2 - w / 2, y, w, -h * bob)
            }

            if (s < .005) {
                const w = .8
                const h = .8
                const stalkW = .13
                const stalkH = rnd(.5, 1.5, x * 9)

                ctx.fillStyle = rgb(lerp(.1,.3,Z), lerp(.1,.2,Z), .1)
                fillRect(x * size + size / 2 - stalkW / 2, y, stalkW, -stalkH)

                ctx.fillStyle = rgb(0, lerp(.1,.4,Z), 0)
                fillRect(x * size + size / 2 - w / 2, y - stalkH, w, -h)
            }
        }

        if (on) {
            // PARTICLES
            for (let i = 0; i < this.particles.length; i ++) {
                const item = this.particles[i]
                if (item.text.length) {
                    item.alpha -= dt * item.fade
                    ctx.fillStyle = rgb(item.color[0],item.color[1],item.color[2],item.alpha)
                    ctx.font = (this.scale * item.size) + 'px font'
                    ctx.textAlign = 'center'
                    fillText(item.text, item.x, item.y)
                    ctx.textAlign = 'left'
                }

                else {
                    ctx.fillStyle = item.color
                    fillRect(item.x - item.size / 2, item.y - item.size / 2, item.size, item.size)
                }

                item.x += item.vx * dt
                item.y += item.vy * dt

                item.size -= item.shrink * dt
                if (item.size < 0 || item.alpha < 0) {
                    this.particles.splice(i, 1)
                    i --
                }
            }

            // ENEMY (AND WEAPON) COLLISION
            for (let i = 0; i < this.weapons.length; i ++) {
                const item = this.weapons[i]

                if (collide(item, hero) && !hero.dead) {
                    cam.boom(.2, 10)
                    hero.health -= item.damage
                    hero.impact = 1
                    zzfx(...[2,.1,99,,,.4,,,-2,-1,,,.04,.8,2,,.1,,,.22])
                    if (item.parent) item.parent.life -= .2

                    const dx = (hero.x + hero.w / 2) - (item.x + item.w / 2)
                    const dy = (hero.y + hero.h / 2) - (item.y + item.h / 2)

                    hero.vx += dx / 100 * dt
                    hero.vy += dy / 100 * dt
                }
            }

            // ENEMY BULLET COLLISION
            for (let i = 0; i < this.bad.length; i ++) {
                const item = this.bad[i]
                item.update(dt)

                if (collide(item, hero) && !hero.dead) {
                    hero.vx += item.vx / 5 * dt
                    hero.vy += item.vy / 5 * dt
                    hero.health -= item.damage
                    item.hit()
                    cam.boom(.1, 10)
                }

                if (item.x <= left || item.x >= right ||
                    item.life <= 0 || item.y < CEILING || item.y > GROUND ||
                    hero.shockWave) {
                    this.bad.splice(i, 1)
                    i --
                }
            }
        }

        // STATS
        hero.smoothMoney += (hero.money - hero.smoothMoney) / 7 * dt
        const pad = this.scale * .07
        const gap = this.scale * .15

        const width = this.scale * 3
        const height = this.scale * .4
        const spread = this.scale * .07

        ctx.fillStyle = '#111c'
        ctx.fillRect(gap, gap, width, height)
        ctx.fillRect(gap, gap + height + spread, width, height)
        ctx.fillRect(gap, gap + height * 2 + spread * 2, width, height)
        ctx.fillRect(gap, gap + height * 3 + spread * 3, width, height)

        const HP = hero.smoothHealth / hero.upg.health.curr
        const H = hero.impact
        const FLASH = .7 + Math.sin(this.time / 5) * .2
        ctx.fillStyle = rgb(lerp(FLASH,lerp(.2,.7,H),HP),lerp(.1,lerp(.6,.3,H),HP),lerp(.1,lerp(.33,.2,H),HP))

        ctx.fillRect(
            gap + pad, gap + pad,
            (width - pad * 2) * HP,
            height - pad * 2)

        ctx.fillStyle = '#35b'
        ctx.fillRect(
            gap + pad, gap + height + spread + pad,
            (width - pad * 2) * (1 - hero.regen),
            height - pad * 2)

        ctx.fillStyle = '#d90'
        ctx.font = (this.scale / 3) + 'px font'
        ctx.fillText(
            this.dist(hero.x) + 'm',
            gap + pad,
            gap + height * 2.6 + spread * 2 + pad)

        ctx.fillStyle = '#0d9'
        ctx.font = (this.scale / 3) + 'px font'
        ctx.fillText(
            CURRENCY + Math.ceil(hero.smoothMoney),
            gap + pad,
            gap + height * 3.8 + spread * 2 + pad)

        // SHOP
        const openSpeed = .03
        let yOft = (1 - this.shopTime * openSpeed)
        if (yOft < 0) yOft = 0
        if (yOft > 1) yOft = 1
        yOft = quad(yOft) * cvs.height

        if (this.shop) {
            ctx.font = (this.scale / 3) + 'px font'

            if (!this.cheapestScanned && this.cheapest.index >= 0) {
                this.shopIdx = this.cheapest.index
                this.cheapestScanned = true
            }

            let boxW = this.scale * 8
            const boxH = this.scale
            const boxGap = boxH * .2
            const boxRim = boxH * .07

            if (boxW > cvs.width)
                boxW = this.box * 15

            this.purchase -= .03 * dt
            this.shopSmoothIdx += (this.shopIdx - this.shopSmoothIdx) / 3 * dt
            let yScroll = this.shopSmoothIdx * (boxH + boxGap) - cvs.height / 2

            ctx.fillStyle = '#222'
            ctx.fillRect(0, yOft, cvs.width, cvs.height)

            const boxes = []
            const cheapest = {index: -1, quality: -1, price: -1}
            let idx = -1

            const exit = () => {
                idx ++

                boxes.push({desc: ['Press the right key to exit'], item: {reveal: 0}})
                const hover = this.shopIdx == idx

                const half = cvs.width / 2
                const boxX = half - boxW / 2
                const boxY = boxH + (idx - 1) * (boxH + boxGap) + yOft - yScroll

                if (boxY < yOft)
                    return

                ctx.fillStyle = '#0005'
                ctx.fillRect(boxX + boxGap / 2, boxY + boxGap / 2, boxW, boxH)
                ctx.fillStyle = '#141'
                if (hover) ctx.fillStyle = '#272'
                ctx.fillRect(boxX, boxY, boxW, boxH)
                ctx.fillStyle = '#151'
                if (hover) ctx.fillStyle = '#282'
                ctx.fillRect(boxX, boxY, boxW, boxH / 2)
                ctx.fillStyle = '#474'
                ctx.fillRect(boxX, boxY, boxW, boxRim)
                ctx.fillRect(boxX, boxY, boxRim, boxH)

                const arrow = (x, y) => {
                    const w = boxW * .045
                    const h = boxH * .2
                    const normX = boxX + boxW / 2 + x * this.scale
                    const normY = boxY + (y + .03) * this.scale + boxH / 2
                    const res = 4

                    ctx.fillRect(normX, normY - h / 2, w, h)

                    for (let i = 0; i < res; i ++) {
                        const segw = this.scale * .25 / res
                        const segh = (res - i) * boxH * .4 / res
                        ctx.fillRect(
                            normX + w + i * segw,
                            normY - segh / 2, segw, segh)
                    }
                }

                if (hover) {
                    ctx.fillStyle = '#010'
                    arrow(2.9,0)
                    ctx.fillStyle = '#7f7'
                    arrow(2.9,-.05)
                }

                ctx.textAlign = 'center'
                drawText('EXIT POWER STATION', boxX + boxW / 2, boxY + boxH * .65)
                ctx.textAlign = 'left'
            }

            const box = (text, key, desc) => {
                const item = hero.upg[key]
                if (hero.moneyMax < item.hide) return

                idx ++
                let afford = hero.money - item.price >= 0
                const hover = this.shopIdx == idx
                const reveal = hero.moneyMax >= item.reveal
                const maxUpg = item.curr >= item.max
                if (!reveal || maxUpg) afford = false

                if (afford &&
                    ((item.quality > cheapest.quality) || 
                    (item.quality == cheapest.quality && item.price < cheapest.price))) {

                    cheapest.index = idx
                    cheapest.quality = item.quality
                    cheapest.price = item.price
                }

                const recommend = idx == this.cheapest.index

                const half = cvs.width / 2
                let boxX = half - boxW / 2
                const boxY = boxH + (idx - 1) * (boxH + boxGap) + yOft - yScroll

                let purchase = Math.sin((1 - this.purchase) * 2 * Math.PI)
                if (purchase < 0) purchase = 0
                else if (purchase > 1) purchase = 1
                if (hover && this.purchase > 0) {
                    if (afford) boxX += quad(purchase) * this.scale * .5
                    else boxX += random(-.05, .05) * this.scale
                }

                boxes.push({desc, item})

                if (boxY < yOft)
                    return

                ctx.fillStyle = '#0005'
                ctx.fillRect(boxX + boxGap / 2, boxY + boxGap / 2, boxW, boxH)
                ctx.fillStyle = '#210'
                if (hover) ctx.fillStyle = '#543'
                ctx.fillRect(boxX, boxY, boxW, boxH)
                ctx.fillStyle = '#321'
                if (hover) ctx.fillStyle = '#654'
                ctx.fillRect(boxX, boxY, boxW, boxH / 2)
                ctx.fillStyle = '#765'
                ctx.fillRect(boxX, boxY, boxW, boxRim)
                ctx.fillRect(boxX, boxY, boxRim, boxH)

                if (hover && this.purchase) {
                    ctx.fillStyle = rgb(1, .85, .7, this.purchase / 3)
                    ctx.fillRect(boxX, boxY, boxW, boxH)
                }

                const arrow = (x, y) => {
                    const w = boxW * .045
                    const h = boxH * .2
                    const normX = boxX + boxW / 2 + x * this.scale
                    const normY = boxY + (y + .03) * this.scale + boxH / 2
                    const res = 4

                    ctx.fillRect(normX, normY - h / 2, w, h)

                    for (let i = 0; i < res; i ++) {
                        const segw = this.scale * .25 / res
                        const segh = (res - i) * boxH * .4 / res
                        ctx.fillRect(
                            normX + w + i * segw,
                            normY - segh / 2, segw, segh)
                    }
                }

                const shift = afford && hover && this.shopTime % 30 < 15
                const jump = .075

                if (afford) {
                    ctx.fillStyle = '#100'
                    if (hover) ctx.fillStyle = '#210'
                    if (shift) arrow(jump,0)
                    else arrow(0,0)

                    ctx.fillStyle = '#432'
                    if (hover) ctx.fillStyle = '#987'

                    if (shift) arrow(jump,-.05)
                    else arrow(0,-.05)

                    if (recommend) {
                        const oft = this.scale * .03
                        const size = boxH * .6
                        ctx.fillStyle = '#210'
                        ctx.fillRect(boxX + boxW * .96 + oft, boxY + boxH * .73 + oft, -size, boxH * .06)
                        ctx.fillStyle = '#050'
                        if (hover) ctx.fillStyle = '#0b0'
                        ctx.fillRect(boxX + boxW * .96, boxY + boxH * .73, -size, boxH * .06)
                    }
                }

                let col = '#fff'
                if (!afford) col = '#f55'

                if (!reveal) drawText('???', boxX + boxH / 3, boxY + boxH * .65, col)
                else drawText(text + Math.ceil(item.curr), boxX + boxH / 3, boxY + boxH * .65, col)

                const price = Math.ceil(item.price)
                ctx.textAlign = 'right'
                if (maxUpg) {
                    if (!afford) col = '#5f5'
                    item.curr = item.max
                    drawText('MAX', boxX + boxW * .96, boxY + boxH * .65, col)
                }
                else drawText(
                    CURRENCY + price,
                    boxX + boxW * .96,
                    boxY + boxH * .65, col)

                ctx.textAlign = 'left'
            }

            exit()
            box('REGEN: ', 'regen', ['How fast the copter can squirt'])
            box('SPEED: ', 'force', ['Particle movement speed'])
            box('HEAL: ', 'recover', ['Self-heal speed'])
            box('HEALTH: ', 'health', ['Max body strength'])
            box('BACK UP: ', 'backup', ['Double damage if copter', 'has < 50% health'])
            box('SHOCKWAVE: ', 'shockwave', ['Blast robots if copter', 'has < 20% health'])
            box('KNOCKBACK: ', 'knockback', ['Knocks robots away on impact'])
            box('MOVEMENT: ', 'move', ['Copter movement speed'])
            box('ARTILLERY: ', 'guns', ['Amount of particles', 'in every squirt'])
            box('DAMAGE: ', 'damage', ['Particle damage'])
            box('FREEZE: ', 'freeze', ['40% chance to freeze robots'])
            box('EXPLODE: ', 'explode', ['Particles multiply after', 'they squirt a robot'])
            box('BUDJET: ', 'cheap', ['All power-ups are 50% cheaper'])
            box('EXTRA LIFE: ', 'life', ['Instantly resurrect your', 'copter after death'])
            box('NPC: ', 'companion', ['A loyal friend', 'for times of need'])
            exit()

            this.cheapest = cheapest

            // DESCRIPTION BOX
            ctx.fillStyle = '#321'
            ctx.fillRect(0, yOft, cvs.width, this.scale)
            ctx.fillStyle = '#765'
            ctx.fillRect(0, yOft + this.scale, cvs.width, this.scale * .05)

            // DESCRIPTION STATS
            let slideIn = (this.shopTime - 10) / 50
            if (slideIn < 0) slideIn = 0
            if (slideIn > 1) slideIn = 1
            const slide = 3
            const textX = boxGap + quad(slideIn) * this.scale * slide - (this.scale * slide - 1)

            ctx.font = (this.scale / 3.5) + 'px font'
            ctx.fillStyle = '#210'
            ctx.fillRect(textX, yOft + this.scale / 4, this.scale * 2, this.scale / 2)
            ctx.fillStyle = '#7e7'
            ctx.fillText(CURRENCY + Math.ceil(hero.smoothMoney), textX + boxGap, yOft + boxGap * 3)

            // DESCRIPTION
            const item = boxes[this.shopIdx].item
            ctx.font = (this.scale / 3) + 'px font'
            if (this.scale * 7 > cvs.width)
                ctx.font = (this.box * .6) + 'px font'

            ctx.fillStyle = '#fff'
            ctx.textAlign = 'center'
            if (item && hero.moneyMax >= item.reveal) {
                const desc = boxes[this.shopIdx].desc

                for (let i = 0; i < desc.length; i ++) {
                    const amt = Math.sin(this.shopTime / 7 + Math.PI) * .8
                    const bob = quad(.5 + Math.sin(this.shopTime / 7 + i * 3) * .5) * this.scale * .03

                    drawText(
                        desc[i], cvs.width / 2,
                        yOft + this.scale * .85 + i * this.scale * .4 - this.scale * .2 * desc.length + bob,
                        rgb(1 + amt, 1, 1 + amt), '#000')
                }

                const LINEW = this.scale * 4
                const LINEH = this.scale * .05
                const GAP = this.scale * .03

                ctx.fillStyle = '#000'
                ctx.fillRect(
                    cvs.width / 2 - LINEW / 2 + GAP,
                    yOft + this.scale * .07 + GAP,
                    LINEW, LINEH)

                ctx.fillStyle = '#555'
                ctx.fillRect(
                    cvs.width / 2 - LINEW / 2,
                    yOft + this.scale * .07,
                    LINEW, LINEH)
            }
            else drawText('???', cvs.width / 2, yOft + this.scale * .65, '#fff', '#210')
            ctx.textAlign = 'left'

            // KEY DETECTION
            if (key.right && !this.shopClose) {
                key.right = false

                if (item.price) {
                    this.purchase = 1

                    if (Math.ceil(hero.money) - Math.ceil(item.price) >= 0 &&
                        hero.moneyMax > item.reveal && (
                        item.max && item.curr < item.max ||
                        !item.max)) {

                        hero.money -= item.price
                        item.curr += item.inc
                        item.price *= item.priceInc
                        if (hero.money < 0) hero.money = 0
                        if (item.command) item.command()

                        zzfx(...[.1,0,542,.01,,.26,1,,,.1,,,,,,,,.27,.03])
                    }

                    else zzfx(...[.1,,100,.01,.03,.17,1,2.79,,-1,,,,1.4,,.5,,.45,.03])
                }
                else {
                    this.shopClose = true
                    this.shopTime = 1 / openSpeed
                    hero.health = hero.upg.health.curr
                    zzfx(...[2,.1,50,.1,.11,.2,,1.3,,-.12,,,,.5,,,,.9,.06])
                }
            }

            if (key.up && !this.shopClose) {
                if (this.shopIdx <= 1) this.shopIdx = 1
                this.shopIdx --
                key.up = false
            }
            if (key.down && !this.shopClose) {
                this.shopIdx ++
                if (this.shopIdx > idx) this.shopIdx = idx
                key.down = false
            }

            if (this.shopTime < 0) {
                this.shopClose = false
                this.shopTime = 0
                this.shop = false
                hero.shopped = true
                this.shopSmoothIdx = 1
                this.shopIdx = 1
                this.cheapestScanned = false
                this.cheapest = {index: -1, quality: -1, price: -1}
            }
        }

        // QUESTS
        const speed = .002
        if (on) this.questTime += speed * dt

        let time3 = this.time * .01 - .3
        if (time3 > 1) time3 = 1
        let val = quad(time3) * 3 - 2
        if (time3 < .5) val = 0

        ctx.fillStyle = '#111c'
        const progressW = this.scale * 3.5
        let progressH = this.scale * .5

        if (this.ending) {
            let t = this.questTime * 80
            if (t > 1) t = 1
            progressH += quad(t) * this.scale * .4
        }

        // Progress box
        ctx.fillRect(
            cvs.width / 2 - progressW / 2,
            yOft - cvs.height + val * this.scale - this.scale,
            progressW, progressH)

        // Progress text
        let col = '#fff'
        let questProgressText = hero.sum + '/' + this.questNum

        if (this.questActive && time3 >= 1 && this.quest > 1) {
            questProgressText =
                CURRENCY + Math.floor(this.questReward) + ' REWARD!'

            col = rgb(1, .6, .3)
            if (this.time % 30 < 15) col = '#fff'
        }

        ctx.textAlign = 'center'
        ctx.font = (this.scale / 3) + 'px font'

        if (this.ending) {
            drawText('Thanks', cvs.width / 2,
                yOft - cvs.height + this.scale * .35 + val * this.scale - this.scale,
                col, '#000')

            drawText('for playing!', cvs.width / 2,
                yOft - cvs.height + this.scale * .7 + val * this.scale - this.scale,
                col, '#000')
        }

        else drawText(
            questProgressText,
            cvs.width / 2,
            yOft - cvs.height + this.scale * .35 + val * this.scale - this.scale,
            col, '#000')
        ctx.textAlign = 'left'

        this.questSpring.goal = 0
        if (this.questActive && !this.start) {
            let time = this.questTime
            if (time > 1.5 && !this.ending) this.questActive = false
            if (time < 1.3) this.questSpring.goal = 1

            const questW = this.scale * 4.5
            const questH = this.scale * 1.5
            let questGap = this.scale * .2
            if (cvs.width < cvs.height) questGap += progressH
            const questY = yOft + (this.questSpring.y - 1) * (questH + questGap) + questGap - cvs.height

            ctx.fillStyle = '#222'
            ctx.fillRect(cvs.width, questY, -questW, questH)

            const mgn = this.scale * .1
            ctx.lineWidth = this.scale * .05
            ctx.strokeStyle = '#c94'
            ctx.strokeRect(
                cvs.width - mgn,
                questY + mgn,
                -questW + mgn * 2,
                questH - mgn * 2)

            ctx.textAlign = 'center'
            ctx.font = (this.scale / 2) + 'px font'

            if (this.ending) drawText(
                'COMPLETED',
                cvs.width - questW / 2,
                questY + questH * .45,
                '#fff', '#840')

            else drawText(
                'QUEST ' + this.quest + '/' + (Math.ceil(this.quest / 10) * 10),
                cvs.width - questW / 2,
                questY + questH * .45,
                '#fff', '#840')
            ctx.font = (this.scale / 3.5) + 'px font'

            if (this.boss) {
                let color = '#fff'
                if (this.time % 30 < 15) color = '#f00'
                drawText(
                    'SQUIRT THE BOSS!!!',
                    cvs.width - questW / 2,
                    questY + questH * .75,
                    color, '#000')
            }

            else if (this.ending) {
                drawText('in ' + this.playTime + ' minutes',
                cvs.width - questW / 2, questY + questH * .75,
                '#fff', '#000')

                this.questSpring.goal = 1
            }

            else drawText(
                'SQUIRT ' + this.questNum + ' ROBOTS!',
                cvs.width - questW / 2, questY + questH * .75,
                '#fff', '#000')

            ctx.textAlign = 'left'
        }

        this.questSpring.v += (this.questSpring.goal - this.questSpring.y) / 20 * dt
        this.questSpring.v *= Math.pow(.8, dt)
        if (this.questSpring.v > 0 && !this.questSpring.goal) this.questSpring.v = 0
        this.questSpring.y += this.questSpring.v * dt

        if (hero.money > hero.moneyMax)
            hero.moneyMax = hero.money

        if (!this.ending) this.playTime = Math.ceil(performance.now() / 60000)
        this.overlay(dt,yOft)
    }
}