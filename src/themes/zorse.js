import { AbstractTheme } from '../theme.js'
import rules from './zorse.css.js'

const options = {
  disable_theme_rules: false,
  label_bold: false,
  object_panel_default: true,
  object_indent: true,
  object_border: true,
  table_border: false,
  table_hdiv: false,
  table_zebrastyle: false,
  input_size: 'small',
  enable_compact: false
}

export class zorseTheme extends AbstractTheme {
  constructor (jsoneditor) {
    super(jsoneditor, options)
    this.container = null
    this.colors = [
      '#4285F4', '#EA4335', '#FBBC05', '#34A853',
      '#FF6D01', '#46BDC6', '#7B1FA2', '#C2185B'
    ]
  }

  getFormInputLabel (text, req) {
    const el = super.getFormInputLabel(text, req)
    el.classList.add('je-form-input-label')
    return el
  }

  getFormInputDescription (text) {
    const el = super.getFormInputDescription(text)
    el.classList.add('je-form-input-description')
    return el
  }

  getIndentedPanel () {
    const el = super.getIndentedPanel()
    el.classList.add('je-indented-panel')
    return el
  }

  getTopIndentedPanel () {
    return this.getIndentedPanel()
  }

  getChildEditorHolder () {
    const el = super.getChildEditorHolder()
    el.classList.add('je-child-editor-holder')
    return el
  }

  getHeaderButtonHolder () {
    const el = this.getButtonHolder()
    el.classList.add('je-header-button-holder')
    return el
  }

  getTable () {
    const el = super.getTable()
    el.classList.add('je-table')
    return el
  }

  getUpload () {
    const el = super.getUpload()
    el.classList.add('je-upload-preview')
    return el
  }

  getDropZone () {
    const el = document.createElement('div')
    el.classList.add('je-dropzone')
    el.setAttribute('data-text', 'Drop files here')
    return el
  }

  addInputError (input, text) {
    const group = this.closest(input, '.form-control') || input.controlgroup

    if (!input.errmsg) {
      input.errmsg = document.createElement('div')
      input.errmsg.setAttribute('class', 'errmsg')
      input.errmsg.style = input.errmsg.style || {}
      input.errmsg.style.color = 'red'
      group.appendChild(input.errmsg)
    } else {
      input.errmsg.style.display = 'block'
    }

    input.errmsg.innerHTML = ''
    input.errmsg.appendChild(document.createTextNode(text))
    input.errmsg.setAttribute('role', 'alert')
  }

  removeInputError (input) {
    if (input.style) {
      input.style.borderColor = ''
    }
    if (input.errmsg) input.errmsg.style.display = 'none'
  }

  getLevelIndicator (path) {
    const el = document.createElement('div')
    el.classList.add('je-level-indicator')

    const levelBar = document.createElement('div')
    levelBar.classList.add('je-level-bar')

    const levelColors = [
      '#4285F4', '#EA4335', '#FBBC05', '#34A853',
      '#FF6D01', '#46BDC6', '#7B1FA2', '#C2185B'
    ]

    path.forEach((level, index) => {
      const indicator = document.createElement('span')
      indicator.style.backgroundColor = levelColors[index % levelColors.length]
      levelBar.appendChild(indicator)
    })

    el.appendChild(levelBar)

    const levelText = document.createElement('span')
    levelText.textContent = `Level ${path.length}`
    levelText.classList.add('je-level-text')
    el.appendChild(levelText)

    return el
  }

  getSearchBar () {
    const el = document.createElement('div')
    el.classList.add('je-search-bar')

    const input = document.createElement('input')
    input.type = 'text'
    input.placeholder = 'Search...'

    const icon = document.createElement('span')
    icon.classList.add('search-icon')
    icon.innerHTML = '&#128269;' // Magnifying glass emoji

    el.appendChild(input)
    el.appendChild(icon)

    return el
  }

  getContainer () {
    const el = super.getContainer()
    el.classList.add('je-container')
    this.setContainer(el) // Ensure setContainer is called
    return el
  }

  setContainer (container) {
    this.container = container
    this.applyStyles()
  }

  applyStyles () {
    if (this.container) {
      const applyStyle = (el, level = 0) => {
        if (el.classList.contains('je-child-editor-holder')) {
          // Apply border color based on level
          el.style.borderColor = this.colors[level % this.colors.length]
          level++
        }
        Array.from(el.children).forEach(child => applyStyle(child, level))
      }

      // Use a MutationObserver to apply styles after elements are rendered
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.addedNodes.length) {
            Array.from(mutation.addedNodes).forEach(node => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                applyStyle(node)
              }
            })
          }
        })
      })

      observer.observe(this.container, { childList: true, subtree: true })

      // Apply styles to the initial container
      applyStyle(this.container)
    }
  }
}

/* Custom stylesheet rules. format: "selector" : "CSS rules" */
zorseTheme.rules = rules
