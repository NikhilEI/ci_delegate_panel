// Platinum/Gold/Silver pass data now lives in the pass_types DB table
// (managed from /admin/pass-types). The free Visitor Pass isn't part of
// that catalog - it's a separate OTP-gated flow - so it stays here.
//
// Matches convergenceindia.org/register-now/: every tier's card lists the
// SAME full set of perks (a comparison view), and a perk the Visitor Pass
// doesn't get is still shown - just greyed out and struck through, via the
// "~~like this~~" line convention that PassCard/parseFeatureLine reads.
export const visitorFeatures = [
  "Entry to exhibition area",
  "Access to leading technology brands",
  "Networking opportunities with industry professionals",
  "Pre-event matchmaking via Expo mobile app",
  "~~Delegate kit~~",
  "~~Access to all conference tracks & stages~~",
  "~~Lunch in the dining area~~",
  "~~Access to the evening awards ceremony~~",
];

export const visitorMoreFeatures = [
  "~~Pre-event matchmaking via Expo mobile app~~",
  "~~Post-event access to on-demand session recordings~~",
  "~~Priority seating at conference sessions~~",
  "~~Access to the networking night~~",
  "~~Access to the business networking lounge~~",
  "~~Certificate of attendance~~",
  "~~Exclusive access to the VIP lounge~~",
  "~~Exclusive car parking pass~~",
  "~~Access to plenary sessions~~",
  "~~Invitation to the inauguration ceremony~~",
  "~~Dedicated concierge support/ Guided tour of the venue~~",
  "~~Exclusive video feature on expo social media channels (subject to availability)~~",
];
