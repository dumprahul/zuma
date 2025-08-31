"use client";

import { useFhevm } from "../../fhevm/useFhevm";
import { useInMemoryStorage } from "../../hooks/useInMemoryStorage";
import { useMetaMaskEthersSigner } from "../../hooks/metamask/useMetaMaskEthersSigner";
import { useZumaEvents } from "../../hooks/useZumaEvents";
import { errorNotDeployed } from "../../components/ErrorNotDeployed";
import Link from "next/link";
import { useEffect } from "react";

export default function CreateEventPage() {
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

  // useZumaEvents hook for event creation
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

  // Console logging for debugging instead of UI boxes
  useEffect(() => {
    console.log("=== CONTRACT STATUS ===");
    console.log("Contract:", zumaEvents.contractAddress ? `${zumaEvents.contractAddress.slice(0, 6)}...${zumaEvents.contractAddress.slice(-4)}` : 'Not deployed');
    console.log("Chain ID:", chainId || 'Unknown');
    console.log("Connected:", isConnected ? 'Yes' : 'No');
    
    console.log("=== FHEVM STATUS ===");
    console.log("Instance:", fhevmInstance ? 'Ready' : 'Not ready');
    console.log("Status:", fhevmStatus);
    console.log("Error:", fhevmError ? (fhevmError instanceof Error ? fhevmError.message : String(fhevmError)) : 'None');
  }, [zumaEvents.contractAddress, chainId, isConnected, fhevmInstance, fhevmStatus, fhevmError]);

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-8">Create New Event</h1>
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
        {/* Event Creation Form */}
        <div className={sectionClass}>
          <h2 className={titleClass}>Event Details</h2>
          
          {/* FHE Information */}
          <div className="mb-6 p-4 bg-blue-500/20 border border-blue-400/30 rounded-lg">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-blue-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-white">
                <p className="font-medium mb-1">FHE-Powered Privacy Protection</p>
                <p>Age and skill requirements are encrypted using Fully Homomorphic Encryption. Attendees&apos; personal data remains private while still allowing verification against your criteria.</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Event Name *
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
              <label className="block text-sm font-semibold text-white mb-2">
                Description *
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
              <label className="block text-sm font-semibold text-white mb-2">
                Date & Time *
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
              <label className="block text-sm font-semibold text-white mb-2">
                Location *
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
              <label className="block text-sm font-semibold text-white mb-2">
                Minimum Age *
              </label>
              <input
                type="number"
                className={inputClass}
                placeholder="18"
                value={zumaEvents.eventForm.minAge}
                onChange={(e) => zumaEvents.updateEventForm("minAge", e.target.value)}
              />
              <p className="text-xs text-white mt-1">Attendees must be older than this age</p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Minimum Skill Level *
              </label>
              <input
                type="number"
                className={inputClass}
                placeholder="5"
                value={zumaEvents.eventForm.minSkill}
                onChange={(e) => zumaEvents.updateEventForm("minSkill", e.target.value)}
              />
              <p className="text-xs text-white mt-1">Attendees must have skill level higher than this</p>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              className={buttonClass + " text-lg px-12 py-4"}
              disabled={!zumaEvents.canCreateEvent}
              onClick={zumaEvents.createEvent}
            >
              {zumaEvents.canCreateEvent
                ? "Create Event"
                : zumaEvents.isCreatingEvent
                  ? "Creating Event..."
                  : "Fill all required fields"}
            </button>
          </div>
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
                  Event &ldquo;{String(zumaEvents.lastCreatedEvent?.name || '')}&rdquo; Created Successfully!
                </h3>
                <div className="mt-2 text-sm text-green-200">
                  <p><strong>Event ID:</strong> {String(zumaEvents.lastCreatedEvent?.id || '')}</p>
                  <p><strong>Requirements:</strong> Age &gt; {String(zumaEvents.lastCreatedEvent?.minAge || '')}, Skill &gt; {String(zumaEvents.lastCreatedEvent?.minSkill || '')}</p>
                </div>
                <div className="mt-4">
                  <Link 
                    href="/"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-300 bg-green-500/30 hover:bg-green-500/50 transition-colors"
                  >
                    View All Events
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Message Display */}
        {zumaEvents.message && (
          <div className="mt-8 bg-blue-500/20 border-2 border-blue-400/30 rounded-xl p-4">
            <p className="text-blue-200 text-center font-medium">{String(zumaEvents.message || '')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
