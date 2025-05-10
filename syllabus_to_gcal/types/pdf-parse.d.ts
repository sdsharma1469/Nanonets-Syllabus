declare module 'pdf-parse' {
    import { Buffer } from 'buffer'
  
    interface PDFMetadata {
      metadata?: any
      info: any
      text: string
      version: string
    }
  
    interface PDFOptions {
      pagerender?: (pageData: any) => string | Promise<string>
      max?: number
      version?: string
      normalizeWhitespace?: boolean
      disableCombineTextItems?: boolean
    }
  
    function pdf(dataBuffer: Buffer | Uint8Array, options?: PDFOptions): Promise<PDFMetadata>
    export default pdf
  }
  