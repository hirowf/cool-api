import { createCheckoutLink, createCustomerIfNull, hasSubcriptions } from '@/lib/stripe'
import Link from 'next/link'

const Page = async () => {
  const customer = await createCustomerIfNull()
  const hasSub = await hasSubcriptions()
  const checkoutLink = await createCheckoutLink(String(customer))
  return (
    <main>
      {hasSub ? (
        <>
          <div className="rounded-sm px-4 py-2 bg-emerald-400 font-mediu text-white">You have a subscription!</div>
        </>
      ) : (
        <>
          <div className="min-h-[60vh] grid place-items-center text-base round-lg px-6 py-10 bg-slate-100">
            <Link href={String(checkoutLink)}>You have no subcription, checkout now!</Link>
          </div>
        </>
      )}
    </main>
  )
}

export default Page
