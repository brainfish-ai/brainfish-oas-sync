# Test Environment Setup

This folder contains test files and GitHub Actions workflows for testing the Brainfish OAS Sync action in the dev environment.

## Test Files

### `api-spec.json`
- **Format**: JSON OpenAPI Specification
- **Content**: Sample User API with CRUD operations
- **Target Catalog**: `8a2abadd-1140-4f40-921c-e4a30c6a8238`
- **Dev URL**: https://app.dev.brainfish.app/knowledge/catalog/8a2abadd-1140-4f40-921c-e4a30c6a8238

### `api-spec.yaml`
- **Format**: YAML OpenAPI Specification
- **Content**: Sample Product API with CRUD operations
- **Target Catalog**: `addad784-8e01-4bc3-b37e-b584ea6d24c5`
- **Dev URL**: https://app.dev.brainfish.app/knowledge/catalog/addad784-8e01-4bc3-b37e-b584ea6d24c5

## GitHub Actions Workflow

### `../.github/workflows/test-dev-sync.yml`

This workflow is located in the root `.github/workflows/` directory and tests the OAS sync functionality in the dev environment with the following jobs:

#### 1. **test-json-sync**
- Tests JSON file upload to the JSON catalog
- Uses `test/api-spec.json`
- Targets catalog ID: `8a2abadd-1140-4f40-921c-e4a30c6a8238`

#### 2. **test-yaml-sync**
- Tests YAML file upload (with auto-conversion to JSON)
- Uses `test/api-spec.yaml`
- Targets catalog ID: `addad784-8e01-4bc3-b37e-b584ea6d24c5`

#### 3. **test-error-handling**
- Tests error handling with non-existent file
- Verifies that the action fails gracefully

### Triggers
- **Manual**: `workflow_dispatch` with file selection options
- **Automatic**: Push to `main`/`develop` branches when test files or core files change

## Required Secrets

Add this secret to your GitHub repository:

- `BRAINFISH_DEV_API_TOKEN` - Your Brainfish dev environment API token

## Usage

### Manual Testing
1. Go to Actions tab in GitHub
2. Select "Test Brainfish OAS Sync - Dev Environment"
3. Click "Run workflow"
4. Choose which file(s) to test: `json`, `yaml`, or `both`

### Automatic Testing
Push changes to the following files to trigger automatic tests:
- `test/api-spec.json`
- `test/api-spec.yaml`
- `index.js`
- `action.yml`

## Dev Environment Details

- **Base URL**: `https://app.dev.brainfish.app`
- **API Endpoint**: `https://app.dev.brainfish.app/api/catalogs.upload`

### Catalog URLs
- **JSON Catalog**: https://app.dev.brainfish.app/knowledge/catalog/8a2abadd-1140-4f40-921c-e4a30c6a8238
- **YAML Catalog**: https://app.dev.brainfish.app/knowledge/catalog/addad784-8e01-4bc3-b37e-b584ea6d24c5

## Testing Scenarios Covered

1. ✅ **JSON file upload** - Tests direct JSON file sync
2. ✅ **YAML file upload** - Tests YAML to JSON conversion and sync
3. ✅ **Error handling** - Tests file not found scenario
4. ✅ **Dev environment** - Tests custom base URL functionality
5. ✅ **Output validation** - Verifies action outputs are set correctly

## Expected Results

### Successful Sync
```
Status: ✅ OAS file successfully synced to Brainfish!
Uploaded file: api-spec.json (or converted filename)
```

### Error Handling
```
❌ Error: OAS file not found at path: test/non-existent-file.json
```

## Local Testing

You can test the action locally using the provided test files:

```bash
# Set environment variables
export INPUT_BRAINFISH_API_TOKEN="your-dev-api-token"
export INPUT_BASE_URL="https://app.dev.brainfish.app"

# Test JSON file
export INPUT_CATALOG_ID="8a2abadd-1140-4f40-921c-e4a30c6a8238"
export INPUT_OAS_FILE_PATH="test/api-spec.json"
node index.js

# Test YAML file
export INPUT_CATALOG_ID="addad784-8e01-4bc3-b37e-b584ea6d24c5"
export INPUT_OAS_FILE_PATH="test/api-spec.yaml"
node index.js
```
