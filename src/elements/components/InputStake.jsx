/* eslint-disable react/prop-types */

import { ButtonBase } from "@mui/material";
import { useRef, useState } from "react";
import StakeButton from "./StakeButton";

const InputStake = ({ max, onActionBtnClick, buttonText, setValue }) => {
  const inputRef = useRef(null);
  const [value, setInternalValue] = useState(0);

  const handleMaxClick = () => {
    setValue(max);
    setInternalValue(max);
    if (inputRef.current) {
      inputRef.current.value = max;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onActionBtnClick(value);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full mt-[8px]">
      <p className="text-right">Max: {max}</p>
      <section className="flex justify-end">
        <div className="flex items-center border border-black flex-[2] px-4 mr-[8px]">
          <input
            ref={inputRef}
            type="number"
            name="stake"
            id="stake"
            min={0}
            defaultValue={0}
            onChange={(e) => {
              setValue(e.target.value);
              setInternalValue(e.target.value);
            }}
            className="w-full text-right no-arrows outline-none focus:outline-none border-none text-[24px] font-bold"
          />
          <p className="ml-5 text-[24px] font-[100] tracking-[0.22512px] leading-[1.5]">
            HOME
          </p>
        </div>
        <ButtonBase
          className="MuiTouchRipple-root"
          onClick={handleMaxClick}
          style={{
            backgroundColor: "#77787D",
            padding: "20px",
            paddingLeft: "24px",
            paddingRight: "24px",
            fontSize: "14px",
            color: "white",
            borderRadius: "5px",
            textTransform: "uppercase",
            fontWeight: 400,
            letterSpacing: "0.02857em",
            lineHeight: "1.75",
          }}
        >
          Max
        </ButtonBase>
      </section>
      <StakeButton onClick={() => handleSubmit()} buttonText={buttonText} />
    </form>
  );
};

export default InputStake;
