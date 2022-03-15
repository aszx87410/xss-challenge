String.prototype.encode = function(type) {
  if (!type) return this
  if (type === 'uri') return encodeURIComponent(this)
  if (type === 'json') return JSON.stringify(this)
  if (type === 'base64') return atob(this)
}

const inputContent = document.querySelector('#input-content')
const renderer = document.querySelector('#renderer')
document.querySelector('#clear').onclick = function(e) {
  e.preventDefault()
  inputContent.value = ""
}

document.querySelector('#reload').onclick = function(e) {
  e.preventDefault()
  reloadRecaptchaScript(0)
  document.querySelector('#reload').style = "display:none"
}

function onSubmit() {
  const content = inputContent.value
  const name = document.querySelector('input[name=creator]').value
  const qs = 'name=' + name.encode('uri') + '&content=' + content.encode('uri')
  window.location.search = '?' + qs
}

function loadScript(src) {
  const script = document.createElement('script');
  script.async = true;
  script.src = src;
  document.body.appendChild(script);
}

function reloadRecaptchaScript(index) {
  // delay for a bit to not block main thread
  setTimeout(() => {
    console.log('reload', index, document.scripts[index])
    const element = document.scripts[index]
    const src = element.getAttribute('src')
    if (!src.startsWith('https://www.google.com/recaptcha/')) {
      throw new Error('reload failed, invalid src')
    }
    element.parentNode.removeChild(element)
    loadScript(src)
  }, 1000)
}

function sanitize(html, options = defaultOptions) {
  return DOMPurify.sanitize(html, {
    FORBID_TAGS: options.blockTags || [],
    FORBID_ATTR: options.blockAttrs || [],
    FORCE_BODY: options.forceBody,
    WHOLE_DOCUMENT: options.wholeDocument,
    KEEP_CONTENT: !options.removeContent,
    SANITIZE_DOM: !options.allowDOM,
  })
}

function loadData(sanitizeOptions) {
  const params = (new URL(document.location)).searchParams
  const name = params.get('name')
  const content = params.get('content')

  if (!content) return

  // hide some elements, we don't need it
  document.querySelector('.title').innerText = 'Note'
  document.querySelector('.input-type').style = 'display: none';
  document.querySelector('.input-date').style = 'display: none';
  document.querySelector('.input-mode').style = 'display: none';
  document.querySelector('#input-content').style = 'display: none';
  document.querySelector('#submit').style = 'display: none';
  document.querySelector('#clear').style = 'display: none';
  document.querySelector('#reload').style = "display:none"

  document.querySelector('input[name=creator]').value = name
  const result = sanitize(content, sanitizeOptions)
  renderer.style = "width:100%; min-height: 400px;display: block"
  renderer.innerHTML = result
}

loadData({
  blockTags: ['style', 'iframe', 'embed', 'input', 'svg', 'script', 'math', 'base', 'link'],
  blockAttrs: [],
  forceBody: false,
  wholeDocument: false,
  allowDOM: false,
  removeContent: true
})
