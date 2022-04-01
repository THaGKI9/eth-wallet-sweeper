interface Chain {
  id: string;
  token: string;
  label: string;
  rpcUrl: string;
  browser: string;
}

export const supportedChains: { [id: string]: Chain } = {
  0x1: {
    id: '0x1',
    token: 'ETH',
    label: 'Ethereum Mainnet',
    rpcUrl: 'https://mainnet.infura.io/v3/b0ddbf6d18524aaf84f91b46fba9459f',
    browser: 'https://etherscan.io',
  },
  0x3: {
    id: '0x3',
    token: 'tROP',
    label: 'Ethereum Ropsten Testnet',
    rpcUrl: 'https://ropsten.infura.io/v3/b0ddbf6d18524aaf84f91b46fba9459f',
    browser: 'https://ropsten.etherscan.io',
  },
  0x4: {
    id: '0x4',
    token: 'rETH',
    label: 'Ethereum Rinkeby Testnet',
    rpcUrl: 'https://rinkeby.infura.io/v3/b0ddbf6d18524aaf84f91b46fba9459f',
    browser: 'https://rinkeby.etherscan.io',
  },
  0x38: {
    id: '0x38',
    token: 'BNB',
    label: 'Binance Smart Chain',
    rpcUrl: 'https://bsc-dataseed.binance.org/',
    browser: 'http://bscscan.com',
  },
  0x89: {
    id: '0x89',
    token: 'MATIC',
    label: 'Matic Mainnet',
    rpcUrl: 'https://matic-mainnet.chainstacklabs.com',
    browser: 'https://polygonscan.com',
  },
  0xfa: {
    id: '0xfa',
    token: 'FTM',
    label: 'Fantom Mainnet',
    rpcUrl: 'https://rpc.ftm.tools/',
    browser: 'https://ftmscan.com',
  },
};
