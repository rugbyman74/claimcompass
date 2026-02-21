export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl grid gap-8">
      {/* Hero Section */}
      <section className="text-center">
        <div className="mb-6 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border-2 border-blue-600 bg-blue-50 px-6 py-3">
            <span className="text-3xl">🇺🇸</span>
            <span className="text-base font-bold text-blue-900">
              Veteran Owned & Operated
            </span>
          </div>
        </div>

        <h1 className="text-4xl font-bold tracking-tight">About ClaimCompass</h1>
        <p className="mt-4 text-lg text-zinc-600">
          Built by an Army veteran who successfully navigated the VA claims process
        </p>
      </section>

      {/* Your Story */}
      <section className="rounded-2xl border bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-zinc-900">My Story</h2>
        <div className="mt-4 space-y-4 text-zinc-700">
          <p>
            I served 12 years in the United States Army and successfully completed the 
            VA disability claims process, ultimately receiving a 100% Permanent and Total 
            (P&T) rating. Throughout that journey, I learned firsthand how challenging 
            it can be to organize evidence, track symptoms consistently, and present a 
            strong case to the VA.
          </p>
          <p>
            Like many veterans, I struggled with scattered notes, inconsistent documentation, 
            and the overwhelming task of keeping everything organized while dealing with 
            service-connected conditions. I knew there had to be a better way.
          </p>
          <p>
            That's why I built ClaimCompass. After going through the process myself and 
            achieving a successful outcome, I wanted to help fellow veterans avoid the 
            same struggles I faced. ClaimCompass gives you the tools to track symptoms 
            daily, store evidence securely, and generate professional statements that 
            strengthen your claim.
          </p>
          <p>
            No veteran should lose their rightful benefits because of poor record-keeping 
            or disorganized evidence. I built this platform to give you the same advantage 
            I wish I had when I started my claims journey.
          </p>
        </div>
      </section>

      {/* Credentials */}
      <section className="rounded-2xl border-2 border-emerald-600 bg-emerald-50 p-8">
        <h2 className="text-2xl font-bold text-emerald-900">My Experience</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-900">12 Years</div>
            <div className="mt-2 text-sm text-emerald-800">U.S. Army Service</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-900">100% P&T</div>
            <div className="mt-2 text-sm text-emerald-800">VA Disability Rating</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-900">Veteran</div>
            <div className="mt-2 text-sm text-emerald-800">Built by Veterans, For Veterans</div>
          </div>
        </div>
      </section>

      {/* Why Veterans Trust Us */}
      <section className="rounded-2xl border-2 border-blue-600 bg-blue-50 p-8">
        <h2 className="text-2xl font-bold text-blue-900">Why Veterans Trust ClaimCompass</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">✓</div>
              <div>
                <div className="font-semibold text-blue-900">Veteran Built</div>
                <div className="text-sm text-blue-800">
                  Created by an Army veteran who achieved 100% P&T
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">✓</div>
              <div>
                <div className="font-semibold text-blue-900">No Affiliates</div>
                <div className="text-sm text-blue-800">
                  We don't sell your data or push affiliate products
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">✓</div>
              <div>
                <div className="font-semibold text-blue-900">Transparent Pricing</div>
                <div className="text-sm text-blue-800">
                  Free to start, affordable Pro plan, no hidden fees
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">✓</div>
              <div>
                <div className="font-semibold text-blue-900">Real Experience</div>
                <div className="text-sm text-blue-800">
                  Built by someone who's been through the process
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="rounded-2xl border bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-zinc-900">Our Mission</h2>
        <p className="mt-4 text-lg text-zinc-700">
          To help every veteran build the strongest possible case for their VA disability claim 
          through consistent symptom tracking, organized evidence storage, and professional 
          documentation tools.
        </p>
        <p className="mt-4 text-zinc-700">
          Having successfully navigated the VA claims process myself, I understand the 
          challenges you face. ClaimCompass exists to give you the organizational tools 
          and documentation structure that increase your chances of approval.
        </p>
        <p className="mt-4 text-zinc-700">
          No veteran should lose their rightful benefits because of poor record-keeping 
          or disorganized evidence. You served your country - now let me help you get 
          the benefits you've earned.
        </p>
      </section>

      {/* CTA */}
      <section className="rounded-2xl bg-zinc-900 p-8 text-center text-white">
        <h2 className="text-2xl font-bold">Ready to Start Organizing Your Claim?</h2>
        <p className="mt-3 text-zinc-300">
          Join fellow veterans using ClaimCompass to strengthen their VA claims.
        </p>
        <div className="mt-6">
          
            href="/login"
            className="inline-block rounded-lg bg-white px-6 py-3 text-base font-semibold text-zinc-900 hover:bg-zinc-100"
          >
            Get Started Free
          </a>
        </div>
      </section>
    </div>
  );
}