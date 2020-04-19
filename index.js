const cloudflareUrl = 'https://cfw-takehome.developers.workers.dev/api/variants'
const NAME = 'cf-assignment'
const variantData = {
  'variant1': {
    title: 'Arion Miles',
    h1: 'Kanishk Singh',
    description: 'This is a variant with a link to my blog.',
    urlText: 'Go to my Blog',
    url: 'https://arionmiles.me/'
  },
  'variant2': {
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
    if(element.tagName == 'a') {
      element.setAttribute('href', this.url)
      element.setAttribute('target', '_blank')
      element.setAttribute('rel', 'noopener')
    }
    element.setInnerContent(this.content)
  }
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  data = await fetch(cloudflareUrl)
  dataJson = await data.json()

  const cookie = request.headers.get('cookie')
  
  if (cookie && cookie.includes(`${NAME}=variant1`)) {
    response = await fetch(dataJson.variants[0])
    finalResponse = formatResponse(response, variantData['variant1'])
    return finalResponse
  } else if (cookie && cookie.includes(`${NAME}=variant2`)) {
    response = await fetch(dataJson.variants[1])
    finalResponse = formatResponse(response, variantData['variant2'])
    return finalResponse
  } else {
    let group = getRandomInt(2) == 0 ? 'variant1':'variant2'
    let response = group === 'variant1' ? await fetch(dataJson.variants[0]):await fetch(dataJson.variants[1])

    finalResponse = formatResponse(response, variantData[group])
    finalResponse = await finalResponse.text()
    return new Response(finalResponse, {
      headers: {'Set-Cookie': `${NAME}=${group}; path=/`,
                'Content-Type': 'text/html'}
    })
  }
}

function formatResponse(response, param) {
  response = new HTMLRewriter().on('title', new ElementHandler(param.title, null)).transform(response)
  response = new HTMLRewriter().on('h1#title', new ElementHandler(param.h1, null)).transform(response)
  response = new HTMLRewriter().on('p#description', new ElementHandler(param.description, null)).transform(response)
  response = new HTMLRewriter().on('a#url', new ElementHandler(param.urlText, param.url)).transform(response)
  
  return response
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
