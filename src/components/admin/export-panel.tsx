'use client'

import { useState } from 'react'
import { useExport } from '@/hooks/use-export'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Download, FileSpreadsheet, Database, Users, Megaphone } from 'lucide-react'

export function ExportPanel() {
  const { exporting, exportAllContacts, exportAllData } = useExport()
  const [error, setError] = useState<string | null>(null)

  const handleExportAllContacts = async () => {
    setError(null)
    try {
      await exportAllContacts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao exportar contatos')
    }
  }

  const handleExportAllData = async () => {
    setError(null)
    try {
      await exportAllData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao exportar dados')
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Exportar Contatos
            </CardTitle>
            <CardDescription>
              Exporte todos os contatos coletados em um arquivo Excel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                <p>Este arquivo incluirá:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Data e hora da coleta</li>
                  <li>Nome da campanha e local</li>
                  <li>Nome do coletador</li>
                  <li>Bairro, nome e telefone do contato</li>
                  <li>Demanda (se informada)</li>
                </ul>
              </div>
              <Button
                onClick={handleExportAllContacts}
                disabled={exporting}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                {exporting ? 'Exportando...' : 'Exportar Contatos'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Exportar Dados Completos
            </CardTitle>
            <CardDescription>
              Exporte todos os dados do sistema em múltiplas planilhas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                <p>Este arquivo incluirá:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Planilha de resumo com estatísticas</li>
                  <li>Planilha com todas as campanhas</li>
                  <li>Planilha com todos os contatos</li>
                </ul>
              </div>
              <Button
                onClick={handleExportAllData}
                disabled={exporting}
                className="w-full"
                variant="outline"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                {exporting ? 'Exportando...' : 'Exportar Dados Completos'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="w-5 h-5" />
            Exportar por Campanha
          </CardTitle>
          <CardDescription>
            Exporte contatos de campanhas específicas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600">
            <p>
              Para exportar contatos de uma campanha específica, acesse a página de 
              <strong> Gerenciar Campanhas</strong> e clique no botão &quot;Exportar&quot; 
              da campanha desejada.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informações sobre a Exportação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <div>
              <strong>Formato:</strong> Arquivos Excel (.xlsx)
            </div>
            <div>
              <strong>Codificação:</strong> UTF-8 (suporte completo ao português)
            </div>
            <div>
              <strong>Localização:</strong> Datas e números no formato brasileiro
            </div>
            <div>
              <strong>Nome dos arquivos:</strong> Incluem data e hora da exportação
            </div>
            <div>
              <strong>Compatibilidade:</strong> Excel, Google Sheets, LibreOffice Calc
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
