// Platinum/Gold/Silver pass data now lives in the pass_types DB table
// (managed from /admin/pass-types). The free Visitor Pass isn't part of
// that catalog - it's a separate OTP-gated flow - so it stays here.
export const visitorFeatures = [
  "Access to the exhibition area",
  "Fast-track registration",
  "Access to all conference tracks",
  "Delegate kit",
  "Lunch in the dining area",
  "Access to the evening awards ceremony",
  "Pre-event matchmaking via Expo mobile app",
  "Post-event access to on-demand session recordings",
];
