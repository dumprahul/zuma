import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { ZumaEvents, ZumaEvents__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  organizer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
  charlie: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("ZumaEvents")) as ZumaEvents__factory;
  const zumaEventsContract = (await factory.deploy()) as ZumaEvents;
  const zumaEventsContractAddress = await zumaEventsContract.getAddress();

  return { zumaEventsContract, zumaEventsContractAddress };
}

describe("ZumaEvents", function () {
  let signers: Signers;
  let zumaEventsContract: ZumaEvents;
  let zumaEventsContractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { 
      deployer: ethSigners[0], 
      organizer: ethSigners[1], 
      alice: ethSigners[2], 
      bob: ethSigners[3], 
      charlie: ethSigners[4] 
    };
  });

  beforeEach(async function () {
    // Check whether the tests are running against an FHEVM mock environment
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    ({ zumaEventsContract, zumaEventsContractAddress } = await deployFixture());
  });

  it("should initialize with correct state after deployment", async function () {
    const nextEventId = await zumaEventsContract.nextEventId();
    expect(nextEventId).to.eq(0);
  });

  it("should create an event with encrypted thresholds", async function () {
    const eventName = "Tech Conference 2024";
    const eventDescription = "Annual technology conference";
    const eventDateTime = "2024-12-25 09:00:00";
    const eventLocation = "San Francisco, CA";
    const minAge = 18;
    const minSkill = 5;

    const tx = await zumaEventsContract
      .connect(signers.organizer)
      .createEvent(
        eventName,
        eventDescription,
        eventDateTime,
        eventLocation,
        minAge,
        minSkill
      );
    
    const receipt = await tx.wait();
    expect(receipt?.status).to.eq(1);

    const nextEventId = await zumaEventsContract.nextEventId();
    expect(nextEventId).to.eq(1);

    const eventData = await zumaEventsContract.events(0);
    expect(eventData.name).to.eq(eventName);
    expect(eventData.description).to.eq(eventDescription);
    expect(eventData.dateTime).to.eq(eventDateTime);
    expect(eventData.location).to.eq(eventLocation);
    expect(eventData.isOpen).to.eq(true);
    expect(eventData.organizer).to.eq(signers.organizer.address);
  });

  it("should allow attendee with sufficient age and skill to attend", async function () {
    // First create an event
    await zumaEventsContract
      .connect(signers.organizer)
      .createEvent(
        "Test Event",
        "Test Description",
        "2024-12-25 09:00:00",
        "Test Location",
        18, // minAge
        5   // minSkill
      );

    const eventId = 0;

    // Alice's encrypted age (25) and skill (8)
    const aliceAge = 25;
    const aliceSkill = 8;

    // Encrypt Alice's age
    const encryptedAliceAge = await fhevm
      .createEncryptedInput(zumaEventsContractAddress, signers.alice.address)
      .add64(aliceAge)
      .encrypt();

    // Encrypt Alice's skill
    const encryptedAliceSkill = await fhevm
      .createEncryptedInput(zumaEventsContractAddress, signers.alice.address)
      .add64(aliceSkill)
      .encrypt();

    // Alice attends the event
    const tx = await zumaEventsContract
      .connect(signers.alice)
      .attend(
        eventId,
        encryptedAliceAge.handles[0],
        encryptedAliceAge.inputProof,
        encryptedAliceSkill.handles[0],
        encryptedAliceSkill.inputProof
      );

    const receipt = await tx.wait();
    expect(receipt?.status).to.eq(1);

    // Get the encrypted accepted count
    const encryptedAcceptedCount = await zumaEventsContract.getAcceptedCount(eventId);
    
    // Decrypt the accepted count (should be 1 since Alice meets requirements)
    // Now Alice should be able to decrypt since FHE.allow was called for her
    const clearAcceptedCount = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      encryptedAcceptedCount,
      zumaEventsContractAddress,
      signers.alice,
    );

    expect(clearAcceptedCount).to.eq(1);
  });

  it("should reject attendee with insufficient age", async function () {
    // Create an event with age requirement 18
    await zumaEventsContract
      .connect(signers.organizer)
      .createEvent(
        "Age Restricted Event",
        "Event for adults only",
        "2024-12-25 09:00:00",
        "Test Location",
        18, // minAge
        1   // minSkill
      );

    const eventId = 0;

    // Bob's encrypted age (16) and skill (5)
    const bobAge = 16;
    const bobSkill = 5;

    // Encrypt Bob's age
    const encryptedBobAge = await fhevm
      .createEncryptedInput(zumaEventsContractAddress, signers.bob.address)
      .add64(bobAge)
      .encrypt();

    // Encrypt Bob's skill
    const encryptedBobSkill = await fhevm
      .createEncryptedInput(zumaEventsContractAddress, signers.bob.address)
      .add64(bobSkill)
      .encrypt();

    // Bob attends the event
    const tx = await zumaEventsContract
      .connect(signers.bob)
      .attend(
        eventId,
        encryptedBobAge.handles[0],
        encryptedBobAge.inputProof,
        encryptedBobSkill.handles[0],
        encryptedBobSkill.inputProof
      );

    const receipt = await tx.wait();
    expect(receipt?.status).to.eq(1);

    // Get the encrypted accepted count
    const encryptedAcceptedCount = await zumaEventsContract.getAcceptedCount(eventId);
    
    // Decrypt the accepted count (should be 0 since Bob doesn't meet age requirement)
    // Now Bob should be able to decrypt since FHE.allow was called for him
    const clearAcceptedCount = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      encryptedAcceptedCount,
      zumaEventsContractAddress,
      signers.bob,
    );

    expect(clearAcceptedCount).to.eq(0);
  });

  it("should reject attendee with insufficient skill", async function () {
    // Create an event with skill requirement 7
    await zumaEventsContract
      .connect(signers.organizer)
      .createEvent(
        "High Skill Event",
        "Event for skilled participants",
        "2024-12-25 09:00:00",
        "Test Location",
        18, // minAge
        7   // minSkill
      );

    const eventId = 0;

    // Charlie's encrypted age (25) and skill (4)
    const charlieAge = 25;
    const charlieSkill = 4;

    // Encrypt Charlie's age
    const encryptedCharlieAge = await fhevm
      .createEncryptedInput(zumaEventsContractAddress, signers.charlie.address)
      .add64(charlieAge)
      .encrypt();

    // Encrypt Charlie's skill
    const encryptedCharlieSkill = await fhevm
      .createEncryptedInput(zumaEventsContractAddress, signers.charlie.address)
      .add64(charlieSkill)
      .encrypt();

    // Charlie attends the event
    const tx = await zumaEventsContract
      .connect(signers.charlie)
      .attend(
        eventId,
        encryptedCharlieAge.handles[0],
        encryptedCharlieAge.inputProof,
        encryptedCharlieSkill.handles[0],
        encryptedCharlieSkill.inputProof
      );

    const receipt = await tx.wait();
    expect(receipt?.status).to.eq(1);

    // Get the encrypted accepted count
    const encryptedAcceptedCount = await zumaEventsContract.getAcceptedCount(eventId);
    
    // Decrypt the accepted count (should be 0 since Charlie doesn't meet skill requirement)
    // Now Charlie should be able to decrypt since FHE.allow was called for him
    const clearAcceptedCount = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      encryptedAcceptedCount,
      zumaEventsContractAddress,
      signers.charlie,
    );

    expect(clearAcceptedCount).to.eq(0);
  });

