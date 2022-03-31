import type { NextPage } from 'next';
import Head from 'next/head';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { init, useConnectWallet, useSetChain } from '@web3-onboard/react';
import injectedModule from '@web3-onboard/injected-wallets';
import ledgerModule from '@web3-onboard/ledger';
import walletConnectModule from '@web3-onboard/walletconnect';
import walletLinkModule from '@web3-onboard/walletlink';
import { BigNumber, ethers } from 'ethers';
import { Container, Text, Button, Input, Row, Spacer, Radio, useInput, Grid } from '@nextui-org/react';
import moment from 'moment';

init({
  wallets: [injectedModule(), ledgerModule(), walletConnectModule(), walletLinkModule()],
  chains: [
    {
      id: '0x1',
      token: 'ETH',
      label: 'Ethereum Mainnet',
      rpcUrl: 'https://mainnet.infura.io/v3/b0ddbf6d18524aaf84f91b46fba9459f',
    },
    {
      id: '0x3',
      token: 'tROP',
      label: 'Ethereum Ropsten Testnet',
      rpcUrl: 'https://ropsten.infura.io/v3/b0ddbf6d18524aaf84f91b46fba9459f',
    },
    {
      id: '0x4',
      token: 'rETH',
      label: 'Ethereum Rinkeby Testnet',
      rpcUrl: 'https://rinkeby.infura.io/v3/b0ddbf6d18524aaf84f91b46fba9459f',
    },
    {
      id: '0x89',
      token: 'MATIC',
      label: 'Matic Mainnet',
      rpcUrl: 'https://matic-mainnet.chainstacklabs.com',
    },
  ],
});

let setCustomGasPriceByOnChainData = false;

