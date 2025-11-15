import { z } from 'zod';

// Schema para validação do formulário de criação de componente
export const componentFormSchema = z.object({
  componentTitle: z.string().min(1, 'Título do componente é obrigatório'),
});

export type ComponentFormData = z.infer<typeof componentFormSchema>;

// Schema para validação individual de propriedade
export const propertyValidationSchema = z.object({
  name: z.string().min(1, 'Nome da propriedade é obrigatório')
    .regex(/^[a-zA-Z_$][a-zA-Z0-9_$]*$/, 'Nome deve ser um identificador JavaScript válido'),
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  defaultValue: z.string().optional(),
  type: z.enum(['string', 'number', 'boolean', 'object', 'array', 'enum', 'conditional']),
  widget: z.enum(['image-uploader', 'datetime', 'textarea', 'color-picker', 'range', 'radio']).optional(),
  format: z.string().optional(),
  
  // Validação condicional para enum
  enumValues: z.string().optional(),
  enumNames: z.string().optional(),
  
  // Validação condicional para array
  arrayItemTitle: z.string().optional(),
  arrayDefaultValue: z.string().optional(),
  enableEditorItemTitle: z.string().optional(),
  editorItemTitleDefault: z.string().optional(),
  editorItemTitleLabel: z.string().optional(),
}).superRefine((data, ctx) => {
  // Validação condicional para enum
  if (data.type === 'enum' && !data.enumValues) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Valores do enum são obrigatórios para tipo enum',
      path: ['enumValues'],
    });
  }
  
  // Validação condicional para widget (apenas para string)
  if (data.widget && data.type !== 'string') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Widget só pode ser usado com tipo string',
      path: ['widget'],
    });
  }
  
  // Validação condicional para format (apenas para string)
  if (data.format && data.type !== 'string') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Format só pode ser usado com tipo string',
      path: ['format'],
    });
  }

  // Validação de arrayDefaultValue deve ser JSON válido
  if (data.type === 'array' && data.arrayDefaultValue) {
    try {
      JSON.parse(data.arrayDefaultValue);
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Default value do array deve ser um JSON válido',
        path: ['arrayDefaultValue'],
      });
    }
  }

  // Validação de enumNames deve ter o mesmo número de itens que enumValues
  if (data.enumValues && data.enumNames) {
    const values = data.enumValues.split(',').map(v => v.trim());
    const names = data.enumNames.split(',').map(v => v.trim());
    
    if (values.length !== names.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Número de nomes deve ser igual ao número de valores',
        path: ['enumNames'],
      });
    }
  }
});

export type PropertyValidationData = z.infer<typeof propertyValidationSchema>;

// Schema para item de array
export const arrayItemValidationSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório')
    .regex(/^[a-zA-Z_$][a-zA-Z0-9_$]*$/, 'Nome deve ser um identificador JavaScript válido'),
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  defaultValue: z.string().optional(),
  type: z.enum(['string', 'number', 'boolean', 'object', 'array', 'enum', 'conditional']),
  widget: z.enum(['image-uploader', 'datetime', 'textarea', 'color-picker', 'range', 'radio']).optional(),
  format: z.string().optional(),
});

export type ArrayItemValidationData = z.infer<typeof arrayItemValidationSchema>;

// Schema para campo condicional
export const conditionalFieldValidationSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório')
    .regex(/^[a-zA-Z_$][a-zA-Z0-9_$]*$/, 'Nome deve ser um identificador JavaScript válido'),
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  defaultValue: z.string().optional(),
  type: z.enum(['string', 'number', 'boolean', 'object', 'array', 'enum', 'conditional']),
  widget: z.enum(['image-uploader', 'datetime', 'textarea', 'color-picker', 'range', 'radio']).optional(),
  format: z.string().optional(),
  enumValues: z.string().optional(),
  enumNames: z.string().optional(),
});

export type ConditionalFieldValidationData = z.infer<typeof conditionalFieldValidationSchema>;
