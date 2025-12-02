import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { createInteraction } from "../features/interactionsSlice";
import { agentLog } from "../features/interactionsSlice";
export default function InteractionForm() {
  const dispatch = useDispatch();

  const [hcpName, setHcpName] = useState("");
  const [interactionType, setInteractionType] = useState("Meeting");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [attendees, setAttendees] = useState("");
  const [topics, setTopics] = useState("");
  const [materials, setMaterials] = useState([]);
  const [samples, setSamples] = useState([]);
  const [sentiment, setSentiment] = useState("neutral");
  const [outcomes, setOutcomes] = useState("");
  const [followups, setFollowups] = useState("");

  const addMaterial = () => {
    const name = prompt("Material name?");
    if (name) setMaterials((prev) => [...prev, name]);
  };

  const addSample = () => {
    const name = prompt("Sample name?");
    if (!name) return;
    const qty = parseInt(prompt("Quantity?", "1") || "1", 10);
    setSamples((prev) => [...prev, { name, quantity: qty }]);
  };

  const handleSave = async () => {
    const meeting_time =
      date && time ? new Date(`${date}T${time}:00`).toISOString() : null;

    const structured_data = {
      hcp_name: hcpName || null,
      interaction_type: interactionType,
      attendees:
        attendees.trim() === ""
          ? []
          : attendees.split(",").map((s) => s.trim()),
      topics:
        topics.trim() === ""
          ? []
          : topics.split("\n").map((s) => s.trim()).filter(Boolean),
      materials_shared: materials,
      samples_distributed: samples,
      sentiment,
      outcomes,
      follow_up_tasks:
        followups.trim() === ""
          ? []
          : followups.split("\n").map((s) => s.trim()).filter(Boolean),
    };

    const payload = {
      raw_text: outcomes || `Met ${hcpName} (${interactionType}).`,
      structured_data,
      summary: outcomes || "",
      sentiment,
      meeting_time,
    };

    await dispatch(createInteraction(payload));
    alert("Interaction saved (form mode).");

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
  };
  const handleAiSave = async () => {
  const raw = `
    HCP: ${hcpName}
    Interaction Type: ${interactionType}
    Topics: ${topics}
    Materials: ${materials.join(", ")}
    Samples: ${samples.map(s => `${s.name} x${s.quantity}`).join(", ")}
    Sentiment: ${sentiment}
    Outcomes: ${outcomes}
    Followups: ${followups}
  `;

  // 1️⃣ Send to /agent/log
  const aiRes = await dispatch(agentLog(raw)).unwrap();

  // 2️⃣ Extract AI fields
  const data = aiRes.interaction.structured_data;

  // 3️⃣ Update the form fields from AI output
  setHcpName(data.hcp_name || "");
  setTopics((data.topics || []).join("\n"));
  setMaterials(data.materials_shared || []);
  setSamples(data.samples_distributed || []);
  setSentiment(data.sentiment || "neutral");
  setFollowups((data.follow_up_tasks || []).join("\n"));
  setOutcomes(aiRes.interaction.summary || "");

  // 4️⃣ Prepare payload for saving
  const savePayload = {
    raw_text: raw,
    structured_data: data,
    summary: aiRes.interaction.summary,
    sentiment: aiRes.interaction.sentiment,
    meeting_time: new Date().toISOString(),
  };

  // 5️⃣ Save to DB
  await dispatch(createInteraction(savePayload));

  alert("AI summarized and saved!");
};
const resetForm = () => {
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
};


  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Interaction Details</h2>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-600">HCP Name</label>
          <input
            className="mt-1 w-full border rounded px-3 py-2 text-sm"
            placeholder="Search or enter HCP name"
            value={hcpName}
            onChange={(e) => setHcpName(e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600">Interaction</label>
          <select
            className="mt-1 w-full border rounded px-3 py-2 text-sm"
            value={interactionType}
            onChange={(e) => setInteractionType(e.target.value)}
          >
            <option>Meeting</option>
            <option>Call</option>
            <option>Virtual</option>
            <option>Event</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600">Date</label>
          <input
            type="date"
            className="mt-1 w-full border rounded px-3 py-2 text-sm"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600">Time</label>
          <input
            type="time"
            className="mt-1 w-full border rounded px-3 py-2 text-sm"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>

        <div className="col-span-2">
          <label className="text-xs font-medium text-gray-600">Attendees</label>
          <input
            className="mt-1 w-full border rounded px-3 py-2 text-sm"
            placeholder="Enter names or search"
            value={attendees}
            onChange={(e) => setAttendees(e.target.value)}
          />
        </div>

        <div className="col-span-2">
          <label className="text-xs font-medium text-gray-600">Topics Discussed</label>
          <textarea
            className="mt-1 w-full border rounded px-3 py-2 text-sm"
            rows={3}
            placeholder="Enter key discussion points..."
            value={topics}
            onChange={(e) => setTopics(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-4 border-t pt-4">
        <h3 className="text-sm font-semibold mb-2">
          Materials Shared / Samples Distributed
        </h3>

        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-xs font-medium">Materials Shared</p>
            {materials.length === 0 ? (
              <p className="text-xs text-gray-500">No materials added.</p>
            ) : (
              <ul className="text-xs text-gray-700">
                {materials.map((m, i) => (
                  <li key={i}>• {m}</li>
                ))}
              </ul>
            )}
          </div>

          <button
            onClick={addMaterial}
            className="border px-3 py-1.5 rounded text-xs"
          >
            Search/Add
          </button>
        </div>

        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-medium">Samples Distributed</p>
            {samples.length === 0 ? (
              <p className="text-xs text-gray-500">No samples added.</p>
            ) : (
              <ul className="text-xs text-gray-700">
                {samples.map((s, i) => (
                  <li key={i}>• {s.name} (x{s.quantity})</li>
                ))}
              </ul>
            )}
          </div>

          <button
            onClick={addSample}
            className="border px-3 py-1.5 rounded text-xs"
          >
            Add Sample
          </button>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-semibold mb-1">
          Observed / Inferred HCP Sentiment
        </h3>

        <div className="flex gap-6 text-sm">
          <label className="flex gap-1 items-center">
            <input
              type="radio"
              checked={sentiment === "positive"}
              onChange={() => setSentiment("positive")}
            />
            Positive
          </label>

          <label className="flex gap-1 items-center">
            <input
              type="radio"
              checked={sentiment === "neutral"}
              onChange={() => setSentiment("neutral")}
            />
            Neutral
          </label>

          <label className="flex gap-1 items-center">
            <input
              type="radio"
              checked={sentiment === "negative"}
              onChange={() => setSentiment("negative")}
            />
            Negative
          </label>
        </div>
      </div>

      <div className="mt-4">
        <label className="text-xs font-medium">Outcomes</label>
        <textarea
          className="mt-1 w-full border rounded px-3 py-2 text-sm"
          rows={3}
          placeholder="Key outcomes or agreements..."
          value={outcomes}
          onChange={(e) => setOutcomes(e.target.value)}
        />
      </div>

      <div className="mt-4">
        <label className="text-xs font-medium">Follow-up Actions</label>
        <textarea
          className="mt-1 w-full border rounded px-3 py-2 text-sm"
          rows={2}
          placeholder="Enter next steps"
          value={followups}
          onChange={(e) => setFollowups(e.target.value)}
        />
      </div>

      {/* BUTTONS */}
      <div className="mt-6 flex gap-3">
        <button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
        >
          Save
        </button>

        <button
  onClick={handleAiSave}
  type="button"
  className="border px-4 py-2 rounded-lg text-sm bg-blue-100 hover:bg-blue-200"
>
  Save & Summarize (AI)
</button>


        <button
  type="button"
  className="border px-4 py-2 rounded-lg text-sm"
  onClick={resetForm}
>
  Cancel
</button>

      </div>
    </div>
  );
}
