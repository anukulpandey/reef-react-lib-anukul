import Uik from '@reef-defi/ui-kit';
import React from "react";
import { SwapState } from "../../store";
import TokenField from "./TokenField";

import { faRepeat } from '@fortawesome/free-solid-svg-icons';
import BigNumber from 'bignumber.js';
import { Pool, resolveSettings } from '../../state';


export interface TradeActions {
  onSwitch: () => void;
  onSwap: () => Promise<void>;
  setToken1Amount: (amount: string) => void;
  setToken2Amount: (amount: string) => void;
  setPercentage: (amount: number) => void;
}

interface Trade {
  state: SwapState,
  actions: TradeActions
}

interface SummaryItem {
  label: string,
  value?: string,
  empty?: boolean,
  className?: string
}

const SummaryItem = ({
  label,
  value,
  empty,
  className
}: SummaryItem): JSX.Element => (
  <div
    className={`
      uik-pool-actions__summary-item
      ${empty ? 'uik-pool-actions__summary-item--empty': ''}
      ${className || ''}
    `}
  >
    <div className="uik-pool-actions__summary-item-label">{ label }</div>
    <div className="uik-pool-actions__summary-item-value">{ value }</div>
  </div>
)

const calculateRate = (sellTokenAddress: string, {token1: {address, decimals: decimals1}, token2: {decimals: decimals2}, reserve1, reserve2}: Pool) => {
  const r1 = new BigNumber(reserve1).div(new BigNumber(10).pow(decimals1));
  const r2 = new BigNumber(reserve2).div(new BigNumber(10).pow(decimals2));
  const res = sellTokenAddress === address ? r1.div(r2) : r2.div(r1);
  // TODO Samo add formating
  return`1 = ${res.toFormat(4)}`;
}

const Trade = ({state: {
  token1,
  percentage,
  token2,
  focus,
  isLoading,
  isValid,
  pool,
  settings,
  status
}, actions: {
  onSwap,
  onSwitch,
  setPercentage,
  setToken1Amount,
  setToken2Amount
}} : Trade): JSX.Element => {
  const {gasLimit, percentage: slippage} = resolveSettings(settings);

  const rate = pool ? calculateRate(token1.address, pool) : undefined;

  return (
    <div>
      <div className="uik-pool-actions__tokens">
        <TokenField
          token={token1}
          onAmountChange={setToken1Amount}
        />

        <div className="uik-pool-actions__token-switch">
          <button
            type="button"
            className={`
              uik-pool-actions__token-switch-btn
              ${focus === 'buy' ? 'uik-pool-actions__token-switch-btn--reversed' : ''}
            `}
            onClick={onSwitch}
          >
            <Uik.Icon icon={faRepeat}/>
          </button>
        </div>

        <TokenField
          token={token2}
          onAmountChange={setToken2Amount}
        />
      </div>

      <div className="uik-pool-actions__summary uik-pool-actions__trade-summary">
        <SummaryItem
          label="Rate"
          value={rate}
          empty={!rate}
        />
        <SummaryItem
          label="Fee"
          value={gasLimit}
          empty={!gasLimit}
        />
        <SummaryItem
          label="Slippage"
          className={slippage > 3 ? 'uik-pool-actions__trade-slippage--warn' : ''}
          value={`${slippage}%`}
          empty={!slippage}
        />
      </div>

      <div className="uik-pool-actions__slider">
        <Uik.Slider
          value={percentage}
          onChange={setPercentage}
          tooltip={`${Uik.utils.maxDecimals(percentage, 2)}%`}
          helpers={[
            { position: 0, text: "0%" },
            { position: 25 },
            { position: 50, text: "50%" },
            { position: 75, },
            { position: 100, text: "100%" },
          ]}
        />
      </div>

      <Uik.Button
        className="uik-pool-actions__cta"
        fill
        icon={faRepeat}
        text={isLoading ? status : 'Trade'}
        size="large"
        disabled={!isValid || isLoading}
        loading={isLoading}
        onClick={onSwap}
      />
    </div>
  );
}

export default Trade;