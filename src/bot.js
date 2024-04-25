'use strict'

class Bot {
    constructor(x, y, type = 'auto', func = bot => {}, phase = 'auto') {
        this.x = x
        this.y = y
        this.w = 1
        this.h = 1
        this.w2 = 1
        this.h2 = 1

        this.freeze = [.7, .8, .9]
        this.norm = [.2, .2, .2]

        this.c = this.norm
        this.l = [.2, .5, .7]

        this.velChangeTime = 0
        this.velChangeAmt = 0
        this.velAttract = 0
        this.velChange = 0
        this.swingVel = 0
        this.swingOft = 0
        this.armLen = 0
        this.vDirX = 0
        this.vDirY = 0
        this.value = 0
        this.life = 0
        this.vx = 0
        this.vy = 0

        this.baseX = this.x
        this.baseY = this.y

        this.frozen = 0
        this.smoothFrozen = 0

        this.joins = [
            (pos, dt, O) => this.pole(pos, dt, O),
            (pos, dt, O) => this.arm(pos, dt, O),
            (pos, dt, O) => this.gear(pos, dt, O)
        ]
        this.ends = [
            (pos, dt, O) => this.drill(pos, dt, O),
            (pos, dt, O) => this.claw(pos, dt, O),
            (pos, dt, O) => this.gear(pos, dt, O),
            (pos, dt, O) => this.gun(pos, dt, O),
            (pos, dt, O) => this.gun(pos, dt, O),
        ]

        this.upg = []
        this.toAngle = 0
        this.time = random(0, 10)

        this.noz = 0
        this.gunRegen = 20
        this.gunShoot = this.gunRegen

        this.random = rnd(0, 1, this.x * this.x * 99)

        this.spawnFreq = 100
        this.spawnTime = this.spawnFreq
        this.spawnable = false
        this.spawns = 0

        this.hit = false
        this.boss = false

        this.ray = 0
        this.rayStop = false

        this.phase = phase
        this.type = type

        // RESTICT PHASE
        this.eradicate = false

        this.generate()
        func(this)

        this.life = this.maxLife
        this.smoothLife = this.life
        this.healthBar = this.life
    }

    spawnABot() {
        game.botRequests.push({x: this.x, y: this.y, type: 0})
    }

    arm(pos, dt, O) {
        const w = this.armLen + rnd(-.5, .3, O * 999 + this.random * 999)
        const h = .15

        const x = this.x + pos.x
        const y = this.y + pos.y
        ctx.strokeStyle = rgb(.2, .2, .2)
        const newPos = rot(x, y, w, h, 0, 0, this.time * this.swingVel)
        const newPos2 = rot(newPos.x, newPos.y, w, h, 0, 0, this.time * this.swingVel * this.swingOft)

        return {x: newPos2.x - this.x, y: newPos2.y - this.y, a: newPos2.ang}
    }

    pole(pos, dt, O) {
        const w = this.armLen / 5
        const h = .15

        const x = this.x + pos.x
        const y = this.y + pos.y
        let newPos = 0
        for (let i = 3; i --;) {
            const shrink = 1 + i / 2
            const W = w * shrink * (1 + Math.sin(this.time) * .7)
            const s = .15 - i / 8
            ctx.strokeStyle = rgb(s, s, s)
            const new2 = rot(
                x, y, W, h / shrink,
                0, 0, this.time * this.swingVel + O)
            if (i == 2) newPos = new2
        }

        return {x: newPos.x - this.x, y: newPos.y - this.y}
    }

