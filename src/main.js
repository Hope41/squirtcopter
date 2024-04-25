'use strict'
function press(e, bool) {
    if (e.repeat) return

    key.press = bool
    if (e.code == 'ArrowUp' || e.code == 'KeyW' || e.code == 'KeyZ') key.up = bool
    if (e.code == 'ArrowLeft' || e.code == 'KeyA' || e.code == 'KeyQ') key.left = bool
    if (e.code == 'ArrowDown' || e.code == 'KeyS') key.down = bool
    if (e.code == 'ArrowRight' || e.code == 'KeyD') key.right = bool
    if (e.code == 'Space' || e.code == 'Enter') {
        key.right = bool
        key.confirm = bool
    }
}

const vol=1
let atx=0
// Thanks to ZZFX by Frank Force <3
const zzfx=(p=1,k=.05,b=220,e=0,r=0,t=.1,q=0,D=1,u=0,y=0,v=0,z=0,l=0,E=0,A=0,F=0,c=0,w=1,m=
0,B=0,M=Math,R=44100,d=2*M.PI,G=u*=500*d/R/R,C=b*=(1-k+2*k*M.random(k=[]))*d/R,g
=0,H=0,a=0,n=1,I=0,J=0,f=0,x,h)=>{if(!atx)return;e=R*e+9;m*=R;r*=R;t*=R;c*=R;y*=500*d/R**3;A*=d
/R;v*=d/R;z*=R;l=R*l|0;for(h=e+m+r+t+c|0;a<h;k[a++]=f)++J%(100*F|0)||(f=q?1<q?2<
q?3<q?M.sin((g%d)**3):M.max(M.min(M.tan(g),1),-1):1-(2*g/d%2+2)%2:1-4*M.abs(M.
round(g/d)-g/d):M.sin(g),f=(l?1-B+B*M.sin(d*a/l):1)*(0<f?1:-1)*M.abs(f)**D*vol
*p*(a<e?a/e:a<e+m?1-(a-e)/m*(1-w):a<e+m+r?w:a<h-c?(h-a-c)/t*w:0),f=c?f/2+(c>a?0:
(a<h-c?1:(h-a)/c)*k[a-c|0]/2):f),x=(b+=u+=y)*M.cos(A*H++),g+=x-x*E*(1-1E9*(M.sin
(a)+1)%2),n&&++n>z&&(b+=v,C+=v,n=0),!l||++I%l||(b=C,u=G,n=n||1);p=atx.
createBuffer(1,h,R);p.getChannelData(0).set(k);b=atx.createBufferSource();b.
buffer=p;b.connect(atx.destination);b.start()}

function playMusic() {
    atx = new (AudioContext || webkitAudioContext)()

    let beats = 4
    const noteLength = 190
    const startDelay = 200
    const scale = [261.63, 293.66, 311.13, 349.23, 392, 415.305, 466.16]

    const base = [0, 2, 1, 6]
    const oft = 1.1

    let progress = 0
    let currentMelody = []

    const generateMelody = () => {
        if (!(progress % 64)) {
            const choice = randomInt(0, 3)
            if (!choice) beats = 2
            else if (choice == 1) beats = 4
            else if (choice == 2) beats = 8
        }

        // Reset melody
        currentMelody = []

        // Make melody snippet
        const snippet = []
        for (let i = 0; i < beats - 1; i ++) {
            let rand = randomInt(0, scale.length)
            if (rand == 3) rand ++
            if (rand == 1) rand ++
            let pass = scale[rand] / 4
            snippet.push(pass * oft)
        }

        // Repeat snippet with changes in the first note
        for (let i = 0; i < base.length; i ++) {
            let pass = scale[base[i]]
            if (base[i] >= scale.length - 1)
                pass /= 2
            currentMelody.push(pass * oft / 2)

            for (let j = 0; j < snippet.length; j ++)
                currentMelody.push(snippet[j])
        }
    }

    const playNote = index => {
        if (!(progress % currentMelody.length)) generateMelody()
        progress ++

        if (index >= currentMelody.length)
            index = 0

        const freq = currentMelody[index]
        let curve = 1 + (.5 + (game.Z * 40)) * music.shopSmooth
        let volume = .4
        let noise = quad(.4 + Math.sin(game.time / 1000) * .4)
        const delay = rndDec(game.dist(hero.x / 300)) * .4

        music.shopSmooth += .05
        if (music.shopSmooth > 1)
            music.shopSmooth = 1

        if (game.shop) {
            noise = .1
            volume = .8
            curve = 1
            music.shopSmooth = 0
        }
        zzfx(...[volume,0,freq,.01,.2,.26,,curve,,,,,,noise,,,delay,.21,.08,.2])
        setTimeout(() => playNote(index + 1), noteLength)
    }

    setTimeout(() => playNote(0), startDelay)
}

