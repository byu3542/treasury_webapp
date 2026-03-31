/**
 * Accessibility utilities for WCAG 2.1 AA compliance
 */

/**
 * Generate unique IDs for linking labels to form inputs
 */
let idCounter = 0

export function generateId(prefix = 'id') {
  idCounter += 1
  return `${prefix}-${idCounter}`
}

/**
 * Keyboard event helpers
 */
export const Keys = {
  ENTER: 'Enter',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  TAB: 'Tab',
  SPACE: ' ',
}

export function isEnterKey(event) {
  return event.key === Keys.ENTER || event.code === 'Enter'
}

export function isEscapeKey(event) {
  return event.key === Keys.ESCAPE || event.code === 'Escape'
}

export function isArrowKey(event) {
  return [Keys.ARROW_UP, Keys.ARROW_DOWN, Keys.ARROW_LEFT, Keys.ARROW_RIGHT].includes(event.key)
}

/**
 * ARIA attributes helper
 */
export function createAriaLabel(label, additionalInfo) {
  if (!additionalInfo) return label
  return `${label}, ${additionalInfo}`
}

/**
 * Announce screen reader messages
 */
export function announceToScreenReader(message, priority = 'polite') {
  const announcement = document.createElement('div')
  announcement.setAttribute('role', 'status')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message
  document.body.appendChild(announcement)

  // Remove after announcement is made
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

/**
 * Focus management
 */
export function setFocusToElement(element) {
  if (element) {
    element.focus()
    // Ensure element is visible
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

/**
 * Skip to main content link helper
 */
export function createSkipLink(mainContentId = 'main-content') {
  return {
    className: 'skip-link',
    href: `#${mainContentId}`,
    children: 'Skip to main content',
  }
}

/**
 * Create semantic heading with proper hierarchy
 */
export function getHeadingLevel(context = 'page') {
  if (context === 'page') return 'h1'
  if (context === 'section') return 'h2'
  if (context === 'subsection') return 'h3'
  return 'div'
}
