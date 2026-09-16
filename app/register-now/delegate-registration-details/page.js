import Header from "@/components/Header";
import FeaturedExpos from "@/components/FeaturedExpos";
import Footer from "@/components/Footer";
import DelegateRegistrationForm from "@/components/registration/DelegateRegistrationForm";

export const metadata = {
  title: "Convergence India - Delegate Registration",
  description:
    "Hurry up, register yourself as a visitor for the most advanced 3-day show and loads of fun conferences that surround it before all the slots are filled. You can find the registration form and process here.",
  keywords: "Convergence India Visitors, Delegate Registration, Visitor Profile",
};

export default async function DelegateRegistrationDetailsPage({ searchParams }) {
  const params = await searchParams;
  const qty = Math.max(1, Math.min(50, parseInt(params?.qty, 10) || 1));
  const price = parseInt(params?.price, 10) || 0;
  const passName = params?.passName || "Delegate Pass";
  const slug = params?.slug || "";
  const promoCode = params?.promoCode || "";
  const discount = Math.max(0, parseInt(params?.discount, 10) || 0);

  return (
    <>
      <Header />
      <FeaturedExpos />
      <DelegateRegistrationForm qty={qty} price={price} passName={passName} slug={slug} promoCode={promoCode} discount={discount} />
      <Footer />
    </>
  );
}
