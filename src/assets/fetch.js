export async function fetchResponse(endpoint, fetchMethod, data) {
  const url = `http://localhost:3001${endpoint}`
  // const url = `https://studdy-buddy-api-h7kw3.ondigitalocean.app${endpoint}`

  const options = {
    method: fetchMethod,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(data),
  }

  return await fetch(url, options)
}

export function getQuery(options) {
  let result = '?'
  for (const [key, value] of Object.entries(options)) {
    result += `${key}=${value}&`
  }

  return result
}