//   it("should allow multiple attendees and count correctly", async function () {
//     // Create an event
//     await zumaEventsContract
//       .connect(signers.organizer)
//       .createEvent(
//         "Multi Attendee Event",
//         "Event for multiple attendees",
//         "2024-12-25 09:00:00",
//         "Test Location",
//         18, // minAge
//         3   // minSkill
//       );

//     const eventId = 0;

//     // Alice attends (age: 25, skill: 8) - should be accepted
//     const aliceAge = 25;
//     const aliceSkill = 8;
//     const encryptedAliceAge = await fhevm
//       .createEncryptedInput(zumaEventsContractAddress, signers.alice.address)
//       .add64(aliceAge)
//       .encrypt();
//     const encryptedAliceSkill = await fhevm
//       .createEncryptedInput(zumaEventsContractAddress, signers.alice.address)
//       .add64(aliceSkill)
//       .encrypt();

//     await zumaEventsContract
//       .connect(signers.alice)
//       .attend(
//         eventId,
//         encryptedAliceAge.handles[0],
//         encryptedAliceAge.inputProof,
//         encryptedAliceSkill.handles[0],
//         encryptedAliceSkill.inputProof
//       );

//     // Bob attends (age: 22, skill: 6) - should be accepted
//     const bobAge = 22;
//     const bobSkill = 6;
//     const encryptedBobAge = await fhevm
//       .createEncryptedInput(zumaEventsContractAddress, signers.bob.address)
//       .add64(bobAge)
//       .encrypt();
//     const encryptedBobSkill = await fhevm
//       .createEncryptedInput(zumaEventsContractAddress, signers.bob.address)
//       .add64(bobSkill)
//       .encrypt();

