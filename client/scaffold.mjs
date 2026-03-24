import fs from 'fs'
import path from 'path'

const files = [
  'src/pages/public/HomePage.jsx',
  'src/pages/public/CharitiesPage.jsx',
  'src/pages/public/CharityDetailPage.jsx',
  'src/pages/public/HowItWorksPage.jsx',
  'src/pages/public/PricingPage.jsx',
  'src/pages/auth/LoginPage.jsx',
  'src/pages/auth/RegisterPage.jsx',
  'src/pages/auth/ForgotPasswordPage.jsx',
  'src/pages/dashboard/DashboardHome.jsx',
  'src/pages/dashboard/ScoresPage.jsx',
  'src/pages/dashboard/DrawsPage.jsx',
  'src/pages/dashboard/WinningsPage.jsx',
  'src/pages/dashboard/CharityPage.jsx',
  'src/pages/dashboard/SettingsPage.jsx',
  'src/pages/admin/AdminDashboard.jsx',
  'src/pages/admin/AdminUsers.jsx',
  'src/pages/admin/AdminDraws.jsx',
  'src/pages/admin/AdminCharities.jsx',
  'src/pages/admin/AdminWinners.jsx',
  'src/pages/admin/AdminReports.jsx',
]

const componentMap = {
  'src/components/ui/Spinner.jsx': `export default function Spinner() {
  return (
    <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
  )
}`
}

for (const file of files) {
  const name = path.basename(file, '.jsx')
  componentMap[file] = `export default function ${name}() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold bg-gradient-to-br from-brand-400 to-brand-600 bg-clip-text text-transparent">
        ${name}
      </h1>
      <p className="mt-4 text-white/60">This page is under construction.</p>
    </div>
  )
}`
}

for (const [file, content] of Object.entries(componentMap)) {
  const fullPath = path.resolve(file)
  fs.mkdirSync(path.dirname(fullPath), { recursive: true })
  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, content)
    console.log(`Created ${file}`)
  }
}

console.log('All missing frontend files scaffolded.')
