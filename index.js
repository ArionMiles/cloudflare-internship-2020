const cloudflareUrl = 'https://cfw-takehome.developers.workers.dev/api/variants'
const NAME = 'cf-assignment'
const variantData = {
  variant1: {
    title: 'Arion Miles',
    h1: 'Kanishk Singh',
    description: 'This is a variant with a link to my blog.',
    urlText: 'Go to my Blog',
    url: 'https://arionmiles.me/'
  },
  variant2: {
    title: 'Arion Miles',
    h1: 'Kanishk Singh',
    description: 'This is a variant with a link to my GitHub profile.',
    urlText: 'Go to my GitHub',
    url: 'https://github.com/ArionMiles/'
  }
}

class ElementHandler {
  constructor(content, url) {
    this.content = content
    this.url = url
  }

  element(element) {
    if (element.tagName === 'a') {
      element.setAttribute('href', this.url)
      element.setAttribute('target', '_blank')
      element.setAttribute('rel', 'noopener')
    }
    element.setInnerContent(this.content)
  }
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function formatResponse(response, param) {
  let ret = response
  ret = new HTMLRewriter().on('title', new ElementHandler(param.title, null)).transform(ret)
  ret = new HTMLRewriter().on('h1#title', new ElementHandler(param.h1, null)).transform(ret)
  ret = new HTMLRewriter().on('p#description', new ElementHandler(param.description, null)).transform(ret)
  ret = new HTMLRewriter().on('a#url', new ElementHandler(param.urlText, param.url)).transform(ret)
  
  return ret
}

async function handleRequest(request) {
  const data = await fetch(cloudflareUrl)
  const [variant1, variant2] = (await data.json()).variants

  const cookie = request.headers.get('cookie')
  let [response, finalResponse] = ['', '']

  if (cookie && cookie.includes(`${NAME}=variant1`)) {
    response = await fetch(variant1)
    finalResponse = formatResponse(response, variantData.variant1)
    return finalResponse
  }

  if (cookie && cookie.includes(`${NAME}=variant2`)) {
    response = await fetch(variant2)
    finalResponse = formatResponse(response, variantData.variant2)
    return finalResponse
  }

  let group = getRandomInt(2) === 0 ? 'variant1':'variant2'
  response = group === 'variant1' ? await fetch(variant1):await fetch(variant2)

  finalResponse = formatResponse(response, variantData[group])
  finalResponse = await finalResponse.text()
  return new Response(finalResponse, {
    headers: {'Set-Cookie': `${NAME}=${group}; path=/`,
              'Content-Type': 'text/html'}
  })
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
