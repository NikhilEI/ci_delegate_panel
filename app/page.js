import Header from "@/components/Header";
import FeaturedExpos from "@/components/FeaturedExpos";
import DelegatePasses from "@/components/DelegatePasses";
import Footer from "@/components/Footer";
import { getActivePassTypes } from "@/lib/passTypes";

export const revalidate = 0;

export default async function Home() {
  let passTypes = [];
  try {
    passTypes = await getActivePassTypes();
  } catch (error) {
    console.error("Could not load pass types for homepage:", error);
  }

  return (
    <>
      <Header />
      <FeaturedExpos />
      <DelegatePasses passTypes={passTypes} />
      <Footer />
    </>
  );
}
