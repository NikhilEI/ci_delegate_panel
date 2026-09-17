"use client";

import PassCard from "@/components/registration/PassCard";

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
          {passTypes.map((passType) => {
            const isVisitor = passType.badgeClass === "delegate-pass-visitor";
            return (
              <div className="col-lg-3 col-md-6 col-sm-6 col-12" key={passType.slug}>
                <PassCard
                  modifierClass={passType.badgeClass}
                  badgeIcon={
                    isVisitor ? (
                      <div className="delegate-pass-badge-icon">
                        <img src="/images/delegate-visitor-pass-icon.png" alt={`${passType.name} Free`} />
                      </div>
                    ) : undefined
                  }
                  title={passType.name}
                  price={isVisitor ? "Free" : passType.price}
                  ctaLabel={isVisitor ? "Register Now" : "Get Your Pass"}
                  ctaHref={isVisitor ? "/visitor-registration" : `/register-now/${passType.slug}`}
                  moreLabel={isVisitor ? "Features Not Included + " : "View all features + "}
                  baseFeatures={passType.baseFeatures}
                  moreFeatures={passType.moreFeatures}
                />
              </div>
            );
          })}
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
