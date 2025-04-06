import Papa from 'papaparse'  // We'll need to install this package

class CSVValidator {
  constructor() {
    // Required headers for inventory items
    this.requiredHeaders = [
      'name',
      'category',
      'quantity',
      'low_stock_threshold',
      'purchase_price',
      'sell_price'
    ]
  }

  /**
   * Validates the structure and content of a CSV file
   * @param {File} file - The CSV file to validate
   * @returns {Promise<{ isValid: boolean, errors: string[], data: Array|null }>}
   */
  async validateFile(file) {
    return new Promise((resolve) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const validation = this.validateParsedData(results)
          resolve(validation)
        },
        error: (error) => {
          resolve({
            isValid: false,
            errors: [`Failed to parse CSV file: ${error.message}`],
            data: null
          })
        }
      })
    })
  }

  /**
   * Validates the parsed CSV data
   * @param {Object} parsedResults - The results from Papa Parse
   * @returns {{ isValid: boolean, errors: string[], data: Array|null }}
   */
  validateParsedData(parsedResults) {
    const errors = []
    const headers = parsedResults.meta.fields || []

    // Check for required headers
    const missingHeaders = this.requiredHeaders.filter(
      required => !headers.includes(required)
    )

    if (missingHeaders.length > 0) {
      errors.push(`Missing required headers: ${missingHeaders.join(', ')}`)
      return { isValid: false, errors, data: null }
    }

    // Validate each row
    const validatedData = []
    parsedResults.data.forEach((row, index) => {
      const rowNumber = index + 2 // +2 because 1 is header and we want 1-based indexing
      const rowErrors = this.validateRow(row, rowNumber)
      
      if (rowErrors.length > 0) {
        errors.push(...rowErrors)
      } else {
        // Convert numeric fields to proper types
        const processedRow = {
          name: row.name.trim(),
          category: row.category.trim(),
          quantity: parseInt(row.quantity, 10),
          low_stock_threshold: parseInt(row.low_stock_threshold, 10),
          purchase_price: parseFloat(row.purchase_price),
          sell_price: parseFloat(row.sell_price)
        }
        validatedData.push(processedRow)
      }
    })

    return {
      isValid: errors.length === 0,
      errors,
      data: errors.length === 0 ? validatedData : null
    }
  }

  /**
   * Validates a single row of CSV data
   * @param {Object} row - The row to validate
   * @param {number} rowNumber - The row number for error reporting
   * @returns {string[]} Array of error messages
   */
  validateRow(row, rowNumber) {
    const errors = []

    // Required string fields
    if (!row.name?.trim()) {
      errors.push(`Row ${rowNumber}: Name is required`)
    }
    if (!row.category?.trim()) {
      errors.push(`Row ${rowNumber}: Category is required`)
    }

    // Numeric fields
    const numericFields = {
      quantity: { min: 0, integer: true },
      low_stock_threshold: { min: 0, integer: true },
      purchase_price: { min: 0, integer: false },
      sell_price: { min: 0, integer: false }
    }

    Object.entries(numericFields).forEach(([field, rules]) => {
      const value = rules.integer 
        ? parseInt(row[field], 10) 
        : parseFloat(row[field])

      if (isNaN(value)) {
        errors.push(`Row ${rowNumber}: ${field} must be a valid number`)
      } else if (value < rules.min) {
        errors.push(`Row ${rowNumber}: ${field} cannot be negative`)
      }
    })

    return errors
  }
}

export default new CSVValidator() 