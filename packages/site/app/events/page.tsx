"use client";

import { useFhevm } from "../../fhevm/useFhevm";
import { useInMemoryStorage } from "../../hooks/useInMemoryStorage";
import { useMetaMaskEthersSigner } from "../../hooks/metamask/useMetaMaskEthersSigner";
import { useZumaEvents } from "../../hooks/useZumaEvents";
import { errorNotDeployed } from "../../components/ErrorNotDeployed";
import Link from "next/link";

export default function EventsPage() {
  const { storage: fhevmDecryptionSignatureStorage } = useInMemoryStorage();
  const {
    provider,
    chainId,
    isConnected,
    connect,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
    initialMockChains,
  } = useMetaMaskEthersSigner();

  // FHEVM instance
  const {
    instance: fhevmInstance,
    status: fhevmStatus,
    error: fhevmError,
  } = useFhevm({
    provider,
    chainId,
    initialMockChains,
    enabled: true,
  });

  // useZumaEvents hook for event management
  const zumaEvents = useZumaEvents({
    instance: fhevmInstance,
    fhevmDecryptionSignatureStorage,
    eip1193Provider: provider,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
  });

  // Styling classes
  const buttonClass =
    "inline-flex items-center justify-center rounded-xl bg-black px-6 py-4 font-semibold text-white shadow-sm " +
    "transition-colors duration-200 hover:bg-blue-700 active:bg-blue-800 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 " +
    "disabled:opacity-50 disabled:pointer-events-none";

  const inputClass =
    "w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors";

  const titleClass = "font-bold text-white text-2xl mb-6";
  const sectionClass = "glass-dark rounded-xl p-6 shadow-sm";

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-8">Your Events</h1>
          <button
            className={buttonClass + " text-xl px-8 py-6"}
            onClick={connect}
          >
            Connect to MetaMask
          </button>
        </div>
      </div>
    );
  }

  if (zumaEvents.isDeployed === false) {
    return errorNotDeployed(chainId);
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="glass-dark border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-6">
            <h1 className="text-3xl font-bold text-white">Your Events</h1>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="glass-dark border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white text-sm">
                  Home
                </Link>
              </li>
              <li className="flex items-center">
                <svg className="h-4 w-4 text-gray-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-white text-sm font-medium">Your Events</span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Event Management Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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
          <Link href="/attend">
            <button className={buttonClass + " w-full"}>
              Attend Event
            </button>
          </Link>
        </div>

        {/* Event Information Display */}
        <div className={sectionClass + " mb-8"}>
          <h2 className={titleClass}>Event Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-white mb-2"><span className="font-medium">Next Event ID:</span> {zumaEvents.nextEventId?.toString() || '0'}</p>
              <p className="text-white mb-2"><span className="font-medium">Selected Event ID:</span> {zumaEvents.selectedEventId || 'None'}</p>
            </div>
            <div>
              <p className="text-white mb-2"><span className="font-medium">Accepted Count Handle:</span> {zumaEvents.acceptedCountHandle || 'Not available'}</p>
              <p className="text-white mb-2"><span className="font-medium">Clear Accepted Count:</span> {zumaEvents.isCountDecrypted ? zumaEvents.clearAcceptedCount?.clear?.toString() || '0' : 'Not decrypted'}</p>
            </div>
          </div>
        </div>

        {/* All Events Display */}
        <div className={sectionClass}>
          <h2 className={titleClass}>All Events</h2>
          <div className="mb-6">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white/10 rounded-lg border border-white/20">
              <div>
                <h3 className="font-semibold text-white text-lg mb-3">Event Details:</h3>
                <div className="space-y-2 text-gray-200">
                  <p><span className="font-medium">Name:</span> {zumaEvents.selectedEventData.name}</p>
                  <p><span className="font-medium">Description:</span> {zumaEvents.selectedEventData.description}</p>
                  <p><span className="font-medium">Date & Time:</span> {zumaEvents.selectedEventData.dateTime}</p>
                  <p><span className="font-medium">Location:</span> {zumaEvents.selectedEventData.location}</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg mb-3">Requirements & Status:</h3>
                <div className="space-y-2 text-gray-200">
                  <p><span className="font-medium">Minimum Age:</span> {zumaEvents.selectedEventData.minAge}</p>
                  <p><span className="font-medium">Minimum Skill:</span> {zumaEvents.selectedEventData.minSkill}</p>
                  <p><span className="font-medium">Status:</span> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                      zumaEvents.selectedEventData.isOpen 
                        ? 'bg-green-500/30 text-green-300 border border-green-400/30' 
                        : 'bg-red-500/30 text-red-300 border border-red-400/30'
                    }`}>
                      {zumaEvents.selectedEventData.isOpen ? 'Open' : 'Closed'}
                    </span>
                  </p>
                  <p><span className="font-medium">Accepted Count:</span> {zumaEvents.selectedEventData.acceptedCount}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Event Registration Confirmation */}
        {zumaEvents.lastCreatedEvent && (
          <div className="mt-8 bg-green-500/20 border-2 border-green-400/30 rounded-xl p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-green-300">
                  Event &ldquo;{zumaEvents.lastCreatedEvent.name}&rdquo; has been successfully registered!
                </h3>
                <div className="mt-2 text-sm text-green-200">
                  <p><strong>Event ID:</strong> {zumaEvents.lastCreatedEvent.id}</p>
                  <p><strong>Requirements:</strong> Age &gt; {zumaEvents.lastCreatedEvent.minAge}, Skill &gt; {zumaEvents.lastCreatedEvent.minSkill}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Result Confirmation */}
        {zumaEvents.lastAttendanceResult && (
          <div className={`mt-8 rounded-xl p-6 ${
            zumaEvents.lastAttendanceResult.accepted 
              ? 'bg-green-500/20 border-2 border-green-400/30' 
              : 'bg-yellow-500/20 border-2 border-yellow-400/30'
          }`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {zumaEvents.lastAttendanceResult.accepted ? (
                  <svg className="h-8 w-8 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-8 w-8 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-4">
                <h3 className={`text-lg font-semibold ${
                  zumaEvents.lastAttendanceResult.accepted 
                    ? 'text-green-300' 
                    : 'text-yellow-300'
                }`}>
                  {zumaEvents.lastAttendanceResult.accepted 
                    ? 'Attendance Accepted!' 
                    : 'Attendance Not Accepted'}
                </h3>
                <div className="mt-2 text-sm text-gray-200">
                  {zumaEvents.lastAttendanceResult.accepted 
                    ? `You have been successfully registered for Event #${zumaEvents.lastAttendanceResult.eventId}`
                    : `Your age (${zumaEvents.lastAttendanceResult.age}) or skill (${zumaEvents.lastAttendanceResult.skill}) does not meet the event requirements (must be greater than minimum).`
                  }
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Information */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={sectionClass}>
            <h3 className="font-semibold text-white text-lg mb-4">Contract Status</h3>
            <div className="space-y-2 text-sm text-gray-200">
              <p><span className="font-medium">Contract:</span> {zumaEvents.contractAddress ? `${zumaEvents.contractAddress.slice(0, 6)}...${zumaEvents.contractAddress.slice(-4)}` : 'Not deployed'}</p>
              <p><span className="font-medium">Chain ID:</span> {chainId || 'Unknown'}</p>
              <p><span className="font-medium">Connected:</span> {isConnected ? 'Yes' : 'No'}</p>
            </div>
          </div>

          <div className={sectionClass}>
            <h3 className="font-semibold text-white text-lg mb-4">FHEVM Status</h3>
            <div className="space-y-2 text-sm text-gray-200">
              <p><span className="font-medium">Instance:</span> {fhevmInstance ? 'Ready' : 'Not ready'}</p>
              <p><span className="font-medium">Status:</span> {fhevmStatus}</p>
              <p><span className="font-medium">Error:</span> {fhevmError ? (fhevmError instanceof Error ? fhevmError.message : String(fhevmError)) : 'None'}</p>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {zumaEvents.message && (
          <div className="mt-8 bg-blue-500/20 border-2 border-blue-400/30 rounded-xl p-4">
            <p className="text-blue-200 text-center font-medium">{zumaEvents.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