//     await zumaEventsContract
//       .connect(signers.bob)
//       .attend(
//         eventId,
//         encryptedBobAge.handles[0],
//         encryptedBobAge.inputProof,
//         encryptedBobSkill.handles[0],
//         encryptedBobSkill.inputProof
//       );

//     // Charlie attends (age: 19, skill: 2) - should be rejected
//     const charlieAge = 19;
//     const charlieSkill = 2;
//     const encryptedCharlieAge = await fhevm
//       .createEncryptedInput(zumaEventsContractAddress, signers.charlie.address)
//       .add64(charlieAge)
//       .encrypt();
//     const encryptedCharlieSkill = await fhevm
//       .createEncryptedInput(zumaEventsContractAddress, signers.charlie.address)
//       .add64(charlieSkill)
//       .encrypt();

//     await zumaEventsContract
//       .connect(signers.charlie)
//       .attend(
//         eventId,
//         encryptedCharlieAge.handles[0],
//         encryptedCharlieAge.inputProof,
//         encryptedCharlieSkill.handles[0],
//         encryptedCharlieSkill.inputProof
//       );

//     // Get the encrypted accepted count
//     const encryptedAcceptedCount = await zumaEventsContract.getAcceptedCount(eventId);
    
//     // Decrypt the accepted count (should be 2 since only Alice and Bob meet requirements)
//     // Use the deployer for decryption since they have contract access
//     const clearAcceptedCount = await fhevm.userDecryptEuint(
//       FhevmType.euint64,
//       encryptedAcceptedCount,
//       zumaEventsContractAddress,
//       signers.deployer,
//     );

