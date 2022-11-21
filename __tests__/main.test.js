const { createHelper } = require('../src/main.js')

// posts         Post[]
// profile       Profile?
// manager       User       @relation(fields: [managerId], references: [id])
// managerId     Int

describe('Traverse Relationships', () => {
  const source = `
    model Post {
      id       Int       @id @default(autoincrement())
      status   Status    @default(DRAFT)
      comments Comment[]
    }
    
    model Comment {
      id     Int
      Post   Post? @relation(fields: [postId], references: [id]) // A comment can have one post
      postId Int?
    }

    enum Status {
      DRAFT
      PUBLISHED
    }
  `

  const prisma = createHelper(source)

  test('traverse belongsToField', () => {
    const comment = prisma.models.find('Comment')
    expect(comment.belongsToFields[0].relatedModel).toBeDefined()
  })

  test('traverse hasManyField', () => {
    const post = prisma.models.find('Post')
    expect(post.hasManyFields[0].relatedModel).toBeDefined()
  })

  test('traverse enumField', () => {
    const post = prisma.models.find('Post')
    expect(post.enumFields[0].relatedEnum).toBeDefined()
  })
})

describe('Enum Values', () => {
  const source = `
  enum Status {
    ACTIVE_STATE
    INACTIVE_STATE
  }
  `
  const prisma = createHelper(source)
  const status = prisma.enums.find('Status')
  const activeState = status.enumerators[0]

  test('should have 2 enumerators', () => {
    expect(status.enumerators.length).toBe(2)
  })

  test('name', () => {
    expect(activeState.name).toBe('ACTIVE_STATE')
  })

  test('label', () => {
    expect(activeState.label).toBe('Active state')
  })

  test('title', () => {
    expect(activeState.title).toBe('Active State')
  })
})

describe('Enum inflection', () => {
  const source = `
    enum StatusFoo {
      ACTIVE
    }
    enum StatusFoos {
      ACTIVE
    }
  `

  const prisma = createHelper(source)
  const status = prisma.enums.find('StatusFoo')
  const statuses = prisma.enums.find('StatusFoos')

  test('name', () => {
    expect(status.name).toBe('StatusFoo')
    expect(statuses.name).toBe('StatusFoos')
  })

  test('singularName', () => {
    expect(status.singularName).toBe('StatusFoo')
    expect(statuses.singularName).toBe('StatusFoo')
  })

  test('pluralName', () => {
    expect(status.pluralName).toBe('StatusFoos')
    expect(statuses.pluralName).toBe('StatusFoos')
  })

  test('singularVaraible', () => {
    expect(status.singularVariable).toEqual('statusFoo')
    expect(statuses.singularVariable).toEqual('statusFoo')
  })

  test('pluralVariable', () => {
    expect(status.pluralVariable).toEqual('statusFoos')
    expect(statuses.pluralVariable).toEqual('statusFoos')
  })

  test('singularLabel', () => {
    expect(status.singularLabel).toEqual('Status foo')
    expect(statuses.singularLabel).toEqual('Status foo')
  })

  test('pluralLabel', () => {
    expect(status.pluralLabel).toEqual('Status foos')
    expect(statuses.pluralLabel).toEqual('Status foos')
  })

  test('singularTitle', () => {
    expect(status.singularTitle).toEqual('Status Foo')
    expect(statuses.singularTitle).toEqual('Status Foo')
  })

  test('pluralTitle', () => {
    expect(status.pluralTitle).toEqual('Status Foos')
    expect(statuses.pluralTitle).toEqual('Status Foos')
  })
})

describe('Model keyFields', () => {
  const source = `
    model User {
      a    Int     @default(autoincrement())
      b    String  @default(uuid())
      c    String  @default(cuid())
    }
    `
  const prisma = createHelper(source)
  const model = prisma.models.find('User')
  const keyFieldNames = model.keyFields.map((x) => x.name)
  const scalorFieldNames = model.scalarFields.map((x) => x.name)

  test('scalarFields do NOT include key fields', () => {
    expect(scalorFieldNames).not.toContain('a')
    expect(scalorFieldNames).not.toContain('b')
    expect(scalorFieldNames).not.toContain('c')
  })

  test('autoincrement fields are keyFields', () => {
    expect(keyFieldNames).toContain('a')
  })

  test('uuid fields are keyFields', () => {
    expect(keyFieldNames).toContain('b')
  })

  test('cuid fields are keyFields', () => {
    expect(keyFieldNames).toContain('c')
  })
})

describe('Finders throw helpfull exceptions', () => {
  const source = `
    model User {
    }
    enum Role {
    }
    `
  const prisma = createHelper(source)

  test('models.finder', () => {
    expect(() => prisma.models.find('X')).toThrow(`Model X not found`)
  })

  test('enums.finder', () => {
    expect(() => prisma.enums.find('X')).toThrow(`Enum X not found`)
  })
})

