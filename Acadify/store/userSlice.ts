import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type User = {
  id?: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  image?: string;
  token?: string;
  gender?: string;
};

type UserState = {
  user: User | null;
};

const initialState: UserState = {
  user: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    clearUser(state) {
      state.user = null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
