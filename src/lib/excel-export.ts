import * as XLSX from 'xlsx'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export interface ContactExportData {
  id: string
  campaign_name: string
  campaign_location: string
  collector_name: string
  neighborhood: string
  first_name: string
  phone: string
  demand: string | null
  created_at: string
}

export function exportContactsToExcel(contacts: ContactExportData[], filename?: string) {
  // Prepare data for Excel
  const excelData = contacts.map(contact => ({
    'Data/Hora da Coleta': format(new Date(contact.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
    'Campanha': contact.campaign_name,
    'Local': contact.campaign_location,
    'Coletador': contact.collector_name,
    'Bairro': contact.neighborhood,
    'Nome': contact.first_name,
    'Telefone': contact.phone,
    'Demanda': contact.demand || '',
  }))

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet(excelData)

  // Set column widths
  const columnWidths = [
    { wch: 20 }, // Data/Hora da Coleta
    { wch: 25 }, // Campanha
    { wch: 25 }, // Local
    { wch: 20 }, // Coletador
    { wch: 20 }, // Bairro
    { wch: 15 }, // Nome
    { wch: 15 }, // Telefone
    { wch: 40 }, // Demanda
  ]
  worksheet['!cols'] = columnWidths

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Contatos Coletados')

  // Generate filename if not provided
  const defaultFilename = `contatos_${format(new Date(), 'yyyy-MM-dd_HH-mm', { locale: ptBR })}.xlsx`
  const finalFilename = filename || defaultFilename

  // Save file
  XLSX.writeFile(workbook, finalFilename)
}

export function exportCampaignContactsToExcel(
  campaignName: string,
  contacts: ContactExportData[],
  filename?: string
) {
  // Prepare data for Excel
  const excelData = contacts.map(contact => ({
    'Data/Hora da Coleta': format(new Date(contact.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
    'Coletador': contact.collector_name,
    'Bairro': contact.neighborhood,
    'Nome': contact.first_name,
    'Telefone': contact.phone,
    'Demanda': contact.demand || '',
  }))

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet(excelData)

  // Set column widths
  const columnWidths = [
    { wch: 20 }, // Data/Hora da Coleta
    { wch: 20 }, // Coletador
    { wch: 20 }, // Bairro
    { wch: 15 }, // Nome
    { wch: 15 }, // Telefone
    { wch: 40 }, // Demanda
  ]
  worksheet['!cols'] = columnWidths

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Contatos')

  // Generate filename if not provided
  const sanitizedCampaignName = campaignName.replace(/[^a-zA-Z0-9]/g, '_')
  const defaultFilename = `contatos_${sanitizedCampaignName}_${format(new Date(), 'yyyy-MM-dd_HH-mm', { locale: ptBR })}.xlsx`
  const finalFilename = filename || defaultFilename

  // Save file
  XLSX.writeFile(workbook, finalFilename)
}

export function exportAllDataToExcel(
  campaigns: Array<{ id: string; name: string; location: string; start_date: string; end_date: string; status: string; participants?: Array<{ id: string }>; contact_count?: number }>,
  contacts: ContactExportData[],
  filename?: string
) {
  // Create workbook
  const workbook = XLSX.utils.book_new()

  // 1. Summary sheet
  const summaryData = [
    { 'Métrica': 'Total de Campanhas', 'Valor': campaigns.length },
    { 'Métrica': 'Campanhas Ativas', 'Valor': campaigns.filter(c => c.status === 'active').length },
    { 'Métrica': 'Campanhas Finalizadas', 'Valor': campaigns.filter(c => c.status === 'finished').length },
    { 'Métrica': 'Total de Contatos', 'Valor': contacts.length },
    { 'Métrica': 'Data de Exportação', 'Valor': format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR }) },
  ]

  const summarySheet = XLSX.utils.json_to_sheet(summaryData)
  summarySheet['!cols'] = [{ wch: 25 }, { wch: 15 }]
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumo')

  // 2. Campaigns sheet
  const campaignsData = campaigns.map(campaign => ({
    'Nome': campaign.name,
    'Local': campaign.location,
    'Data Início': format(new Date(campaign.start_date), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
    'Data Fim': format(new Date(campaign.end_date), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
    'Status': campaign.status === 'active' ? 'Ativa' : 'Finalizada',
    'Participantes': campaign.participants?.length || 0,
    'Contatos Coletados': campaign.contact_count || 0,
  }))

  const campaignsSheet = XLSX.utils.json_to_sheet(campaignsData)
  campaignsSheet['!cols'] = [
    { wch: 25 }, // Nome
    { wch: 25 }, // Local
    { wch: 20 }, // Data Início
    { wch: 20 }, // Data Fim
    { wch: 12 }, // Status
    { wch: 15 }, // Participantes
    { wch: 18 }, // Contatos Coletados
  ]
  XLSX.utils.book_append_sheet(workbook, campaignsSheet, 'Campanhas')

  // 3. Contacts sheet
  const contactsData = contacts.map(contact => ({
    'Data/Hora da Coleta': format(new Date(contact.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
    'Campanha': contact.campaign_name,
    'Local': contact.campaign_location,
    'Coletador': contact.collector_name,
    'Bairro': contact.neighborhood,
    'Nome': contact.first_name,
    'Telefone': contact.phone,
    'Demanda': contact.demand || '',
  }))

  const contactsSheet = XLSX.utils.json_to_sheet(contactsData)
  contactsSheet['!cols'] = [
    { wch: 20 }, // Data/Hora da Coleta
    { wch: 25 }, // Campanha
    { wch: 25 }, // Local
    { wch: 20 }, // Coletador
    { wch: 20 }, // Bairro
    { wch: 15 }, // Nome
    { wch: 15 }, // Telefone
    { wch: 40 }, // Demanda
  ]
  XLSX.utils.book_append_sheet(workbook, contactsSheet, 'Contatos')

  // Generate filename if not provided
  const defaultFilename = `dados_completos_${format(new Date(), 'yyyy-MM-dd_HH-mm', { locale: ptBR })}.xlsx`
  const finalFilename = filename || defaultFilename

  // Save file
  XLSX.writeFile(workbook, finalFilename)
}
