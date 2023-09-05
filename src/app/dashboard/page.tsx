import { prisma } from '@/lib/prisma'
import { createCheckoutLink, createCustomerIfNull, hasSubcriptions, stripe } from '@/lib/stripe'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { getServerSession } from 'next-auth'
import Link from 'next/link'

const Page = async () => {
  const session = await getServerSession(authOptions)
  const customer = await createCustomerIfNull()
  const hasSub = await hasSubcriptions()
  const checkoutLink = await createCheckoutLink(String(customer))

  const user = await prisma.user.findFirst({
    where: {
      email: session?.user?.email,
    },
  })

  const recentLogs = await prisma.log.findMany({
    where: {
      userId: user?.id,
    },
    orderBy: {
      created: 'desc',
    },
    take: 10,
  })

  let current_usage = 0

  if (hasSub) {
    const subscriptions = await stripe.subscriptions.list({
      customer: String(user?.stripe_customer_id),
    })

    const invoice = await stripe.invoices.retrieveUpcoming({
      subscription: subscriptions.data.at(0)?.id,
    })

    current_usage = invoice.amount_due
  }
  return (
    <main>
      {hasSub ? (
        <>
          <div className="flex flex-col gap-4">
            <div className="rounded-sm px-4 py-2 bg-emerald-400 font-mediu text-white">You have a subscription!</div>

            <div className="divide-y divide-zinc-200 border border-zinc-200 rounded-md">
              <p className="text-sm text-black px-6 py-4 font-medium">Current Usage</p>
              <p className="text-sm font-mono text-zinc-800 px-6 py-4">{current_usage / 100}</p>
            </div>

            <div className="divide-y divide-zinc-200 border border-zinc-200 rounded-md">
              <p className="text-sm text-black px-6 py-4 font-medium">APY Key</p>
              <p className="text-sm font-mono text-zinc-800 px-6 py-4">{user?.api_key}</p>
            </div>

            <div className="divide-y divide-zinc-200 border border-zinc-200 rounded-md">
              <p className="text-sm text-black px-6 py-4 font-medium">Log Events</p>
              <p className="text-sm font-mono text-zinc-800 px-6 py-4">
                {recentLogs.map((item, index) => {
                  return (
                    <div className="flex items-center gap-4" key={index}>
                      <p className="text-sm font-mono text-zin-800 px-6 py-4">{item.method}</p>
                      <p className="text-sm font-mono text-zin-800 px-6 py-4">{item.status}</p>
                      <p className="text-sm font-mono text-zin-800 px-6 py-4">{item.created.toDateString()}</p>
                    </div>
                  )
                })}
              </p>
            </div>
          </div>
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
