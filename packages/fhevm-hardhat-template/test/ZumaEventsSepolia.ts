import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm, deployments } from "hardhat";
import { ZumaEvents } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  organizer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

describe("ZumaEventsSepolia", function () {
  let signers: Signers;
  let zumaEventsContract: ZumaEvents;
  let zumaEventsContractAddress: string;
  let step: number;
  let steps: number;

  function progress(message: string) {
    console.log(`${++step}/${steps} ${message}`);
  }

  before(async function () {
    if (fhevm.isMock) {
      console.warn(`This hardhat test suite can only run on Sepolia Testnet`);
      this.skip();
    }

    try {
      const ZumaEventsDeployment = await deployments.get("ZumaEvents");
      zumaEventsContractAddress = ZumaEventsDeployment.address;
      zumaEventsContract = await ethers.getContractAt("ZumaEvents", ZumaEventsDeployment.address);
    } catch (e) {
      (e as Error).message += ". Call 'npx hardhat deploy --network sepolia'";
      throw e;
    }

    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { 
      organizer: ethSigners[0], 
      alice: ethSigners[1], 
      bob: ethSigners[2] 
    };
  });

  beforeEach(async () => {
    step = 0;
    steps = 0;
  });

  it("should create an event and allow qualified attendee", async function () {
    steps = 12;

    this.timeout(4 * 40000);

    progress("Creating event with age requirement 18 and skill requirement 5...");
    const tx = await zumaEventsContract
      .connect(signers.organizer)
      .createEvent(
        "Sepolia Test Event",
        "Event for testing on Sepolia",
        "2024-12-25 09:00:00",
        "Sepolia Test Location",
        18, // minAge
        5   // minSkill
      );
    await tx.wait();

    progress("Getting event details...");
    const eventData = await zumaEventsContract.events(0);
    expect(eventData.isOpen).to.eq(true);

    progress("Encrypting Alice's age (25)...");
    const aliceAge = 25;
    const encryptedAliceAge = await fhevm
      .createEncryptedInput(zumaEventsContractAddress, signers.alice.address)
      .add64(aliceAge)
      .encrypt();

    progress("Encrypting Alice's skill (8)...");
    const aliceSkill = 8;
    const encryptedAliceSkill = await fhevm
      .createEncryptedInput(zumaEventsContractAddress, signers.alice.address)
      .add64(aliceSkill)
      .encrypt();

    progress(
      `Call attend() for Alice: age=${aliceAge}, skill=${aliceSkill}, eventId=0, contract=${zumaEventsContractAddress}...`
    );
    const attendTx = await zumaEventsContract
      .connect(signers.alice)
      .attend(
        0, // eventId
        encryptedAliceAge.handles[0],
        encryptedAliceAge.inputProof,
        encryptedAliceSkill.handles[0],
        encryptedAliceSkill.inputProof
      );
    await attendTx.wait();

    progress("Getting encrypted accepted count...");
    const encryptedAcceptedCount = await zumaEventsContract.getAcceptedCount(0);
    expect(encryptedAcceptedCount).to.not.eq(ethers.ZeroHash);

    progress(`Decrypting accepted count: ${encryptedAcceptedCount}...`);
    const clearAcceptedCount = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      encryptedAcceptedCount,
      zumaEventsContractAddress,
      signers.alice,
    );
    progress(`Clear accepted count: ${clearAcceptedCount}`);

    // Alice should be accepted since age=25 > 18 and skill=8 > 5
    expect(clearAcceptedCount).to.eq(1);
  });

  it("should reject attendee with insufficient age", async function () {
    steps = 10;

    this.timeout(4 * 40000);

    progress("Creating event with age requirement 21...");
    const tx = await zumaEventsContract
      .connect(signers.organizer)
      .createEvent(
        "Age Restricted Sepolia Event",
        "Event for adults 21+ on Sepolia",
        "2024-12-25 09:00:00",
        "Sepolia Test Location",
        21, // minAge
        1   // minSkill
      );
    await tx.wait();

    progress("Getting event details...");
    const eventData = await zumaEventsContract.events(1);
    expect(eventData.isOpen).to.eq(true);

    progress("Encrypting Bob's age (19)...");
    const bobAge = 19;
    const encryptedBobAge = await fhevm
      .createEncryptedInput(zumaEventsContractAddress, signers.bob.address)
      .add64(bobAge)
      .encrypt();

    progress("Encrypting Bob's skill (7)...");
    const bobSkill = 7;
    const encryptedBobSkill = await fhevm
      .createEncryptedInput(zumaEventsContractAddress, signers.bob.address)
      .add64(bobSkill)
      .encrypt();

    progress(
      `Call attend() for Bob: age=${bobAge}, skill=${bobSkill}, eventId=1, contract=${zumaEventsContractAddress}...`
    );
    const attendTx = await zumaEventsContract
      .connect(signers.bob)
      .attend(
        1, // eventId
        encryptedBobAge.handles[0],
        encryptedBobAge.inputProof,
        encryptedBobSkill.handles[0],
        encryptedBobSkill.inputProof
      );
    await attendTx.wait();

    progress("Getting encrypted accepted count...");
    const encryptedAcceptedCount = await zumaEventsContract.getAcceptedCount(1);
    expect(encryptedAcceptedCount).to.not.eq(ethers.ZeroHash);

    progress(`Decrypting accepted count: ${encryptedAcceptedCount}...`);
    const clearAcceptedCount = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      encryptedAcceptedCount,
      zumaEventsContractAddress,
      signers.bob,
    );
    progress(`Clear accepted count: ${clearAcceptedCount}`);

    // Bob should be rejected since age=19 < 21
    expect(clearAcceptedCount).to.eq(0);
  });

  it("should allow organizer to close event", async function () {
    steps = 6;

    this.timeout(2 * 40000);

    progress("Creating event for closing test...");
    const tx = await zumaEventsContract
      .connect(signers.organizer)
      .createEvent(
        "Closable Sepolia Event",
        "Event that will be closed",
        "2024-12-25 09:00:00",
        "Sepolia Test Location",
        18, // minAge
        1   // minSkill
      );
    await tx.wait();

    progress("Getting event details before closing...");
    let eventData = await zumaEventsContract.events(2);
    expect(eventData.isOpen).to.eq(true);

    progress("Closing the event...");
    const closeTx = await zumaEventsContract
      .connect(signers.organizer)
      .closeEvent(2);
    await closeTx.wait();

    progress("Verifying event is closed...");
    eventData = await zumaEventsContract.events(2);
    expect(eventData.isOpen).to.eq(false);
  });

  it("should test user acceptance tracking on Sepolia", async function () {
    steps = 8;

    this.timeout(3 * 40000);

    progress("Creating event for acceptance test...");
    const tx = await zumaEventsContract
      .connect(signers.organizer)
      .createEvent(
        "Acceptance Test Sepolia Event",
        "Event to test user acceptance tracking",
        "2024-12-25 09:00:00",
        "Sepolia Test Location",
        18, // minAge
        5   // minSkill
      );
    await tx.wait();

    const eventId = 3; // Assuming this is the next event ID

    progress("Getting event details...");
    const eventData = await zumaEventsContract.events(eventId);
    expect(eventData.isOpen).to.eq(true);

    progress("Encrypting Bob's age (19) and skill (7)...");
    const bobAge = 19;
    const bobSkill = 7;
    const encryptedBobAge = await fhevm
      .createEncryptedInput(zumaEventsContractAddress, signers.bob.address)
      .add64(bobAge)
      .encrypt();
    const encryptedBobSkill = await fhevm
      .createEncryptedInput(zumaEventsContractAddress, signers.bob.address)
      .add64(bobSkill)
      .encrypt();

    progress("Submitting Bob's attendance...");
    const attendTx = await zumaEventsContract
      .connect(signers.bob)
      .attend(
        eventId,
        encryptedBobAge.handles[0],
        encryptedBobAge.inputProof,
        encryptedBobSkill.handles[0],
        encryptedBobSkill.inputProof
      );
    await attendTx.wait();

    progress("Getting Bob's acceptance status...");
    const bobAccepted = await zumaEventsContract.getUserAccepted(eventId, signers.bob.address);
    expect(bobAccepted).to.not.eq(ethers.ZeroHash);

    progress("Decrypting acceptance status...");
    const clearBobAccepted = await fhevm.userDecryptEbool(
      bobAccepted,
      zumaEventsContractAddress,
      signers.bob,
    );

    // Bob should be accepted since age=19 > 18 and skill=7 > 5
    expect(clearBobAccepted).to.eq(true);
  });
});
