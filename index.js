const core = require('@actions/core')
const fs = require('fs')
const path = require('path')
const https = require('https')
const yaml = require('js-yaml')
const FormData = require('form-data')

/**
 * Reads and validates the OAS file from the specified path
 * @param {string} filePath - Path to the OAS file
 * @returns {Object} - Object containing file content and metadata
 */
const readOASFile = (filePath) => {
  core.info(`Reading OAS file from: ${filePath}`)
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`OAS file not found at path: ${filePath}`)
  }

  const fileStats = fs.statSync(filePath)
  const fileExtension = path.extname(filePath).toLowerCase()
  const fileName = path.basename(filePath)
  const fileContent = fs.readFileSync(filePath, 'utf8')

  core.info(`File found: ${fileName} (${fileStats.size} bytes, ${fileExtension})`)

  return {
    content: fileContent,
    extension: fileExtension,
    fileName: fileName,
    size: fileStats.size
  }
}

/**
 * Converts YAML content to JSON format
 * @param {string} yamlContent - YAML content as string
 * @returns {string} - JSON content as string
 */
const convertYamlToJson = (yamlContent) => {
  try {
    const parsedYaml = yaml.load(yamlContent)
    return JSON.stringify(parsedYaml, null, 2)
  } catch (error) {
    throw new Error(`Failed to parse YAML content: ${error.message}`)
  }
}

/**
 * Processes the OAS file content based on its format
 * @param {Object} fileData - File data object from readOASFile
 * @returns {Object} - Processed file data with JSON content
 */
const processOASFile = (fileData) => {
  const { content, extension, fileName } = fileData
  
  let processedContent
  let processedFileName = fileName

  if (extension === '.yaml' || extension === '.yml') {
    core.info('Converting YAML to JSON format')
    processedContent = convertYamlToJson(content)
    // Change extension to .json for upload
    processedFileName = fileName.replace(/\.(yaml|yml)$/, '.json')
  } else if (extension === '.json') {
    core.info('File is already in JSON format')
    // Validate JSON format
    try {
      JSON.parse(content)
      processedContent = content
    } catch (error) {
      throw new Error(`Invalid JSON format: ${error.message}`)
    }
  } else {
    throw new Error(`Unsupported file format: ${extension}. Supported formats: .yaml, .yml, .json`)
  }

  return {
    ...fileData,
    processedContent,
    processedFileName
  }
}

/**
 * Uploads the OAS file to Brainfish API
 * @param {Object} fileData - Processed file data
 * @param {string} apiToken - Brainfish API token
 * @param {string} catalogId - Catalog ID for upload
 * @param {string} baseUrl - Base URL for Brainfish API
 * @returns {Promise} - Promise resolving to upload result
 */
const uploadToBrainfish = (fileData, apiToken, catalogId, baseUrl = 'https://app.brainfi.sh') => {
  return new Promise((resolve, reject) => {
    const { processedContent, processedFileName } = fileData
    
    core.info(`Uploading ${processedFileName} to Brainfish catalog: ${catalogId}`)
    
    // Create form data
    const form = new FormData()
    
    // Convert string content to Buffer to ensure proper binary handling
    const fileBuffer = Buffer.from(processedContent, 'utf8')
    
    // Try 'file' as field name (most common for file uploads)
    form.append('file', fileBuffer, {
      filename: processedFileName,
      contentType: 'application/json'
    })

    // Get form headers
    const formHeaders = form.getHeaders()
    
    // Parse the base URL to extract hostname and determine if HTTPS
    const url = new URL(baseUrl)
    const hostname = url.hostname
    const port = url.port || (url.protocol === 'https:' ? 443 : 80)
    
    // Prepare request options
    const requestOptions = {
      method: 'POST',
      hostname: hostname,
      port: port,
      path: `/api/catalogs.upload?catalogId=${encodeURIComponent(catalogId)}`,
      headers: {
        ...formHeaders,
        'Authorization': `Bearer ${apiToken}`
      }
    }

    core.info(`Making request to: ${baseUrl}${requestOptions.path}`)

    const request = https.request(requestOptions, (response) => {
      let responseData = ''
      
      response.on('data', (chunk) => {
        responseData += chunk
      })
      
      response.on('end', () => {
        core.info(`Response status: ${response.statusCode}`)
        core.info(`Response data: ${responseData}`)
        
        if (response.statusCode >= 200 && response.statusCode < 300) {
          resolve({
            success: true,
            statusCode: response.statusCode,
            data: responseData,
            fileName: processedFileName
          })
        } else {
          reject(new Error(`Upload failed with status ${response.statusCode}: ${responseData}`))
        }
      })
    })

    request.on('error', (error) => {
      core.error(`Request error: ${error.message}`)
      reject(new Error(`Request failed: ${error.message}`))
    })

    // Pipe form data to request
    form.pipe(request)
  })
}

/**
 * Main function to execute the OAS sync process
 */
const main = async () => {
  try {
    // Get inputs from action
    const apiToken = core.getInput('brainfish_api_token')
    const catalogId = core.getInput('catalog_id')
    const oasFilePath = core.getInput('oas_file_path')
    const baseUrl = core.getInput('base_url') || 'https://app.brainfi.sh'

    // Validate required inputs
    if (!apiToken) {
      throw new Error('brainfish_api_token is required')
    }
    if (!catalogId) {
      throw new Error('catalog_id is required')
    }
    if (!oasFilePath) {
      throw new Error('oas_file_path is required')
    }

    core.info('Starting Brainfish OAS sync process')
    core.info(`Base URL: ${baseUrl}`)
    core.info(`Catalog ID: ${catalogId}`)
    core.info(`OAS file path: ${oasFilePath}`)

    // Step 1: Read the OAS file
    const fileData = readOASFile(oasFilePath)

    // Step 2: Process the file (convert YAML to JSON if needed)
    const processedFileData = processOASFile(fileData)

    // Step 3: Upload to Brainfish API
    const uploadResult = await uploadToBrainfish(processedFileData, apiToken, catalogId, baseUrl)

    // Step 4: Set outputs and complete
    core.setOutput('status', '✅ OAS file successfully synced to Brainfish!')
    core.setOutput('uploaded_file', uploadResult.fileName)
    
    core.info(`✅ Success! Uploaded ${uploadResult.fileName} to Brainfish catalog ${catalogId}`)

  } catch (error) {
    core.error(`❌ Error: ${error.message}`)
    core.setFailed(error.message)
  }
}

// Execute main function
main()
