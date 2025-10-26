import { createSlice } from "@reduxjs/toolkit";

const initialState={
    isAuthenticated:false,
    user:null,
};

const authSlice= createSlice({
    name:'auth',
    initialState,
    reducers:{
        logIn:(state,action)=>{ 
            state.isAuthenticated=true;
            state.user=action.payload;
        },
        logOut:(state)=>{
            state.isAuthenticated=false;
            
        },
    }
})
export const {logIn, logOut}= authSlice.actions;
export default authSlice.reducer;