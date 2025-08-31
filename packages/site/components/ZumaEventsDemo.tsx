"use client";

import { useFhevm } from "../fhevm/useFhevm";
import { useInMemoryStorage } from "../hooks/useInMemoryStorage";
import { useMetaMaskEthersSigner } from "../hooks/metamask/useMetaMaskEthersSigner";
import { useZumaEvents } from "@/hooks/useZumaEvents";
import { errorNotDeployed } from "./ErrorNotDeployed";
import Link from "next/link";

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
      <div className="col-span-full mx-20 glass-dark text-white rounded-xl">
        <div className="flex justify-between items-center m-5">
          <p className="font-semibold text-3xl">
            Zuma Events - FHE Event Management -{" "}
            <span className="font-mono font-normal text-gray-300">
              ZumaEvents.sol (Updated)
            </span>
          </p>
          <div className="flex space-x-4">
            <Link 
              href="/"
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Dashboard
            </Link>
            <Link 
              href="/create"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              + Create Event
            </Link>
          </div>
        </div>
      </div>

      <div className="col-span-full mx-20 mt-4 px-5 pb-4 rounded-lg glass-dark border border-white/20">
        <p className={titleClass + " text-white"}>Chain Infos</p>
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
          <div className="rounded-lg glass-dark border border-white/20 pb-4 px-4">
            <p className={titleClass + " text-white"}>FHEVM instance</p>
            {printProperty(
              "Fhevm Instance",
              fhevmInstance ? "OK" : "undefined"
            )}
            {printProperty("Fhevm Status", fhevmStatus)}
            {printProperty("Fhevm Error", fhevmError ?? "No Error")}
          </div>
          <div className="rounded-lg glass-dark border border-white/20 pb-4 px-4">
            <p className={titleClass + " text-white"}>Status</p>
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
      <div className="col-span-full mx-20 px-4 pb-4 rounded-lg glass-dark border border-white/20">
        <p className={titleClass + " text-white"}>Create New Event</p>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-white mb-1">
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
            <label className="block text-sm font-medium text-white mb-1">
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
            <label className="block text-sm font-medium text-white mb-1">
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
            <label className="block text-sm font-medium text-white mb-1">
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
            <label className="block text-sm font-medium text-white mb-1">
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
            <label className="block text-sm font-medium text-white mb-1">
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
      <div className="col-span-full mx-20 px-4 pb-4 rounded-lg glass-dark border border-white/20">
        <p className={titleClass + " text-white"}>Attend Event</p>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-white mb-1">
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
            <label className="block text-sm font-medium text-white mb-1">
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
            <label className="block text-sm font-medium text-white mb-1">
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
      <div className="col-span-full mx-20 px-4 pb-4 rounded-lg glass-dark border border-white/20">
        <p className={titleClass + " text-white"}>Event Information</p>
        {printProperty("Next Event ID", zumaEvents.nextEventId)}
        {printProperty("Selected Event ID", zumaEvents.selectedEventId)}
        {printProperty("Accepted Count Handle", zumaEvents.acceptedCountHandle)}
        {printProperty(
          "Clear Accepted Count",
          zumaEvents.isCountDecrypted ? zumaEvents.clearAcceptedCount : "Not decrypted"
        )}
      </div>

      {/* All Events Display */}
      <div className="col-span-full mx-20 px-4 pb-4 rounded-lg glass-dark border border-white/20">
        <p className={titleClass + " text-white"}>All Events</p>
        <div className="mb-4">
          <label className="block text-sm font-medium text-white mb-2">
            Select Event to View Details:
          </label>
          <select
            className={inputClass}
            value={zumaEvents.selectedEventId ?? ""}
            onChange={(e) => zumaEvents.selectEvent(e.target.value ? parseInt(e.target.value) : 0)}
          >
            <option value="">Choose an event...</option>
            {Array.from({ length: Number(zumaEvents.nextEventId || 0) }, (_, i) => (
              <option key={i} value={i}>
                Event #{i}
              </option>
            ))}
          </select>
        </div>
        
        {zumaEvents.selectedEventData && (
                      <div className="grid grid-cols-2 gap-4 p-4 bg-white/10 rounded-lg border border-white/20">
            <div>
              <p className="font-semibold text-white">Event Details:</p>
              <p className="text-gray-200"><span className="font-medium">Name:</span> {zumaEvents.selectedEventData.name}</p>
              <p className="text-gray-200"><span className="font-medium">Description:</span> {zumaEvents.selectedEventData.description}</p>
              <p className="text-gray-200"><span className="font-medium">Date & Time:</span> {zumaEvents.selectedEventData.dateTime}</p>
              <p className="text-gray-200"><span className="font-medium">Location:</span> {zumaEvents.selectedEventData.location}</p>
            </div>
            <div>
              <p className="font-semibold text-white">Requirements & Status:</p>
              <p className="text-gray-200"><span className="font-medium">Minimum Age:</span> {zumaEvents.selectedEventData.minAge}</p>
              <p className="text-gray-200"><span className="font-medium">Minimum Skill:</span> {zumaEvents.selectedEventData.minSkill}</p>
              <p className="text-gray-200"><span className="font-medium">Status:</span> 
                <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                  zumaEvents.selectedEventData.isOpen 
                    ? 'bg-green-500/30 text-green-300 border border-green-400/30' 
                    : 'bg-red-500/30 text-red-300 border border-red-400/30'
                }`}>
                  {zumaEvents.selectedEventData.isOpen ? 'Open' : 'Closed'}
                </span>
              </p>
              <p className="text-gray-200"><span className="font-medium">Accepted Count:</span> {zumaEvents.selectedEventData.acceptedCount}</p>
            </div>
          </div>
        )}
      </div>

      {/* Event Registration Confirmation */}
      {zumaEvents.lastCreatedEvent && (
        <div className="col-span-full mx-20 px-4 py-3 rounded-lg bg-green-500/20 border-2 border-green-400/30">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
                             <p className="text-sm font-medium text-green-800">
                 Event &quot;{zumaEvents.lastCreatedEvent.name}&quot; has been successfully registered!
               </p>
              <p className="text-sm text-green-700 mt-1">
                Event ID: {zumaEvents.lastCreatedEvent.id} | Requirements: Age &gt; {zumaEvents.lastCreatedEvent.minAge}, Skill &gt; {zumaEvents.lastCreatedEvent.minSkill}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Result Confirmation */}
      {zumaEvents.lastAttendanceResult && (
        <div className={`col-span-full mx-20 px-4 py-3 rounded-lg border-2 ${
          zumaEvents.lastAttendanceResult.accepted 
            ? 'bg-green-500/20 border-green-400/30' 
            : 'bg-yellow-500/20 border-yellow-400/30'
        }`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {zumaEvents.lastAttendanceResult.accepted ? (
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${
                zumaEvents.lastAttendanceResult.accepted 
                  ? 'text-green-300' 
                  : 'text-yellow-300'
              }`}>
                {zumaEvents.lastAttendanceResult.accepted 
                  ? 'Attendance Accepted!' 
                  : 'Attendance Not Accepted'}
              </p>
              <p className={`text-sm mt-1 ${
                zumaEvents.lastAttendanceResult.accepted 
                  ? 'text-green-200' 
                  : 'text-yellow-200'
              }`}>
                {zumaEvents.lastAttendanceResult.accepted 
                  ? `You have been successfully registered for Event #${zumaEvents.lastAttendanceResult.eventId}`
                  : `Your age (${zumaEvents.lastAttendanceResult.age}) or skill (${zumaEvents.lastAttendanceResult.skill}) does not meet the event requirements (must be greater than minimum).`
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Message Display */}
      <div className="col-span-full mx-20 p-4 rounded-lg glass-dark border border-white/20">
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
    // Handle BigInt and other complex types safely
    try {
      displayValue = JSON.stringify(value, (key, val) => {
        if (typeof val === "bigint") {
          return val.toString();
        }
        return val;
      });
    } catch {
      // Fallback for objects that can't be serialized
      displayValue = String(value);
    }
  }
  return (
    <p className="text-white">
      {name}:{" "}
      <span className="font-mono font-semibold text-white">{displayValue}</span>
    </p>
  );
}

function printBooleanProperty(name: string, value: boolean) {
  if (value) {
    return (
      <p className="text-white">
        {name}:{" "}
        <span className="font-mono font-semibold text-green-400">true</span>
      </p>
    );
  }

  return (
    <p className="text-black">
      {name}:{" "}
              <span className="font-semibold text-red-400">false</span>
    </p>
  );
}
