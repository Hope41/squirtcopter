'use strict'

function triangle(x) {
    return 2 * Math.abs((((x - .5) % 2) + 2) % 2 - 1) - 1
}

function quad(x) {
    return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2
}

function lerp(a, b, x) {
    return a + x * (b - a)
}

function collide(a, b) {
    return (
        a.x < b.x + b.w &&
        a.x + a.w > b.x &&
        a.y < b.y + b.h &&
        a.y + a.h > b.y)
}

function offScreen(a, multiply = 1) {
    const b = real(a.x, a.y)
    const w = a.w * game.scale
    const h = a.h * game.scale
    const gapX = cvs.width * (multiply - 1)
    const gapY = cvs.height * (multiply - 1)
    return (
        b.x + w < -gapX ||
        b.x > cvs.width + gapX ||
        b.y + h < -gapY ||
        b.y > cvs.height + gapY)
}

function real(x, y) {
    x = (x - cam.x) * game.scale + cvs.width / 2
    y = (y - cam.y) * game.scale + cvs.height / 2
    return {x, y}
}

function fake(x, y) {
    x = (x - cvs.width / 2) / game.scale + cam.x,
    y = (y - cvs.height / 2) / game.scale + cam.y
    return {x, y}
}

function rot(x, y, w, h, X, Y, a = 0) {
    const r = real(
        x + Math.cos(a) * X,
        y + Math.sin(a) * Y)
    const goal = {
        x: r.x + Math.cos(a) * w * game.scale,
        y: r.y + Math.sin(a) * w * game.scale
    }

    ctx.lineWidth = h * game.scale

    ctx.beginPath()
    ctx.moveTo(r.x, r.y)
    ctx.lineTo(goal.x, goal.y)
    ctx.stroke()

    return fake(goal.x, goal.y)
}

function rotAroundAhr(x, y, X, Y, ang) {
    const cos = Math.cos(-ang)
    const sin = Math.sin(-ang)
    const distX = x - X
    const distY = y - Y

    const newX = (cos * distX) + (sin * distY) + X
    const newY = (cos * distY) - (sin * distX) + Y

    return {x: newX, y: newY}
}

function rotAhr(x, y, w, h, X, Y, a = 0) {
    const pos = rotAroundAhr(x, y, X, Y, a)
    const r = real(pos.x, pos.y)

    const goal = {
        x: r.x + Math.cos(a) * w * game.scale,
        y: r.y + Math.sin(a) * w * game.scale
    }

    ctx.lineWidth = h * game.scale

    ctx.beginPath()
    ctx.moveTo(r.x, r.y)
    ctx.lineTo(goal.x, goal.y)
    ctx.stroke()

    return fake(goal.x, goal.y)
}

function fillText(text, x, y) {
    const r = real(x, y)
    ctx.fillText(text, r.x, r.y)
}

function fillRect(x, y, w, h) {
    const r = real(x, y)
    ctx.fillRect(r.x, r.y, w * game.scale, h * game.scale)
}

function rndDec(seed) {
    const whole = 2038074743
    seed *= 15485863
    return ((seed * seed * seed % whole + whole) % whole) / whole
}

function rnd(min, max, seed) {
    return min + rndDec(seed) * (max - min)
}

function random(min, max) {
    return min + Math.random() * (max - min)
}

function randomInt(min, max) {
    return Math.floor(min + Math.random() * (max - min))
}

function rgb(r, g, b, a = 1) {
    return 'rgb('+r*255+','+g*255+','+b*255+','+a+')'
}

const drawText = (T, X, Y, C = '#fff', B = '#321') => {
    const oft = .03 * game.scale

    ctx.fillStyle = B
    ctx.fillText(T, X + oft, Y + oft)

    ctx.fillStyle = C
    ctx.fillText(T, X, Y)
}