describe('Field Inflection', () => {
  const source = `
    model User {
      snake_case  String
      snake_cases String
    }
    `

  const prisma = createHelper(source)
  const snake_case = prisma.models.find('User').scalarFields[0]
  const snake_cases = prisma.models.find('User').scalarFields[1]

  test('name', () => {
    expect(snake_case.name).toBe('snake_case')
    expect(snake_cases.name).toBe('snake_cases')
  })

  test('singularName', () => {
    expect(snake_case.singularName).toBe('snake_case')
    expect(snake_cases.singularName).toBe('snake_case')
  })

  test('pluralName', () => {
    expect(snake_case.pluralName).toBe('snake_cases')
    expect(snake_cases.pluralName).toBe('snake_cases')
  })

  test('singularVaraible', () => {
    expect(snake_case.singularVariable).toEqual('snakeCase')
    expect(snake_cases.singularVariable).toEqual('snakeCase')
  })

  test('pluralVariable', () => {
    expect(snake_case.pluralVariable).toEqual('snakeCases')
    expect(snake_cases.pluralVariable).toEqual('snakeCases')
  })

  test('singularLabel', () => {
    expect(snake_case.singularLabel).toEqual('Snake case')
    expect(snake_cases.singularLabel).toEqual('Snake case')
  })

  test('pluralLabel', () => {
    expect(snake_case.pluralLabel).toEqual('Snake cases')
    expect(snake_cases.pluralLabel).toEqual('Snake cases')
  })

  test('singularTitle', () => {
    expect(snake_case.singularTitle).toEqual('Snake Case')
    expect(snake_cases.singularTitle).toEqual('Snake Case')
  })

  test('pluralTitle', () => {
    expect(snake_case.pluralTitle).toEqual('Snake Cases')
    expect(snake_cases.pluralTitle).toEqual('Snake Cases')
  })
})

describe('Model Inflection', () => {
  const source = `
    model CamelCase {
    }
    
    model CamelCases {
    }
    `

  const prisma = createHelper(source)
  const camelCase = prisma.models.find('CamelCase')
  const camelCases = prisma.models.find('CamelCases')

  test('name', () => {
    expect(camelCase.name).toBe('CamelCase')
    expect(camelCases.name).toBe('CamelCases')
  })

  test('singularName', () => {
    expect(camelCase.singularName).toBe('CamelCase')
    expect(camelCases.singularName).toBe('CamelCase')
  })

  test('pluralName', () => {
    expect(camelCase.pluralName).toBe('CamelCases')
    expect(camelCases.pluralName).toBe('CamelCases')
  })

  test('singularVaraible', () => {
    expect(camelCase.singularVariable).toEqual('camelCase')
    expect(camelCases.singularVariable).toEqual('camelCase')
  })
  test('pluralVariable', () => {
    expect(camelCase.pluralVariable).toEqual('camelCases')
    expect(camelCases.pluralVariable).toEqual('camelCases')
  })
  test('singularLabel', () => {
    expect(camelCase.singularLabel).toEqual('Camel case')
    expect(camelCases.singularLabel).toEqual('Camel case')
  })
  test('pluralLabel', () => {
    expect(camelCase.pluralLabel).toEqual('Camel cases')
    expect(camelCases.pluralLabel).toEqual('Camel cases')
  })

  test('singularTitle', () => {
    expect(camelCase.singularTitle).toEqual('Camel Case')
    expect(camelCases.singularTitle).toEqual('Camel Case')
  })
  test('pluralTitle', () => {
    expect(camelCase.pluralTitle).toEqual('Camel Cases')
    expect(camelCases.pluralTitle).toEqual('Camel Cases')
  })
})

describe('Finders', () => {
  test('find models by name', () => {
    const source = `
      model User {
      }`
    const prisma = createHelper(source)
    expect(prisma.models.find('User')).toBeDefined()
  })

  test('find enums by name', () => {
    const source = `
      enum Status {
      }`
    const prisma = createHelper(source)
    expect(prisma.enums.find('Status')).toBeDefined()
  })
})

describe('Models belongsTo', () => {
  const source = `
    model User {
      id            Int      @id @default(autoincrement())
      manager       User       @relation(fields: [managerId], references: [id])
      managerId     Int
    }
  `
  const prisma = createHelper(source)
  const model = prisma.models.all[0]

  test('Set belongsToFields', () => {
    let btFieldNames = model.belongsToFields.map((x) => x.name)
    expect(btFieldNames).toContain('manager')
  })

  test('Set foreignKey on belongsToField', () => {
    let btField = model.belongsToFields.find((x) => x.name === 'manager')
    expect(btField.foreignKey).toBe('managerId')
  })

  test('Set references on belongsToField', () => {
    let btField = model.belongsToFields.find((x) => x.name === 'manager')
    expect(btField.references).toBe('id')
  })

  test('Exclude foreignkeyFields from scalors', () => {
    expect(model.scalarFields.map((s) => s.name)).not.toContain('managerId')
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

  const prisma = createHelper(source)
  const models = prisma.models.all
  const scalorFieldNames = models[0].scalarFields.map((f) => f.name)

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
    const prisma = createHelper(source)
    expect(prisma.models.all[0]).toBeDefined()
  })

  test('Parse Empty Enum', () => {
    const source = `
    enum Role {
    }`
    const prisma = createHelper(source)
    expect(prisma.enums.all[0]).toBeDefined()
  })
})
