/** Shared stack header styles. Titles and nav buttons use brand coral. */
export const brandHeaderOptions = {
  headerStyle: { backgroundColor: '#FFFCF9' },
  headerTintColor: '#ce6b69',
  headerTitleStyle: {
    fontFamily: 'Nickainley',
    fontWeight: 'normal' as const,
    color: '#ce6b69',
    fontSize: 22,
  },
  headerShadowVisible: false,
  headerBackTitle: 'Back',
  contentStyle: { backgroundColor: '#FFFCF9' },
} as const;
