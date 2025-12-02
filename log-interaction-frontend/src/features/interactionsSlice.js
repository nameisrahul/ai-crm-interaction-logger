import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api";

// GET /interactions
export const fetchInteractions = createAsyncThunk(
  "interactions/fetchAll",
  async () => {
    const res = await api.get("/interactions");
    return res.data;
  }
);

// POST /interactions (form mode)
export const createInteraction = createAsyncThunk(
  "interactions/create",
  async (payload) => {
    const res = await api.post("/interactions", payload);
    return res.data;
  }
);

// POST /agent/log (chat mode)
export const agentLog = createAsyncThunk(
  "interactions/agentLog",
  async (text) => {
    const res = await api.post("/agent/log", { text });
    return res.data; // { interaction: {...}, followups: [...] }
  }
);

// DELETE interaction
export const deleteInteraction = createAsyncThunk(
  "interactions/delete",
  async (id) => {
    await api.delete(`/interactions/${id}`);
    return id;
  }
);

const interactionsSlice = createSlice({
  name: "interactions",
  initialState: {
    list: [],
    agentResult: null,
    status: "idle",
    error: null,
  },
  reducers: {
    clearAgentResult(state) {
      state.agentResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInteractions.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchInteractions.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchInteractions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(createInteraction.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      .addCase(agentLog.pending, (state) => {
        state.status = "loading";
        state.agentResult = null;
      })
      .addCase(agentLog.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.agentResult = action.payload;
      })
      .addCase(agentLog.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;      
      })
      .addCase(deleteInteraction.fulfilled, (state, action) => {
  state.list = state.list.filter(i => i.id !== action.payload);
});

  },
});

export const { clearAgentResult } = interactionsSlice.actions;
export default interactionsSlice.reducer;
