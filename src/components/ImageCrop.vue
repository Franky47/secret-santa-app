<template>
    <canvas v-el:canvas
            @wheel.stop.prevent='onWheel'
            v-touch:pan='onPan'
            v-touch:pinch='onPinch'
            v-touch-options:pan='{ threshold: 0 }'
    ></canvas>
</template>

<script>
import 'hammerjs'
import exif             from 'exif-js'
import exifOrient       from 'exif-orient'
import Vue              from 'vue'
import VueTouch         from 'vue-touch'
import { setupCanvas }  from '../utility/canvas'

Vue.use(VueTouch)

const clip = (value, bounds) => Math.min(Math.max(value, bounds.min), bounds.max)

const fixImageOrientation = (image) => {
    return new Promise((resolve, reject) => {
        exif.getData(image, () => {
            if (image.exifdata             === undefined ||
                image.exifdata.Orientation === undefined) {
                return resolve()
            }
            const orientation = image.exifdata.Orientation
            exifOrient(image, orientation, (err, canvas) => {
                if (err) {
                    reject(err)
                }
                image.onload = () => {
                    resolve()
                }
                image.src = canvas.toDataURL()
            })
        })
    })
}

export default {
    data: () => ({
        image: null,
        zoom: 1.0,
        pan: {
            x: 0.0,
            y: 0.0
        },
        mem: {
            x: 0.0,
            y: 0.0,
            z: 1.0
        }
    }),
    props: {
        size: {
            type: Number,
            default: 150
        },
        file: {
            type: window.File,
            default: () => null
        }
    },
    ready() {
        setupCanvas(this.$els.canvas, this.size)
        if (this.file) {
            this.loadImageFromFile(this.file)
        }
    },
    methods: {
        loadImageFromFile(file) {
            const reader = new window.FileReader()
            reader.onload = (event) => {
                this.loadImageFromURL(event.target.result)
            }
            reader.readAsDataURL(file)
        },
        loadImageFromURL(url) {
            this.image = new window.Image()
            this.image.onload = () => {
                fixImageOrientation(this.image).then(() => {
                    this.reset()
                }).catch(error => {
                    console.error('Error while reorienting image:', error)
                    this.reset()
                })
            }
            this.image.src = url
        },
        onWheel(event) {
            const factor = event.deltaMode === 0 ? 0.001 : 1.0 // 0: DOM_DELTA_PIXEL
            this.zoom  = clip(this.zoom - event.deltaY * factor, this.zoomBounds)
            this.pan.x = clip(this.pan.x, this.panBounds.x)
            this.pan.y = clip(this.pan.y, this.panBounds.y)
        },
        onPinch(event) {
            this.zoom  = clip(this.zoom * (event.scale / this.mem.z), this.zoomBounds)
            this.mem.z = event.scale
            this.pan.x = clip(this.pan.x, this.panBounds.x)
            this.pan.y = clip(this.pan.y, this.panBounds.y)
            if (event.eventType === 4) {
                // End of pinch, reset memories
                this.mem.z = 1.0
                // onPan will be called after onPinch, causing a sudden translation.
                // This helps counter-interact it.
                this.mem.x = event.deltaX
                this.mem.y = event.deltaY
            }
        },
        onPan(event) {
            const bounds = this.panBounds
            const factor = 1.0 / this.zoom
            this.pan.x = clip(this.pan.x + factor * (event.deltaX - this.mem.x), bounds.x)
            this.mem.x = event.deltaX
            this.pan.y = clip(this.pan.y + factor * (event.deltaY - this.mem.y), bounds.y)
            this.mem.y = event.deltaY
            if (event.eventType === 4) {
                // End of pan, reset memories
                this.mem.x = 0
                this.mem.y = 0
            }
        },
        redraw() {
            if (!this.image) {
                return
            }
            const canvas = this.$els.canvas
            const context = canvas.getContext('2d')
            const cw = canvas.width  / canvas.ratio
            const ch = canvas.height / canvas.ratio
            const iw = this.image.width
            const ih = this.image.height
            const sw = iw * this.zoom
            const sh = ih * this.zoom
            const sx = (cw - sw) * 0.5 + this.pan.x * this.zoom
            const sy = (ch - sh) * 0.5 + this.pan.y * this.zoom
            context.clearRect(0, 0, canvas.width, canvas.height)
            context.drawImage(this.image, sx, sy, sw, sh)
        },
        reset() {
            this.pan.x = 0.0
            this.pan.y = 0.0
            this.mem.x = 0.0
            this.mem.y = 0.0
            this.mem.z = 1.0
            if (this.image) {
                // Zoom to fit into frame
                const canvas = this.$els.canvas
                const cw = canvas.width  / canvas.ratio
                const ch = canvas.height / canvas.ratio
                const iw = this.image.width
                const ih = this.image.height
                this.zoom = Math.max(cw / iw, ch / ih)
            } else {
                this.zoom = 1.0
            }
        },
        getImageAsFile() {
            return Promise.race([
                new Promise((resolve) => {
                    this.$els.canvas.toBlob(file => {
                        resolve(file)
                    })
                }),
                new Promise((resolve, reject) => {
                    window.setTimeout(() => {
                        reject(new Error('Canvas rendering timed out'))
                    }, 10000)
                })
            ])
        }
    },
    computed: {
        zoomBounds() {
            if (!this.image) {
                return { min: 1.0, max: 1.0 }
            }
            const canvas = this.$els.canvas
            const cw = canvas.width  / canvas.ratio
            const ch = canvas.height / canvas.ratio
            const iw = this.image.width
            const ih = this.image.height
            return {
                min: Math.max(cw / iw, ch / ih),
                max: 10.0
            }
        },
        panBounds() {
            if (!this.image) {
                return {
                    x: { min: 0.0, max: 0.0 },
                    y: { min: 0.0, max: 0.0 }
                }
            }
            const canvas = this.$els.canvas
            const cw = canvas.width  / canvas.ratio
            const ch = canvas.height / canvas.ratio
            const z = 1.0 / (2.0 * this.zoom)
            const x = (this.zoom * this.image.width  - cw) * z
            const y = (this.zoom * this.image.height - ch) * z
            return {
                x: { min: -1 * x, max: x },
                y: { min: -1 * y, max: y }
            }
        }
    },
    watch: {
        zoom: 'redraw',
        pan: {
            handler: 'redraw',
            deep: true
        }
    }
}
</script>

<style scoped>
canvas {
    display: block;
    border-radius: 100%;
}
</style>
