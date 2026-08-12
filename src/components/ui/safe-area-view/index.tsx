'use client';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { withUniwind } from 'uniwind';

/**
 * react-native-safe-area-context is a third-party component, so uniwind does not
 * patch it: without withUniwind its className is dropped and layout classes like
 * flex-1 never apply (which collapses children to zero height).
 */
export const SafeAreaView = withUniwind(RNSafeAreaView);
