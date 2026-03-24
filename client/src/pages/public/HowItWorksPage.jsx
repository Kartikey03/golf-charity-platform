import { Card, CardBody } from '../../components/ui/Card'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, ListOrdered, CalendarHeart, Gift } from 'lucide-react'

export default function HowItWorksPage() {
  const steps = [
    {
      icon: <CheckCircle2 className="text-brand-400" size={32} />,
      title: "1. Subscribe & Choose Your Charity",
      description: "Sign up for a monthly or yearly plan. Select a charity from our directory that you want to support. A minimum of 10% goes directly to them."
    },
    {
      icon: <ListOrdered className="text-accent-400" size={32} />,
      title: "2. Log Your 5 Latest Scores",
      description: "After playing, enter your Stableford score (1-45) and the date. Our system only keeps your most recent 5 scores in a rolling window."
    },
    {
      icon: <CalendarHeart className="text-rose-400" size={32} />,
      title: "3. The Monthly Draw",
      description: "At the end of each month, the draw engine generates the winning numbers based on an algorithm that weighs global score frequencies, or completely random generation."
    },
    {
      icon: <Gift className="text-yellow-400" size={32} />,
      title: "4. Match & Win",
      description: "If your 5 stored scores match 3, 4, or all 5 of the drawn numbers, you win a share of the rolling prize pool! If no one hits 5, the jackpot rolls over."
    }
  ]

  return (
    <div className="w-full pt-16 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16 animate-slide-up">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
            Make Every Round Count
          </h1>
          <p className="text-xl text-white/60">
            A simple, transparent system designed to support great causes and reward consistent play.
          </p>
        </div>

        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-8 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
          {steps.map((step, index) => (
            <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group animate-fade-in" style={{ animationDelay: `${index * 0.15}s` }}>
              
              <div className="flex items-center justify-center w-16 h-16 rounded-full border-4 border-dark-950 bg-dark-800 shadow shadow-brand-500/10 z-10 
                shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ml-0 md:ml-0 absolute md:static left-0 md:left-1/2 -translate-x-1/2 md:-translate-x-0">
                {step.icon}
              </div>
              
              <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] ml-auto md:ml-0 bg-white/5 border-white/10 group-hover:bg-white/10 transition-colors">
                <CardBody className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-white/60">{step.description}</p>
                </CardBody>
              </Card>

            </div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <Link to="/pricing" className="btn-primary px-8 py-4 text-lg inline-flex items-center gap-2">
            View Plans <ArrowRight size={20} />
          </Link>
        </div>

      </div>
    </div>
  )
}