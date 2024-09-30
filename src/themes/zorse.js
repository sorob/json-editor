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
    this.jsoneditor = jsoneditor // Store the jsoneditor instance
    this.container = null
    this.colors = [
      '#FF6D01', // Orange
      '#EA4335', // Red
      '#C2185B', // Dark Pink
      '#FBBC05', // Yellow
      '#34A853', // Green
      '#46BDC6', // Cyan
      '#4285F4', // Blue
      '#7B1FA2' // Purple
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

  getHeader (text) {
    const header = super.getHeader(text)

    if (!this.searchBarAdded) {
      const container = document.createElement('div')
      container.style.display = 'flex'
      container.style.flexDirection = 'column'

      const searchBar = document.createElement('input')
      searchBar.type = 'text'
      searchBar.id = 'json-editor-search'
      searchBar.placeholder = 'Search...'
      searchBar.style.marginBottom = '10px'
      searchBar.style.width = '100%'

      container.appendChild(searchBar)
      container.appendChild(header)

      this.searchBarAdded = true

      // Attach event listener for search functionality
      searchBar.addEventListener(
        'input',
        this.debounce(
          function () {
            const searchTerm = searchBar.value
            const editorContainer =
              this.jsoneditor.container || this.jsoneditor.element
            if (!editorContainer) {
              // eslint-disable-next-line no-console
              console.error('Editor container is undefined')
              return
            }
            this.searchEditorElements(editorContainer, searchTerm)
          }.bind(this),
          300
        )
      )

      // Return the container
      return container
    }

    return header
  }

  debounce (func, wait) {
    let timeout
    return function (...args) {
      clearTimeout(timeout)
      timeout = setTimeout(() => func.apply(this, args), wait)
    }
  }

  highlightText (text, searchTerm) {
    const regex = new RegExp(
      `(${searchTerm.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})`,
      'gi'
    )
    return text.replace(regex, '<span class="highlight">$1</span>')
  }

  searchEditorElements (element, searchTerm) {
    if (!element) return false

    let elementMatches = false
    const lowerSearchTerm = searchTerm.toLowerCase()

    // Get the label or title of the element
    const labelElement = element.querySelector(
      '.je-label, .form-name, .property-name, b'
    )
    let labelText = ''
    if (labelElement) {
      labelText = labelElement.textContent || ''
    }

    // Get the value of the element if applicable
    const valueElement = element.querySelector('input, select, textarea')
    let valueText = ''
    if (valueElement && valueElement.value) {
      valueText = valueElement.value || ''
    }

    // Combine label and value text for searching
    // const combinedText = (labelText + ' ' + valueText).toLowerCase()
    // const shouldBeVisible = combinedText.includes(lowerSearchTerm)
    // Check if this element matches
    if (labelText.toLowerCase().includes(lowerSearchTerm) && lowerSearchTerm !== '') {
      elementMatches = true

      // Highlight matching text in label
      if (labelElement) {
        labelElement.innerHTML = this.highlightText(labelText, searchTerm)
      }
    } else {
      // Remove highlighting if it was previously added
      if (labelElement) {
        labelElement.innerHTML = labelText
      }
    }

    if (valueText.toLowerCase().includes(lowerSearchTerm) && lowerSearchTerm !== '') {
      elementMatches = true

      // Highlight matching text in value
      if (valueElement) {
        valueElement.classList.add('highlight')
      }
    } else {
      // Remove highlighting if it was previously added
      if (valueElement) {
        valueElement.classList.remove('highlight')
      }
    }

    // Recursively check child elements
    let childMatches = false
    const childElements = Array.from(element.children)

    for (const childElement of childElements) {
      // Skip certain elements if necessary
      if (
        childElement.classList.contains('je-modal') ||
        childElement.classList.contains('je-object__controls')
      ) {
        continue
      }

      const childMatch = this.searchEditorElements(childElement, searchTerm)
      childMatches = childMatches || childMatch
    }

    const matches = elementMatches || childMatches

    // Show or hide the element based on whether it or any child matches
    if (matches || lowerSearchTerm === '') {
      element.style.display = ''
    } else {
      // element.style.display = 'none'
    }

    return matches
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
      '#FF6D01', // Orange
      '#EA4335', // Red
      '#C2185B', // Dark Pink
      '#FBBC05', // Yellow
      '#34A853', // Green
      '#46BDC6', // Cyan
      '#4285F4', // Blue
      '#7B1FA2' // Purple
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
          el.classList.add('level-' + level)
          level++
        }
        Array.from(el.children).forEach((child) => applyStyle(child, level))
      }

      // Use a MutationObserver to apply styles after elements are rendered
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.addedNodes.length) {
            Array.from(mutation.addedNodes).forEach((node) => {
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
