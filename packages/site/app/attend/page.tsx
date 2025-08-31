"use client";

import { useFhevm } from "../../fhevm/useFhevm";
import { useInMemoryStorage } from "../../hooks/useInMemoryStorage";
import { useMetaMaskEthersSigner } from "../../hooks/metamask/useMetaMaskEthersSigner";
import { useZumaEvents } from "../../hooks/useZumaEvents";
import { errorNotDeployed } from "../../components/ErrorNotDeployed";
import Link from "next/link";

export default function AttendEventPage() {
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
  } = useFhevm({
    provider,
    chainId,
    initialMockChains,
    enabled: true,
  });

  // useZumaEvents hook for event attendance
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

  const titleClass = "font-bold text-gray-900 text-2xl mb-6";
  const sectionClass = "glass-dark rounded-xl p-6 shadow-sm";

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-8">Attend Event</h1>
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

  const handleEventSelect = (eventId: number) => {
    zumaEvents.selectEvent(eventId);
  };

  return (
    <div className="min-h-screen">
      {/* Simple Back Button */}
      <div className="pt-6 px-4 sm:px-6 lg:px-8">
        <Link 
          href="/"
          className="inline-flex items-center text-blue-300 hover:text-blue-100 font-medium transition-colors"
        >
          ← Back to Home
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-white text-center mb-12">Available Events</h1>
        
        {/* Event Selection */}
        <div className="glass-dark rounded-xl p-6 shadow-sm mb-8">
          <h2 className="font-bold text-white text-2xl mb-6">Select Event to Attend</h2>
          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-2">
              Choose an event:
            </label>
            <select
              className={inputClass}
              value={zumaEvents.selectedEventId ?? ""}
              onChange={(e) => handleEventSelect(e.target.value ? parseInt(e.target.value) : 0)}
            >
              <option value="">Choose an event...</option>
              {Array.from({ length: Number(zumaEvents.nextEventId || 0) }, (_, i) => (
                <option key={i} value={i}>
                  Event #{i}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Event Details Display */}
        {zumaEvents.selectedEventData && (
          <div className="glass-dark rounded-xl p-6 shadow-sm mb-8">
            <h2 className="font-bold text-white text-2xl mb-6">Event Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-white text-lg mb-3">Event Information:</h3>
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
          </div>
        )}

        {/* Event Attendance Form */}
        <div className={sectionClass}>
          <h2 className={titleClass + " text-white"}>Event Attendance</h2>
          
          {/* FHE Information */}
          <div className="mb-6 p-4 bg-blue-500/20 border border-blue-400/30 rounded-lg">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-blue-300 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-blue-200">
                <p className="font-medium mb-1">Privacy-First Attendance</p>
                <p>Your age and skill level are encrypted using FHE. The event organizer never sees your actual values, only whether you meet the requirements.</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Event ID *
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
              <label className="block text-sm font-semibold text-white mb-2">
                Your Age *
              </label>
              <input
                type="number"
                className={inputClass}
                placeholder="25"
                value={zumaEvents.attendanceForm.age}
                onChange={(e) => zumaEvents.updateAttendanceForm("age", e.target.value)}
              />
              <p className="text-xs text-gray-300 mt-1">Must be greater than event minimum</p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Your Skill Level *
              </label>
              <input
                type="number"
                className={inputClass}
                placeholder="8"
                value={zumaEvents.attendanceForm.skill}
                onChange={(e) => zumaEvents.updateAttendanceForm("skill", e.target.value)}
              />
              <p className="text-xs text-gray-300 mt-1">Must be greater than event minimum</p>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              className={buttonClass + " text-lg px-12 py-4"}
              disabled={!zumaEvents.canAttend}
              onClick={zumaEvents.attendEvent}
            >
              {zumaEvents.canAttend
                ? "Attend Event"
                : zumaEvents.isAttending
                  ? "Submitting..."
                  : "Fill all required fields"}
            </button>
          </div>
        </div>

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
