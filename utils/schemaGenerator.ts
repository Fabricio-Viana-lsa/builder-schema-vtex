import { 
  PropertyForm, 
  VtexSchemaDefinition, 
  VtexProperty, 
  ArrayItemProperty,
  ArrayArrayItemProperty,
  ObjectArrayItemProperty,
  EnumArrayItemProperty,
  StringArrayItemProperty
} from '@/types';

/**
 * Type guard para propriedades do tipo array
 */
function isArrayProperty(prop: ArrayItemProperty): prop is ArrayArrayItemProperty {
  return prop.type === 'array';
}

/**
 * Type guard para propriedades do tipo object
 */
function isObjectProperty(prop: ArrayItemProperty): prop is ObjectArrayItemProperty {
  return prop.type === 'object';
}

/**
 * Type guard para propriedades do tipo enum
 */
function isEnumProperty(prop: ArrayItemProperty): prop is EnumArrayItemProperty {
  return prop.type === 'enum';
}

/**
 * Type guard para propriedades do tipo string
 */
function isStringProperty(prop: ArrayItemProperty): prop is StringArrayItemProperty {
  return prop.type === 'string';
}

/**
 * Processa recursivamente propriedades de array/object aninhados
 */
function processArrayItemProperties(items: ArrayItemProperty[]): { [key: string]: VtexProperty } {
  const properties: { [key: string]: VtexProperty } = {};

  items.forEach((itemProp) => {
    if (!itemProp.name) return;

    const itemProperty: VtexProperty = {
      type: (itemProp.type === 'conditional' || itemProp.type === 'enum') ? 'string' : itemProp.type,
      title: itemProp.title,
    };

    if (itemProp.description) itemProperty.description = itemProp.description;

    if (itemProp.defaultValue) {
      if (itemProp.type === 'boolean') {
        itemProperty.default = itemProp.defaultValue === 'true';
      } else if (itemProp.type === 'number') {
        itemProperty.default = Number(itemProp.defaultValue);
      } else {
        itemProperty.default = itemProp.defaultValue;
      }
    }

    if (isStringProperty(itemProp)) {
      if (itemProp.widget) {
        itemProperty.widget = { 'ui:widget': itemProp.widget };
      }
      if (itemProp.format) {
        itemProperty.format = itemProp.format;
      }
    }

    if (isEnumProperty(itemProp) && itemProp.enumValues) {
      itemProperty.enum = itemProp.enumValues.split(',').map((v: string) => v.trim());
      if (itemProp.enumNames) {
        itemProperty.enumNames = itemProp.enumNames.split(',').map((v: string) => v.trim());
      }
    }

    // Processar array aninhado
    if (isArrayProperty(itemProp) && itemProp.arrayItemProperties && itemProp.arrayItemProperties.length > 0) {
      const nestedProperties = processArrayItemProperties(itemProp.arrayItemProperties);
      itemProperty.items = {
        type: 'object',
        properties: nestedProperties,
      };
    }

    // Processar objeto aninhado
    if (isObjectProperty(itemProp) && itemProp.objectProperties && itemProp.objectProperties.length > 0) {
      const nestedProperties = processArrayItemProperties(itemProp.objectProperties);
      itemProperty.properties = nestedProperties;
    }

    properties[itemProp.name] = itemProperty;
  });

  return properties;
}

/**
 * Gera o schema VTEX a partir das propriedades do formulário
 * @param properties Array de propriedades do formulário
 * @param componentTitle Título do componente
 * @returns Schema VTEX completo
 */
