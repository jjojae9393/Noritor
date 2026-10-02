import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const BASE = '/Noritor/'
const SITE_URL = `https://jjojae9393.github.io${BASE}`

// GitHub Pages has no SPA fallback, so /vacation/ needs its own index.html.
// It also gets its own link preview (og tags) for sharing.
function vacationPage() {
  return {
    name: 'vacation-page',
    apply: 'build',
    closeBundle() {
      const dist = resolve(__dirname, 'dist')
      const html = readFileSync(resolve(dist, 'index.html'), 'utf-8')
        .replace(/<title>.*?<\/title>/, '<title>노리터 - 여행 체크리스트✈️</title>')
        .replace(/(property="og:title" content=")[^"]*/, '$1여행 체크리스트✈️ — 친구야! 우리 하나씩 맞춰보자')
        .replace(/(name="twitter:title" content=")[^"]*/, '$1여행 체크리스트✈️ — 친구야! 우리 하나씩 맞춰보자')
        .replace(/(property="og:description" content=")[^"]*/, '$1친구들의 여행 취향을 모아 가장 잘 맞는 선택지를 추천해요')
        .replace(/(name="twitter:description" content=")[^"]*/, '$1친구들의 여행 취향을 모아 가장 잘 맞는 선택지를 추천해요')
        .replace(/(property="og:url" content=")[^"]*/, `$1${SITE_URL}vacation/`)
      mkdirSync(resolve(dist, 'vacation'), { recursive: true })
      writeFileSync(resolve(dist, 'vacation/index.html'), html)
    },
  }
}

export default defineConfig({
  plugins: [react(), vacationPage()],
  base: BASE,
})
