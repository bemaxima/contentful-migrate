// const eslint = require('eslint')

const removeNullValues = (value) => {
  if (value instanceof Array) {
    return value.map(removeNullValues)
  } else if (value instanceof Object) {
    const prunedObject = {}
    Object.keys(value).forEach((key) => {
      if (value[key] === null || value[key] === undefined) {
        return
      }
      prunedObject[key] = removeNullValues(value[key])
    })
    return prunedObject
  }
  return value
}

const createProp = ([key, value]) => `
  .${key}(${JSON.stringify(removeNullValues(value))})`

const rejectEmptyObjects = ([, value]) => {
  const emptyArray = value.constructor === Array && value.length === 0
  const emptyObject = typeof value === 'object' && Object.keys(value).length === 0
  return value && !emptyArray && !emptyObject
}

const createField = (itemId, field) => `
  ${itemId}.createField("${field.id}")${''.concat(...Object.entries(field.props).filter(rejectEmptyObjects).map(createProp))};
`

const createChangeFieldControl = (itemId, field) => {
  const { fieldId, widgetId, settings, widgetNamespace } = field
  const baseString = `${itemId}.changeFieldControl("${fieldId}", "${widgetNamespace}", "${widgetId}"`
  return settings ? `${baseString}, ${JSON.stringify(settings)});` : `${baseString});`
}

const createContentType = (item, editorInterface) => `
  const ${item.id} = migration.createContentType('${item.id}')${''.concat(...Object.entries(item.props).map(createProp))};
  ${''.concat(...item.fields.map(field => createField(item.id, field)))}
  ${editorInterface.map(field => createChangeFieldControl(item.id, field)).join('\n')}
`

const createJSScript = (item, editorInterface) => `module.exports.description = 'Create content model for ${item.props.name}';

module.exports.up = (migration) => {${createContentType(item, editorInterface)}};

module.exports.down = migration => migration.deleteContentType('${item.id}');
`

const createTSScript = (item, editorInterface) => `import { MigrationFunction } from 'contentful-migration';
  const description = "Create content model for ${item.props.name}";

  const up: MigrationFunction = (migration) => {${createContentType(item, editorInterface)}};

  const down: MigrationFunction = (migration) => migration.deleteContentType("${item.id}");

  export {
    description,
    up,
    down
  }
`

const restructureFields = (field) => {
  const { id, ...props } = field
  return { id, props }
}

const restructureContentTypeJson = item => ({
  id: item.sys.id,
  props: {
    name: item.name,
    displayField: item.displayField,
    description: item.description
  },
  fields: item.fields.map(restructureFields)
})

const jsonToScript = async (contentTypeJson, editorInterface, extension) => {
  const restructuredJson = restructureContentTypeJson(contentTypeJson)
  const unformattedScript = extension === '.ts'
    ? createTSScript(restructuredJson, editorInterface)
    : createJSScript(restructuredJson, editorInterface)
  return unformattedScript
  // const engine = new eslint.ESLint({
  //   fix: true,
  //   baseConfig: { extends: ['eslint-config-standard-with-typescript'] },
  //   overrideConfigFile: `${process.cwd()}/.eslintrc.js`,
  //   overrideConfig: {
  //     rules: {
  //       indent: 'off'
  //     }
  //   },
  //   useEslintrc: false
  // })
  // const [result] = await engine.lintText(unformattedScript)
  // console.log(result);
  // return result.output;
}

module.exports = {
  removeNullValues,
  rejectEmptyObjects,
  createChangeFieldControl,
  restructureFields,
  restructureContentTypeJson,
  jsonToScript
}
