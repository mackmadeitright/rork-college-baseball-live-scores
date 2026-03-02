export default ({ config }) => ({
  ...config,
  slug: "college-baseball-live-scores",
  extra: {
    ...(config.extra || {}),
    eas: {
      projectId: "57aed3d3-733d-47ff-a6be-c41d7e28bce9",
    },
  },

  ios: {
    ...config.ios,
    bundleIdentifier: "com.mackmadeitright.collegebaseball",
    infoPlist: {
      ...(config.ios?.infoPlist || {}),
      NSUserTrackingUsageDescription:
        "This identifier will be used to deliver personalized content to you.",
      UIBackgroundModes: ["remote-notification"],
    },
  },

  plugins: [
    ...(config.plugins || []),
    [
      "expo-notifications",
      {
        icon: "./assets/images/icon.png",
        color: "#16A34A",
      },
    ],
  ],
});
