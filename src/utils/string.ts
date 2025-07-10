export const getFirstName = (name: string) => {
  return name.split(' ')[0]
}

export const wordToSnakeCase = (word: string) => {
  return word.toLowerCase().replace(/ /g, '_')
}

export const snakeToWordCase = (word: string) => {
  return word.replace(/_/g, ' ').replace(/(?<![^\w\s])\b\w/g, (match) => match.toUpperCase())
}

export const addPlural = (count: number, word: string) => {
  if (count === 1) {
    return word
  } else {
    return word + 's'
  }
}
