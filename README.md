# Brainfish OAS Sync GitHub Action

A GitHub Action to automatically sync OpenAPI Specification (OAS) files from your repository to your Brainfish API catalog. This action supports both YAML and JSON formats and automatically converts YAML files to JSON for upload.

## Features

- 🔄 **Auto-sync OAS files** to Brainfish catalog
- 📝 **YAML to JSON conversion** - automatically converts `.yaml` and `.yml` files to JSON
- 🔒 **Secure authentication** using Brainfish API tokens
- 📁 **Flexible file paths** - works with any OAS file location in your repo
- 🚀 **Easy integration** with GitHub workflows
- 📊 **Detailed logging** for debugging and monitoring

## Inputs

The following inputs are fully declared and documented in the [action.yml](action.yml):

### Required Inputs

- `brainfish_api_token` [**Required**] - Your Brainfish API token for authentication
- `catalog_id` [**Required**] - The Brainfish catalog ID where the OAS file should be uploaded
- `oas_file_path` [**Required**] - Path to your OpenAPI Specification file (supports `.yaml`, `.yml`, `.json`)

### Optional Inputs

- `github_token` [**Optional**] - GitHub token (automatically provided, required only for private repositories)

## Outputs

- `status` - The status of the OAS sync operation
- `uploaded_file` - The name of the file that was uploaded to Brainfish

## Usage Examples

### Basic Usage - Sync on Push to Main

```yml
name: Sync OAS to Brainfish
on:
  push:
    branches: [main]
    paths: ['docs/api.yaml'] # Only run when OAS file changes

jobs:
  sync-oas:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        
      - name: Sync OAS to Brainfish
        uses: brainfish-ai/brainfish-oas-sync@v1
        with:
          brainfish_api_token: ${{ secrets.BRAINFISH_API_TOKEN }}
          catalog_id: ${{ secrets.BRAINFISH_CATALOG_ID }}
          oas_file_path: 'docs/api.yaml'
```

### Sync on Release

```yml
name: Sync OAS on Release
on:
  release:
    types: [published]

jobs:
  sync-oas:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        
      - name: Sync OpenAPI Spec to Brainfish
        uses: brainfish-ai/brainfish-oas-sync@v1
        with:
          brainfish_api_token: ${{ secrets.BRAINFISH_API_TOKEN }}
          catalog_id: 'your-catalog-id'
          oas_file_path: 'openapi.json'
```

### Multiple OAS Files

```yml
name: Sync Multiple OAS Files
on:
  workflow_dispatch: # Manual trigger

jobs:
  sync-multiple-oas:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        include:
          - file: 'docs/user-api.yaml'
            catalog: 'user-api-catalog-id'
          - file: 'docs/admin-api.yml'
            catalog: 'admin-api-catalog-id'
          - file: 'docs/public-api.json'
            catalog: 'public-api-catalog-id'
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        
      - name: Sync ${{ matrix.file }} to Brainfish
        uses: brainfish-ai/brainfish-oas-sync@v1
        with:
          brainfish_api_token: ${{ secrets.BRAINFISH_API_TOKEN }}
          catalog_id: ${{ matrix.catalog }}
          oas_file_path: ${{ matrix.file }}
```

## Setup Instructions

### 1. Get Your Brainfish API Token

1. Log in to your Brainfish dashboard
2. Navigate to API settings
3. Generate a new API token
4. Copy the token for use in GitHub secrets

### 2. Find Your Catalog ID

1. In your Brainfish dashboard, go to your desired catalog
2. Copy the catalog ID from the URL or catalog settings

### 3. Configure GitHub Secrets

Add the following secrets to your GitHub repository:

- `BRAINFISH_API_TOKEN` - Your Brainfish API token
- `BRAINFISH_CATALOG_ID` - Your catalog ID (optional, can be hardcoded in workflow)

### 4. Add Workflow File

Create `.github/workflows/sync-oas.yml` with one of the examples above.

## Supported File Formats

| Format | Extension | Conversion | Status |
|--------|-----------|------------|--------|
| YAML | `.yaml` | ✅ Auto-convert to JSON | ✅ Supported |
| YAML | `.yml` | ✅ Auto-convert to JSON | ✅ Supported |
| JSON | `.json` | ⚡ Upload as-is | ✅ Supported |

## Error Handling

The action provides detailed error messages for common issues:

- **File not found**: Check your `oas_file_path` parameter
- **Invalid YAML/JSON**: Validate your OAS file syntax
- **Authentication failed**: Verify your `brainfish_api_token`
- **Catalog not found**: Check your `catalog_id`
- **Network errors**: Temporary issues with Brainfish API

## Troubleshooting

### Common Issues

1. **"OAS file not found"**
   - Verify the file path is correct and the file exists
   - Use relative paths from the repository root

2. **"Authentication failed"**
   - Check that your API token is valid and not expired
   - Ensure the token has proper permissions for the catalog

3. **"Invalid YAML format"**
   - Validate your YAML syntax using a YAML validator
   - Check for proper indentation and structure

### Debug Mode

Enable debug logging by adding this to your workflow:

```yml
env:
  ACTIONS_STEP_DEBUG: true
```

## Development

### Building the Action

If you're contributing to this action or need to build it locally:

1. **Install dependencies**
   ```sh
   npm install
   ```

2. **Build the action**
   ```sh
   npm run build
   ```

3. **Test locally** (optional)
   ```sh
   # Create a test OAS file
   echo 'openapi: "3.0.0"' > test-api.yaml
   
   # Set environment variables
   export INPUT_BRAINFISH_API_TOKEN="your-token"
   export INPUT_CATALOG_ID="your-catalog-id"
   export INPUT_OAS_FILE_PATH="test-api.yaml"
   
   # Run the action
   node index.js
   ```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run build` to update the `dist/` folder
5. Submit a pull request

## License

This project is licensed under the MIT License - see the repository for details.

## Support

- 📖 [Brainfish Documentation](https://help.brainfi.sh)
- 🐛 [Report Issues](https://github.com/brainfish-ai/brainfish-oas-sync/issues)
- 💬 [Community Support](https://github.com/brainfish-ai/brainfish-oas-sync/discussions)
