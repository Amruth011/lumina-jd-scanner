export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Lumina JD Scanner",
    "url": "https://lumina-jd-scanner.vercel.app",
    "description": "Lumina JD Scanner is an AI-powered ATS resume optimizer and job description analyzer designed to help candidates bridge skill gaps and land top-tier roles.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  return (
    <section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1>Lumina JD Scanner</h1>
    </section>
  );
}
