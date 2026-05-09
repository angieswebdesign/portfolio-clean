import { icons } from '../../../shared/js/icons.js'

const svgNS = 'http://www.w3.org/2000/svg'

function toKebabCase(str) {
  return str.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`)
}

function createNode(node) {
  const el = document.createElementNS(svgNS, node.type)

  Object.entries(node.attrs || {}).forEach(([key, value]) => {
    el.setAttribute(toKebabCase(key), value)
  })

  if (node.children) {
    node.children.forEach(child => {
      el.appendChild(createNode(child))
    })
  }

  return el
}

export function createIcon(name, size = 24) {
  const icon = icons[name]

  if (!icon) {
    console.warn(`Icon "${name}" not found`)
    return null
  }

  const svg = document.createElementNS(svgNS, 'svg')

  svg.setAttribute('viewBox', '0 0 24 24')
  svg.setAttribute('width', size)
  svg.setAttribute('height', size)
  svg.setAttribute('fill', 'none')
  svg.setAttribute('stroke', 'currentColor')
  svg.setAttribute('stroke-width', '2')
  svg.setAttribute('stroke-linecap', 'round')
  svg.setAttribute('stroke-linejoin', 'round')
  svg.setAttribute('aria-hidden', 'true')
  svg.classList.add('icon')

  icon.forEach(node => {
    svg.appendChild(createNode(node))
  })

  return svg
}

export function initializeIcons() {
  document.querySelectorAll('[data-icon]').forEach(el => {
    const name = el.dataset.icon
    const size = parseInt(el.dataset.iconSize || 24, 10)

    const icon = createIcon(name, size)

    if (icon) {
      el.appendChild(icon)
    }
  })
}
