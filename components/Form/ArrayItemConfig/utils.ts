import { ArrayItemProperty } from '@/types';
import { BreadcrumbItem, isArrayProperty, isObjectProperty } from './types';

/**
 * Encontra propriedades seguindo um caminho de navegação
 */
export function findPropertyByPath(
  props: ArrayItemProperty[], 
  path: BreadcrumbItem[]
): ArrayItemProperty[] {
  if (path.length === 0) return props;
  
  let current = props;
  for (const pathItem of path) {
    const found = current.find(p => p.id === pathItem.id);
    if (!found) return props;
    
    if (isArrayProperty(found) && found.arrayItemProperties) {
      current = found.arrayItemProperties;
    } else if (isObjectProperty(found) && found.objectProperties) {
      current = found.objectProperties;
    } else {
      return props;
    }
  }
  return current;
}

/**
 * Atualiza propriedades em um caminho específico da árvore
 */
export function updatePropertiesInPath(
  rootProps: ArrayItemProperty[], 
  path: BreadcrumbItem[], 
  newProps: ArrayItemProperty[]
): ArrayItemProperty[] {
  if (path.length === 0) return newProps;

  const updateRecursive = (
    props: ArrayItemProperty[], 
    pathIndex: number
  ): ArrayItemProperty[] => {
    if (pathIndex >= path.length) return newProps;

    return props.map(prop => {
      if (prop.id === path[pathIndex].id) {
        if (pathIndex === path.length - 1) {
          // Último nível - atualizar as propriedades
          if (isArrayProperty(prop)) {
            return { ...prop, arrayItemProperties: newProps };
          } else if (isObjectProperty(prop)) {
            return { ...prop, objectProperties: newProps };
          }
        } else {
          // Nível intermediário - continuar recursão
          if (isArrayProperty(prop) && prop.arrayItemProperties) {
            return { 
              ...prop, 
              arrayItemProperties: updateRecursive(prop.arrayItemProperties, pathIndex + 1) 
            };
          } else if (isObjectProperty(prop) && prop.objectProperties) {
            return { 
              ...prop, 
              objectProperties: updateRecursive(prop.objectProperties, pathIndex + 1) 
            };
          }
        }
      }
      return prop;
    });
  };

  return updateRecursive(rootProps, 0);
}
