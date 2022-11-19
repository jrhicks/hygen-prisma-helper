import { createHelpers } from '../src/createHelpers.js'

// posts         Post[]
// profile       Profile?
// manager       User       @relation(fields: [managerId], references: [id])
// managerId     Int

describe('Models belongsTo', () => {
  const source = `
    model User {
      id            Int      @id @default(autoincrement())
      manager       User       @relation(fields: [managerId], references: [id])
      managerId     Int
    }
  `
  const { models, raw } = createHelpers(source)
  const model = models[0]

  test('Set belongsToRelationships', () => {
    let btFieldNames = model.belongsToRelationships.map((x) => x.name)
    expect(btFieldNames).toContain('manager')
  })

  test('Set foreignKey on belongsToField', () => {
    let btField = model.belongsToRelationships.find((x) => x.name === 'manager')
    expect(btField.foreignKey).toBe('managerId')
  })

  test('Set references on belongsToField', () => {
    let btField = model.belongsToRelationships.find((x) => x.name === 'manager')
    expect(btField.references).toBe('id')
  })

  test('Exclude foreignKeys from scalors', () => {
    expect(models[0].scalars.map((s) => s.name)).not.toContain('managerId')
  })
})

describe('Models collect scalor fields', () => {
  const source = `
    model User {
      intField      Int 
      bigIntField   BigInt 
      floatField    Float 
      decimalField  Decimal
      stringField   String
      optionalField String?
      booleanField  Boolean
      dateTimeField DateTime
      jsonField     Json
      bytesField    Bytes
    }
  `
  const { models } = createHelpers(source)
  const scalorFieldNames = models[0].scalars.map((f) => f.name)

  test('Include Boolean Fields in scalors', () => {
    expect(scalorFieldNames).toContain('booleanField')
  })

  test('Include Bytes Fields in scalors', () => {
    expect(scalorFieldNames).toContain('bytesField')
  })

  test('Include DateTime Fields in scalors', () => {
    expect(scalorFieldNames).toContain('dateTimeField')
  })

  test('Include Decimal Fields in scalors', () => {
    expect(scalorFieldNames).toContain('decimalField')
  })

  test('Include Float Fields in scalors', () => {
    expect(scalorFieldNames).toContain('floatField')
  })

  test('Include Optional Fields in scalors', () => {
    expect(scalorFieldNames).toContain('optionalField')
  })

  test('Include String Fields in scalors', () => {
    expect(scalorFieldNames).toContain('stringField')
  })
})

describe('Edge Cases', () => {
  test('Parse Empty Model', () => {
    const source = `
      model User {
      }`
    const { models } = createHelpers(source)
    console.log(models)
    expect(models[0]).toBeDefined()
  })

  test('Parse Empty Enum', () => {
    const source = `
    enum Role {
    }`
    const { enums } = createHelpers(source)
    expect(enums[0]).toBeDefined()
  })
})
