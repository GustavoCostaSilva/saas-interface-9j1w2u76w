const parseCsvLine = (line: string): string[] => {
  const values: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current)
      current = ''
    } else {
      current += char
    }
  }
  values.push(current)
  return values.map((v) => v.trim().replace(/^"|"$/g, ''))
}

export const parseCsv = (csvText: string): Record<string, string>[] => {
  const lines = csvText.trim().replace(/\r\n/g, '\n').split('\n')
  if (lines.length < 1) {
    throw new Error('CSV inválido ou vazio.')
  }

  const headers = parseCsvLine(lines[0])
  const requiredHeaders = [
    'Razão Social',
    'Nome Sócio',
    'Email Sócio',
    'Telefone Sócio',
  ]
  const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h))
  if (missingHeaders.length > 0) {
    throw new Error(
      `Cabeçalhos ausentes no arquivo CSV: ${missingHeaders.join(', ')}`,
    )
  }

  const data: Record<string, string>[] = []

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i]) continue
    const values = parseCsvLine(lines[i])
    if (values.length > 0 && values.some((v) => v)) {
      const entry: Record<string, string> = {}
      for (let j = 0; j < headers.length; j++) {
        entry[headers[j]] = values[j] || ''
      }
      data.push(entry)
    }
  }
  return data
}

export const parseXml = (xmlText: string): Record<string, string>[] => {
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(xmlText, 'application/xml')

  const parserError = xmlDoc.querySelector('parsererror')
  if (parserError) {
    throw new Error('Arquivo XML malformado. Verifique a sintaxe.')
  }

  const records = Array.from(xmlDoc.getElementsByTagName('record'))
  if (records.length === 0) {
    throw new Error('Nenhum registro <record> encontrado no arquivo XML.')
  }

  const data: Record<string, string>[] = []
  const keyMap: Record<string, string> = {
    RazaoSocial: 'Razão Social',
    NomeSocio: 'Nome Sócio',
    EmailSocio: 'Email Sócio',
    TelefoneSocio: 'Telefone Sócio',
  }

  for (const record of records) {
    const entry: Record<string, string> = {}
    const razsoc =
      record.getElementsByTagName('RazaoSocial')[0]?.textContent ?? ''
    const nomsoc =
      record.getElementsByTagName('NomeSocio')[0]?.textContent ?? ''
    const emlsoc =
      record.getElementsByTagName('EmailSocio')[0]?.textContent ?? ''
    const telsoc =
      record.getElementsByTagName('TelefoneSocio')[0]?.textContent ?? ''

    if (razsoc && nomsoc && (emlsoc || telsoc)) {
      entry[keyMap.RazaoSocial] = razsoc
      entry[keyMap.NomeSocio] = nomsoc
      entry[keyMap.EmailSocio] = emlsoc
      entry[keyMap.TelefoneSocio] = telsoc
      data.push(entry)
    }
  }

  if (data.length === 0) {
    throw new Error(
      'Nenhum registro válido encontrado. Verifique se as tags <RazaoSocial>, <NomeSocio>, <EmailSocio>, e <TelefoneSocio> existem em cada <record>.',
    )
  }

  return data
}
