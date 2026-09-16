export default function FooterVisitor() {
  const year = new Date().getFullYear();

  return (
    <footer>
      <div className="footer-section">
        <div className="container-xxl">
          <div className="row">
            <div className="col-xl-5 col-lg-6 col-md-6 col-12 mb-3">
              <div className="row">
                <div className="col-xl-5 col-lg-6 col-md-6 col-sm-6 col-12">
                  <div className="footer-logo-bottom">Convergence India Expo</div>
                  <div className="footer-logo-bottom-txt">
                    23-25 March 2027 <br /> Bharat Mandapam, New Delhi
                  </div>
                  <div className="footer-bottom-btn-main">
                    <ul>
                      <li>
                        <a href="https://www.convergenceindia.org/space-booking.aspx" className="d-flex justify-content-between">
                          <span>For Exhibition Enquiries</span> <i className="far fa-arrow-right btn-arrow-icon"></i>
                        </a>
                      </li>
                      <li>
                        <a href="https://www.convergenceindia.org/mobile-app.aspx" className="d-flex justify-content-between" target="_blank">
                          <span>Download Expo App</span> <i className="far fa-arrow-right btn-arrow-icon"></i>
                        </a>
                      </li>
                      <li>
                        <a href="https://www.convergence-now.com/" className="d-flex justify-content-between" target="_blank">
                          <span>Industry News</span> <i className="far fa-arrow-right btn-arrow-icon"></i>
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="col-xl-5 col-lg-6 col-md-6 col-sm-6 col-12 offset-xl-1">
                  <div className="footer-bottom-heading">Quick Links</div>
                  <div className="footer-bottom-link">
                    <ul>
                      <li>
                        <a href="download-form.aspx" target="_blank">
                          2026 Brochure
                        </a>
                      </li>
                      <li>
                        <a href="https://convergenceindia.pixieset.com/32ndconvergenceindiaand10thsmartcitiesindia2025expo/">2025 Photo Gallery</a>
                      </li>
                      <li>
                        <a href="https://www.convergenceindia.org/exhibitors-and-participants-convergence-india.aspx">List of Participants</a>
                      </li>
                      <li>
                        <a href="https://www.convergenceindia.org/expo-highlights/default.aspx" target="_blank">
                          Press Zone
                        </a>
                      </li>
                      <li>
                        <a href="https://www.convergenceindia.org/terms-and-conditions.aspx" target="_blank">
                          Terms &amp; Conditions
                        </a>
                      </li>
                      <li>
                        <a href="https://www.convergenceindia.org/privacy-policy.aspx" target="_blank">
                          Privacy Policy
                        </a>
                      </li>
                      <li>
                        <a href="https://www.convergenceindia.org/contact-us.aspx" target="_blank">
                          Contact Us
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-7 col-lg-6 col-md-6 col-12 footer-left-border">
              <div className="row justify-content-center">
                <div className="col-4">
                  <div className="footer-logo-heading">A Member of</div>
                  <div className="footer-logo-box">
                    <img src="/images/UFI-Member-logo-2026.png" alt="UFI Member logo" />
                  </div>
                </div>

                <div className="col-4">
                  <div className="footer-logo-heading">Communications Partner</div>
                  <div className="footer-logo-box">
                    <img src="/images/communications-today-2026.png" alt="Communications Today" />
                  </div>
                </div>
              </div>
              <hr className="m-5" />
              <div className="row">
                <div className="col-12">
                  <div className="footer-logo-heading">Organisers</div>
                </div>
              </div>
              <div className="row justify-content-center">
                <div className="col-lg-4 col-md-5 col-sm-6 col-6">
                  <div className="footer-logo-box">
                    <img src="/images/footer-event-organiger-2026.png" alt="ITPO -India Trade Promotion Organisation (ITPO)" />
                  </div>
                </div>
                <div className="col-lg-4 col-md-5 col-sm-6 col-6">
                  <div className="footer-logo-box">
                    <img src="/images/footer-event-organiger-2026-1.png" alt="Exhibitions India" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-section-bottom">
        <div className="container-xxl">
          <div className="row">
            <div className="col-12">
              <div className="footer-copyright">Copyright © {year} All rights reserved. Exhibitions India Group.</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
