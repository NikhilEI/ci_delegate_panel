const expos = [
  { name: "AI Bharat Expo", href: "https://www.aibharatexpo.com/", logo: "/images/co-located-expo-logo/ai-bharat-expo.png" },
  { name: "Data Center Expo", href: "https://www.datacenterindiaexpo.com/", logo: "/images/co-located-expo-logo/data-center-expo-logo.png" },
  { name: "FinTech India Expo", href: "https://www.fintechindiaexpo.com/", logo: "/images/co-located-expo-logo/fintech-india-expo.png" },
  { name: "IoT India Expo", href: "https://www.iotindiaexpo.com/", logo: "/images/co-located-expo-logo/iot-india-expo.png" },
  { name: "Mobile Smart Living Expo", href: "https://www.mobileindiaexpo.com/", logo: "/images/co-located-expo-logo/Mobile-Smart-Living-Expo.png" },
  { name: "Security and Surveillance Home", href: "https://www.securitysurveillanceexpo.com/", logo: "/images/co-located-expo-logo/Security-and-Surveillance-Home-Logo.png" },
  { name: "Smart Mobility India expo", href: "https://www.smartmobilityindiaexpo.com/", logo: "/images/co-located-expo-logo/smart-mobility-india-expo.png" },
  { name: "Startup Hub Logo", href: "https://www.startuphubexpo.com/", logo: "/images/co-located-expo-logo/startup-hub-expo.png" },
];

export default function FeaturedExpos() {
  return (
    <>
      <section className="home-banner-bottom d-none d-sm-block">
        <div className="container-xxl">
          <div className="row align-items-center">
            <div className="col-md-12 col-sm-12 px-0 text-center">
              <div className="co-located-hd">
                <span>Featured Expos</span>
              </div>
            </div>
          </div>
        </div>

        <div className="container-xxl">
          <div className="home-banner-bottom-bg">
            <ul className="row align-items-center justify-content-md-center">
              {expos.map((expo) => (
                <li className="col-md-2 col-4" key={expo.name}>
                  <a href={expo.href} target="_blank">
                    <img src={expo.logo} alt={expo.name} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="home-banner--bottom d-sm-none d-block">
        <img src="/images/delegate-registration-featured-expos.jpg" alt="Featured India Expo" className="w-100" />
      </section>
    </>
  );
}
