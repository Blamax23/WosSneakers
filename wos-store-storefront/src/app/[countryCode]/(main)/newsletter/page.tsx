import NewsletterForm from "@modules/newsletter/components/newsletter-form"

export default function NewsletterPage() {
  return (
    <div className="py-12 max-w-4xl mx-auto px-4">
      <h1 className="text-2xl font-bold mb-8">Newsletter</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <NewsletterForm />
      </div>
    </div>
  )
}