//     expect(clearAcceptedCount).to.eq(2);
//   });

  it("should allow organizer to close event", async function () {
    // Create an event
    await zumaEventsContract
      .connect(signers.organizer)
      .createEvent(
        "Closable Event",
        "Event that can be closed",
        "2024-12-25 09:00:00",
        "Test Location",
        18, // minAge
        1   // minSkill
      );

    const eventId = 0;

    // Verify event is open
    let eventData = await zumaEventsContract.events(eventId);
    expect(eventData.isOpen).to.eq(true);

    // Close the event
    const tx = await zumaEventsContract
      .connect(signers.organizer)
      .closeEvent(eventId);

    const receipt = await tx.wait();
    expect(receipt?.status).to.eq(1);

    // Verify event is closed
    eventData = await zumaEventsContract.events(eventId);
    expect(eventData.isOpen).to.eq(false);
  });

  it("should prevent non-organizer from closing event", async function () {
    // Create an event
    await zumaEventsContract
      .connect(signers.organizer)
      .createEvent(
        "Protected Event",
        "Event that only organizer can close",
        "2024-12-25 09:00:00",
        "Test Location",
        18, // minAge
        1   // minSkill
      );

    const eventId = 0;

    // Try to close event with different signer (should fail)
    await expect(
      zumaEventsContract
        .connect(signers.alice)
        .closeEvent(eventId)
    ).to.be.revertedWith("Only organizer can close");

    // Verify event is still open
    const eventData = await zumaEventsContract.events(eventId);
    expect(eventData.isOpen).to.eq(true);
  });

  it("should prevent attendance to closed events", async function () {
    // Create and close an event
    await zumaEventsContract
      .connect(signers.organizer)
      .createEvent(
        "Closed Event",
        "Event that is closed",
        "2024-12-25 09:00:00",
        "Test Location",
        18, // minAge
        1   // minSkill
      );

    const eventId = 0;
    await zumaEventsContract
      .connect(signers.organizer)
      .closeEvent(eventId);

    // Try to attend closed event
    const aliceAge = 25;
    const aliceSkill = 8;
    const encryptedAliceAge = await fhevm
      .createEncryptedInput(zumaEventsContractAddress, signers.alice.address)
      .add64(aliceAge)
      .encrypt();
    const encryptedAliceSkill = await fhevm
      .createEncryptedInput(zumaEventsContractAddress, signers.alice.address)
      .add64(aliceSkill)
      .encrypt();

    // This should revert due to the onlyOpen modifier
    await expect(
      zumaEventsContract
        .connect(signers.alice)
        .attend(
          eventId,
          encryptedAliceAge.handles[0],
          encryptedAliceAge.inputProof,
          encryptedAliceSkill.handles[0],
          encryptedAliceSkill.inputProof
        )
    ).to.be.revertedWith("Event is closed");
  });

  it("should track user acceptance status", async function () {
    // Create an event
    await zumaEventsContract
      .connect(signers.organizer)
      .createEvent(
        "Acceptance Test Event",
        "Event to test user acceptance tracking",
        "2024-12-25 09:00:00",
        "Test Location",
        18, // minAge
        5   // minSkill
      );

    const eventId = 0;

    // Alice attends with sufficient age and skill (should be accepted)
    const aliceAge = 25;
    const aliceSkill = 8;
    const encryptedAliceAge = await fhevm
      .createEncryptedInput(zumaEventsContractAddress, signers.alice.address)
      .add64(aliceAge)
      .encrypt();
    const encryptedAliceSkill = await fhevm
      .createEncryptedInput(zumaEventsContractAddress, signers.alice.address)
      .add64(aliceSkill)
      .encrypt();

    await zumaEventsContract
      .connect(signers.alice)
      .attend(
        eventId,
        encryptedAliceAge.handles[0],
        encryptedAliceAge.inputProof,
        encryptedAliceSkill.handles[0],
        encryptedAliceSkill.inputProof
      );

    // Get Alice's acceptance status
    const aliceAccepted = await zumaEventsContract.getUserAccepted(eventId, signers.alice.address);
    
    // Decrypt the acceptance status
    // Now Alice should be able to decrypt since FHE.allow was called for her
    const clearAliceAccepted = await fhevm.userDecryptEbool(
      aliceAccepted,
      zumaEventsContractAddress,
      signers.alice,
    );

    expect(clearAliceAccepted).to.eq(true);
  });

  it("should get all events", async function () {
    // Create multiple events
    await zumaEventsContract
      .connect(signers.organizer)
      .createEvent(
        "Event 1",
        "First event",
        "2024-12-25 09:00:00",
        "Location 1",
        18, // minAge
        1   // minSkill
      );

    await zumaEventsContract
      .connect(signers.organizer)
      .createEvent(
        "Event 2",
        "Second event",
        "2024-12-26 09:00:00",
        "Location 2",
        21, // minAge
        3   // minSkill
      );

    // Get all events
    const allEvents = await zumaEventsContract.getAllEvents();
    expect(allEvents.length).to.eq(2);
    expect(allEvents[0].name).to.eq("Event 1");
    expect(allEvents[1].name).to.eq("Event 2");
  });

  it("should get owner events", async function () {
    // Create events with different organizers
    await zumaEventsContract
      .connect(signers.organizer)
      .createEvent(
        "Organizer Event",
        "Event by organizer",
        "2024-12-25 09:00:00",
        "Test Location",
        18, // minAge
        1   // minSkill
      );

    await zumaEventsContract
      .connect(signers.alice)
      .createEvent(
        "Alice Event",
        "Event by Alice",
        "2024-12-26 09:00:00",
        "Test Location",
        18, // minAge
        1   // minSkill
      );

    // Get organizer's events
    const organizerEvents = await zumaEventsContract.getOwnerEvents(signers.organizer.address);
    expect(organizerEvents.length).to.eq(1);
    expect(organizerEvents[0].name).to.eq("Organizer Event");

    // Get Alice's events
    const aliceEvents = await zumaEventsContract.getOwnerEvents(signers.alice.address);
    expect(aliceEvents.length).to.eq(1);
    expect(aliceEvents[0].name).to.eq("Alice Event");
  });
});
