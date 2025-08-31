// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, ebool, euint64, externalEuint64 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title ZumaEvents - FHE based Event Management
/// @notice Event metadata is public, but conditions + acceptedCount + acceptance decisions are FHE-protected.
contract ZumaEvents is SepoliaConfig {
    struct EventData {
        // Public metadata
        string name;
        string description;
        string dateTime;
        string location;
        bool isOpen;
        address organizer;

        // Encrypted thresholds
        euint64 minAge;
        euint64 minSkill;

        // Encrypted accepted count
        euint64 acceptedCount;
    }

    uint256 public nextEventId;
    mapping(uint256 => EventData) public events;

    // Track acceptance (encrypted bools)
    mapping(uint256 => mapping(address => ebool)) private userAccepted;

    event EventCreated(uint256 indexed eventId, string name, string description);
    event AttendeeAccepted(uint256 indexed eventId, address attendee); // neutral event (doesn't reveal acceptance)

    modifier onlyOpen(uint256 eventId) {
        require(events[eventId].isOpen, "Event is closed");
        _;
    }

    /// @notice Organizer creates event
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
        e.organizer = msg.sender;

        // Store encrypted thresholds
        e.minAge = FHE.asEuint64(minAgePlain);
        e.minSkill = FHE.asEuint64(minSkillPlain);
        e.acceptedCount = FHE.asEuint64(0);

        // Allow contract to use these internally
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

        // Persist the encrypted decision so it can be decrypted later by allowed parties
        userAccepted[eventId][msg.sender] = accepted;
        // Ensure the contract can access the stored accepted handle later if needed
        FHE.allowThis(userAccepted[eventId][msg.sender]);

        // Update acceptedCount += (accepted ? 1 : 0) via encrypted select
        euint64 one = FHE.asEuint64(1);
        euint64 zero = FHE.asEuint64(0);
        euint64 addVal = FHE.select(accepted, one, zero);

        e.acceptedCount = FHE.add(e.acceptedCount, addVal);

        // Allow caller + organizer to decrypt the per-user acceptance and (optionally) the total
        FHE.allow(userAccepted[eventId][msg.sender], msg.sender);
        FHE.allow(userAccepted[eventId][msg.sender], e.organizer);

        // Allow access to the encrypted acceptedCount for the attendee and organizer
        FHE.allowThis(e.acceptedCount);
        FHE.allow(e.acceptedCount, msg.sender);
        FHE.allow(e.acceptedCount, e.organizer);

        emit AttendeeAccepted(eventId, msg.sender);
    }

    /// @notice Return encrypted accepted count (decrypt via Relayer SDK)
    function getAcceptedCount(uint256 eventId) external view returns (euint64) {
        return events[eventId].acceptedCount;
    }

    /// @notice Return encrypted acceptance decision for a user
    function getUserAccepted(uint256 eventId, address user) external view returns (ebool) {
        return userAccepted[eventId][user];
    }

    /// @notice Organizer can close event
    function closeEvent(uint256 eventId) external {
        require(msg.sender == events[eventId].organizer, "Only organizer can close");
        events[eventId].isOpen = false;
    }

    /// @notice Get all events created by an owner
    function getOwnerEvents(address owner) external view returns (EventData[] memory) {
        uint256 count;
        for (uint256 i = 0; i < nextEventId; i++) {
            if (events[i].organizer == owner) {
                count++;
            }
        }

        EventData[] memory result = new EventData[](count);
        uint256 idx;
        for (uint256 i = 0; i < nextEventId; i++) {
            if (events[i].organizer == owner) {
                result[idx++] = events[i];
            }
        }
        return result;
    }

    /// @notice Get all events
    function getAllEvents() external view returns (EventData[] memory) {
        EventData[] memory result = new EventData[](nextEventId);
        for (uint256 i = 0; i < nextEventId; i++) {
            result[i] = events[i];
        }
        return result;
    }
}
