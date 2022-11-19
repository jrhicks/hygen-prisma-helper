import { getSchema } from '@mrleebo/prisma-ast'

const SCALOR_TYPES = ['Float', 'String', 'Int', 'Boolean', 'DateTime', 'Bytes', 'Decimal']

const createField = (field) => {
  let newField = Object.assign(
    {
      autoincrement: false,
      default: undefined,
      isKey: false,
      isScalor: true,
      isEnum: false,
      isBelongsTo: false,
      foreignKey: undefined,
      references: undefined
    },
    field
  )
  if (field.attributes) {
    let attributes = [...field.attributes]
    if (attributes) {
      attributes.forEach((attribute) => {
        if (attribute.name === 'unique') {
          newField.unique = true
        }
        if (attribute.name === 'default') {
          newField.default = attribute.args[0].value
        }
        if (attribute.name === 'relation') {
          field.isRelation = true
          newField.fieldModel = () => {
            throw 'Not implemented'
          }
          attribute.args.forEach((arg) => {
            let value = arg.value
            if (value.type === 'keyValue') {
              if (value.key === 'fields') {
                newField.foreignKey = value.value.args[0]
                newField.isBelongsTo = true
              }
              if (value.key === 'references') {
                newField.references = value.value.args[0]
              }
            }
          })
        }
      })
    }
  }
  return newField
}

const createEnum = (enumModel) => {
  return enumModel
}

const createModel = (model) => {
  let newModel = {
    keys: [],
    scalars: [],
    hasManyRelationships: [],
    hasOneRelationships: [],
    belongsToRelationships: []
  }

  if (model.properties) {
    model.properties
      .filter((x) => x.type === 'field')
      .forEach((f) => {
        let newField = createField(f)
        if (SCALOR_TYPES.includes(newField.fieldType)) {
          newModel.scalars.push(newField)
        }
        if (newField.isBelongsTo) {
          newModel.belongsToRelationships.push(newField)
        }
        delete newField.attributes
      })
  }

  let foreignKeys = newModel.belongsToRelationships.map((x) => x.foreignKey)
  newModel.scalars = newModel.scalars.filter((scalor) => !foreignKeys.includes(scalor.name))
  return newModel
}

export const createHelpers = (source) => {
  // https://github.com/MrLeebo/prisma-ast/blob/main/src/printSchema.ts
  const schema = getSchema(source)

  const enums = schema.list.filter((x) => x.type === 'enum').map(createEnum)

  const models = schema.list.filter((x) => x.type === 'model').map(createModel)

  const raw = schema.list

  return { models, enums, raw }
}
