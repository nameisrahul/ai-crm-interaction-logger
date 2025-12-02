import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchInteractions,
  deleteInteraction
} from "../features/interactionsSlice";
import { api } from "../api";

export default function InteractionList() {
  const dispatch = useDispatch();
  const { list, status } = useSelector((state) => state.interactions);

  useEffect(() => {
    dispatch(fetchInteractions());
  }, [dispatch]);

  const [editing, setEditing] = React.useState(null);

  const saveEdit = async (item) => {
    await api.put(`/interactions/${item.id}`, item);
    dispatch(fetchInteractions());
    setEditing(null);
  };

  return (
    <div>
      {/* EDIT POPUP */}
      {editing && (
        <div className="border p-4 rounded mb-4 bg-gray-50">
          <h3 className="font-semibold mb-2">Edit Interaction</h3>
          <textarea
            className="w-full border rounded p-2 text-sm"
            rows={10}
            value={JSON.stringify(editing, null, 2)}
            onChange={(e) =>
              setEditing(JSON.parse(e.target.value))
            }
          />
          <div className="flex gap-2 mt-2">
            <button
              className="px-3 py-1 bg-blue-600 text-white rounded"
              onClick={() => saveEdit(editing)}
            >
              Save
            </button>
           <button
  type="button"
  className="border px-4 py-2 rounded-lg text-sm"
  onClick={() => {
    setHcpName("");
    setInteractionType("Meeting");
    setDate("");
    setTime("");
    setAttendees("");
    setTopics("");
    setMaterials([]);
    setSamples([]);
    setSentiment("neutral");
    setOutcomes("");
    setFollowups("");
  }}
>
  Cancel
</button>

          </div>
        </div>
      )}

      <h3 className="text-sm font-semibold mb-3">Recent Interactions</h3>

      {status === "loading" && (
        <p className="text-xs text-gray-500">Loading interactions…</p>
      )}

      {list.length === 0 && status !== "loading" && (
        <p className="text-xs text-gray-500">No interactions logged yet.</p>
      )}

      <ul className="space-y-2">
        {list.map((it) => (
          <li
            key={it.id}
            className="bg-white border rounded-lg px-3 py-2 flex justify-between items-start"
          >
            <div className="text-xs">
              <div className="font-semibold text-sm">
                {it.structured_data?.hcp_name || "Unknown HCP"}
              </div>
              <div className="text-gray-600 mt-1">
                {it.summary ||
                  (it.raw_text || "").slice(0, 120) ||
                  "No summary available."}
              </div>
            </div>

            <div className="text-[10px] text-gray-400 text-right min-w-[120px]">
              {new Date(it.created_at).toLocaleString()}

              <button
                onClick={() => dispatch(deleteInteraction(it.id))}
                className="text-red-600 text-xs hover:underline ml-2"
              >
                Delete
              </button>

              <button
                onClick={() => setEditing(it)}
                className="text-blue-600 text-xs hover:underline ml-2"
              >
                Edit
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
