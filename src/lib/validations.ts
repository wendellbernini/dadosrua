import { z } from 'zod'

// User schemas
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  username: z.string().min(2, 'Nome de usuário deve ter pelo menos 2 caracteres'),
})

// Campaign schemas
export const createCampaignSchema = z.object({
  name: z.string().min(3, 'Nome da campanha deve ter pelo menos 3 caracteres'),
  location: z.string().min(2, 'Local deve ter pelo menos 2 caracteres'),
  start_date: z.string().min(1, 'Data de início é obrigatória'),
  end_date: z.string().min(1, 'Data de fim é obrigatória'),
})

export const updateCampaignSchema = createCampaignSchema.partial()

// Contact schemas
export const createContactSchema = z.object({
  neighborhood: z.string().min(2, 'Bairro é obrigatório'),
  first_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  demand: z.string().optional(),
})

export const updateContactSchema = createContactSchema.partial()

// Settings schemas
export const updateSettingsSchema = z.object({
  registration_open: z.boolean(),
  default_campaign_end_time: z.string(),
})

// Phone validation helper
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }
  return phone
}

export const unformatPhone = (phone: string): string => {
  return phone.replace(/\D/g, '')
}

// Types
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type CreateCampaignInput = z.infer<typeof createCampaignSchema>
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>
export type CreateContactInput = z.infer<typeof createContactSchema>
export type UpdateContactInput = z.infer<typeof updateContactSchema>
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>