    gear(pos, dt, O) {
        const size = 1
        const mid = .3
        const spikes = 3
        const w = .1
        const h = .1
        const speed = this.time * 8

        const x = this.x + pos.x
        const y = this.y + pos.y

        ctx.strokeStyle = rgb(.1, .1, .1)
        const newPos = rot(x, y, size, size, -size /  2, -size / 2, speed)

        for (let i = 0; i < spikes; i ++) {
            ctx.strokeStyle = rgb(.15, .15, .15)
            const oft = i * (size / spikes)
            const gap = (1 / spikes) / 2
            rotAhr(x - size / 2, y - size / 2 + oft + gap, -h, w, x, y, speed)
            rotAhr(x + size / 2, y - size / 2 + oft + gap, h, w, x, y, speed)
            rotAhr(x - size / 2 + oft + gap / 2, y - size / 2 - h / 2, h, w, x, y, speed)
            rotAhr(x - size / 2 + oft + gap / 2, y + size / 2 + h / 2, h, w, x, y, speed)
        }

        ctx.strokeStyle = rgb(.25, .25, .25)
        rot(x, y, mid, mid, -mid /  2, -mid / 2, speed)

        game.weapons.push({x: x - size / 2, y: y - size / 2, w: size, h: size, damage: .5})

        return {x: newPos.x - this.x, y: newPos.y - this.y}
    }

    claw(pos, dt, O) {
        const x = this.x + pos.x
        const y = this.y + pos.y
        const w = .5
        const h = 1
        const w2 = .3
        const h2 = .7
        const dx = (hero.x + hero.w / 2) - x
        const dy = (hero.y + hero.h / 2) - y
        const angle = Math.atan2(dy, dx)

        const ang = angle + 1.7 + Math.sin(this.time * 3) * .5
        const snap = .4 + quad(.5 + Math.sin(this.time * (6 + this.random * 6)) * .5) * .8

        ctx.strokeStyle = rgb(.25, .2 + this.random * .05, .09 + this.random * .14)
        rotAhr(x, y - h2 / 2, w2, h2, x, y, ang - snap)
        ctx.strokeStyle = rgb(.2, .15 + this.random * .05, .04 + this.random * .16)
        rotAhr(x, y - h / 2, w, h, x, y, ang)

        game.weapons.push({x: x - w / 2, y: y - h / 2, w: 1, h: 1, damage: 1})
    }

    drill(pos, dt, O) {
        const x = this.x + pos.x
        const y = this.y + pos.y
        const w = .5
        const h = 1
        const a = this.toAngle + 1.4

        ctx.strokeStyle = rgb(0, 0, 0)
        rotAhr(x - .05, y - .3, .1, .6, x, y, a)

        for (let i = 0; i < 5; i ++) {
            let s = Math.sin(i / 3 + this.time * 10) - .75
            if (s < 0) s = 0
            ctx.strokeStyle = rgb(.1 + s, .1 + s, .1 + s)
            const w = .6 + i / 15
            rotAhr(
                x - w / 2,
                y - i * .15 + Math.sin(this.time * 5 + i / 5) * .1 - .1,
                w, .13, x, y, a + rnd(0, .1, this.time + i))
        }

        game.weapons.push({x: x - w, y: y - h / 2, w: 1, h: 1, damage: .5})
    }

    gun(pos, dt, O) {
        const thick = .3
        const len = .7
        const size = .2

        const x = this.x + pos.x
        const y = this.y + pos.y
        ctx.strokeStyle = rgb(.2, .2, .2)
        rotAhr(x, y - len / 2, thick, len, x, y, this.toAngle + 1.4)
        ctx.strokeStyle = rgb(.3, .3, .3)
        this.noz = rotAhr(x + thick / 2 - size / 2, y - len - size / 4, size, size / 2, x, y, this.toAngle + 1.4)

        this.gunShoot -= dt
    }

