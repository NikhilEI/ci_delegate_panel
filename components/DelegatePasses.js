"use client";

import PassCard from "@/components/registration/PassCard";
import { visitorFeatures, visitorMoreFeatures } from "@/lib/passFeatures";

export default function DelegatePasses({ passTypes = [] }) {
  return (
    <section className="section-padding section-delegate-pass">
      <div className="container-xxl">
        <div className="row align-items-center">
          <div className="col-md-8">
            <div className="delegate-pass-left-heading">Secure Your Spot</div>
            <div className="delegate-pass-left-para">Choose the best pass and experience the future of fintech</div>
          </div>
        </div>
      </div>

      <div className="container-xxl">
        <div className="row">
          {passTypes.map((passType) => (
            <div className="col-lg-3 col-md-6 col-sm-6 col-12" key={passType.slug}>
              <PassCard
                modifierClass={passType.badgeClass}
                title={passType.name}
                price={passType.price}
                ctaHref={`/register-now/${passType.slug}`}
                baseFeatures={passType.baseFeatures}
                moreFeatures={passType.moreFeatures}
              />
            </div>
          ))}

          <div className="col-lg-3 col-md-6 col-sm-6 col-12">
            <PassCard
              modifierClass="delegate-pass-visitor"
              badgeIcon={
                <div className="delegate-pass-badge-icon">
                  <img src="/images/delegate-visitor-pass-icon.png" alt="Visitor Pass Free" />
                </div>
              }
              title="Visitor Pass"
              price="Free"
              ctaLabel="Register Now"
              ctaHref="/visitor-registration"
              moreLabel="Features Not Included + "
              baseFeatures={visitorFeatures}
              moreFeatures={visitorMoreFeatures}
            />
          </div>
        </div>
      </div>

      <div className="container-xxl">
        <div className="row align-items-center">
          <div className="col-md-12">
            <div className="exhibitor-profile-left-para">
              *Price is inclusive of all applicable taxes <br />
              *<strong>Platinum, Gold</strong> and <strong>Silver</strong> Pass holders will have access to all conference sessions on all three
              days from 23-25 March 2027.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