export function generateVtexSchema(
  properties: PropertyForm[],
  componentTitle: string
): VtexSchemaDefinition {
  const schemaProperties: Record<string, VtexProperty> = {};
  const pendingDependencies: NonNullable<VtexSchemaDefinition['dependencies']> = {};

  properties.forEach((prop) => {
    if (!prop.name) return;

    const property: VtexProperty = {
      type: prop.type === 'conditional' || prop.type === 'enum' ? 'string' : prop.type,
      title: prop.title,
    };

    if (prop.description) property.description = prop.description;

    // Valor padrão - tratamento especial para cada tipo
    if (prop.defaultValue) {
      if (prop.type === 'boolean') {
        property.default = prop.defaultValue === 'true';
      } else if (prop.type === 'number') {
        property.default = Number(prop.defaultValue);
      } else {
        property.default = prop.defaultValue;
      }
    }

    // Widget e formato (apenas para string)
    if (prop.type === 'string') {
      if (prop.widget) {
        property.widget = { 'ui:widget': prop.widget };
      }

      if (prop.format) {
        property.format = prop.format;
      }
    }

    if ((prop.type === 'string' || prop.type === 'enum') && prop.enumValues) {
      property.enum = prop.enumValues.split(',').map((v) => v.trim());
      if (prop.enumNames) {
        property.enumNames = prop.enumNames.split(',').map((v) => v.trim());
      }
    }

    // Configuração de Object
    if (prop.type === 'object' && prop.objectProperties && prop.objectProperties.length > 0) {
      // Processar propriedades do objeto (com suporte a aninhamento)
      const processedProperties = processArrayItemProperties(prop.objectProperties);
      property.properties = processedProperties;
    }

    // Configuração de Array
    if (prop.type === 'array' && prop.arrayItemProperties && prop.arrayItemProperties.length > 0) {
      const itemProperties: { [key: string]: VtexProperty } = {};

      // Adicionar __editorItemTitle se habilitado
      if (prop.enableEditorItemTitle) {
        itemProperties.__editorItemTitle = {
          type: 'string',
          title: prop.editorItemTitleLabel || 'Change item name',
          default: prop.editorItemTitleDefault || 'Item',
        };
      }

      // Processar propriedades do item do array (com suporte a aninhamento)
      const processedProperties = processArrayItemProperties(prop.arrayItemProperties);
      Object.assign(itemProperties, processedProperties);

      property.items = {
        type: 'object',
        title: prop.arrayItemTitle || 'Item',
        properties: itemProperties,
      };

      // Default value para array (se fornecido)
      if (prop.arrayDefaultValue) {
        try {
          property.default = JSON.parse(prop.arrayDefaultValue);
        } catch {
          // Ignora se não for JSON válido
        }
      }
    }

    // Configuração de Conditional
    if (prop.type === 'conditional') {
      // Força os valores fixos para o campo conditional
      property.type = 'string';
      property.enum = ['none', 'provide'];
      property.enumNames = ['Não', 'Sim'];
      property.default = 'none';
      property.widget = { 'ui:widget': 'radio' };

      // Se houver campos condicionais, adiciona ao schema principal e cria dependencies
      if (
        prop.addConditionalFields &&
        prop.conditionalFields &&
        prop.conditionalFields.length > 0 &&
        prop.name
      ) {
        const triggerValue = 'provide';
        const conditionalProperties: Record<string, Partial<VtexProperty>> = {};

        // Adiciona o próprio campo com enum restrito ao valor trigger
        conditionalProperties[prop.name] = {
          enum: [triggerValue],
        };

        // Adiciona os campos condicionais
        prop.conditionalFields.forEach((condField) => {
          if (!condField.name) return;

          const condProperty: Partial<VtexProperty> = {
            type: (condField.type === 'conditional' || condField.type === 'enum') ? 'string' : condField.type,
          };

          if (condField.defaultValue) {
            if (condField.type === 'boolean') {
              condProperty.default = condField.defaultValue === 'true';
            } else if (condField.type === 'number') {
              condProperty.default = Number(condField.defaultValue);
            } else {
              condProperty.default = condField.defaultValue;
            }
          }

          if (condField.type === 'string') {
            if (condField.widget) {
              condProperty.widget = { 'ui:widget': condField.widget };
            }

            if (condField.format) {
              condProperty.format = condField.format;
            }
          }

          if (condField.type === 'enum' && condField.enumValues) {
            condProperty.enum = condField.enumValues.split(',').map((v) => v.trim());
            if (condField.enumNames) {
              condProperty.enumNames = condField.enumNames.split(',').map((v) => v.trim());
            }
          }

          conditionalProperties[condField.name] = condProperty;
        });

        pendingDependencies[prop.name] = {
          oneOf: [
            {
              properties: conditionalProperties,
            },
          ],
        };
      }
    }

    schemaProperties[prop.name] = property;
  });

  const schema: VtexSchemaDefinition = {
    title: componentTitle,
    type: 'object',
    properties: schemaProperties,
  };

  if (Object.keys(pendingDependencies).length > 0) {
    schema.dependencies = pendingDependencies;
  }

  return schema;
}
