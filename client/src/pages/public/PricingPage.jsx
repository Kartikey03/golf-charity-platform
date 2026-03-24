import { Card, CardBody, CardFooter } from '../../components/ui/Card'
import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { PLANS } from '../../constants'

export default function PricingPage() {
  
  const features = [
    "Log your latest 5 Stableford scores",
    "Entry into massive monthly prize draws",
    "Minimum 10% directly supports your chosen charity",
    "Full access to the Charity Directory",
    "Winner verification and dashboard analytics"
  ]

  return (
    <div className="w-full pt-16 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16 animate-slide-up">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Choose a plan that fits your game. Cancel anytime. All subscriptions include a 10% minimum direct contribution to charity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {Object.values(PLANS).map((plan) => (
            <Card key={plan.id} className={`relative overflow-hidden ${plan.id === 'yearly' ? 'border-brand-500/50 shadow-lg shadow-brand-500/20' : ''}`}>
              {plan.badge && (
                <div className="absolute top-0 right-0 bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  {plan.badge}
                </div>
              )}
              <CardBody className="p-8">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.label} Plan</h3>
                <div className="flex items-baseline mb-6">
                  <span className="text-5xl font-bold text-white tracking-tight">{plan.currency}{plan.price}</span>
                  <span className="text-white/50 ml-2">/{plan.interval}</span>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {features.map((feature, i) => (
                    <li key={i} className="flex items-start text-white/80">
                      <Check className="text-brand-400 mr-3 shrink-0" size={20} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardBody>
              <CardFooter className="p-6 bg-transparent border-t-0 p-8 pt-0">
                <Link to={`/register?plan=${plan.id}`} className={`w-full text-center ${plan.id === 'yearly' ? 'btn-primary' : 'btn-secondary'} block w-full py-4 text-lg`}>
                  Choose {plan.label}
                </Link>
              </CardFooter>
            </Card>
          ))}
          
        </div>

        <div className="mt-16 text-center text-white/40 text-sm">
          <p>Payments are securely processed via Stripe. You can cancel your subscription at any time.</p>
          <p>Read our Terms to understand how the prize pools are calculated and distributed.</p>
        </div>

      </div>
    </div>
  )
}