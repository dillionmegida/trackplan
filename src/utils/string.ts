import { v4 as uuidv4 } from 'uuid'

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

export const genId = () => {
  return uuidv4()
}

export const getLinkTextAndUrlFromMarkdown = (str: string) => {
  // markdown format: [linkText](linkUrl)
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g
  return str.replace(regex, '<a href="$2">$1</a>')
} 