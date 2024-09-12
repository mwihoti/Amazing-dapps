## Amazing_Dapps share
Amazing_Dapps Share is a simple decentralized application (dApp) infrastructure built on the Aptos blockchain. It provides basic wallet functionalities like wallet information, account details, APT (Aptos Coin) transfer, and the ability to create NFT collections.


## Amazing-dapps provides:

- Wallet Integration: Implements the WalletInfo component to connect and display
- wallet details using the Aptos Wallet Adapter.
- APT Transfer: A simple TransferAPT component that allows users to send APT 
- tokens to any address on the Aptos network.
- Show Transfer  History : Displays the transfer history of the connected wallet.
- Create NFT Collection: Allows users to create an NFT collection directly from 
- the dApp using the CreateCollection component.
- Network Information: Displays details about the connected network such as 
- Testnet or Mainnet.
- Account Information: Shows information about the connected Aptos account, including account address and balance.
## What tools the Amazing-dapps uses?

- React framework
- Vite development tool
- shadcn/ui + tailwind for styling
- Aptos TS SDK
- Aptos Wallet Adapter
- Node based Move commands

## What Move commands are available?

The tool utilizes [aptos-cli npm package](https://github.com/aptos-labs/aptos-cli) that lets us run Aptos CLI in a Node environment.

Some commands are built-in the template and can be ran as a npm script, for example:

- `npm run move:init` - a command to initialize an account to publish the Move contract and to configure the development environment
- `npm run move:publish` - a command to publish the Move contract
- `npm run move:test` - a command to run Move unit tests
- `npm run move:compile` - a command to compile the Move contract
- `npm run deploy` - a command to deploy the dapp to Vercel

For all other available CLI commands, can run `npx aptos` and see a list of all available commands.
