import { notFound } from "next/navigation";
import Header from "@/components/Header";
import FeaturedExpos from "@/components/FeaturedExpos";
import Footer from "@/components/Footer";
import DelegateCart from "@/components/registration/DelegateCart";
import { getPassTypeBySlug } from "@/lib/passTypes";

export const revalidate = 0;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const passType = await getPassTypeBySlug(slug).catch(() => null);
  if (!passType) return {};

  return {
    title: `Convergence India - ${passType.name}`,
    description:
      "Hurry up, register yourself as a visitor for the most advanced 3-day show and loads of fun conferences that surround it before all the slots are filled. You can find the registration form and process here.",
    keywords: `Convergence India Visitors, ${passType.name}, Visitor Profile`,
  };
}

export default async function DelegatePassCartPage({ params }) {
  const { slug } = await params;
  const passType = await getPassTypeBySlug(slug);

  if (!passType) {
    notFound();
  }

  return (
    <>
      <Header />
      <FeaturedExpos />
      <DelegateCart
        slug={passType.slug}
        modifierClass={passType.badgeClass}
        passName={passType.name}
        price={passType.price}
        baseFeatures={passType.baseFeatures}
        moreFeatures={passType.moreFeatures}
        detailsHref="/register-now/delegate-registration-details"
      />
      <Footer />
    </>
  );
}
