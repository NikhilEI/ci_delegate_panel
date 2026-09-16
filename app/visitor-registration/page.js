import HeaderVisitor from "@/components/HeaderVisitor";
import FeaturedExpos from "@/components/FeaturedExpos";
import VisitorRegistrationForm from "@/components/registration/VisitorRegistrationForm";
import ContactCards from "@/components/ContactCards";
import FooterVisitor from "@/components/FooterVisitor";

export const metadata = {
  title: "Convergence India - Visitor Registration",
  description:
    "Hurry up, register yourself as a visitor for the most advanced 3-day show and loads of fun conferences that surround it before all the slots are filled. You can find the registration form and process here.",
  keywords: "Convergence India Visitors, Visitor Registration, Visitor Profile",
};

export default function VisitorRegistrationPage() {
  return (
    <>
      <HeaderVisitor />
      <FeaturedExpos />
      <VisitorRegistrationForm />
      <ContactCards />
      <FooterVisitor />
    </>
  );
}
