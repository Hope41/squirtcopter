'use strict'

class Camera {
    constructor() {
        this.x = 0
        this.y = 0
        this.vx = 0
        this.vy = 0

        this.goal = hero
        this.booms = []
    }

    boom(amt, time) {
        this.booms.push({amt, time})
    }

    update(dt) {
        for (let i = 0; i < this.booms.length; i ++) {
            const item = this.booms[i]
            item.time -= dt
            this.x += random(-item.amt, item.amt)
            this.y += random(-item.amt, item.amt)
            if (item.time < 0)
                this.booms.splice(i, 1)
        }

        const followX = .1
        const followY = .05

        this.vy += (this.goal.y + this.goal.h / 2 - this.y) * followY * dt
        this.vx += (this.goal.x + this.goal.w / 2 - this.x) * followX * dt
        this.vx *= Math.pow(.8, dt)
        this.vy *= Math.pow(.8, dt)
        this.y += this.vy * dt
        this.x += this.vx * dt

        const top = CEILING + cvs.height / 2 / game.scale
        if (this.y < top)
            this.y = top
    }
}