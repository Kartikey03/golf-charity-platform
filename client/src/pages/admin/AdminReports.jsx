import { Card, CardBody } from '../../components/ui/Card'
import { FileBarChart } from 'lucide-react'

export default function AdminReports() {
  return (
    <div className="w-full h-full max-w-6xl mx-auto space-y-8 animate-fade-in">
      
      <div>
        <h1 className="text-3xl font-display font-bold text-white mb-2 flex items-center">
          <FileBarChart className="mr-3 text-brand-400" /> Advanced Reports
        </h1>
        <p className="text-white/60">Generate detailed CSV/PDF reports for accounting and compliance.</p>
      </div>

      <Card className="border-dashed border-2 border-white/10 bg-transparent">
        <CardBody className="p-16 text-center text-white/40 flex flex-col items-center">
          <FileBarChart size={48} className="mb-4 opacity-50 text-brand-400" />
          <h3 className="text-xl font-bold text-white mb-2">Reporting Engine Coming Soon</h3>
          <p className="max-w-md mx-auto">
            The advanced reporting module for detailed financial, demographic, and tax statements is scheduled for the next release phase. Use the Platform Overview dashboard for current high-level metrics.
          </p>
        </CardBody>
      </Card>

    </div>
  )
}