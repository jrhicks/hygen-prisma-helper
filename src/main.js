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
      default: undefined,
      isEnumField: false,
      isScalarField: false,
      isKeyField: false,
      isBelongsToField: false,
      isHasManyField: false,
      isHasOneField: false,
      isRequired: false,
      isUnique: false,
      isArray: field.array,
      foreignKey: undefined,
      references: undefined,
      relatedModel: null,
      relatedEnum: null
    },
    field
  )

  if (field.attributes) {
    let attributes = [...field.attributes]
    if (attributes) {
      attributes.forEach((attribute) => {
        if (attribute.name === 'unique') {
          newField.isUnique = true
        }
        if (attribute.name === 'default') {
          const keyDefaults = ['autoincrement', 'cuid', 'uuid']
          newField.default = attribute.args[0].value.name
          if (keyDefaults.includes(newField.default)) {
            newField.isKeyField = true
          }
        }
        if (attribute.name === 'relation') {
          field.isRelation = true
          attribute.args.forEach((arg) => {
            let value = arg.value
            if (value.type === 'keyValue') {
              if (value.key === 'fields') {
                newField.foreignKey = value.value.args[0]
                newField.isBelongsToField = true
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
    fields: [],
    keyFields: [],
    enumFields: [],
    scalarFields: [],
    hasManyFields: [],
    hasOneFields: [],
    belongsToFields: []
  }

  if (model.properties) {
    model.properties
      .filter((x) => x.type === 'field')
      .forEach((f) => {
        let newField = createField(f)
        newModel.fields.push(newField)

        // IDENTIFY AND COLLECT SCALAR FIELDS
        if (SCALOR_TYPES.includes(newField.fieldType) && !newField.isKeyField) {
          newModel.scalarFields.push(newField)
          newField.isScalar = true
        }

        // COLLECT BELONGS TO FIELDS
        if (newField.isBelongsToField) {
          newModel.belongsToFields.push(newField)
        }

        // COLLECT KEYFIELDS
        if (newField.isKeyField) {
          newModel.keyFields.push(newField)
        }

        delete newField.attributes
      })
  }

  let foreignkeyFields = newModel.belongsToFields.map((x) => x.foreignKey)
  newModel.scalarFields = newModel.scalarFields.filter(
    (scalor) => !foreignkeyFields.includes(scalor.name)
  )
  return newModel
}

export const createHelper = (source) => {
  const schema = getSchema(source)
  const enums = schema.list.filter((x) => x.type === 'enum').map(createEnum)
  const models = schema.list.filter((x) => x.type === 'model').map(createModel)

  // Identify and Link hasManyFields
  models.forEach((model) => {
    model.fields.forEach((field) => {
      if (field.isArray) {
        let m = models.find((x) => x.name === field.fieldType)
        if (m) {
          field.relatedModel = m
          field.isHasManyField = true
          model.hasManyFields.push(field)
        }
      }
    })
  })

  // Identify and Link enumFields
  models.forEach((model) => {
    model.fields.forEach((field) => {
      if (!field.isScalarField && !field.isBelongsToField && !field.isHasManyField) {
        let m = enums.find((x) => x.name === field.fieldType)
        if (m) {
          field.relatedModel = m
          field.isEnumField = true
          model.enumFields.push(field)
        }
      }
    })
  })

  // Link belongToFields
  models.forEach((model) => {
    model.belongsToFields.forEach((field) => {
      let m = models.find((x) => x.name === field.references)
      if (m) {
        field.relatedModel = models.find((x) => x.name === field.fieldType)
      }
    })
  })

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
