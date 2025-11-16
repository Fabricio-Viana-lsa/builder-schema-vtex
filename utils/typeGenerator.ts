import { 
  PropertyForm, 
  ArrayItemProperty,
  ArrayArrayItemProperty,
  ObjectArrayItemProperty,
  EnumArrayItemProperty
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
 * Gera tipo TypeScript para propriedades de array recursivamente
 */
function generateArrayItemType(items: ArrayItemProperty[], depth: number = 0): string {
  const indent = '    ' + '  '.repeat(depth);
  const itemProps: string[] = [];
  
  items.forEach((itemProp) => {
    if (!itemProp.name) return;
    
    let itemType: string;
    
    // Enum dentro de array
    if (isEnumProperty(itemProp) && itemProp.enumValues) {
      const values = itemProp.enumValues.split(',').map((v: string) => `'${v.trim()}'`);
      itemType = values.join(' | ');
    }
    // Array aninhado
    else if (isArrayProperty(itemProp) && itemProp.arrayItemProperties && itemProp.arrayItemProperties.length > 0) {
      const nestedType = generateArrayItemType(itemProp.arrayItemProperties, depth + 1);
      itemType = `Array<${nestedType}>`;
    }
    // Objeto aninhado
    else if (isObjectProperty(itemProp) && itemProp.objectProperties && itemProp.objectProperties.length > 0) {
      const nestedType = generateArrayItemType(itemProp.objectProperties, depth + 1);
      itemType = nestedType;
    }
    // Tipos básicos
    else {
      itemType = mapItemTypeToTypeScript(itemProp.type);
    }
    
    itemProps.push(`${indent}${itemProp.name}: ${itemType};`);
  });
  
  return `{\n${itemProps.join('\n')}\n${indent.slice(0, -2)}}`;
}

/**
 * Gera interface TypeScript a partir das propriedades do formulário
 * @param properties Array de propriedades do formulário
 * @param interfaceName Nome da interface TypeScript
 * @returns String com a interface TypeScript gerada
 */
export function generateTypeScriptInterface(
  properties: PropertyForm[],
  interfaceName: string = 'ComponentProps'
): string {
  const lines: string[] = [];
  
  lines.push(`export interface ${interfaceName} {`);

  properties.forEach((prop) => {
    if (!prop.name) return;

    // Adicionar comentário JSDoc se houver description
    if (prop.description) {
      lines.push(`  /** ${prop.description} */`);
    }

    const tsType = mapPropertyTypeToTypeScript(prop);
    const optional = !prop.required ? '?' : '';
    lines.push(`  ${prop.name}${optional}: ${tsType};`);
  });

  lines.push('}');
  
  return lines.join('\n');
}

/**
 * Mapeia o tipo da propriedade para o tipo TypeScript correspondente
 */
function mapPropertyTypeToTypeScript(prop: PropertyForm): string {
  switch (prop.type) {
    case 'string':
      // Se for enum, retorna union type
      if (prop.enumValues) {
        const values = prop.enumValues.split(',').map(v => `'${v.trim()}'`);
        return values.join(' | ');
      }
      return 'string';
    
    case 'number':
      return 'number';
    
    case 'boolean':
      return 'boolean';
    
    case 'object':
      if (prop.objectProperties && prop.objectProperties.length > 0) {
        // Gerar tipo inline para as propriedades do objeto
        return generateArrayItemType(prop.objectProperties);
      }
      return 'Record<string, any>';
    
    case 'array':
      if (prop.arrayItemProperties && prop.arrayItemProperties.length > 0) {
        // Gerar tipo inline para os itens do array com suporte a aninhamento
        const arrayItemType = generateArrayItemType(prop.arrayItemProperties);
        
        if (prop.enableEditorItemTitle) {
          // Adicionar __editorItemTitle no tipo
          return `Array<${arrayItemType.replace('{', '{\n    __editorItemTitle?: string;')}>`;
        }
        
        return `Array<${arrayItemType}>`;
      }
      return 'Array<any>';
    
    case 'enum':
      if (prop.enumValues) {
        const values = prop.enumValues.split(',').map(v => `'${v.trim()}'`);
        return values.join(' | ');
      }
      return 'string';
    
    case 'conditional':
      // Para conditional, incluir os campos condicionais como opcionais
      if (prop.conditionalFields && prop.conditionalFields.length > 0) {
        const conditionalTypes: string[] = ["'none'", "'provide'"];
        return conditionalTypes.join(' | ');
      }
      return "'none' | 'provide'";
    
    default:
      return 'any';
  }
}

/**
 * Mapeia o tipo do item de array para TypeScript
 */
function mapItemTypeToTypeScript(type: string): string {
  switch (type) {
    case 'string':
      return 'string';
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'object':
      return 'Record<string, any>';
    case 'array':
      return 'Array<any>';
    default:
      return 'any';
  }
}

/**
 * Gera tipagem completa incluindo campos condicionais
 */
export function generateFullTypeScript(
  properties: PropertyForm[],
  interfaceName: string = 'ComponentProps'
): string {
  const lines: string[] = [];
  const conditionalInterfaces: string[] = [];

  // Gerar interfaces para campos condicionais
  properties.forEach((prop) => {
    if (
      prop.type === 'conditional' &&
      prop.conditionalFields &&
      prop.conditionalFields.length > 0 &&
      prop.name
    ) {
      const conditionalInterfaceName = `${capitalize(prop.name)}Fields`;
      const conditionalLines: string[] = [];
      
      conditionalLines.push(`export interface ${conditionalInterfaceName} {`);
      
      prop.conditionalFields.forEach((condField) => {
        if (!condField.name) return;
        
        if (condField.description) {
          conditionalLines.push(`  /** ${condField.description} */`);
        }
        
        let fieldType: string;
        
        if (condField.type === 'enum' && condField.enumValues) {
          const values = condField.enumValues.split(',').map(v => `'${v.trim()}'`);
          fieldType = values.join(' | ');
        } else {
          fieldType = mapItemTypeToTypeScript(condField.type);
        }
        
        conditionalLines.push(`  ${condField.name}: ${fieldType};`);
      });
      
      conditionalLines.push('}');
      conditionalInterfaces.push(conditionalLines.join('\n'));
    }
  });

  // Adicionar interfaces condicionais primeiro
  if (conditionalInterfaces.length > 0) {
    lines.push(...conditionalInterfaces);
    lines.push('');
  }

  // Gerar interface principal
  lines.push(`export interface ${interfaceName} {`);

  properties.forEach((prop) => {
    if (!prop.name) return;

    if (prop.description) {
      lines.push(`  /** ${prop.description} */`);
    }

    let tsType: string;
    
    if (
      prop.type === 'conditional' &&
      prop.conditionalFields &&
      prop.conditionalFields.length > 0
    ) {
      tsType = `'none' | 'provide'`;
      lines.push(`  ${prop.name}${!prop.required ? '?' : ''}: ${tsType};`);
      
      // Adicionar campos condicionais como opcionais
      prop.conditionalFields.forEach((condField) => {
        if (!condField.name) return;
        
        let fieldType: string;
        if (isEnumProperty(condField) && condField.enumValues) {
          const values = condField.enumValues.split(',').map((v: string) => `'${v.trim()}'`);
          fieldType = values.join(' | ');
        } else {
          fieldType = mapItemTypeToTypeScript(condField.type);
        }
        
        lines.push(`  ${condField.name}?: ${fieldType};`);
      });
    } else {
      tsType = mapPropertyTypeToTypeScript(prop);
      const optional = !prop.required ? '?' : '';
      lines.push(`  ${prop.name}${optional}: ${tsType};`);
    }
  });

  lines.push('}');
  
  return lines.join('\n');
}

/**
 * Capitaliza a primeira letra de uma string
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
