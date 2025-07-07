export const getFirstName = (name: string) => {
  return name.split(' ')[0]
}

export const wordToSnakeCase = (word: string) => {
  return word.toLowerCase().replace(/ /g, '_')
}

export const snakeToWordCase = (word: string) => {
  return word.replace(/_/g, ' ').replace(/\b\w/g, (match) => match.toUpperCase())
}
