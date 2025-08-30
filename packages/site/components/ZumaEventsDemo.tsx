"use client";

import { useFhevm } from "../fhevm/useFhevm";
import { useInMemoryStorage } from "../hooks/useInMemoryStorage";
import { useMetaMaskEthersSigner } from "../hooks/metamask/useMetaMaskEthersSigner";
import { useZumaEvents } from "@/hooks/useZumaEvents";
import { errorNotDeployed } from "./ErrorNotDeployed";

/*
 * Main ZumaEvents React component with event management functionality
 *  - "Create Event" button: allows you to create a new event with encrypted thresholds
 *  - "Attend Event" button: allows you to attend an event with encrypted age and skill
 *  - "Get Accepted Count" button: allows you to get and decrypt the accepted count
 *  - "Close Event" button: allows you to close an event
 */
export const ZumaEventsDemo = () => {
  const { storage: fhevmDecryptionSignatureStorage } = useInMemoryStorage();
  const {
    provider,
    chainId,
    accounts,
    isConnected,
    connect,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
    initialMockChains,
  } = useMetaMaskEthersSigner();

  //////////////////////////////////////////////////////////////////////////////
  // FHEVM instance
  //////////////////////////////////////////////////////////////////////////////

  const {
    instance: fhevmInstance,
    status: fhevmStatus,
    error: fhevmError,
  } = useFhevm({
    provider,
    chainId,
    initialMockChains,
    enabled: true, // use enabled to dynamically create the instance on-demand
  });

  //////////////////////////////////////////////////////////////////////////////
  // useZumaEvents is a custom hook containing all the ZumaEvents logic, including
  // - calling the ZumaEvents contract
  // - encrypting FHE inputs (age, skill)
  // - decrypting FHE handles (accepted count)
  // - event management functions
  //////////////////////////////////////////////////////////////////////////////

  const zumaEvents = useZumaEvents({
    instance: fhevmInstance,
    fhevmDecryptionSignatureStorage, // is global, could be invoked directly in useZumaEvents hook
    eip1193Provider: provider,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
  });

  //////////////////////////////////////////////////////////////////////////////
  // UI Stuff:
  // --------
  // A basic page containing
  // - A bunch of debug values allowing you to better visualize the React state
  // - Event creation form with encrypted thresholds
  // - Event attendance form with encrypted age and skill
  // - Event management controls
  //////////////////////////////////////////////////////////////////////////////

  const buttonClass =
    "inline-flex items-center justify-center rounded-xl bg-black px-4 py-4 font-semibold text-white shadow-sm " +
    "transition-colors duration-200 hover:bg-blue-700 active:bg-blue-800 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 " +
    "disabled:opacity-50 disabled:pointer-events-none";

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

  const titleClass = "font-semibold text-black text-lg mt-4";

  if (!isConnected) {
    return (
      <div className="mx-auto">
        <button
          className={buttonClass}
          disabled={isConnected}
          onClick={connect}
        >
          <span className="text-4xl p-6">Connect to MetaMask</span>
        </button>
      </div>
    );
  }

  if (zumaEvents.isDeployed === false) {
    return errorNotDeployed(chainId);
  }

  return (
    <div className="grid w-full gap-4">
      <div className="col-span-full mx-20 bg-black text-white">
        <p className="font-semibold text-3xl m-5">
          Zuma Events - FHE Event Management -{" "}
          <span className="font-mono font-normal text-gray-400">
            ZumaEvents.sol
          </span>
        </p>
      </div>

      <div className="col-span-full mx-20 mt-4 px-5 pb-4 rounded-lg bg-white border-2 border-black">
        <p className={titleClass}>Chain Infos</p>
        {printProperty("ChainId", chainId)}
        {printProperty(
          "Metamask accounts",
          accounts
            ? accounts.length === 0
              ? "No accounts"
              : `{ length: ${accounts.length}, [${accounts[0]}, ...] }`
            : "undefined"
        )}
        {printProperty(
          "Signer",
          ethersSigner ? ethersSigner.address : "No signer"
        )}

        <p className={titleClass}>Contract</p>
        {printProperty("ZumaEvents", zumaEvents.contractAddress)}
        {printProperty("isDeployed", zumaEvents.isDeployed)}
      </div>

      <div className="col-span-full mx-20">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-white border-2 border-black pb-4 px-4">
            <p className={titleClass}>FHEVM instance</p>
            {printProperty(
              "Fhevm Instance",
              fhevmInstance ? "OK" : "undefined"
            )}
            {printProperty("Fhevm Status", fhevmStatus)}
            {printProperty("Fhevm Error", fhevmError ?? "No Error")}
          </div>
          <div className="rounded-lg bg-white border-2 border-black pb-4 px-4">
            <p className={titleClass}>Status</p>
            {printProperty("isCreatingEvent", zumaEvents.isCreatingEvent)}
            {printProperty("isAttending", zumaEvents.isAttending)}
            {printProperty("isGettingCount", zumaEvents.isGettingCount)}
            {printProperty("isClosingEvent", zumaEvents.isClosingEvent)}
            {printProperty("canCreateEvent", zumaEvents.canCreateEvent)}
            {printProperty("canAttend", zumaEvents.canAttend)}
            {printProperty("canGetCount", zumaEvents.canGetCount)}
            {printProperty("canCloseEvent", zumaEvents.canCloseEvent)}
          </div>
        </div>
      </div>

      {/* Event Creation Form */}
      <div className="col-span-full mx-20 px-4 pb-4 rounded-lg bg-white border-2 border-black">
        <p className={titleClass}>Create New Event</p>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Name
            </label>
            <input
              type="text"
              className={inputClass}
              placeholder="Tech Conference 2024"
              value={zumaEvents.eventForm.name}
              onChange={(e) => zumaEvents.updateEventForm("name", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              className={inputClass}
              placeholder="Annual technology conference"
              value={zumaEvents.eventForm.description}
              onChange={(e) => zumaEvents.updateEventForm("description", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date & Time
            </label>
            <input
              type="text"
              className={inputClass}
              placeholder="2024-12-25 09:00:00"
              value={zumaEvents.eventForm.dateTime}
              onChange={(e) => zumaEvents.updateEventForm("dateTime", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              className={inputClass}
              placeholder="San Francisco, CA"
              value={zumaEvents.eventForm.location}
              onChange={(e) => zumaEvents.updateEventForm("location", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Age
            </label>
            <input
              type="number"
              className={inputClass}
              placeholder="18"
              value={zumaEvents.eventForm.minAge}
              onChange={(e) => zumaEvents.updateEventForm("minAge", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Skill
            </label>
            <input
              type="number"
              className={inputClass}
              placeholder="5"
              value={zumaEvents.eventForm.minSkill}
              onChange={(e) => zumaEvents.updateEventForm("minSkill", e.target.value)}
            />
          </div>
        </div>
        <button
          className={buttonClass}
          disabled={!zumaEvents.canCreateEvent}
          onClick={zumaEvents.createEvent}
        >
          {zumaEvents.canCreateEvent
            ? "Create Event"
            : zumaEvents.isCreatingEvent
              ? "Creating..."
              : "Cannot create event"}
        </button>
      </div>

      {/* Event Attendance Form */}
      <div className="col-span-full mx-20 px-4 pb-4 rounded-lg bg-white border-2 border-black">
        <p className={titleClass}>Attend Event</p>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event ID
            </label>
            <input
              type="number"
              className={inputClass}
              placeholder="0"
              value={zumaEvents.attendanceForm.eventId}
              onChange={(e) => zumaEvents.updateAttendanceForm("eventId", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Age
            </label>
            <input
              type="number"
              className={inputClass}
              placeholder="25"
              value={zumaEvents.attendanceForm.age}
              onChange={(e) => zumaEvents.updateAttendanceForm("age", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Skill Level
            </label>
            <input
              type="number"
              className={inputClass}
              placeholder="8"
              value={zumaEvents.attendanceForm.skill}
              onChange={(e) => zumaEvents.updateAttendanceForm("skill", e.target.value)}
            />
          </div>
        </div>
        <button
          className={buttonClass}
          disabled={!zumaEvents.canAttend}
          onClick={zumaEvents.attendEvent}
        >
          {zumaEvents.canAttend
            ? "Attend Event"
            : zumaEvents.isAttending
              ? "Attending..."
              : "Cannot attend event"}
        </button>
      </div>

      {/* Event Management Controls */}
      <div className="grid grid-cols-3 mx-20 gap-4">
        <button
          className={buttonClass}
          disabled={!zumaEvents.canGetCount}
          onClick={zumaEvents.getAcceptedCount}
        >
          {zumaEvents.canGetCount
            ? "Get Accepted Count"
            : zumaEvents.isGettingCount
              ? "Getting..."
              : "Cannot get count"}
        </button>
        <button
          className={buttonClass}
          disabled={!zumaEvents.canCloseEvent}
          onClick={zumaEvents.closeEvent}
        >
          {zumaEvents.canCloseEvent
            ? "Close Event"
            : zumaEvents.isClosingEvent
              ? "Closing..."
              : "Cannot close event"}
        </button>
        <button
          className={buttonClass}
          disabled={!zumaEvents.canRefreshEvents}
          onClick={zumaEvents.refreshEvents}
        >
          {zumaEvents.canRefreshEvents
            ? "Refresh Events"
            : "Cannot refresh"}
        </button>
      </div>

      {/* Event Information Display */}
      <div className="col-span-full mx-20 px-4 pb-4 rounded-lg bg-white border-2 border-black">
        <p className={titleClass}>Event Information</p>
        {printProperty("Next Event ID", zumaEvents.nextEventId)}
        {printProperty("Selected Event ID", zumaEvents.selectedEventId)}
        {printProperty("Selected Event Data", zumaEvents.selectedEventData)}
        {printProperty("Accepted Count Handle", zumaEvents.acceptedCountHandle)}
        {printProperty(
          "Clear Accepted Count",
          zumaEvents.isCountDecrypted ? zumaEvents.clearAcceptedCount : "Not decrypted"
        )}
      </div>

      {/* Message Display */}
      <div className="col-span-full mx-20 p-4 rounded-lg bg-white border-2 border-black">
        {printProperty("Message", zumaEvents.message)}
      </div>
    </div>
  );
};

function printProperty(name: string, value: unknown) {
  let displayValue: string;

  if (typeof value === "boolean") {
    return printBooleanProperty(name, value);
  } else if (typeof value === "string" || typeof value === "number") {
    displayValue = String(value);
  } else if (typeof value === "bigint") {
    displayValue = String(value);
  } else if (value === null) {
    displayValue = "null";
  } else if (value === undefined) {
    displayValue = "undefined";
  } else if (value instanceof Error) {
    displayValue = value.message;
  } else {
    displayValue = JSON.stringify(value);
  }
  return (
    <p className="text-black">
      {name}:{" "}
      <span className="font-mono font-semibold text-black">{displayValue}</span>
    </p>
  );
}

function printBooleanProperty(name: string, value: boolean) {
  if (value) {
    return (
      <p className="text-black">
        {name}:{" "}
        <span className="font-mono font-semibold text-green-500">true</span>
      </p>
    );
  }

  return (
    <p className="text-black">
      {name}:{" "}
      <span className="font-mono font-semibold text-red-500">false</span>
    </p>
  );
}
