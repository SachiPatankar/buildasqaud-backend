export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  Date: { input: any; output: any };
};

export type CreatePostInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  location_id?: InputMaybe<Scalars['String']['input']>;
  project_phase?: InputMaybe<Scalars['String']['input']>;
  project_type?: InputMaybe<Scalars['String']['input']>;
  requirements?: InputMaybe<RequirementInput>;
  tech_stack?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  title: Scalars['String']['input'];
  work_mode?: InputMaybe<Scalars['String']['input']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  _empty?: Maybe<Scalars['String']['output']>;
  changePassword: Scalars['Boolean']['output'];
  closePost: Post;
  createPost: Post;
  deletePhoto: User;
  deletePost: Scalars['Boolean']['output'];
  deleteProfilePhoto: Scalars['Boolean']['output'];
  incrementPostView: Post;
  savePost: SavedPost;
  unsavePost: Scalars['Boolean']['output'];
  updatePost: Post;
  updateUser: User;
  updateUserPhoto: User;
};

export type MutationChangePasswordArgs = {
  newPassword: Scalars['String']['input'];
  oldPassword: Scalars['String']['input'];
};

export type MutationClosePostArgs = {
  postId: Scalars['String']['input'];
};

export type MutationCreatePostArgs = {
  input: CreatePostInput;
};

export type MutationDeletePostArgs = {
  postId: Scalars['String']['input'];
};

export type MutationDeleteProfilePhotoArgs = {
  photoUrl: Scalars['String']['input'];
};

export type MutationIncrementPostViewArgs = {
  postId: Scalars['String']['input'];
};

export type MutationSavePostArgs = {
  postId: Scalars['String']['input'];
};

export type MutationUnsavePostArgs = {
  postId: Scalars['String']['input'];
};

export type MutationUpdatePostArgs = {
  input: UpdatePostInput;
  postId: Scalars['String']['input'];
};

export type MutationUpdateUserArgs = {
  input: UpdateUserInput;
};

export type MutationUpdateUserPhotoArgs = {
  photoUrl: Scalars['String']['input'];
};

export type Post = {
  __typename?: 'Post';
  _id: Scalars['String']['output'];
  applications_count: Scalars['Int']['output'];
  created_at: Scalars['Date']['output'];
  description?: Maybe<Scalars['String']['output']>;
  location_id?: Maybe<Scalars['String']['output']>;
  posted_by: Scalars['String']['output'];
  project_phase?: Maybe<Scalars['String']['output']>;
  project_type?: Maybe<Scalars['String']['output']>;
  requirements?: Maybe<Requirement>;
  status: Scalars['String']['output'];
  tech_stack?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  title: Scalars['String']['output'];
  updated_at: Scalars['Date']['output'];
  views_count: Scalars['Int']['output'];
  work_mode?: Maybe<Scalars['String']['output']>;
};

export type PostFilterInput = {
  project_phase?: InputMaybe<Scalars['String']['input']>;
  project_type?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  tech_stack?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  work_mode?: InputMaybe<Scalars['String']['input']>;
};

export type PresignedUrlResult = {
  __typename?: 'PresignedUrlResult';
  file_url: Scalars['String']['output'];
  upload_url: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  _empty?: Maybe<Scalars['String']['output']>;
  getPresignedUrl: PresignedUrlResult;
  getSavedPosts: Array<Maybe<SavedPost>>;
  loadPostByFilter: Array<Maybe<Post>>;
  loadPostById?: Maybe<Post>;
  loadPosts: Array<Maybe<Post>>;
};

export type QueryGetPresignedUrlArgs = {
  fileType: Scalars['String']['input'];
  folder?: InputMaybe<Scalars['String']['input']>;
};

export type QueryGetSavedPostsArgs = {
  userId: Scalars['String']['input'];
};

export type QueryLoadPostByFilterArgs = {
  filter: PostFilterInput;
};

export type QueryLoadPostByIdArgs = {
  postId: Scalars['String']['input'];
};

export type QueryLoadPostsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};

export type Requirement = {
  __typename?: 'Requirement';
  desired_roles?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  desired_skills?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  preferred_experience?: Maybe<Scalars['String']['output']>;
};

export type RequirementInput = {
  desired_roles?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  desired_skills?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  preferred_experience?: InputMaybe<Scalars['String']['input']>;
};

export type SavedPost = {
  __typename?: 'SavedPost';
  _id: Scalars['String']['output'];
  created_at: Scalars['Date']['output'];
  post_id: Scalars['String']['output'];
  user_id: Scalars['String']['output'];
};

export type Subscription = {
  __typename?: 'Subscription';
  _empty?: Maybe<Scalars['String']['output']>;
};

export type UpdatePostInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  project_phase?: InputMaybe<Scalars['String']['input']>;
  project_type?: InputMaybe<Scalars['String']['input']>;
  requirements?: InputMaybe<RequirementInput>;
  status?: InputMaybe<Scalars['String']['input']>;
  tech_stack?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  title: Scalars['String']['input'];
  work_mode?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateUserInput = {
  first_name?: InputMaybe<Scalars['String']['input']>;
  last_name?: InputMaybe<Scalars['String']['input']>;
};

export type User = {
  __typename?: 'User';
  _id: Scalars['String']['output'];
  first_name?: Maybe<Scalars['String']['output']>;
  last_name?: Maybe<Scalars['String']['output']>;
  photo?: Maybe<Scalars['String']['output']>;
};
