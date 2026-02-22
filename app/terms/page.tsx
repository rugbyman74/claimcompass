export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl prose prose-zinc">
      <h1>Terms of Service</h1>
      <p className="text-sm text-zinc-600">Last updated: February 21, 2026</p>

      <h2>Agreement to Terms</h2>
      <p>
        By accessing or using ClaimCompass, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, do not use our service.
      </p>

      <h2>Description of Service</h2>
      <p>
        ClaimCompass is a web-based application designed to help veterans organize evidence and documentation for VA disability claims. Our service includes:
      </p>
      <ul>
        <li>Daily symptom and mood tracking</li>
        <li>Document storage (evidence vault)</li>
        <li>Statement generation (PDF and Word documents)</li>
        <li>Email reminder notifications</li>
        <li>Achievement badges and progress tracking</li>
        <li>Premium features for Pro subscribers</li>
      </ul>

      <h2>User Accounts</h2>
      <p>
        To use ClaimCompass, you must create an account. You are responsible for:
      </p>
      <ul>
        <li>Maintaining the confidentiality of your account credentials</li>
        <li>All activities that occur under your account</li>
        <li>Notifying us immediately of any unauthorized access</li>
        <li>Providing accurate and complete information</li>
      </ul>

      <h2>Acceptable Use</h2>
      <p>You agree NOT to:</p>
      <ul>
        <li>Use the service for any illegal purpose</li>
        <li>Upload false, misleading, or fraudulent information</li>
        <li>Attempt to gain unauthorized access to our systems</li>
        <li>Interfere with or disrupt the service</li>
        <li>Share your account with others</li>
        <li>Use automated systems to access the service</li>
      </ul>

      <h2>Pro Subscription</h2>
      <h3>Billing</h3>
      <p>
        Pro subscriptions are billed monthly at $12/month. Payment is processed through Stripe. By subscribing, you authorize us to charge your payment method on a recurring basis.
      </p>

      <h3>Cancellation</h3>
      <p>
        You may cancel your Pro subscription at any time from your Account page. Cancellations take effect at the end of your current billing period. No refunds are provided for partial months.
      </p>

      <h3>Pro Features</h3>
      <p>Pro subscribers receive access to:</p>
      <ul>
        <li>PDF and Word document exports</li>
        <li>Unlimited evidence vault storage</li>
        <li>SMS reminder notifications</li>
        <li>Priority support</li>
      </ul>

      <h2>Intellectual Property</h2>
      <p>
        ClaimCompass and its original content, features, and functionality are owned by ClaimCompass LLC and are protected by copyright, trademark, and other intellectual property laws.
      </p>

      <h3>Your Content</h3>
      <p>
        You retain all rights to the content you upload to ClaimCompass (symptom logs, documents, notes). By using our service, you grant us a limited license to store, process, and display your content solely for the purpose of providing our service to you.
      </p>

      <h2>Disclaimer of Warranties</h2>
      <p>
        ClaimCompass is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not guarantee that:
      </p>
      <ul>
        <li>The service will be uninterrupted or error-free</li>
        <li>Defects will be corrected</li>
        <li>The service is free of viruses or harmful components</li>
        <li>The results from using the service will be accurate or reliable</li>
      </ul>

      <h2>Medical and Legal Disclaimer</h2>
      <div className="rounded-lg border-2 border-red-600 bg-red-50 p-6 not-prose">
        <p className="text-sm text-red-900">
          <strong>IMPORTANT:</strong> ClaimCompass is a documentation tool only. We do NOT provide:
        </p>
        <ul className="mt-2 text-sm text-red-900">
          <li>Medical advice, diagnosis, or treatment</li>
          <li>Legal advice or representation</li>
          <li>Guarantees about VA claim outcomes</li>
          <li>Medical or legal professional services</li>
        </ul>
        <p className="mt-2 text-sm text-red-900">
          You should consult with qualified medical and legal professionals regarding your VA disability claim. ClaimCompass is not affiliated with the U.S. Department of Veterans Affairs.
        </p>
      </div>

      <h2>Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, ClaimCompass LLC shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, use, or goodwill arising from your use of the service.
      </p>

      <h2>Indemnification</h2>
      <p>
        You agree to indemnify and hold harmless ClaimCompass LLC from any claims, damages, losses, liabilities, and expenses (including attorney fees) arising from your use of the service or violation of these terms.
      </p>

      <h2>Data Deletion</h2>
      <p>
        You may request deletion of your account and all associated data at any time. We will delete your data within 30 days of your request, except where retention is required by law. See our Data Deletion Policy for details.
      </p>

      <h2>Changes to Terms</h2>
      <p>
        We reserve the right to modify these Terms of Service at any time. We will notify users of material changes by email or through the service. Your continued use after changes constitutes acceptance of the modified terms.
      </p>

      <h2>Governing Law</h2>
      <p>
        These Terms shall be governed by and construed in accordance with the laws of the United States and the state in which ClaimCompass LLC is registered, without regard to conflict of law provisions.
      </p>

      <h2>Contact Information</h2>
      <p>
        If you have questions about these Terms of Service, please contact us through our Feedback page or email support@claimcompass.net.
      </p>

      <div className="mt-12 rounded-lg border-2 border-blue-600 bg-blue-50 p-6 not-prose">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> These Terms of Service are provided for informational purposes and do not constitute legal advice. We recommend consulting with a legal professional to ensure compliance with all applicable laws and regulations.
        </p>
      </div>
    </div>
  );
}