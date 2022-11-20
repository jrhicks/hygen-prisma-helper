import { getSchema } from '@mrleebo/prisma-ast'
import inflection from 'inflection'

const SCALOR_TYPES = ['Float', 'String', 'Int', 'Boolean', 'DateTime', 'Bytes', 'Decimal']

const singularName = (name) => {
  return inflection.singularize(name)
}

const pluralName = (name) => {
  return inflection.pluralize(name)
}

const singularVariable = (name) => {
  return inflection.camelize(inflection.singularize(name), true)
}

const pluralVariable = (name) => {
  return inflection.camelize(inflection.pluralize(name), true)
}

const singularTitle = (name) => {
  return inflection.transform(name, ['underscore', 'titleize', 'singularize'])
}

const pluralTitle = (name) => {
  return inflection.transform(name, ['underscore', 'titleize', 'pluralize'])
}

const singularLabel = (name) => {
  return inflection.transform(name, ['underscore', 'singularize', 'humanize'])
}

const pluralLabel = (name) => {
  return inflection.transform(name, ['underscore', 'pluralize', 'humanize'])
}

const createField = (field) => {
  let newField = Object.assign(
    {
      name: field.name,
      singularName: singularName(field.name),
      pluralName: pluralName(field.name),
      singularVariable: singularVariable(field.name),
      pluralVariable: pluralVariable(field.name),
      singularTitle: singularTitle(field.name),
      pluralTitle: pluralTitle(field.name),
      singularLabel: singularLabel(field.name),
      pluralLabel: pluralLabel(field.name),
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
          const keyDefaults = ['autoincrement', 'cuid', 'uuid']
          newField.default = attribute.args[0].value.name
          if (keyDefaults.includes(newField.default)) {
            newField.isKey = true
          }
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

const createEnumerator = (enumerator) => {
  const newEnumerator = {
    name: enumerator.name,
    title: inflection.titleize(enumerator.name.toLowerCase()),
    label: inflection.humanize(enumerator.name.toLowerCase()),
    comment: enumerator.comment
  }
  return newEnumerator
}

const createEnum = (enumModel) => {
  return {
    name: enumModel.name,
    enumerators: (enumModel.enumerators || []).map(createEnumerator),
    singularName: singularName(enumModel.name),
    pluralName: pluralName(enumModel.name),
    singularVariable: singularVariable(enumModel.name),
    pluralVariable: pluralVariable(enumModel.name),
    singularTitle: singularTitle(enumModel.name),
    pluralTitle: pluralTitle(enumModel.name),
    singularLabel: singularLabel(enumModel.name),
    pluralLabel: pluralLabel(enumModel.name)
  }
}

const createModel = (model) => {
  let newModel = {
    name: model.name,
    singularName: singularName(model.name),
    pluralName: pluralName(model.name),
    singularVariable: singularVariable(model.name),
    pluralVariable: pluralVariable(model.name),
    singularTitle: singularTitle(model.name),
    pluralTitle: pluralTitle(model.name),
    singularLabel: singularLabel(model.name),
    pluralLabel: pluralLabel(model.name),
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
        if (SCALOR_TYPES.includes(newField.fieldType) && !newField.isKey) {
          newModel.scalars.push(newField)
        }
        if (newField.isBelongsTo) {
          newModel.belongsToRelationships.push(newField)
        }
        if (newField.isKey) {
          newModel.keys.push(newField)
        }
        delete newField.attributes
      })
  }

  let foreignKeys = newModel.belongsToRelationships.map((x) => x.foreignKey)
  newModel.scalars = newModel.scalars.filter((scalor) => !foreignKeys.includes(scalor.name))
  return newModel
}

export const createHelper = (source) => {
  const schema = getSchema(source)
  const enums = schema.list.filter((x) => x.type === 'enum').map(createEnum)
  const models = schema.list.filter((x) => x.type === 'model').map(createModel)

  const prisma = {
    models: {
      all: models,
      find: (name) => {
        let model = models.filter((x) => x.name === name)[0]
        if (!model) {
          throw `Model ${name} not found`
        }
        return model
      }
    },
    enums: {
      all: enums,
      find: (name) => {
        let enumModel = enums.filter((x) => x.name === name)[0]
        if (!enumModel) {
          throw `Enum ${name} not found`
        }
        return enumModel
      }
    }
  }

  return prisma
}
