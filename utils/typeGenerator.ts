import { PropertyForm } from '@/types';

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
      return 'Record<string, any>';
    
    case 'array':
      if (prop.arrayItemProperties && prop.arrayItemProperties.length > 0) {
        // Gerar interface inline para os itens do array
        const itemProps: string[] = [];
        
        if (prop.enableEditorItemTitle) {
          itemProps.push('    __editorItemTitle?: string;');
        }
        
        prop.arrayItemProperties.forEach((itemProp) => {
          if (!itemProp.name) return;
          
          const itemType = mapItemTypeToTypeScript(itemProp.type);
          itemProps.push(`    ${itemProp.name}: ${itemType};`);
        });
        
        return `Array<{\n${itemProps.join('\n')}\n  }>`;
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
      const conditionalInterfaceName = `${capitalize(prop.name)}Fields`;
      tsType = `'none' | 'provide'`;
      lines.push(`  ${prop.name}${!prop.required ? '?' : ''}: ${tsType};`);
      
      // Adicionar campos condicionais como opcionais
      prop.conditionalFields.forEach((condField) => {
        if (!condField.name) return;
        
        let fieldType: string;
        if (condField.type === 'enum' && condField.enumValues) {
          const values = condField.enumValues.split(',').map(v => `'${v.trim()}'`);
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