    createProx(type) {
        // Amount of proximities
        let prox = 1 + Math.floor(type / 10)
        if (prox > 4) prox = 4

        // Extend arms
        for (let i = 0; i < prox; i ++) {
            const arr = [
                rnd(this.w * .1, this.w * .9, this.x + i * i),
                rnd(this.h * .1, this.h * .9, this.x + i * 99)]

            if (!this.phase) {
                const choice = Math.floor(rnd(0, 4, this.x + i * i * 999))
                if (choice == 0) arr[0] = this.w * .1
                if (choice == 1) arr[0] = this.w * .9
                if (choice == 2) arr[1] = this.h * .1
                if (choice == 3) arr[1] = this.h * .9
            }
            else if (this.phase == 1) {
                arr[1] = this.h * rnd(.7, .8, i * i + this.x * 99)

                const seed = this.x + i * i * 500
                const choice = Math.floor(rnd(0, 2, this.x + i * i * 999))
                if (choice) arr[0] = this.w * rnd(.1, .2, seed)
                else arr[0] = this.w * rnd(.8, .9, seed)
            }

            let segments = 4 + Math.floor(rnd(0, 5, type + type * i * 17) * this.x * .002)
            if (segments > 4) segments = 4

            for (let j = 2; j < segments; j ++) {
                if (j < segments - 1) {
                    let join = type / 3
                    if (join > this.joins.length - 1) join = this.joins.length - 1
                    arr.push(this.joins[Math.round(rnd(0, join, this.x + this.x * i * j * 60))])
                }
                else {
                    let end = 1 + type / 3
                    if (end > this.ends.length - 1) end = this.ends.length - 1
                    arr.push(this.ends[Math.round(rnd(0, end, this.x + this.x * i * j * 99))])
                }
            }

            this.upg.push(arr)
        }
    }

    generate() {
        // Enemies get worse much more gradually if you haven't destroyed all of them
        const MISSX = this.x - hero.misses

        if (this.phase == 'auto')
            this.phase = Math.floor(rnd(0, hero.bossesDestroyed + .5, MISSX + MISSX * 999))
        // Type ranges from newest to oldest
        if (this.type == 'auto') {
            this.type = Math.floor(rnd(0, MISSX / 40, MISSX * MISSX))
            this.type -= this.phase * 10
            if (this.type < 0) this.type = 0
        }

        this.phase = this.phase % MAXPHASES

        const size = rnd(.7, 1.2, this.type * this.type + 40)
        this.w = size
        this.h = size

        if (this.phase == 1) {
            this.w = size * 1.7
            this.h = size * .8
        }

        this.w2 = this.w + 2.5
        this.h2 = this.h + 2.5

        // How strong it is
        this.maxLife = Math.ceil(this.type / 1.45) + 1 + this.phase * (100 + this.type * 10)
        this.value = Math.ceil(this.type * 1.2) + 1 + this.phase * 100

        let saturation = .2
        if (this.phase == 1) saturation = .05
        this.c = [
            .2 + rndDec(this.type+2)*saturation,
            .2 + rndDec(this.type)*saturation,
            .2 + rndDec(this.type+1)*saturation]

        if (this.type > 0) {
            // How fast it moves in a direction
            this.velChangeAmt = this.type / (1300 / (this.phase + 1))
            if (this.velChangeAmt > .036) this.velChangeAmt = .036

            // How often it changes direction
            let change = 200 - this.type * 10
            if (change < 30) change = 30
            this.velChangeTime = change + rnd(0, 50, this.type * 45)
        }

        // How fast it moves towards player
        if (this.type > 7) {
            this.velAttract = (this.type - 7) / 1300
            if (this.velAttract > .02) this.velAttract = .02
            if (this.phase) this.velAttract = .015
        }

        // How long the arm segments are
        this.armLen = 1 + this.type * .001 * rnd(.5, 1, this.type * 37)
        if (this.armLen > 1.5) this.armLen = 1.5

        // How fast it swings its proximities
        this.swingVel = 1 + this.type * .03 * rnd(.6, 1, this.type * 9)
        if (this.swingVel > 3) this.swingVel = 3

        // The increased swing of its weapons they get longer
        this.swingOft = 2 + this.type * .05 * rnd(.6, 1, this.type * 30)
        if (this.swingOft > 5) this.swingOft = 5

        this.createProx(this.type)

        // Set gun regen
        this.gunRegen = 100 - this.type * 5 * ((this.phase * 5) + 1)
        if (this.gunRegen < 15) this.gunRegen = 15

        // Set spawnable
        if (this.type > 10 && !Math.floor(rnd(0, 3, MISSX + MISSX * 157))) {
            this.spawnable = true
            this.spawnFreq = 300 - this.type * 10
            if (this.spawnFreq < 30) this.spawnFreq = 30
            this.spawnTime = this.spawnFreq
        }
    }

