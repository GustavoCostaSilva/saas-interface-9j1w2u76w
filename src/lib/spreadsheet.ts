type DataRow = Record<string, string | number | boolean | null>

const escapeXml = (unsafe: string): string => {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;'
      case '>':
        return '&gt;'
      case '&':
        return '&amp;'
      case "'":
        return '&apos;'
      case '"':
        return '&quot;'
      default:
        return c
    }
  })
}

export const generateXmlSpreadsheet = (
  data: DataRow[],
  headers: Record<string, string>,
): string => {
  const headerKeys = Object.keys(headers)
  const headerValues = Object.values(headers)

  const headerRow = `<Row>${headerValues
    .map(
      (header) =>
        `<Cell ss:StyleID="s62"><Data ss:Type="String">${escapeXml(
          header,
        )}</Data></Cell>`,
    )
    .join('')}</Row>`

  const dataRows = data
    .map(
      (row) =>
        `<Row>${headerKeys
          .map((key) => {
            const value = row[key]
            const type = typeof value === 'number' ? 'Number' : 'String'
            const cellValue = value === null || value === undefined ? '' : value
            return `<Cell><Data ss:Type="${type}">${escapeXml(
              String(cellValue),
            )}</Data></Cell>`
          })
          .join('')}</Row>`,
    )
    .join('')

  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:html="http://www.w3.org/TR/REC-html40">
  <Styles>
    <Style ss:ID="s62">
      <Font ss:Bold="1"/>
    </Style>
  </Styles>
  <Worksheet ss:Name="Validation Results">
    <Table>
      ${headerRow}
      ${dataRows}
    </Table>
  </Worksheet>
</Workbook>`
}

export const downloadSpreadsheet = (
  xmlContent: string,
  fileName: string,
): void => {
  const blob = new Blob([xmlContent], {
    type: 'application/vnd.ms-excel',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', fileName)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
