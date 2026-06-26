/** Navigator param lists (typed routes for native-stack). */

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

export type AppStackParamList = {
  Feed: undefined;
  CreatePost: undefined;
  Comments: { postId: string };
};