    update(dt) {
        const dx = (hero.x + hero.w / 2) - (this.x + this.w / 2)
        const dy = (hero.y + hero.h / 2) - (this.y + this.h / 2)
        this.toAngle = Math.atan2(dy, dx)

        this.frozen -= (1 + this.phase * 3) * dt
        if (this.frozen < 0) this.frozen = 0

        if (this.spawnable) {
            this.spawnTime -= dt
            if (this.spawnTime < 0) {
                this.spawns ++
                this.spawnABot()
                this.spawnTime = this.spawnFreq
            }
        }

        // BULLETS
        if (this.gunShoot < 0) {
            const speed = .1
            const item = {
                x: this.noz.x,
                y: this.noz.y,
                vx: Math.cos(this.toAngle),
                vy: Math.sin(this.toAngle),
                w: .15,
                h: .15,
                life: 200,
                spark: 0,
                damage: 5,
            }

            item.update = dt => {
                item.life -= dt
                item.x += item.vx * speed * dt
                item.y += item.vy * speed * dt
                item.spark -= dt
                if (item.spark < 0) {
                    game.cloud(item.x, item.y, item.w, item.h, .1, 1, '#e62', .01, .01)
                    item.spark = 6
                }

                const GRAY = .7
                const TIMER = 7
                let range = game.Z*TIMER
                if (range < 0) range = 0
                if (range > 1) range = 1
                ctx.fillStyle = rgb(
                    lerp(GRAY,0,range),
                    lerp(GRAY,0,range),
                    lerp(GRAY,0,range))
                fillRect(item.x, item.y, item.w, item.h)
            }

            item.hit = () => item.life = 0

            game.bad.push(item)
            this.gunShoot = this.gunRegen
        }

        // MOVEMENT
        this.velChange -= dt
        if (this.velChange < 0) {
            this.vDirX = random(-this.velChangeAmt, this.velChangeAmt)
            this.vDirY = random(-this.velChangeAmt, this.velChangeAmt)
            this.velChange = this.velChangeTime
        }

        let ang = 0
        if (!this.phase) ang = Math.atan2(
            hero.y - this.y, hero.x + hero.w / 2 - this.x - this.w / 2)

        else if (this.phase == 1) {
            ang = Math.atan2(hero.y - 2.5 - this.y, hero.x + hero.w / 2 - this.x - this.w / 2)
            const bobLag = .2
            this.vy += Math.sin(this.time / bobLag) * (.0005 / bobLag)

            // If hovering over hero
            const rng = 1.7
            if (!hero.dead &&
                this.y < hero.y &&
                this.y > hero.y - 4 &&
                this.x > hero.x - rng &&
                this.x + this.w < hero.x + hero.w + rng) {

                this.ray += dt
                hero.vy += .005 * dt
                hero.health -= hero.upg.recover.curr * .1 * dt
                cam.boom(.01, 1)
                this.rayStop = false
            }
            else {
                this.ray -= dt
                this.rayStop = true
            }
        }

        const moveX = Math.cos(ang)
        const moveY = Math.sin(ang)

        if (!this.frozen) {
            this.vx += moveX * this.velAttract
            this.vy += moveY * this.velAttract
        }

        if (hero.shockWave && !this.boss) {
            this.vx -= (moveX + Math.abs(moveY)) * hero.upg.shockwave.curr
            this.vy -= moveY * hero.upg.shockwave.curr
            this.life = this.life / 4 - hero.upg.shockwave.curr * 2
        }

        if (this.y > GROUND - this.h) {
            this.vy -= (this.y + this.h - GROUND) / 10 * dt
            this.vDirY = -this.velChangeAmt
        }
        if (this.y < CEILING) {
            this.vy -= (this.y - CEILING) / 10 * dt
            this.vDirY = this.velChangeAmt
        }

        if (this.frozen) {
            this.vDirX = 0
            this.vDirY = 0
        }

        this.vx += this.vDirX * dt
        this.vy += this.vDirY * dt
        this.vx *= Math.pow(.9, dt)
        this.vy *= Math.pow(.9, dt)

        this.x += this.vx * dt
        this.y += this.vy * dt

        if (this.boss) {
            if (hero.x > this.x - 2)
                hero.x -= (hero.x - (this.x - 2)) / 5

            this.x += (this.baseX - this.x) / (15 / (hero.upg.knockback.curr + 1))
            this.y += (this.baseY - this.y) / (15 / (hero.upg.knockback.curr + 1))
        }

        if (this.life <= 0) {
            zzfx(...[2.3,.5,60,.01,.1,.12,,,,,,,.03,.8,.5,,,.5,.1])

            // Prevent hero.sum from increasing when defeating boss-spawned enemies
            if (!game.boss) hero.sum ++
            hero.money += this.value

            if (!hero.first) {
                game.questActive = true
                zzfx(...[.2,0,445,.01,.1,.26,,20,,,128,.1,,,,,,.5,.2,.1])
            }
            hero.first = true

            // If the destroyed enemy was a boss
            if (this.boss) {
                game.boss = false
                game.killedBoss = true
                hero.shockWave = true
                hero.afterDeath = true
                hero.sum ++
                hero.bossesDestroyed ++
                game.cloud(this.x, this.y, this.w, this.h, 3, 10, '#9229', .1, .01)

                cam.boom(.2, 20)
            }

            if (this.frozen) {
                game.cloud(this.x, this.y, this.w, this.h, .17, 10, '#fff', .05, .01)
                game.cloud(this.x, this.y, this.w, this.h, 1, 1, '#fff5', 0, .04)
                game.cloud(this.x, this.y, this.w, this.h, .1, 5, '#99f', 0, .02)
            }

            else {
                game.cloud(this.x, this.y, this.w, this.h, .17, 10, '#333', .05, .01)
                game.cloud(this.x, this.y, this.w, this.h, 1, 1, '#3335', 0, .04)
                game.cloud(this.x, this.y, this.w, this.h, .1, 5, '#b50', 0, .02)
            }

            game.cloud(this.x, this.y, this.w, this.h, .5, 1, [0, 0, 0], 0, -.01, '+' + this.value, .02)
            cam.boom(.1, 10)
        }

        game.weapons.push({
            x: this.x, y: this.y,
            w: this.w, h: this.h,
            damage: this.life / (this.phase * 20 + 1) / 3, parent: this})
    }

