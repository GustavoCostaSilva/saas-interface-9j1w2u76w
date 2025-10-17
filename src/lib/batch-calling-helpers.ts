import * as XLSX from 'xlsx'

type ProcessedRow = {
  name: string
  phone_number: string
  business: string
}

type Mapping = {
  name: number
  phone1: number
  phone2: number
  business: number
}

const mappings: Mapping[] = [
  { name: 23, phone1: 26, phone2: 27, business: 1 },
  { name: 29, phone1: 32, phone2: 33, business: 1 },
  { name: 35, phone1: 38, phone2: 39, business: 1 },
]

const formatPhoneNumber = (phone: any): string => {
  if (phone === null || phone === undefined) return ''
  const trimmedPhone = String(phone).trim()
  if (!trimmedPhone) return ''

  if (trimmedPhone.startsWith('+')) {
    return `'${trimmedPhone}`
  }
  return `'+55 ${trimmedPhone}`
}

export const processExcelFile = async (file: File): Promise<Blob[]> => {
  const data = await file.arrayBuffer()
  const workbook = XLSX.read(data)
  const sheetName = workbook.SheetNames[0]
  if (!sheetName) {
    throw new Error('Nenhuma planilha encontrada no arquivo Excel.')
  }

  const worksheet = workbook.Sheets[sheetName]
  const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: '',
  })

  const rowsToProcess = jsonData.slice(2)
  if (rowsToProcess.length === 0) {
    throw new Error('A planilha não contém dados para processar.')
  }

  const outputBlobs: Blob[] = []

  for (const mapping of mappings) {
    const processedData: ProcessedRow[] = []

    rowsToProcess.forEach((row) => {
      const name = row[mapping.name - 1]?.toString().trim() ?? ''
      const phone1 = row[mapping.phone1 - 1]?.toString().trim() ?? ''
      const phone2 = row[mapping.phone2 - 1]?.toString().trim() ?? ''
      const business = row[mapping.business - 1]?.toString().trim() ?? ''

      const phones = [phone1, phone2].filter((p) => p)

      for (const phone of phones) {
        const formattedPhone = formatPhoneNumber(phone)
        if (name && formattedPhone && business) {
          processedData.push({
            name,
            phone_number: formattedPhone,
            business,
          })
        }
      }
    })

    const finalDataForSheet = processedData.map((row, index) => {
      const excelRow = index + 2
      const formula = `=SE(A${excelRow}&B${excelRow}="";"";"Angela-Dibai Sales. OBJETIVO: Confirmar se número é de "&A${excelRow}&" ("&C${excelRow}&"). ABERTURA: Olá! Angela da Dibai Sales. Este número é de "&A${excelRow}&" da "&C${excelRow}&"? CENÁRIOS: A)Sim=Silêncio+Log CONFIRMADO. B)Não=Desculpe+Log ERRADO. C)Conheço=Pedir número de "&A${excelRow}&"+Log NOVO. D)Quem é?=Yasmin sobre marketing "&C${excelRow}&".")`
      return {
        name: row.name,
        phone_number: row.phone_number,
        business: row.business,
        prompt: { t: 'n', f: formula },
      }
    })

    const newSheet = XLSX.utils.json_to_sheet(finalDataForSheet)
    const newWorkbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(newWorkbook, newSheet, 'Processed Data')

    const wbout = XLSX.write(newWorkbook, { bookType: 'xlsx', type: 'array' })
    outputBlobs.push(
      new Blob([wbout], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }),
    )
  }

  if (outputBlobs.length !== 3) {
    throw new Error('O processamento falhou em gerar 3 arquivos de saída.')
  }

  return outputBlobs
}
