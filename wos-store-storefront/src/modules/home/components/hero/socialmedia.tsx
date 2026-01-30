import Script from "next/script"


const SocialMedia = () => {
  return (
    <div className="py-12 w-[80vw] mx-auto">
        <div className="flex justify-between items-center mb-8 mx-auto">
            <h2 className="font-semibold text-3xl font-bold">Notre actualité</h2>
            <a
                href="https://www.instagram.com/wossneakers?igsh=eTRveHFnaGwwbWow"
                className="border border-black text-white bg-black text-sm px-4 py-1 rounded-full transition-all duration-300
                    hover:bg-gradient-to-r
                    hover:from-pink-500
                    hover:via-red-500
                    hover:to-yellow-500
                    hover:border-yellow-500
                "
                target="_blank"
                rel="noopener noreferrer"
            >
                Découvrir
            </a>
        </div>
        <div id="curator-feed-default-feed-layout"><a href="https://curator.io" target="_blank" className="crt-logo crt-tag">Powered by Curator.io</a></div>
            <Script
            src="https://cdn.curator.io/published/b475a739-fd8c-4219-93cd-ba16dcb12409.js"
            strategy="afterInteractive"
            />
    </div>
  )
}

export default SocialMedia