    draw(dt) {
        if (!game.shop && !this.frozen) this.time += .01 * dt
        const jud = Math.sin(this.time * 60) * .01
        const y = this.y + jud

        const drawProx = () => {
            for (let i = 0; i < this.upg.length; i ++) {
                const prox = this.upg[i]
                let pos = {x: prox[0], y: prox[1] + jud}

                // Iterate through all segments
                for (let j = 2; j < prox.length; j ++) {
                    const newPosition = prox[j](pos, dt, 99+(i+j)*99)
                    pos = newPosition
                }
            }
        }

        // HEALTH BAR
        if (this.life && this.life < this.maxLife && !this.boss) {
            this.smoothLife += (this.life - this.smoothLife) / 3 * dt
            this.healthBar += (this.life - this.healthBar) / 10 * dt

            let life = this.maxLife - this.healthBar
            if (life < 0) life = 0
            if (life > 1) life = 1

            const healthHover = quad(life) * .2
            const pad = .03

            ctx.fillStyle = '#222'
            fillRect(this.x, y - healthHover, this.w, .1)
            ctx.fillStyle = '#262'
            fillRect(
                this.x + pad,
                y - healthHover + pad,
                (this.w - pad * 2) * (this.smoothLife / this.maxLife),
                .1 - pad * 2)
        }

        if (!this.phase) {
            // BODY
            this.smoothFrozen += (this.frozen - this.smoothFrozen) / 20 * dt
            ctx.fillStyle = rgb(
                lerp(this.c[0],this.freeze[0],this.smoothFrozen/20),
                lerp(this.c[1],this.freeze[1],this.smoothFrozen/20),
                lerp(this.c[2],this.freeze[2],this.smoothFrozen/20))
            fillRect(this.x, y, this.w, this.h)

            const small = .6
            ctx.fillStyle = rgb(this.l[0],this.l[1],this.l[2],.5)
            fillRect(
                this.x + this.w * (1 - small) / 2,
                y + this.h * (1 - small) / 2,
                this.w * small, this.h * small)

            ctx.fillStyle = rgb(1, 1, 1,.3)
            fillRect(
                this.x + this.w * (1 - small) / 2 + .05 + quad(.5 + Math.sin(this.vx * 5) * .5) * .2,
                y + this.h * (1 - small) / 2,
                .15, this.h * small)

            if (this.hit > 0) {
                ctx.fillStyle = rgb(.7, .2, .2, .5 * this.hit)
                fillRect(this.x, y, this.w, this.h)

                this.hit -= .2 * dt
            }

            drawProx()
        }

        if (this.phase == 1) {
            const windowW = this.w * .45
            const windowH = this.h * .65
            const bodyH = this.h - windowH
            const pad = .13

            // ARM THINGIES
            ctx.strokeStyle = '#222'
            const long = .4
            const fat = .11
            const ang1 = 2.5
            const ang2 = 1
            const gap = .3

            const Y = y + this.h - .1
            const P1 = rot(this.x + this.w * gap, Y, long, fat, 0, 0, ang1)
            rot(P1.x, P1.y, long, fat, 0, 0, ang2)
            const P2 = rot(this.x + this.w * (1 - gap), Y, long, fat, 0, 0, Math.PI - ang1)
            rot(P2.x, P2.y, long, fat, 0, 0, Math.PI - ang2)

            // RAY
            const raySpeed = 50
            if (this.ray < 0) this.ray = 0
            if (this.ray > raySpeed) this.ray = raySpeed

            if (this.ray > 0) {
                const pos = real(this.x + this.w / 2, y + this.h)

                let amt = this.ray / raySpeed + .3
                if (amt > 1) amt = 1

                const raySize = 1.3
                const grow = game.scale * quad(amt) * raySize
                const gX = grow * .9
                const gY = grow * 2
                const start = 8

                ctx.fillStyle = rgb(0, 1, 0, amt / 4)
                ctx.moveTo(pos.x - gX / start, pos.y)
                ctx.lineTo(pos.x + gX / start, pos.y)
                ctx.lineTo(pos.x + gX, pos.y + gY)
                ctx.lineTo(pos.x + gX / 2, pos.y + gY * 1.1)
                ctx.lineTo(pos.x - gX / 2, pos.y + gY * 1.1)
                ctx.lineTo(pos.x - gX, pos.y + gY)
                ctx.lineTo(pos.x - gX / start, pos.y)
                ctx.fill()

                const rays = 5
                for (let i = 0; i < rays; i ++) {
                    const yPos = ((i / rays + this.time) % 1 + 1) % 1
                    const w = yPos * 1.4
                    ctx.fillStyle = rgb(0, .4, 0, quad(yPos * 2) / 2 - (1 - amt))
                    fillRect(this.x + this.w / 2 - w / 2, y + this.h + yPos * 2, w, .1)
                }

                if (this.rayStop) this.ray -= dt
                else this.ray += dt
            }

            // BODY
            this.smoothFrozen += (this.frozen - this.smoothFrozen) / 50 * dt
            ctx.fillStyle = rgb(
                lerp(this.c[0],this.freeze[0],this.smoothFrozen/50),
                lerp(this.c[1],this.freeze[1],this.smoothFrozen/50),
                lerp(this.c[2],this.freeze[2],this.smoothFrozen/50))
            fillRect(this.x, y + this.h - bodyH, this.w, bodyH)

            // WINDOW
            fillRect(this.x + this.w / 2 - windowW / 2, y, windowW, windowH)

            ctx.fillStyle = rgb(this.l[0],this.l[1],this.l[2],.5)
            fillRect(
                this.x + this.w / 2 - windowW / 2 + pad,
                y + pad,
                windowW - pad * 2, windowH - pad)

            ctx.fillStyle = rgb(1, 1, 1,.3)
            fillRect(
                this.x + this.w * .4,
                y + pad,
                .15, windowH - pad)

            // HIT COLOR
            if (this.hit > 0) {
                ctx.fillStyle = rgb(.7, .2, .2, .5 * this.hit)
                fillRect(this.x, y + this.h - bodyH, this.w, bodyH)

                this.hit -= .2 * dt
            }

            drawProx()
        }
    }
}