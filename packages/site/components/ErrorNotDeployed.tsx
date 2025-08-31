export function errorNotDeployed(chainId: number | undefined) {
  return (
    <div className="grid w-full gap-4 mx-auto font-semibold">
      <div className="col-span-full mx-20">
        <p className="text-4xl leading-relaxed text-white">
          {" "}
          <span className="font-mono bg-red-500 text-white px-2 rounded">Error</span>:{" "}
          <span className="font-mono glass-dark px-2 rounded text-white">ZumaEvents.sol</span> Contract
          Not Deployed on{" "}
          <span className="font-mono glass-dark px-2 rounded text-white">chainId={chainId}</span>{" "}
          {chainId === 11155111 ? "(Sepolia)" : ""} or Deployment Address
          Missing.
        </p>
        <p className="text-2xl leading-relaxed mt-8 text-white">
          It appears that the ZumaEvents.sol contract has either not been
          deployed yet, or the deployment address is missing from the ABI
          directory{" "}
          <span className="font-mono glass-dark px-2 rounded text-white">root/packages/abi</span>. Run the
          following command:
        </p>
        <p className="font-mono text-2xl leading-relaxed glass-dark text-white p-4 mt-12 rounded-lg">
          npx hardhat deploy --network{" "}
          {chainId === 11155111 ? "sepolia" : "your-network-name"}
        </p>
        <p className="text-2xl leading-relaxed mt-12 text-white">
          Alternatively, switch to the local{" "}
          <span className="font-mono glass-dark px-2 rounded text-white">Hardhat Node</span> using the
          MetaMask browser extension.
        </p>
      </div>
    </div>
  );
}
