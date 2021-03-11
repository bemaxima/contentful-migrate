const contentful = require('contentful-management')
const chalk = require('chalk')
const pMap = require('p-map')
const log = require('migrate/lib/log')

const createFile = require('./createFile')
const { jsonToScript } = require('./jsonToScript')

// Magic number to prevent overloading the contentful management API.
// TODO: passed in from bootstrap command as an option
const concurrency = 5

const generateScripts = async (spaceId, environmentId, contentTypes, accessToken, migrationsDirectory, extension) => {
  const client = contentful.createClient({ accessToken })
  const space = await client.getSpace(spaceId)
  const environment = await space.getEnvironment(environmentId)
  // TODO: add pagination when content type exceeds 1000
  const contentTypeResponse = await environment.getContentTypes({ limit: 1000 })
  let requiredContentTypes = contentTypeResponse.items.filter(item => item.sys.id !== 'migration')
  if (contentTypes.length > 0) {
    const contentTypesSet = new Set(contentTypes)
    requiredContentTypes = requiredContentTypes.filter(contentType => contentTypesSet.has(contentType.sys.id))
  }
  const mapper = (contentType) => {
    const contentTypeId = contentType.sys.id
    return environment.getEditorInterfaceForContentType(contentTypeId)
      .then(async (editorInterface) => {
        return createFile(
          contentTypeId,
          await jsonToScript(contentType, editorInterface.controls, extension),
          migrationsDirectory,
          extension
        )
      })
  }

  const files = await pMap(requiredContentTypes, mapper, { concurrency })
  log(chalk.bold.green('🎉  Scripts generation'), chalk.bold.green('successful'))
  return files
}

module.exports = generateScripts
