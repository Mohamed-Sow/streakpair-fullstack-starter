import type { BottomTabScreenProps as BottomTabScreenPropsBase } from "@react-navigation/bottom-tabs";
import { CompositeScreenProps, NavigatorScreenParams } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<BottomTabParamList> | undefined;
  AuthScreen: undefined;
  CreateStreakScreen: undefined;
  StreakDetailScreen: { streakId: string };
  CheckInScreen: { streakId: string };
  InsightsScreen: undefined;
  PhotoGalleryScreen: {
    checkIns: Array<{
      id: string;
      photoUrl: string | null;
      date: string;
      note: string | null;
      userId: string;
      createdAt: string;
      user: {
        id: string;
        name: string | null;
        email: string;
        image: string | null;
      };
    }>;
    streakName: string;
  };
};

export type BottomTabParamList = {
  HomeTab: undefined;
  ProfileTab: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

export type BottomTabScreenProps<Screen extends keyof BottomTabParamList> = CompositeScreenProps<
  BottomTabScreenPropsBase<BottomTabParamList, Screen>,
  NativeStackScreenProps<RootStackParamList>
>;
