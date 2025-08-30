// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, ebool, euint64, externalEuint64 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title ZumaEvents - FHE based Event Management
/// @notice Event metadata is stored in plaintext, conditions (age + skill) and acceptedCount are FHE-protected.
contract ZumaEvents is SepoliaConfig {
    struct EventData {
        // Public event metadata
        string name;
        string description;
        string dateTime;
        string location;
        bool isOpen;

        // Encrypted conditions
        euint64 minAge;
        euint64 minSkill;

        // Encrypted accepted count
        euint64 acceptedCount;
    }

    uint256 public nextEventId;
    mapping(uint256 => EventData) public events;

    event EventCreated(uint256 indexed eventId, string name, string description);
    event AttendeeAccepted(uint256 indexed eventId, address attendee);

    modifier onlyOpen(uint256 eventId) {
        require(events[eventId].isOpen, "Event is closed");
        _;
    }

    /// @notice Organizer creates an event with public metadata and encrypted condition thresholds.
    function createEvent(
        string calldata name,
        string calldata description,
        string calldata dateTime,
        string calldata location,
        uint64 minAgePlain,
        uint64 minSkillPlain
    ) external returns (uint256 eventId) {
        eventId = nextEventId++;
        EventData storage e = events[eventId];

        e.name = name;
        e.description = description;
        e.dateTime = dateTime;
        e.location = location;
        e.isOpen = true;

        // Store encrypted condition thresholds
        e.minAge = FHE.asEuint64(minAgePlain);
        e.minSkill = FHE.asEuint64(minSkillPlain);

        // Initialize acceptedCount
        e.acceptedCount = FHE.asEuint64(0);

        // Access control: allow organizer + this contract
        FHE.allowThis(e.minAge);
        FHE.allowThis(e.minSkill);
        FHE.allowThis(e.acceptedCount);

        emit EventCreated(eventId, name, description);
    }

    /// @notice Attendee submits encrypted age + skill, validated against event conditions.
    function attend(
        uint256 eventId,
        externalEuint64 ageCt,
        bytes calldata ageProof,
        externalEuint64 skillCt,
        bytes calldata skillProof
    ) external onlyOpen(eventId) {
        EventData storage e = events[eventId];

        // Bring external encrypted inputs into scope
        euint64 encAge = FHE.fromExternal(ageCt, ageProof);
        euint64 encSkill = FHE.fromExternal(skillCt, skillProof);

        // Check conditions
        ebool ageOK = FHE.gt(encAge, e.minAge);
        ebool skillOK = FHE.gt(encSkill, e.minSkill);
        ebool accepted = FHE.and(ageOK, skillOK);

        // Update acceptedCount += (accepted ? 1 : 0)
        euint64 one = FHE.asEuint64(1);
        euint64 zero = FHE.asEuint64(0);
        euint64 addVal = FHE.select(accepted, one, zero);

        e.acceptedCount = FHE.add(e.acceptedCount, addVal);

        // Allow caller + contract + organizer to decrypt acceptedCount
        FHE.allowThis(e.acceptedCount);
        FHE.allow(e.acceptedCount, msg.sender);
        FHE.allow(e.acceptedCount, tx.origin); // organizer (optional)

        emit AttendeeAccepted(eventId, msg.sender);
    }

    /// @notice Returns encrypted accepted count (frontend must decrypt via Relayer SDK)
    function getAcceptedCount(uint256 eventId) external view returns (euint64) {
        return events[eventId].acceptedCount;
    }

    /// @notice Organizer can close event
    function closeEvent(uint256 eventId) external {
        events[eventId].isOpen = false;
    }
}
