import parseBankOfAmerica from './parseBankOfAmerica'
// import parseChase from './parseChase'
// import parseFidelity from './parseFidelity'

const parserMap = {
  'bank_of_america:checking': parseBankOfAmerica,
  // 'chase:checking': parseChase,
  // 'fidelity:investment': parseFidelity,
}

export function parseCsv(text, institution, accountType) {
  const key = `${institution}:${accountType}`
  const parser = parserMap[key]

  if (!parser) {
    throw new Error(`No parser found for: ${key}`)
  }

  return parser(text)
}