function resize() {
    cvs.width = innerWidth * devicePixelRatio
    cvs.height = innerHeight * devicePixelRatio + 1

    game.resize()
}

function update() {
    let dt = (performance.now() - game.oldPerf) / 16
    game.oldPerf = performance.now()
    if (dt > 1) dt = 1

    game.update(dt)

    // MOBILE CONTROL PAD
    if (MOBILE) {
        PADRAD = game.box * 3
        x1PAD = game.box + PADRAD
        x2PAD = cvs.width - game.box - PADRAD
        yPAD = cvs.height - game.box - PADRAD

        ctx.fillStyle = '#dfe3'
        if (key.right) ctx.fillStyle = '#dfe4'
        ctx.beginPath()
        ctx.arc(x1PAD, yPAD, PADRAD, -Math.PI / 2, Math.PI / 2)
        ctx.fill()
        ctx.fillStyle = '#dfe6'
        if (key.left) ctx.fillStyle = '#dfe5'
        ctx.beginPath()
        ctx.arc(x1PAD, yPAD, PADRAD, Math.PI / 2, -Math.PI / 2)
        ctx.fill()

        ctx.fillStyle = '#dfe3'
        if (key.down) ctx.fillStyle = '#dfe4'
        ctx.beginPath()
        ctx.arc(x2PAD, yPAD, PADRAD, 0, Math.PI)
        ctx.fill()
        ctx.fillStyle = '#dfe6'
        if (key.up) ctx.fillStyle = '#dfe5'
        ctx.beginPath()
        ctx.arc(x2PAD, yPAD, PADRAD, Math.PI, 0)
        ctx.fill()
    }

    requestAnimationFrame(update)
}

const ctx = cvs.getContext('2d')
const game = new Game()
const hero = new Hero()
const cam = new Camera()
const music = {
    started: false,
    shopSmooth: 0,
    switchedOn: true
}
const key = {
    up: 0,
    down: 0,
    left: 0,
    right: 0,
    press: 0,
    confirm: 0
}
const mouse = {
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    move: false,
    press: false
}

let PADRAD = 0
let x1PAD = 0
let x2PAD = 0
let yPAD = 0
const MOBILE = 'ontouchstart' in window

addEventListener('keydown', e => press(e, 1))
addEventListener('keyup', e => press(e, 0))
addEventListener('resize', resize)

// MOBILE AND MOUSE
function moveMouse(x, y) {
    mouse.x = x * devicePixelRatio
    mouse.y = y * devicePixelRatio
    mouse.move = true
}

function touchMove(e) {
    if (e.originalEvent) e = e.originalEvent
    const touch = e.touches[0] || e.changedTouches[0]
    moveMouse(touch.pageX, touch.pageY)
}

function cancelTouches(e) {
    for (let i = 0; i < e.changedTouches.length; i ++) {
        const release = key => {
            if (key && key.identifier == e.changedTouches[i].identifier)
                return false
            return key
        }

        key.up = release(key.up)
        key.down = release(key.down)
        key.left = release(key.left)
        key.right = release(key.right)
    }
}

addEventListener('touchstart', e => {
    e.preventDefault()

    mouse.press = true
    touchMove(e)

    for (let i = 0; i < e.changedTouches.length; i ++) {
        const touch = e.changedTouches[i]
        const m = {
            x: touch.clientX * devicePixelRatio,
            y: touch.clientY * devicePixelRatio,
            w: 0, h: 0}

        if (collide(m, {x:x1PAD-PADRAD,y:yPAD-PADRAD,w:PADRAD,h:PADRAD*2}))
            key.left = touch
        if (collide(m, {x:x1PAD,y:yPAD-PADRAD,w:PADRAD,h:PADRAD*2}))
            key.right = touch
        if (collide(m, {x:x2PAD-PADRAD,y:yPAD-PADRAD,w:PADRAD*2,h:PADRAD}))
            key.up = touch
        if (collide(m, {x:x2PAD-PADRAD,y:yPAD,w:PADRAD*2,h:PADRAD}))
            key.down = touch
    }
})
addEventListener('touchend', e => {
    e.preventDefault()
    mouse.press = false
    cancelTouches(e)
})
addEventListener('touchleave', e => {
    e.preventDefault()
    mouse.press = false
    cancelTouches(e)
})
addEventListener('mousedown', () => mouse.press = true)
addEventListener('mouseup', () => mouse.press = false)
addEventListener('mousemove', e => moveMouse(e.clientX, e.clientY))
addEventListener('touchmove', e => touchMove(e))

resize()
update()