const Home: NextPage = () => {
  const [{ wallet, connecting }, connect] = useConnectWallet();
  const [{ connectedChain }] = useSetChain();
  const version = `${(process.env.VERSION ?? 'dirty').substring(0, 8)}, ${moment().format('yyyy-MM-DD')}`;

  const [currentWalletBalance, setCurrentWalletBalance] = useState<BigNumber>();
  const [currentGasPrice, setCurrentGasPrice] = useState<BigNumber>();
  const [useCustomGasPrice, setUseCustomGasPrice] = useState(false);
  const [gasPrice, setGasPrice] = useState<BigNumber>();
  const [gasFee, setGasFee] = useState<BigNumber>();
  const [valueToTransfer, setValueToTransfer] = useState<BigNumber>();
  const [executing, setExecuting] = useState(false);

  const inputGasPrice = useInput('');
  const inputRecipientAddress = useInput('0x42f30aa6d2237248638d1c74ddfcf80f4ecd340a');

  const web3Provider = useMemo(() => {
    let onboardProvider = wallet?.provider;
    if (!onboardProvider) return;

    return new ethers.providers.Web3Provider(onboardProvider as any);
  }, [wallet]);

  const updateCurrentWalletBalance = useCallback(async () => {
    let walletAddress = wallet?.accounts[0].address;
    if (!walletAddress) setCurrentWalletBalance(undefined);
    if (!web3Provider) setCurrentWalletBalance(undefined);

    web3Provider!.getBalance(walletAddress!).then((balance) => setCurrentWalletBalance(balance));
  }, [wallet, web3Provider]);

  const updateCurrentGasPrice = useCallback(async () => {
    if (!web3Provider) {
      setCurrentGasPrice(undefined);
    }

    web3Provider?.getGasPrice().then((gasPrice) => {
      setCurrentGasPrice(gasPrice);
      if (!useCustomGasPrice) setGasPrice(gasPrice);
    });
  }, [useCustomGasPrice, web3Provider]);

  const executeTransfer = useCallback(async () => {
    if (executing) {
      return;
    }
    setExecuting(true);

    try {
      const signer = web3Provider?.getSigner(wallet?.accounts[0].address);
      await signer?.sendTransaction({
        to: inputRecipientAddress.value,
        value: valueToTransfer,
        gasLimit: 21000,
        maxFeePerGas: gasPrice,
        maxPriorityFeePerGas: gasPrice,
      });
    } finally {
      setExecuting(false);
    }
  }, [executing, gasPrice, inputRecipientAddress.value, valueToTransfer, wallet?.accounts, web3Provider]);

  useEffect(() => {
    if (!web3Provider) return;

    updateCurrentGasPrice();
    const intervalIdUpdateCurrentGasPrice = setInterval(updateCurrentGasPrice, 10 * 1000);
    const intervalIdUpdateCurrentWalletBalance = setInterval(updateCurrentWalletBalance, 1000);

    return () => {
      clearInterval(intervalIdUpdateCurrentGasPrice);
      clearInterval(intervalIdUpdateCurrentWalletBalance);
    };
  }, [updateCurrentGasPrice, updateCurrentWalletBalance, web3Provider]);

  useEffect(() => {
    if (useCustomGasPrice) {
      try {
        setGasPrice(ethers.utils.parseUnits(inputGasPrice.value || '0', 'gwei'));
      } catch (e) {
        console.error('Invalid gas price:', e);
        setGasPrice(undefined);
      }
    }
  }, [inputGasPrice.value, useCustomGasPrice]);

  useEffect(() => {
    if (useCustomGasPrice && inputGasPrice.value === '' && !setCustomGasPriceByOnChainData) {
      setCustomGasPriceByOnChainData = true;
      inputGasPrice.setValue(ethers.utils.formatUnits(currentGasPrice || BigNumber.from(0), 'gwei'));
    }
  }, [currentGasPrice, inputGasPrice, useCustomGasPrice]);

  useEffect(() => {
    setGasFee(gasPrice ? gasPrice.mul(21000) : undefined);
  }, [gasPrice]);

  useEffect(() => {
    setValueToTransfer(gasFee && currentWalletBalance ? currentWalletBalance.sub(gasFee) : undefined);
  }, [currentWalletBalance, gasFee]);

  return (
    <>
      <Head>
        <title>Ethereum Wallet Sweeper</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container fluid css={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
        <Row align="baseline">
          <Text h1 css={{ textGradient: '45deg, $blue500 -20%, $pink500 50%' }}>
            Ethereum Wallet Sweeper
          </Text>
          <Text span css={{ paddingLeft: '1rem' }}>
            (Version: {version})
          </Text>
        </Row>
        <Spacer y={0.2} />

        <Row>
          {!wallet && (
            <Button ghost color="gradient" onClick={() => connect({})} disabled={connecting}>
              {connecting ? 'Connecting...' : 'Connect'}
            </Button>
          )}
        </Row>

        {wallet && (
          <>
            <Row>
              <div>
                <Text>Connected: {wallet.accounts[0]?.address}</Text>
                <Text>Chain: {connectedChain ? Number.parseInt(connectedChain.id, 16) : ''}</Text>
              </div>
            </Row>

            <Spacer y={1.5} />

            <Row>
              <Text h2>Setting</Text>
            </Row>
            <Row>
              <Input
                {...inputRecipientAddress.bindings}
                label="Recipient Address"
                width="42ch"
                status={
                  !inputRecipientAddress.value || ethers.utils.isAddress(inputRecipientAddress.value)
                    ? 'default'
                    : 'error'
                }
              />
            </Row>
            <Spacer y={0.5} />

            <Row>
              <Radio.Group initialValue={'auto-gas'} onChange={(e) => setUseCustomGasPrice(e === 'custom-gas')}>
                <Radio size="sm" value="auto-gas">
                  Auto Gas Price
                  <Spacer x={1} />
                  <Input
                    readOnly
                    disabled={useCustomGasPrice}
                    labelRight="gwei"
                    value={currentGasPrice ? `${ethers.utils.formatUnits(currentGasPrice, 'gwei')}` : 'N/A'}
                  />
                </Radio>
                <Radio size="sm" value="custom-gas">
                  Custom Gas Price
                  <Spacer x={1} />
                  <Input
                    {...inputGasPrice.bindings}
                    status={gasPrice && gasFee?.lte(currentWalletBalance || gasPrice) ? 'default' : 'error'}
                    labelRight="gwei"
                    disabled={!useCustomGasPrice}
                  />
                </Radio>
              </Radio.Group>
            </Row>

            <Spacer y={0.5} />
            <Row>
              <Text h2> Calculation</Text>
            </Row>
            <Row>
              <Container fluid>
                <Grid.Container>
                  <Grid xs={1}>Balance:</Grid>
                  <Grid xs>{currentWalletBalance ? `${ethers.utils.formatEther(currentWalletBalance)}Ξ` : 'N/A'}</Grid>
                </Grid.Container>
                <Grid.Container>
                  <Grid xs={1}>Gas Usage:</Grid>
                  <Grid xs>21000</Grid>
                </Grid.Container>
                <Grid.Container>
                  <Grid xs>----------------------</Grid>
                </Grid.Container>
                <Grid.Container>
                  <Grid xs={1}>Gas Fee:</Grid>
                  <Grid xs>{gasFee ? `${ethers.utils.formatEther(gasFee)}Ξ` : 'N/A'}</Grid>
                </Grid.Container>

                <Grid.Container>
                  <Grid xs={1}>Transfer:</Grid>
                  <Grid xs>
                    {valueToTransfer && gasFee && !gasFee.isNegative() && !valueToTransfer.isNegative()
                      ? `${ethers.utils.formatEther(valueToTransfer)}Ξ`
                      : 'N/A'}
                  </Grid>
                </Grid.Container>
              </Container>
            </Row>

            <Spacer y={0.5} />
            <Row>
              <Button
                color="gradient"
                auto
                disabled={
                  executing ||
                  !(
                    valueToTransfer &&
                    !valueToTransfer.isNegative() &&
                    ethers.utils.isAddress(inputRecipientAddress.value)
                  )
                }
                onClick={() => executeTransfer()}
              >
                {executing ? 'Sweep...' : 'Sweep!'}
              </Button>
            </Row>
          </>
        )}
      </Container>
    </>
  );
};

export default Home;
