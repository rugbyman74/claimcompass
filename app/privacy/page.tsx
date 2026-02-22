export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl prose prose-zinc">
      <h1>Privacy Policy</h1>
      <p className="text-sm text-zinc-600">Last updated: February 21, 2026</p>

      <h2>Introduction</h2>
      <p>
        ClaimCompass ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our web application.
      </p>

      <h2>Information We Collect</h2>
      <h3>Personal Information</h3>
      <p>We collect information that you provide directly to us, including:</p>
      <ul>
        <li>Name and email address</li>
        <li>Phone number (optional)</li>
        <li>Physical address (optional)</li>
        <li>Payment information (processed securely through Stripe)</li>
      </ul>

      <h3>Health Information</h3>
      <p>
        You may choose to provide health-related information including symptom logs, medical conditions, severity ratings, and notes about your health status. This information is stored securely and is only used to help you organize your VA disability claim evidence.
      </p>

      <h3>Usage Information</h3>
      <p>We automatically collect certain information when you use our service, including:</p>
      <ul>
        <li>Log data (IP address, browser type, pages visited)</li>
        <li>Device information</li>
        <li>Usage patterns and preferences</li>
      </ul>

      <h2>How We Use Your Information</h2>
      <p>We use your information to:</p>
      <ul>
        <li>Provide and maintain our service</li>
        <li>Process your subscription payments</li>
        <li>Send you email reminders (if enabled)</li>
        <li>Generate statements and documents for your VA claim</li>
        <li>Respond to your feedback and support requests</li>
        <li>Improve and develop new features</li>
        <li>Comply with legal obligations</li>
      </ul>

      <h2>Data Security</h2>
      <p>
        We implement appropriate technical and organizational security measures to protect your personal information. Your data is encrypted in transit and at rest. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
      </p>

      <h2>Third-Party Services</h2>
      <p>We use the following third-party service providers:</p>
      <ul>
        <li><strong>Stripe:</strong> For payment processing (subject to Stripe's Privacy Policy)</li>
        <li><strong>Supabase:</strong> For secure data storage and authentication</li>
        <li><strong>Resend:</strong> For sending email notifications</li>
        <li><strong>Vercel:</strong> For hosting our application</li>
      </ul>

      <h2>Your Rights</h2>
      <p>You have the right to:</p>
      <ul>
        <li>Access your personal information</li>
        <li>Correct inaccurate information</li>
        <li>Request deletion of your data</li>
        <li>Export your data</li>
        <li>Opt-out of email communications</li>
        <li>Cancel your subscription at any time</li>
      </ul>

      <h2>Data Retention</h2>
      <p>
        We retain your personal information for as long as your account is active or as needed to provide you services. If you delete your account, we will delete your personal information within 30 days, except where we are required to retain it for legal purposes.
      </p>

      <h2>Children's Privacy</h2>
      <p>
        Our service is not intended for individuals under the age of 18. We do not knowingly collect personal information from children.
      </p>

      <h2>Changes to This Privacy Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
      </p>

      <h2>Contact Us</h2>
      <p>
        If you have questions about this Privacy Policy, please contact us through our Feedback page or email us at support@claimcompass.net.
      </p>

      <div className="mt-12 rounded-lg border-2 border-blue-600 bg-blue-50 p-6 not-prose">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> This Privacy Policy is provided for informational purposes and does not constitute legal advice. We recommend consulting with a legal professional to ensure compliance with all applicable laws and regulations.
        </p>
      </div>
    </div>
  );
}